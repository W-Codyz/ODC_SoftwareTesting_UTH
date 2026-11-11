# Test Execution Report – FR-MEN-001: Accept Project Invitation

**Môi trường:** http://localhost:8089, Environment LabODC Unified Environment.  
**Căn cứ:** Test design TC_Mentor_Invitations.md và SRS FR-MEN-001.

## 1. Tổng kết

| Kết quả             | Số ca |
| ------------------- | ----: |
| Tổng số ca thiết kế |    14 |
| PASS                |     4 |
| FAIL                |    10 |
| Tỷ lệ PASS          | 28,6% |

FAIL bao gồm lỗi thực tế và ca không thể kiểm chứng vì thiếu fixture. Các ca không chạy được được ghi rõ trong log, không thay bằng kết quả giả định.

## 2. Execution log

| ID        | Kết quả mong đợi                                       | Kết quả thực tế quan sát được                                                                                                                              | Trạng thái                       |
| --------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-INV-01 | Login Mentor3 HTTP 200                                 | Postman login thành công, HTTP 200, test assertions 2/2; token lưu vào environment                                                                         | PASS                             |
| TC-INV-02 | Danh sách rỗng trả HTTP 200, data=[]                   | Postman GET /api/mentor/invitations trả success=true, data=[]; test assertions 3/3                                                                         | PASS                             |
| TC-INV-03 | data.invitations và pagination theo SRS                | Response thực tế có data là mảng phẳng []; không có invitations/pagination                                                                                 | FAIL                             |
| TC-INV-04 | Filter/page/limit hoạt động trên fixture               | Đã gửi GET với status=PENDING&page=1&limit=10, HTTP 200, data=[]; fixture rỗng nên không thể chứng minh lọc/phân trang                                     | FAIL – không đủ dữ liệu xác minh |
| TC-INV-05 | Chi tiết tồn tại trả 200; thiếu ID trả 404             | GET /api/mentor/invitations/1 trả HTTP 500, message No static resource api/mentor/invitations/1                                                            | FAIL                             |
| TC-INV-06 | Accept ID không tồn tại trả 404                        | Postman POST /api/mentor/invitations/999999/accept trả HTTP 404, Invitation not found                                                                      | PASS                             |
| TC-INV-07 | Reject ID không tồn tại trả 404                        | Postman POST /api/mentor/invitations/999999/reject trả HTTP 404, Invitation not found                                                                      | PASS                             |
| TC-INV-08 | Collection mong HTTP 401 khi không token               | Postman trả HTTP 403 Forbidden, body Access Denied; khác assertion 401 của collection                                                                      | FAIL                             |
| TC-INV-09 | Token hết hạn bị từ chối bằng 401/403                  | Request dùng token cũ trong environment trả HTTP 500 với lỗi expired JWT/clock skew                                                                        | FAIL                             |
| TC-INV-10 | Mentor2 thấy fixture C nhưng không thấy A/B            | Login Mentor2 thành công; GET trả HTTP 200 và data=[]; Postman assertion 2/3, thất bại vì không có QA-POSTMAN-MI-C. Không đủ fixture để chứng minh cách ly | FAIL – thiếu fixture             |
| TC-INV-11 | Accept invitation PENDING trả 200 và cập nhật liên kết | Không chạy: danh sách của Mentor đã đăng nhập rỗng; không có invitation PENDING đã xác nhận                                                                | FAIL – không có fixture an toàn  |
| TC-INV-12 | Accept lại invitation đã xử lý trả 400                 | Không chạy: không có invitation ACCEPTED đã xác nhận thuộc tài khoản thử nghiệm                                                                            | FAIL – không có fixture          |
| TC-INV-13 | Reject invitation PENDING trả 200 và ghi trạng thái    | Không chạy: không có invitation PENDING đã xác nhận                                                                                                        | FAIL – không có fixture          |
| TC-INV-14 | Reject lại invitation đã xử lý trả 400                 | Không chạy: không có invitation REJECTED/ACCEPTED đã xác nhận                                                                                              | FAIL – không có fixture          |

## 3. Các lần đăng nhập và dữ liệu

- Mentor3 từ collection đăng nhập thành công trong Postman và có invitation list rỗng.
- Mentor2 từ collection đăng nhập thành công; fixture QA-POSTMAN-MI-C mà request test yêu cầu không xuất hiện.
- Tài khoản mentor1@labodc.com / 123123 trong collection unified trả 401 trong kiểm tra API trước đó. Không dùng tài khoản này làm cơ sở cho report Postman.
- Không accept/reject invitation thật trong lần chạy này; không có fixture PENDING an toàn.

## 4. Kết luận đối chiếu

Các ca ID không tồn tại hoạt động đúng với HTTP 404. Các điểm không đạt quan sát được gồm: route xem chi tiết trả 500 thay vì có implementation; cấu trúc list không đúng response SRS; unauthenticated và expired token trả mã 403/500 khác assertion; fixtures cách ly/trạng thái không đủ. Chưa có bằng chứng thực thi thành công cho accept/reject hợp lệ hoặc validation trạng thái PENDING.
