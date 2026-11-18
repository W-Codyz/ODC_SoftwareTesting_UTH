import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { mentorService } from '@/services/mentor/mentorService';
import type { IMentorProjectOption } from '@/types/mentor.types';
import styles from './TaskExcelManagement.module.css';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_UID = 'mentor-task-excel-upload';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const messageText = (error as { message?: unknown }).message;
    if (typeof messageText === 'string' && messageText.trim()) return messageText;
  }
  return 'Không thể hoàn tất thao tác Excel. Vui lòng thử lại.';
};

const TaskExcelManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<IMentorProjectOption | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setPageLoading(true);
    setPageError(null);

    mentorService.getProjects()
      .then((projects) => {
        if (!active) return;
        const ownedProject = projects.find((item) => String(item.id) === String(projectId));
        if (!ownedProject) {
          setPageError('Dự án không tồn tại hoặc không thuộc quyền quản lý của bạn.');
          return;
        }
        setProject(ownedProject);
      })
      .catch((error: unknown) => {
        if (active) setPageError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setPageLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  const handleDownloadTemplate = async () => {
    if (!projectId || !project) return;
    setDownloading(true);
    try {
      const workbook = await mentorService.downloadTaskTemplate(projectId);
      const objectUrl = window.URL.createObjectURL(workbook);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'task-template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      message.success('Đã tải file Excel mẫu');
    } catch (error) {
      setUploadError(getErrorMessage(error));
      message.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    setImportedCount(null);
    setUploadError(null);

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setUploadError('Chỉ chấp nhận file Excel .xlsx.');
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError('Dung lượng file tối đa là 10 MB.');
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    return false;
  };

  const handleUpload = async () => {
    if (!projectId || !selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setImportedCount(null);
    try {
      const count = await mentorService.uploadTaskExcel(projectId, selectedFile);
      setImportedCount(count);
      message.success(`Đã nhập ${count} công việc từ file Excel`);
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const fileList: UploadFile[] = selectedFile
    ? [{ uid: FILE_UID, name: selectedFile.name, size: selectedFile.size, status: 'done' }]
    : [];

  if (pageLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(projectId ? `/mentor/projects/${projectId}/tasks` : '/mentor/tasks')}
          className={styles.backButton}
        >
          Quay lại công việc
        </Button>

        <Card className={styles.card} bordered={false}>
          <header className={styles.header}>
            <div>
              <Typography.Title level={2} className={styles.title}>
                Task Breakdown với Excel
              </Typography.Title>
              <Typography.Paragraph className={styles.subtitle}>
                Dự án: <strong>{project?.title || `#${projectId}`}</strong>
              </Typography.Paragraph>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={downloading}
              disabled={!project}
              onClick={handleDownloadTemplate}
            >
              Tải file Excel mẫu
            </Button>
          </header>

          {pageError && (
            <Alert
              type="error"
              showIcon
              message="Không thể mở chức năng Excel"
              description={pageError}
              className={styles.alert}
              data-testid="excel-page-error"
            />
          )}

          {project && (
            <>
              <Alert
                type="info"
                showIcon
                message="Quy trình làm việc"
                description="Tải template, điền thông tin task theo các cột trong sheet Tasks, sau đó tải file .xlsx lên. Task ID phải duy nhất trong dự án; ngày kết thúc không được trước ngày bắt đầu; dung lượng tối đa 10 MB."
                className={styles.alert}
              />

              <section className={styles.uploadSection}>
                <Typography.Title level={4}>Nhập task từ Excel</Typography.Title>
                <Upload.Dragger
                  accept=".xlsx"
                  maxCount={1}
                  multiple={false}
                  fileList={fileList}
                  beforeUpload={handleBeforeUpload}
                  onRemove={() => {
                    setSelectedFile(null);
                    setUploadError(null);
                    setImportedCount(null);
                    return true;
                  }}
                  disabled={uploading}
                  data-testid="task-excel-uploader"
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Chọn file hoặc kéo thả file Excel vào đây</p>
                  <p className="ant-upload-hint">Chỉ nhận .xlsx, tối đa 10 MB</p>
                </Upload.Dragger>

                {uploadError && (
                  <Alert
                    type="error"
                    showIcon
                    message="Không thể nhập file Excel"
                    description={uploadError}
                    className={styles.alert}
                    data-testid="task-excel-error"
                  />
                )}

                {importedCount !== null && (
                  <Alert
                    type="success"
                    showIcon
                    message={`Đã nhập thành công ${importedCount} công việc`}
                    description="Các task đã được ghi nhận cho dự án này."
                    className={styles.alert}
                    data-testid="task-excel-success"
                  />
                )}

                <Space className={styles.actions}>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={uploading}
                    disabled={!selectedFile || !project}
                    onClick={handleUpload}
                  >
                    Tải lên và nhập task
                  </Button>
                  <Button
                    disabled={!selectedFile || uploading}
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadError(null);
                      setImportedCount(null);
                    }}
                  >
                    Xóa file đã chọn
                  </Button>
                </Space>
              </section>
            </>
          )}
        </Card>
      </div>
    </main>
  );
};

export default TaskExcelManagement;
