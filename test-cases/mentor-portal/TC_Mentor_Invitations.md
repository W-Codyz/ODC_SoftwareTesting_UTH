# Test Case Design – FR-MEN-001: Accept Project Invitation

## 1. Phạm vi và căn cứ

Kiểm thử các chức năng theo đặc tả SRS FR-MEN-001: danh sách lời mời, chi tiết lời mời, accept và reject. Đặc tả được cung cấp trong cuộc hội thoại và đối chiếu với SRS_LabOdc.md, Postman collection LabODC_TestingAPI, MentorPortalController và MentorPortalService.

## 2. Điều kiện và dữ liệu kiểm thử

- Xác thực bằng tài khoản Mentor có sẵn trong collection, không giả định tài khoản mentor1@labodc.com tồn tại.
- Tài khoản Mentor 3 trong collection đăng nhập thành công và có danh sách invitation rỗng.
- Tài khoản Mentor 2 đăng nhập thành công; dữ liệu fixture QA-POSTMAN-MI-C mà collection yêu cầu không có trong phản hồi.
- Không tạo/sửa invitation và không tự thêm fixture. Các ca cần invitation PENDING hoặc ACCEPTED chỉ chạy khi có fixture được xác nhận.
- Đặc tả mong response list có data.invitations và pagination. Cần kiểm tra contract này riêng với HTTP status.

## 3. Bộ test case

| ID        | Mục tiêu                                      | Tiền điều kiện                         | Request                                                                      | Kết quả mong đợi                                                                                |
| --------- | --------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TC-INV-01 | Đăng nhập Mentor 3 để lấy token               | Tài khoản trong collection             | POST /api/auth/login, mentor.lehoang@uth.edu.vn                              | HTTP 200, role MENTOR, token được lưu; Postman assertions pass                                  |
| TC-INV-02 | Lấy danh sách khi Mentor không có invitation  | Token Mentor 3                         | GET /api/mentor/invitations                                                  | HTTP 200, success=true, data là mảng rỗng                                                       |
| TC-INV-03 | Kiểm tra cấu trúc response danh sách theo SRS | Có thể dùng danh sách rỗng             | GET /api/mentor/invitations                                                  | data.invitations là mảng và có pagination.currentPage, totalPages, totalInvitations             |
| TC-INV-04 | Lọc và phân trang invitation                  | Có fixture nhiều trạng thái            | GET /api/mentor/invitations?status=PENDING&page=1&limit=10                   | HTTP 200; chỉ trả PENDING trong trang yêu cầu; pagination phản ánh số lượng thực                |
| TC-INV-05 | Xem chi tiết invitation                       | ID tồn tại và thuộc Mentor             | GET /api/mentor/invitations/{id}                                             | HTTP 200 và trả thông tin invitation/project; ID không tồn tại trả 404                          |
| TC-INV-06 | Accept ID không tồn tại                       | Token Mentor                           | POST /api/mentor/invitations/999999/accept                                   | HTTP 404, không thay đổi dữ liệu                                                                |
| TC-INV-07 | Reject ID không tồn tại                       | Token Mentor                           | POST /api/mentor/invitations/999999/reject                                   | HTTP 404, không thay đổi dữ liệu                                                                |
| TC-INV-08 | Gọi list không có token                       | Không gửi Authorization                | GET /api/mentor/invitations                                                  | HTTP 401 theo assertion của collection; ghi riêng nếu backend trả 403                           |
| TC-INV-09 | Gọi list bằng token hết hạn                   | Token hết hạn                          | GET /api/mentor/invitations                                                  | HTTP 401/403; không được trả lỗi máy chủ 5xx                                                    |
| TC-INV-10 | Cách ly lời mời giữa Mentor                   | Cần fixture A, B, C cho các Mentor     | Login Mentor 2; GET /api/mentor/invitations                                  | Chỉ thấy fixture của Mentor 2; fixture A/B không lộ; fixture cần thiết phải tồn tại để kết luận |
| TC-INV-11 | Accept invitation đang PENDING                | Invitation thuộc Mentor và còn PENDING | POST /api/mentor/invitations/{id}/accept với message và availability như SRS | HTTP 200; status ACCEPTED, gán Mentor cho project; dữ liệu/response theo SRS                    |
| TC-INV-12 | Accept lại invitation đã ACCEPTED             | Invitation đã ACCEPTED                 | Gọi lại POST /accept cùng ID                                                 | HTTP 400 theo luật trạng thái; không xử lý lần hai                                              |
| TC-INV-13 | Reject invitation đang PENDING                | Invitation thuộc Mentor và còn PENDING | POST /api/mentor/invitations/{id}/reject với reason                          | HTTP 200; status REJECTED và có response_message/responded_at theo SRS                          |
| TC-INV-14 | Reject lại invitation đã xử lý                | Invitation đã REJECTED hoặc ACCEPTED   | Gọi lại POST /reject                                                         | HTTP 400; không đổi trạng thái lần nữa                                                          |

## 4. Lưu ý so sánh đặc tả và code

Controller hiện có GET danh sách và POST accept/reject; không có GET chi tiết. GET danh sách không khai báo tham số status/page/limit. DTO response hiện là danh sách phẳng, không phải cấu trúc data.invitations + pagination trong SRS. Service accept/reject hiện không kiểm tra trạng thái PENDING; service accept cũng không đọc message/availability từ request. Các khác biệt này cần được ghi thành kết quả FAIL nếu response thực tế xác nhận.
