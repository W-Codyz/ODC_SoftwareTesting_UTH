# Test Cases - Mentor Projects

**Người thực hiện:** Lê Duy Mạnh
**Module:** Mentor Portal  
**Chức năng:** Danh sách project của Mentor (`GET /api/mentor/projects`)  
**Ngày tạo:** 04/11/2026

---

## 1. Căn cứ và phạm vi

- Endpoint được xác nhận từ controller: `GET /api/mentor/projects`, yêu cầu role `MENTOR`.
- API không nhận query parameter hoặc request body; các phân hoạch đầu vào chính là xác thực, role và trạng thái hồ sơ/dữ liệu liên quan.
- Service tìm project theo Mentor đang đăng nhập; response item có các field `id`, `title`, `progressPercentage`.
- Bộ kiểm thử gồm 5 ca positive và 11 ca negative. Script đối chiếu contract trong source; kết quả API được ghi riêng và giữ lại khi sinh lại.

## 2. Phân hoạch tương đương và điều kiện biên

### 2.1 Phân hoạch tương đương (EP)

| Điều kiện                                                               | Lớp               | Tag    | Giá trị đại diện                            |
| ----------------------------------------------------------------------- | ----------------- | ------ | ------------------------------------------- |
| Token hợp lệ, role MENTOR, có hồ sơ                                     | Valid             | V1     | Bearer MENTOR có liên kết Mentor            |
| Dữ liệu project thuộc mentor hiện tại                                   | Valid             | V2     | mentorId khớp Mentor của token              |
| Có một project được gán                                                 | Valid             | V3     | Một project                                 |
| Có nhiều project được gán                                               | Valid             | V4     | Hai project trở lên                         |
| Không có project được gán                                               | Valid             | V5     | Danh sách rỗng                              |
| Project thuộc Mentor khác                                               | Valid / isolation | V6     | mentorId khác                               |
| `progressPercentage` nằm trong miền nghiệp vụ giả định                  | Valid             | V7     | Các giá trị trong [0,100]                   |
| Thiếu token / Bearer rỗng / sai header / JWT sai / hết hạn / sai chữ ký | Invalid           | X1-X6  | Thiếu hoặc không xác minh được credential   |
| Token có role khác MENTOR                                               | Invalid           | X7-X10 | TALENT, ENTERPRISE, LAB_ADMIN, SYSTEM_ADMIN |
| Role MENTOR nhưng không có hồ sơ Mentor                                 | Invalid state     | X11    | Không tìm thấy hồ sơ theo user              |

### 2.2 Giá trị biên chuẩn (BVA)

| Điều kiện           | Loại     | Tag | Giá trị đại diện         |
| ------------------- | -------- | --- | ------------------------ |
| Biên dưới giả định  | Boundary | B1  | progressPercentage = 0   |
| Ngay trên biên dưới | Boundary | B2  | progressPercentage = 1   |
| Ngay dưới biên trên | Boundary | B3  | progressPercentage = 99  |
| Biên trên giả định  | Boundary | B4  | progressPercentage = 100 |

> Lưu ý: GET này không nhận `progressPercentage` làm đầu vào và source hiện chỉ trả giá trị đã lưu, không kiểm tra miền 0–100. B1–B4 là kiểm tra dữ liệu fixture/response theo giả định nghiệp vụ, không phải BVA đầu vào chuẩn; cần SRS xác nhận giới hạn này.

## 3. Test cases

| STT | TC ID        | Tên test case                          | Input / Dữ liệu                                                                           | Expected Result                                                             | Actual Result                                                                    | Trạng thái | Ghi chú                                                                             |
| --: | ------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | :--------: | ----------------------------------------------------------------------------------- |
|   1 | **TC-MP-01** | Mentor có một project được gán         | Token: MENTOR hợp lệ<br>Mentor có Project A                                               | 200; data chứa đúng A và đủ field                                           | HTTP 200; one project returned (id=2, Mobile Learning Application, progress=10). |  **PASS**  | Used existing Mentor 3 data; no fixture required.                                   |
|   2 | **TC-MP-02** | Mentor có nhiều project                | Token: MENTOR hợp lệ<br>Mentor có A và B                                                  | 200; data chứa A và B; không kiểm tra thứ tự                                | HTTP 200; two projects returned (ids=1, 3).                                      |  **PASS**  | Used existing Mentor 1 data.                                                        |
|   3 | **TC-MP-03** | Mentor chưa có project                 | Token: MENTOR hợp lệ<br>Không có project gán cho mentor                                   | 200; `data=[]`                                                              | HTTP 200; data=[].                                                               |  **PASS**  | Created temporary MENTOR profile without projects; deleted user/profile after test. |
|   4 | **TC-MP-04** | Cách ly dữ liệu giữa hai mentor        | Token: MENTOR A hợp lệ<br>A có A1; B có B1; gọi bằng token A                              | 200; có A1, không có B1                                                     | HTTP 200; Mentor 1 ids=[1,3], Mentor 3 ids=[2].                                  |  **PASS**  | No cross-mentor project IDs were returned.                                          |
|   5 | **TC-MP-05** | Kiểm tra các biên progressPercentage   | Token: MENTOR hợp lệ<br>Chuẩn bị các project có progressPercentage lần lượt 0, 1, 99, 100 | 200; trả nguyên cả bốn giá trị và field `id`, `title`, `progressPercentage` | HTTP 200; fixture progress values returned unchanged: 0, 1, 99, 100.             |  **PASS**  | All DTO fields present; four temporary projects were deleted after test.            |
|   6 | **TC-MP-06** | Không gửi token                        | Token: Không có<br>Không có Authorization                                                 | 401 Unauthorized                                                            | 403 Forbidden                                                                    |  **FAIL**  | Expected 401; observed HTTP 403.                                                    |
|   7 | **TC-MP-07** | Bearer rỗng                            | Token: Bearer không có token<br>`Authorization: Bearer`                                   | 401 Unauthorized                                                            | 403 Forbidden                                                                    |  **FAIL**  | Expected 401; observed HTTP 403.                                                    |
|   8 | **TC-MP-08** | Thiếu scheme Bearer                    | Token: Token hợp lệ nhưng header sai format<br>Gửi JWT trực tiếp trong Authorization      | 401 Unauthorized                                                            | 403 Forbidden                                                                    |  **FAIL**  | Expected 401; observed HTTP 403.                                                    |
|   9 | **TC-MP-09** | JWT sai định dạng                      | Token: Token lỗi<br>Bearer chuỗi không phải JWT                                           | Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse      | 500 Internal Server Error                                                        |  **FAIL**  | Malformed JWT caused HTTP 500; expected 401.                                        |
|  10 | **TC-MP-10** | JWT hết hạn                            | Token: Token hết hạn<br>Bearer JWT đã hết hạn                                             | Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse      | 500 Internal Server Error                                                        |  **FAIL**  | Valid expired JWT caused HTTP 500; expected 401.                                    |
|  11 | **TC-MP-11** | JWT sai chữ ký                         | Token: Token chữ ký không hợp lệ<br>Bearer JWT ký bằng secret khác                        | Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse      | 500 Internal Server Error                                                        |  **FAIL**  | JWT signed with a different key caused HTTP 500; expected 401.                      |
|  12 | **TC-MP-12** | Role TALENT                            | Token: TALENT hợp lệ<br>Token TALENT còn hạn                                              | 403 Forbidden                                                               | 400 Bad Request - Access Denied                                                  |  **FAIL**  | Expected 403; observed HTTP 400.                                                    |
|  13 | **TC-MP-13** | Role ENTERPRISE                        | Token: ENTERPRISE hợp lệ<br>Token ENTERPRISE còn hạn                                      | 403 Forbidden                                                               | 400 Bad Request - Access Denied                                                  |  **FAIL**  | Expected 403; observed HTTP 400.                                                    |
|  14 | **TC-MP-14** | Role LAB_ADMIN                         | Token: LAB_ADMIN hợp lệ<br>Token LAB_ADMIN còn hạn                                        | 403 Forbidden                                                               | 400 Bad Request - Access Denied                                                  |  **FAIL**  | Expected 403; observed HTTP 400.                                                    |
|  15 | **TC-MP-15** | Role SYSTEM_ADMIN                      | Token: SYSTEM_ADMIN hợp lệ<br>Token SYSTEM_ADMIN còn hạn                                  | 403 Forbidden                                                               | 400 Bad Request - Access Denied                                                  |  **FAIL**  | Expected 403; observed HTTP 400.                                                    |
|  16 | **TC-MP-16** | User role MENTOR không có hồ sơ Mentor | Token: MENTOR hợp lệ<br>User không có bản ghi Mentor liên kết                             | 404 Not Found theo exception handler hiện tại                               | HTTP 404; ResourceNotFound response for missing Mentor profile.                  |  **PASS**  | Created a disposable MENTOR user without profile; deleted it after test.            |

**Kết quả thực thi hiện tại:** 6 PASS, 10 FAIL, 0 CHƯA CHẠY (trên 16 case).

## 4. Bảng kiểm tra độ phủ

| Nhóm/điều kiện                                  | Các TC      | Độ phủ                                          |
| ----------------------------------------------- | ----------- | ----------------------------------------------- |
| Valid Mentor, hồ sơ và truy vấn project (V1-V5) | TC-MP-01–03 | Đã thiết kế                                     |
| Cách ly project giữa mentor (V6)                | TC-MP-04    | Đã thiết kế                                     |
| Field response và progress boundary (V7, B1-B4) | TC-MP-05    | Đã thiết kế; cần fixture và xác nhận miền 0–100 |
| Credential invalid (X1-X6)                      | TC-MP-06–11 | Đã thiết kế; status JWT lỗi cần chạy xác nhận   |
| Sai role (X7-X10)                               | TC-MP-12–15 | Đã thiết kế                                     |
| Mentor thiếu hồ sơ (X11)                        | TC-MP-16    | Đã thiết kế                                     |
| Tổng số                                         | TC-MP-01–16 | 16 (5 positive, 11 negative)                    |
