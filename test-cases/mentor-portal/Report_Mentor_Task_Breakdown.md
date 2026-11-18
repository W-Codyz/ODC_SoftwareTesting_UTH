# Test Execution Report: FR-MEN-002 — Mentor Task Breakdown with Excel

**Module:** Mentor Portal  
**Chức năng:** Quản lý task và tải lên Excel (`/api/mentor/tasks`, `/api/mentor/projects/{projectId}/tasks`, `/api/mentor/projects/{projectId}/task-template`, `/api/mentor/projects/{projectId}/tasks/upload`)  
**Ngày chạy:** 16/11/2026  
**Công cụ:** Postman  
**Môi trường:** `LabODC Unified Environment`  
**Base URL:** `http://localhost:8080`  
**Tài khoản:** Mentor có hồ sơ liên kết với project được kiểm thử  
**Tham chiếu test case:** [TC_Mentor_Task_Breakdown.md](TC_Mentor_Task_Breakdown.md)  
**Phạm vi:** TC-TSK-01 đến TC-TSK-12

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
| --- | ---: |
| Tổng số test case | 12 |
| Passed | 12 |
| Failed | 0 |
| Blocked / Skipped | 0 |
| Pass rate | 12/12 = 100% |

Người kiểm thử xác nhận đã chạy lại 12 test case trong Postman và tất cả đều đạt assertion. Chưa có Collection Runner export hoặc ảnh bằng chứng riêng được lưu kèm; vì vậy báo cáo không bổ sung status code, response body, task ID hay tên file cụ thể ngoài dữ liệu đã xác nhận.

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input / dữ liệu | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / Rule | Ghi chú |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC-TSK-01 | Xem task của Mentor | Token Mentor hợp lệ | HTTP 200; chỉ trả task thuộc Mentor, response đúng DTO | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Authorization, ownership | Chưa có body/HTTP log đính kèm |
| 2 | TC-TSK-02 | Xem task theo project | Project thuộc Mentor | HTTP 200; chỉ trả task của project | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Project scope | Chưa có body/HTTP log đính kèm |
| 3 | TC-TSK-03 | Tạo task hợp lệ | Project thuộc Mentor; title, description, status, progress, dueDate, priority hợp lệ | HTTP 200; tạo đúng một task và trả ID mới | Người kiểm thử xác nhận đạt assertion trong Postman; task ID chưa lưu | PASS | Create task | CRUD có ghi dữ liệu vào database |
| 4 | TC-TSK-04 | Cập nhật task | Task tạo ở TC-TSK-03; progress=100, status=completed | HTTP 200; progress/status phản hồi đúng | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Update task | Chưa có body/HTTP log đính kèm |
| 5 | TC-TSK-05 | Xóa task thử nghiệm | Task tạo ở TC-TSK-03 | HTTP 200; xóa thành công và task không còn trong danh sách | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Delete / cleanup | Chưa lưu task ID trong report |
| 6 | TC-TSK-06 | Kiểm tra tiêu đề trống | Token/project hợp lệ; title rỗng | HTTP 400; không tạo task | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Input validation | Chưa có body/HTTP log đính kèm |
| 7 | TC-TSK-07 | Giá trị tiến độ vượt 100 | Token/project hợp lệ; progress=105 | Từ chối progress ngoài [0,100]; không lưu giá trị bị âm thầm đổi | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Progress boundary | Chi tiết assertion chưa được lưu kèm |
| 8 | TC-TSK-08 | Tải Excel template | Token và project hợp lệ | HTTP 200; XLSX, đúng Content-Type và Content-Disposition theo SRS | Người kiểm thử xác nhận tải template thành công; header/file chưa lưu | PASS | Template download | Chưa có file/response header đính kèm |
| 9 | TC-TSK-09 | Upload Excel hợp lệ | File `.xlsx` hợp lệ, ≤10 MB, dữ liệu member hợp lệ | HTTP 200; số lượng tạo/cập nhật và summary khớp file | Người kiểm thử xác nhận đạt assertion trong Postman; summary chưa lưu | PASS | Excel import | Dùng multipart `file`; chưa có export run đính kèm |
| 10 | TC-TSK-10 | Upload sai loại hoặc quá dung lượng | File kiểm thử tương ứng | HTTP 4xx; không tạo task | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | File validation | Chưa có status/body cụ thể |
| 11 | TC-TSK-11 | Ràng buộc ID task duy nhất | Database schema đúng SRS; trùng `(project_id, task_id)` | Database từ chối vi phạm UNIQUE; không khẳng định nếu bảng/cột không tồn tại | Người kiểm thử xác nhận đạt assertion trong Postman; chi tiết schema/response chưa lưu | PASS | Database constraint | Chưa có log DB đính kèm |
| 12 | TC-TSK-12 | Ràng buộc ngày và progress | Due Date < Start Date; progress ngoài [0,100], kiểm tra riêng từng điều kiện | DB/validation từ chối dữ liệu không hợp lệ | Người kiểm thử xác nhận đạt assertion trong Postman; response cụ thể chưa lưu | PASS | Date/progress validation | Chưa có body/HTTP log đính kèm |

## 3. Kiểm tra độ bao phủ (Coverage Verification)

### 3.1 Phân hoạch tương đương (EP)

| Điều kiện / nhóm | Test case bao phủ | Kết quả ghi nhận |
| --- | --- | --- |
| Truy cập danh sách task theo Mentor/project | TC-TSK-01, TC-TSK-02 | PASS |
| CRUD task hợp lệ | TC-TSK-03–05 | PASS |
| Dữ liệu task không hợp lệ | TC-TSK-06, TC-TSK-07 | PASS |
| Template và upload Excel | TC-TSK-08, TC-TSK-09 | PASS |
| File upload không hợp lệ | TC-TSK-10 | PASS |
| Ràng buộc database và dữ liệu ngày/progress | TC-TSK-11, TC-TSK-12 | PASS |

### 3.2 Giá trị biên (BVA)

| Điều kiện biên | Test case | Kết quả ghi nhận |
| --- | --- | --- |
| Title rỗng | TC-TSK-06 | PASS |
| Progress vượt max 100 (`105`) | TC-TSK-07 | PASS |
| File sai loại hoặc vượt dung lượng theo dữ liệu đã chọn | TC-TSK-10 | PASS |
| Due Date trước Start Date hoặc progress ngoài [0,100] | TC-TSK-12 | PASS |

Chi tiết giá trị file và các điểm min/max không có trong log thực thi đã cung cấp; không ghi thêm ngưỡng thực tế ngoài giới hạn 10 MB nêu trong điều kiện của test upload hợp lệ.

### 3.3 Chuyển đổi trạng thái và bảng quyết định

Test case không gắn tag State Transition (ST) hoặc Decision Rule (R) riêng. Các hành động tạo, cập nhật, xóa được kiểm tra tuần tự qua TC-TSK-03–05; nhánh dữ liệu hợp lệ/không hợp lệ được kiểm tra qua TC-TSK-06–12.

## 4. Danh sách bug / khiếm khuyết phát hiện (Defect Log)

Không ghi nhận test case FAIL trong lần chạy được xác nhận (12/12 PASS). Chưa có Postman export, response body hoặc log database đính kèm để lập defect bổ sung.

## 5. Ghi chú và đề xuất kiểm thử

- Dùng `base_url = http://localhost:8080`; đăng nhập bằng tài khoản Mentor có hồ sơ và project liên kết. Lấy project ID từ `GET /api/mentor/projects`, không mặc định ID.
- Download template bằng `GET /api/mentor/projects/{projectId}/task-template`; upload bằng `POST /api/mentor/projects/{projectId}/tasks/upload`, Body `form-data`, key `file` kiểu File. Để Postman tự tạo multipart boundary.
- Workbook mẫu `task-template.xlsx` có Task ID `1`, đã tồn tại ở project 1 và 3. Upload nguyên file vào các project đó được kỳ vọng báo trùng; cần dùng dữ liệu phù hợp project để kiểm tra upload thành công.
- CRUD Mentor và Excel importer thao tác trên các bảng nghiệp vụ riêng (`mentor_tasks` và `tasks`). Khi kiểm tra dữ liệu database, cần xác nhận đúng bảng/cột theo test case.
- CRUD/upload có ghi dữ liệu. Dùng Task ID/tiêu đề riêng và dọn dữ liệu kiểm thử theo kế hoạch. Lưu Postman run export, status/body và file mẫu để lần sau có thể đối chiếu chi tiết.

## 6. Căn cứ lập báo cáo

Báo cáo được lập từ [TC_Mentor_Task_Breakdown.md](TC_Mentor_Task_Breakdown.md) và kết quả Postman do người kiểm thử xác nhận. Tổng số 12 ca và trạng thái 12 PASS được giữ theo report thực thi đã cung cấp; các response chi tiết không được suy đoán khi chưa có bằng chứng đính kèm.
