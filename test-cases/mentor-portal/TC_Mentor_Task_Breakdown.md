# Test Case Design – FR-MEN-002: Task Breakdown with Excel

## 1. Phạm vi và căn cứ

Kiểm thử tải template, upload Excel và quản lý task theo SRS FR-MEN-002. Đối chiếu đặc tả trong SRS_LabOdc.md, collection LabODC_TestingAPI và controller/service/schema hiện tại.

## 2. Điều kiện và dữ liệu

- Chỉ dùng project mà tài khoản Mentor đã nhận từ API GET /api/mentor/projects.
- Mentor đã đăng nhập trong Postman có project ID 2 và một task sẵn có.
- Task tạo trong CRUD phải có tiêu đề TEMP-CODEX-API-TEST-2026-11-10 và được xóa sau khi test.
- Không có file Excel upload được cung cấp trong workspace/run hiện tại; không tự tạo file dữ liệu để giả định kết quả parse.
- SRS mô tả bảng tasks với task_id, task_name, start_date, due_date, estimated_hours, progress_percentage và các constraint. Schema runtime hiện dùng mentor_tasks với title, progress, due_date; các trường/constraint SRS nêu không hiện diện trong bảng này.

## 3. Bộ test case

| ID        | Mục tiêu                            | Tiền điều kiện                                         | Request / dữ liệu                                                                                       | Kết quả mong đợi                                                                       |
| --------- | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-TSK-01 | Xem task của Mentor                 | Token Mentor hợp lệ                                    | GET /api/mentor/tasks                                                                                   | HTTP 200; task thuộc Mentor, response có các trường theo DTO                           |
| TC-TSK-02 | Xem task theo project               | Project thuộc Mentor                                   | GET /api/mentor/projects/{projectId}/tasks                                                              | HTTP 200; chỉ task của project                                                         |
| TC-TSK-03 | Tạo task hợp lệ                     | Project thuộc Mentor                                   | POST /api/mentor/projects/{projectId}/tasks với title, description, status, progress, dueDate, priority | HTTP 200; tạo đúng một task, trả ID mới                                                |
| TC-TSK-04 | Cập nhật task                       | Task vừa tạo                                           | PUT /api/mentor/projects/{projectId}/tasks/{id}, progress=100, status=completed                         | HTTP 200; progress/status phản hồi đúng                                                |
| TC-TSK-05 | Xóa task thử nghiệm                 | Task vừa tạo bởi TC-TSK-03                             | DELETE /api/mentor/projects/{projectId}/tasks/{id}, sau đó GET list                                     | HTTP 200; task không còn trong danh sách                                               |
| TC-TSK-06 | Kiểm tra tiêu đề trống              | Token/project hợp lệ                                   | POST task với title rỗng                                                                                | HTTP 400; không tạo task                                                               |
| TC-TSK-07 | Giá trị tiến độ vượt 100            | Token/project hợp lệ                                   | POST task với progress=105                                                                              | Theo validation cần từ chối dữ liệu ngoài [0,100]; không lưu giá trị đã bị âm thầm đổi |
| TC-TSK-08 | Tải Excel template                  | Token và project hợp lệ                                | GET /api/mentor/projects/{projectId}/task-template                                                      | HTTP 200; XLSX, đúng Content-Type và Content-Disposition theo SRS                      |
| TC-TSK-09 | Upload Excel hợp lệ                 | File .xlsx đã kiểm tra, <=10 MB, dữ liệu member hợp lệ | POST /api/mentor/projects/{projectId}/tasks/upload multipart file                                       | HTTP 200; số lượng tạo/cập nhật và summary khớp file                                   |
| TC-TSK-10 | Upload sai loại hoặc quá dung lượng | File kiểm thử tương ứng                                | POST upload multipart file                                                                              | HTTP 4xx; không tạo task                                                               |
| TC-TSK-11 | Ràng buộc ID task duy nhất          | Có database schema đúng SRS                            | Chèn trùng (project_id, task_id)                                                                        | DB từ chối vi phạm UNIQUE; không khẳng định nếu bảng/cột không tồn tại                 |
| TC-TSK-12 | Ràng buộc ngày và tiến độ           | Có schema đúng SRS                                     | Due Date < Start Date; progress ngoài [0,100]                                                           | DB/validation từ chối; kiểm tra riêng từng điều kiện                                   |

## 4. Endpoint theo implementation hiện tại

Controller hiện có GET /api/mentor/tasks, GET /api/mentor/projects/{projectId}/tasks, POST tạo task và PUT/DELETE dạng nested /projects/{projectId}/tasks/{taskId}. Không có route task-template hoặc tasks/upload. Entity/schema task hiện hành là mentor_tasks; progress được chuẩn hóa bằng cách kẹp vào khoảng 0–100, không có DB check constraint tương ứng trong mentor_tasks.
