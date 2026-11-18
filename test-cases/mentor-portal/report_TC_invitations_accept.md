# Test Execution Report: Mentor Portal — Danh sách lời mời Mentor

**Module:** Mentor Portal  
**Chức năng:** Lấy danh sách lời mời Mentor (`GET /api/mentor/invitations`)  
**Người thực hiện:** Lê Duy Mạnh  
**Ngày lập báo cáo:** 18/11/2026  
**Môi trường test:** Chưa được cung cấp  
**Tham chiếu test case:** `test-cases/mentor-portal/Test_Cases_Mentor_Invitations.md`  
**Phạm vi:** TC-MI-01 đến TC-MI-16

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
| --- | ---: |
| Tổng số test case | 16 |
| Passed | 15 |
| Failed | 1 |
| Blocked / Skipped | 0 |
| Pass rate | 15/16 = 93,75% |

> Kết quả PASS/FAIL được ghi theo thông tin hiện có. Không có response thực tế/status thực tế cho từng lần chạy trong dữ liệu đầu vào; do đó cột kết quả thực tế dưới đây nêu rõ khi chưa được cung cấp.

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input / dữ liệu | Expected HTTP & Result | Actual HTTP & Result | Status | Tag | Ghi chú |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TC-MI-01 | Mentor có một lời mời đang chờ | Token MENTOR hợp lệ; một invitation `PENDING` của mentor | HTTP 200; `data` có đúng lời mời | Chưa được cung cấp | PASS* | V1, V2 | Kết quả trạng thái được ghi nhận; chưa có response để đối chiếu |
| 2 | TC-MI-02 | Mentor có nhiều lời mời đang chờ | Token MENTOR hợp lệ; nhiều invitation `PENDING` | HTTP 200; trả đủ lời mời, `receivedDate` giảm dần | Chưa được cung cấp | PASS* | V1, V3 | Chưa có response/thứ tự thực tế |
| 3 | TC-MI-03 | Mentor không có lời mời đang chờ | Token MENTOR hợp lệ; không có invitation `PENDING` | HTTP 200; `data=[]` | Chưa được cung cấp | PASS* | V1, V4 | Chưa có response thực tế |
| 4 | TC-MI-04 | Chỉ lấy lời mời của mentor đang đăng nhập | Token mentor A; dữ liệu PENDING của A và B | HTTP 200; chỉ trả invitation của A | Chưa được cung cấp | PASS* | V1, V5 | Chưa có response thực tế để xác minh cách ly dữ liệu |
| 5 | TC-MI-05 | Kiểm tra mapping và giá trị mặc định | Token MENTOR hợp lệ; PENDING đủ field và case thiếu project | HTTP 200; đủ field; fallback `Project #<id>` và chuẩn hóa field theo thiết kế | Chưa được cung cấp | PASS* | V1, V6 | Chưa có payload thực tế để đối chiếu |
| 6 | TC-MI-06 | Không gửi token | Không có `Authorization` | HTTP 401 Unauthorized | Chưa được cung cấp | PASS* | X1 | Chưa có response thực tế |
| 7 | TC-MI-07 | Bearer rỗng | `Authorization: Bearer` | HTTP 401 Unauthorized | Chưa được cung cấp | PASS* | X2 | Chưa có response thực tế |
| 8 | TC-MI-08 | Thiếu scheme Bearer | Gửi JWT trực tiếp trong Authorization | HTTP 401 Unauthorized | Chưa được cung cấp | PASS* | X3 | Chưa có response thực tế |
| 9 | TC-MI-09 | JWT sai định dạng | Bearer token không phải JWT | Kỳ vọng HTTP 401; ghi nhận status thực tế | Chưa được cung cấp | PASS* | X4 | Cần response thực tế để xác nhận status |
| 10 | TC-MI-10 | JWT hết hạn | Bearer JWT đã hết hạn | Kỳ vọng HTTP 401; ghi nhận status thực tế | Chưa được cung cấp | PASS* | X5 | Cần response thực tế để xác nhận status |
| 11 | TC-MI-11 | JWT sai chữ ký | JWT ký bằng secret khác | Kỳ vọng HTTP 401; ghi nhận status thực tế | Chưa được cung cấp | PASS* | X6 | Cần response thực tế để xác nhận status |
| 12 | TC-MI-12 | Role TALENT | Token TALENT còn hạn | HTTP 403 Forbidden | Chưa được cung cấp | PASS* | X7 | Chưa có response thực tế |
| 13 | TC-MI-13 | Role ENTERPRISE | Token ENTERPRISE còn hạn | HTTP 403 Forbidden | Chưa được cung cấp | PASS* | X8 | Chưa có response thực tế |
| 14 | TC-MI-14 | Role LAB_ADMIN | Token LAB_ADMIN còn hạn | HTTP 403 Forbidden | Chưa được cung cấp | PASS* | X9 | Chưa có response thực tế |
| 15 | TC-MI-15 | Role SYSTEM_ADMIN | Token SYSTEM_ADMIN còn hạn | HTTP 403 Forbidden | Chưa được cung cấp | PASS* | X10 | Chưa có response thực tế |
| 16 | TC-MI-16 | User MENTOR không có hồ sơ Mentor | Token MENTOR; user không có bản ghi Mentor liên kết | HTTP 404 Not Found theo thiết kế test case | Chưa được cung cấp | FAIL* | X11 | Được ghi nhận chưa đạt; chưa có status/body thực tế để mô tả sai lệch |

\* Trạng thái được giữ theo thông tin kết quả đã có trong report trước đó; dấu sao nhắc rằng log HTTP thực tế chưa được cung cấp kèm theo.

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test case bao phủ | Kết quả ghi nhận |
| --- | --- | --- | --- |
| V1 | Bearer hợp lệ, role MENTOR và có hồ sơ | TC-MI-01–05 | PASS* |
| V2 | Có một invitation PENDING của mentor | TC-MI-01 | PASS* |
| V3 | Có nhiều invitation PENDING; kiểm tra thứ tự | TC-MI-02 | PASS* |
| V4 | Không có invitation PENDING | TC-MI-03 | PASS* |
| V5 | Cách ly invitation theo mentor đăng nhập | TC-MI-04 | PASS* |
| V6 | DTO, fallback và chuẩn hóa field | TC-MI-05 | PASS* |
| X1–X6 | Token thiếu/rỗng/sai format hoặc JWT không hợp lệ | TC-MI-06–11 | PASS*; status thực tế chưa được cung cấp |
| X7–X10 | Role không phải MENTOR | TC-MI-12–15 | PASS* |
| X11 | Role MENTOR nhưng thiếu hồ sơ Mentor | TC-MI-16 | FAIL* |

### 3.2 Giá trị biên (BVA)

Không áp dụng BVA số học: endpoint không nhận input có miền min/max. Trường null/blank trong response được kiểm tra theo mapping và phân hoạch tương đương ở TC-MI-05.

### 3.3 Chuyển đổi trạng thái và bảng quyết định

Test case này không định nghĩa tag State Transition (ST) riêng. Các nhánh quyền truy cập và trạng thái invitation được kiểm tra theo các lớp tương đương V1–V6, X1–X11.

| Nhóm luật | Test case | Kết quả ghi nhận |
| --- | --- | --- |
| Lấy invitation PENDING thành công | TC-MI-01–05 | PASS* |
| Credential thiếu/không hợp lệ | TC-MI-06–11 | PASS* |
| Role không được phép | TC-MI-12–15 | PASS* |
| MENTOR không có hồ sơ liên kết | TC-MI-16 | FAIL* |

## 4. Danh sách bug / khiếm khuyết phát hiện (Defect Log)

| # | TC ID | Mô tả | Phân loại | Severity | Root cause |
| ---: | --- | --- | --- | --- | --- |
| 1 | TC-MI-16 | Test case được ghi nhận FAIL dù expected là HTTP 404 khi user role MENTOR không có hồ sơ Mentor. Response/status thực tế chưa được cung cấp nên chưa thể mô tả chính xác sai lệch. | Cần xác minh phân quyền / xử lý hồ sơ | Chưa xác định | Chưa đủ log thực tế để xác định nguyên nhân |

## 5. Ghi chú và đề xuất kiểm thử

- Báo cáo giữ kết quả 15 PASS và 1 FAIL theo report hiện có; đây là trạng thái được ghi nhận, không phải kết quả được tái xác minh từ log API.
- Cần bổ sung status code, response body và thời điểm chạy cho các ca, đặc biệt TC-MI-09–11 (JWT lỗi) và TC-MI-16, để hoàn thiện cột Actual và xác định defect.
- Với TC-MI-02 và TC-MI-04, nên lưu payload thực tế để đối chiếu thứ tự `receivedDate` và phạm vi dữ liệu theo mentor.
- Không suy đoán nguyên nhân gốc của TC-MI-16 khi chưa có response hoặc log server.

## 6. Căn cứ lập báo cáo

Báo cáo dựa trên tài liệu [Test_Cases_Mentor_Invitations.md](Test_Cases_Mentor_Invitations.md) và report kết quả trước đó. Tài liệu test case cung cấp phạm vi, điều kiện, expected result và tag; report trước đó cung cấp trạng thái tổng hợp 15 PASS / 1 FAIL. Không có log Postman/API đính kèm để xác minh actual response.
