import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Upload, Tag, Rate, message, Spin, Select, Typography, Space, InputNumber } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import {
  talentService,
  TalentProfile as TalentProfileType,
} from '../../services/talent/talentService';
import type { UploadProps } from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;

const PROFICIENCY_OPTIONS = [
  { label: 'Mới bắt đầu', value: 'BEGINNER' },
  { label: 'Trung bình', value: 'INTERMEDIATE' },
  { label: 'Nâng cao', value: 'ADVANCED' },
  { label: 'Chuyên gia', value: 'EXPERT' },
];

const TalentProfile: React.FC = () => {
  const [uploadingCv, setUploadingCv] = useState(false);
  const [profile, setProfile] = useState<TalentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await talentService.getProfile();
      setProfile(data);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      message.error('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      const updated = await talentService.updateProfile(values);
      setProfile(updated);
      message.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error('Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const beforeAvatarUpload = (file: File) => {
    // 1. Kiểm tra định dạng file: chỉ cho phép JPG/PNG
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || /\.(jpe?g|png)$/i.test(file.name);
    if (!isJpgOrPng) {
      message.error('Định dạng ảnh không hỗ trợ, chỉ chấp nhận JPG/PNG');
      return Upload.LIST_IGNORE; // Hoặc return false để chặn không gửi request
    }

    // 2. Kiểm tra dung lượng: không được vượt quá 5MB (5 * 1024 * 1024 bytes)
    const isLt5M = file.size / 1024 / 1024 <= 5;
    if (!isLt5M) {
      message.error('Dung lượng ảnh đại diện vượt quá 5MB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    try {
      const { file } = options;
      const avatarUrl = await talentService.uploadAvatar(file as File);
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : null));
      message.success('Tải lên ảnh đại diện thành công');
    } catch (error: any) {
      const errorData = error?.response?.data;
      const errorMsg =
        (errorData?.data && typeof errorData.data === 'object' ? Object.values(errorData.data)[0] : null) ||
        errorData?.message ||
        'Không thể tải lên ảnh đại diện';
      message.error(String(errorMsg));
    }
  };

  const handleCvUpload: UploadProps['customRequest'] = async (options) => {
    try {
      setUploadingCv(true);
      const { file } = options;
      const cvUrl = await talentService.uploadCV(file as File);
      setProfile((prev) => (prev ? { ...prev, cvUrl } : null));
      message.success('Tải lên CV thành công');
    } catch (error: any) {
      console.error('Failed to upload CV:', error);
      const errorMsg = error?.response?.data?.message || 'Không thể tải lên CV';
      message.error(errorMsg);
    } finally {
      setUploadingCv(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={4}>Không thể tải hồ sơ. Vui lòng thử lại.</Title>
        <Button type="primary" onClick={fetchProfile}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Hồ sơ của tôi">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Form form={form} layout="vertical" onFinish={handleSave} initialValues={profile}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '16px' }}>
                <Upload
                  beforeUpload={beforeAvatarUpload}
                  customRequest={handleAvatarUpload}
                  showUploadList={false}
                  accept=".jpg,.jpeg,.png"
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      border: '2px dashed #d9d9d9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundImage: profile.avatarUrl ? `url(${profile.avatarUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!profile.avatarUrl && (
                      <div style={{ textAlign: 'center' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#999' }} />
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Tải ảnh lên</div>
                      </div>
                    )}
                  </div>
                </Upload>

                <div style={{ flex: 1 }}>
                  <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Mã số sinh viên" name="studentId">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        pattern: /^0\d{9}$/,
                        message: 'Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0',
                      },
                    ]}
                  >
                    <Input placeholder="0xxxxxxxxx" />
                  </Form.Item>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item label="Khoa" name="faculty" style={{ flex: 1 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="Ngành" name="major" style={{ flex: 1 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="Năm học" name="yearOfStudy" style={{ width: '100px' }}>
                      <Input type="number" min={1} max={6} />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <Form.Item label="Giới thiệu bản thân" name="bio">
                <TextArea rows={4} placeholder="Mô tả ngắn về bản thân, kinh nghiệm, mục tiêu..." />
              </Form.Item>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item label="GitHub" name="githubUrl" style={{ flex: 1 }}>
                  <Input placeholder="https://github.com/username" />
                </Form.Item>
                <Form.Item label="LinkedIn" name="linkedinUrl" style={{ flex: 1 }}>
                  <Input placeholder="https://linkedin.com/in/username" />
                </Form.Item>
              </div>

              <Form.Item label="Portfolio" name="portfolioUrl">
                <Input placeholder="https://yourportfolio.com" />
              </Form.Item>

              <Form.Item label="Hồ sơ CV (Curriculum Vitae)">
                <Upload
                  customRequest={handleCvUpload}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx"
                >
                  <Button icon={<UploadOutlined />} loading={uploadingCv}>
                    Tải lên CV
                  </Button>
                </Upload>
                {profile.cvUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ color: '#8c8c8c', marginRight: '8px' }}>CV hiện tại:</span>
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer">
                      {profile.cvUrl}
                    </a>
                  </div>
                )}
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Kỹ năng" key="2">
            <SkillsManagement profile={profile} onUpdate={setProfile} />
          </TabPane>

          <TabPane tab="Chứng chỉ" key="3">
            <CertificationsManagement profile={profile} onUpdate={setProfile} />
          </TabPane>

          <TabPane tab="Thống kê" key="4">
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Card size="small">
                <div style={{ color: '#595959', marginBottom: '4px' }}>Dự án hoàn thành</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {profile.projectsCompleted ?? 0}
                </div>
              </Card>
              <Card size="small">
                <div style={{ color: '#595959', marginBottom: '4px' }}>Đánh giá trung bình</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fadb14' }}>
                  <Rate disabled value={profile.averageRating} allowHalf />
                  <span style={{ fontSize: '14px', color: '#8c8c8c', marginLeft: '8px' }}>
                    ({profile.averageRating ?? 0})
                  </span>
                </div>
              </Card>
              <Card size="small">
                <div style={{ color: '#595959', marginBottom: '4px' }}>Số kỹ năng</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {profile.skills?.length ?? 0}
                </div>
              </Card>
              <Card size="small">
                <div style={{ color: '#595959', marginBottom: '4px' }}>Chứng chỉ</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#13c2c2' }}>
                  {profile.certifications?.length ?? 0}
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

const SkillsManagement: React.FC<{
  profile: TalentProfileType;
  onUpdate: (profile: TalentProfileType) => void;
}> = ({ profile, onUpdate }) => {
  const [addingSkill, setAddingSkill] = useState(false);
  const [form] = Form.useForm();

  const handleAddSkill = async (values: any) => {
    try {
      setAddingSkill(true);
      await talentService.addSkill(values);
      const updated = await talentService.getProfile();
      onUpdate(updated);
      form.resetFields();
      message.success('Đã thêm kỹ năng');
    } catch (error: any) {
      // Đọc trực tiếp error.message đã được chuẩn hoá
      const errorMsg = error?.message || 'Không thể thêm kỹ năng';
      message.error(String(errorMsg));
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await talentService.removeSkill(skillId);
      const updated = await talentService.getProfile();
      onUpdate(updated);
      message.success('Đã xóa kỹ năng');
    } catch (error) {
      message.error('Không thể xóa kỹ năng');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        {profile.skills?.length ? (
          profile.skills.map((skill) => (
            <Tag
              key={skill.id}
              closable
              onClose={() => handleRemoveSkill(skill.id)}
              style={{ marginBottom: '8px', padding: '4px 8px' }}
            >
              {skill.skillName} ({skill.proficiencyLevel})
              {skill.yearsOfExperience && ` - ${skill.yearsOfExperience} năm`}
            </Tag>
          ))
        ) : (
          <div style={{ color: '#8c8c8c' }}>Chưa có kỹ năng nào</div>
        )}
      </div>

      <Card title="Thêm kỹ năng mới" size="small">
        <Form form={form} layout="vertical" onFinish={handleAddSkill}>
          <Space wrap align="end">
            <Form.Item
              label="Tên kỹ năng"
              name="skillName"
              rules={[{ required: true, whitespace: true, message: 'Tên kỹ năng không được để trống' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Ví dụ: ReactJS, Python..." style={{ width: '200px' }} />
            </Form.Item>
            <Form.Item
              label="Trình độ"
              name="proficiencyLevel"
              rules={[{ required: true, message: 'Chọn trình độ' }]}
              style={{ marginBottom: 0 }}
            >
              <Select options={PROFICIENCY_OPTIONS} style={{ width: '160px' }} />
            </Form.Item>
            <Form.Item
              label="Số năm kinh nghiệm"
              name="yearsOfExperience"
              style={{ marginBottom: 0 }}
              rules={[
                {
                  validator: async (_, value) => {
                    if (value === undefined || value === null || value === '') {
                      return Promise.resolve(); // Cho phép để trống nếu không bắt buộc
                    }
                    const num = Number(value);
                    if (num < 0) {
                      return Promise.reject(new Error('Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.0'));
                    }
                    if (num > 50) {
                      return Promise.reject(new Error('Số năm kinh nghiệm tối đa là 50.0'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                step={0.1}
                placeholder="0.0"
                style={{ width: '120px' }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={addingSkill} icon={<PlusOutlined />}>
                Thêm
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

const CertificationsManagement: React.FC<{
  profile: TalentProfileType;
  onUpdate: (profile: TalentProfileType) => void;
}> = ({ profile, onUpdate }) => {
  const [addingCert, setAddingCert] = useState(false);
  const [form] = Form.useForm();

  const handleAddCert = async (values: any) => {
    try {
      setAddingCert(true);
      await talentService.addCertification(values);
      const updated = await talentService.getProfile();
      onUpdate(updated);
      form.resetFields();
      message.success('Đã thêm chứng chỉ');
    } catch (error) {
      message.error('Không thể thêm chứng chỉ');
    } finally {
      setAddingCert(false);
    }
  };

  const handleRemoveCert = async (certId: number) => {
    try {
      await talentService.removeCertification(certId);
      const updated = await talentService.getProfile();
      onUpdate(updated);
      message.success('Đã xóa chứng chỉ');
    } catch (error) {
      message.error('Không thể xóa chứng chỉ');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        {profile.certifications?.length ? (
          profile.certifications.map((cert) => (
            <Card
              key={cert.id}
              size="small"
              style={{ marginBottom: '8px' }}
              extra={
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveCert(cert.id)}
                >
                  Xóa
                </Button>
              }
            >
              <div><strong>{cert.name}</strong></div>
              <div style={{ color: '#8c8c8c', fontSize: '13px' }}>
                {cert.issuer}
                {cert.expiryDate && ` — Hết hạn: ${cert.expiryDate}`}
              </div>
              {cert.description && <div style={{ color: '#595959', fontSize: '13px' }}>{cert.description}</div>}
            </Card>
          ))
        ) : (
          <div style={{ color: '#8c8c8c' }}>Chưa có chứng chỉ nào</div>
        )}
      </div>

      <Card title="Thêm chứng chỉ mới" size="small">
        <Form form={form} layout="vertical" onFinish={handleAddCert}>
          <Form.Item
            label="Tên chứng chỉ"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
          >
            <Input placeholder="Ví dụ: AWS Certified Developer, Oracle Java..." />
          </Form.Item>
          <Form.Item
            label="Tổ chức cấp"
            name="issuer"
            rules={[{ required: true, message: 'Vui lòng nhập tổ chức cấp' }]}
          >
            <Input placeholder="Ví dụ: Amazon, Google, Microsoft..." />
          </Form.Item>
          <Form.Item label="Ngày hết hạn" name="expiryDate">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn về chứng chỉ (tùy chọn)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={addingCert} icon={<PlusOutlined />}>
              Thêm chứng chỉ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TalentProfile;
