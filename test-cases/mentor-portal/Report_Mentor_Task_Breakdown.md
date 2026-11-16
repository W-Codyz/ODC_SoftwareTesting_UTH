# Test Execution Report – FR-MEN-002: Task Breakdown with Excel

**Ngày chạy:** 2026-11-16  
**Công cụ:** Postman  
**Môi trường:** `LabODC Unified Environment`  
**Base URL:** `http://localhost:8080`  
**Tài khoản:** Mentor có hồ sơ liên kết với project được kiểm thử  
**Căn cứ:** `TC_Mentor_Task_Breakdown.md`, API backend hiện tại và kết quả chạy Postman do người kiểm thử xác nhận.

## 1. Tổng kết

| Kết quả    | Số ca |
| ---------- | ----: |
| Tổng số ca |    12 |
| PASS       |    12 |
| FAIL       |     0 |
| Tỷ lệ PASS |  100% |

Người kiểm thử xác nhận đã chạy lại toàn bộ 12 test case trong Postman và tất cả đều đạt. Chi tiết response, test run export và ảnh bằng chứng chưa được lưu kèm trong workspace; vì vậy report không ghi thêm status code, response body, task ID hoặc tên file cụ thể ngoài thông tin đã xác nhận.

## 2. Execution log

| ID        | Test case                                | Kết quả mong đợi                                         | Kết quả thực tế                                     | Trạng thái |
| --------- | ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- | ---------- |
| TC-TSK-01 | Xem task của Mentor                      | HTTP 200; chỉ trả task thuộc Mentor                      | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-02 | Xem task theo project                    | HTTP 200; task thuộc project của Mentor                  | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-03 | Tạo task hợp lệ                          | Tạo task thành công và trả thông tin task mới            | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-04 | Cập nhật task                            | Cập nhật task thành công; dữ liệu phản hồi đúng          | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-05 | Xóa task thử nghiệm                      | Xóa thành công; task không còn trong danh sách           | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-06 | Tiêu đề task rỗng                        | Từ chối dữ liệu không hợp lệ; không tạo task             | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-07 | Progress vượt 100%                       | Xử lý giá trị ngoài giới hạn theo assertion của test     | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-08 | Tải Excel template                       | HTTP 200; tải được workbook `.xlsx`                      | Người kiểm thử xác nhận tải template thành công     | PASS       |
| TC-TSK-09 | Upload Excel hợp lệ                      | Upload file hợp lệ thành công; số task nhập đúng         | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-10 | Upload file sai loại hoặc quá dung lượng | Từ chối file không hợp lệ; không nhập task               | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-11 | Task ID trùng                            | Từ chối ID trùng theo assertion của test                 | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |
| TC-TSK-12 | Ràng buộc ngày và progress               | Xử lý ngày/progress không hợp lệ theo assertion của test | Người kiểm thử xác nhận đạt assertion trong Postman | PASS       |

## 3. Cấu hình và lưu ý khi tái chạy

- Dùng `base_url = http://localhost:8080` cho monolith backend.
- Đăng nhập bằng tài khoản Mentor có hồ sơ và project được liên kết; dùng project ID lấy từ `GET /api/mentor/projects`.
- Download template bằng `GET /api/mentor/projects/{projectId}/task-template`.
- Upload Excel bằng `POST /api/mentor/projects/{projectId}/tasks/upload`, Body `form-data`, key `file` kiểu File. Để Postman tự tạo `Content-Type` và multipart boundary.
- Cập nhật progress bằng `PUT /api/mentor/projects/{projectId}/tasks/{taskId}` với Body raw JSON; không gửi JSON vào endpoint upload.
- Upload và CRUD có ghi dữ liệu vào database. Dùng Task ID riêng và dọn dữ liệu thử nghiệm nếu kế hoạch kiểm thử yêu cầu.

## 4. Bằng chứng

Kết quả PASS được ghi theo xác nhận của người kiểm thử trong Postman. Chưa có Postman Collection Runner export hoặc ảnh chụp riêng cho từng test case được lưu cùng report tại thời điểm cập nhật.
