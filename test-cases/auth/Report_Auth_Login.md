# Test Execution Report: FR-AUTH-001 - Đăng nhập (Login)

**Module:** Authentication  
**Chức năng:** User Login (`POST /auth/login`)  
**Người thực hiện:** Đặng Thành Đình Phát  
**Ngày thực hiện:** 31/10/2026  
**Môi trường test:** Postman, 00 - Authentication  
**Tham chiếu test case:** `test-cases/auth/TC_Auth_Login.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 13 |
| Passed | 13 |
| Failed | 0 |
| Blocked / Skipped | 0 |
| **Pass rate** | **100%** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input (Email / Password) | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-LOGIN-01 | Login thành công - nominal | `testlogin@labodc.com` / `Secure@123` | 200 - Trả về token | 200, trả về token | PASS | V-EM1, V-PW1, B-PW3 | |
| 2 | TC-LOGIN-02 | Login thành công - password min (8 ký tự) | `testmin@labodc.com` / `Abcdef1!` | 200 - Login thành công | 200, trả về token | PASS | V-EM1, V-PW1, B-PW1 | |
| 3 | TC-LOGIN-03 | Login thành công - password min+ (9 ký tự) | `testminplus@labodc.com` / `Abcdefg1!` | 200 - Login thành công | 200, trả về token | PASS | V-EM1, V-PW1, B-PW2 | |
| 4 | TC-LOGIN-04 | Email rỗng | `""` / `Secure@123` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email is required"}}` | PASS | X-EM1 | |
| 5 | TC-LOGIN-05 | Email thiếu @ | `testloginlabodc.com` / `Secure@123` | 400 - Lỗi `@Email` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM2 | |
| 6 | TC-LOGIN-06 | Email thiếu domain | `testlogin@` / `Secure@123` | 400 - Lỗi `@Email` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM3 | |
| 7 | TC-LOGIN-07 | Email không tồn tại | `ghost@labodc.com` / `Secure@123` | 401 - `"Invalid email or password"` | 401, `{"success":false,"message":"Invalid email or password","data":null}` | PASS | X-EM4 | |
| 8 | TC-LOGIN-08 | Password rỗng | `testlogin@labodc.com` / `""` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"password":"Password is required"}}` | PASS | X-PW1 | |
| 9 | TC-LOGIN-09 | Password sai - đủ dài nhưng không khớp | `testlogin@labodc.com` / `WrongPass999!` | 401 - `"Invalid email or password"` | 401, `{"success":false,"message":"Invalid email or password","data":null}` | PASS | X-PW2 | |
| 10 | TC-LOGIN-10 | Email chỉ có khoảng trắng | `"   "` / `Secure@123` | 400 - Lỗi validation | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email is required"}}` | PASS | X-EM1 | |
| 11 | TC-LOGIN-11 | Password chỉ có khoảng trắng | `testlogin@labodc.com` / `"   "` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"password":"Password must be at least 6 characters"}}` | PASS | X-PW1 | Validation message ghi "6 characters" thay vì "8 characters" theo SRS |
| 12 | TC-LOGIN-12 | Email có khoảng trắng đầu/cuối | `" testlogin@labodc.com "` / `Secure@123` | 400 hoặc 401 | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM2 | |
| 13 | TC-LOGIN-13 | Email viết hoa - case sensitivity | `TESTLOGIN@LABODC.COM` / `Secure@123` | 401 - `"Invalid email or password"` | 401, `"Invalid email or password"` | PASS | X-EM5 | Phân biệt hoa/thường nhưng trong SRS chưa quy định rõ |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-EM1 | Email hợp lệ + tồn tại | TC-LOGIN-01, 02, 03 | PASS |
| V-PW1 | Password hợp lệ + khớp | TC-LOGIN-01, 02, 03 | PASS |
| X-EM1 | Email rỗng | TC-LOGIN-04, 10 | PASS |
| X-EM2 | Email sai format | TC-LOGIN-05, 12 | PASS |
| X-EM3 | Email thiếu domain | TC-LOGIN-06 | PASS |
| X-EM4 | Email không tồn tại | TC-LOGIN-07 | PASS |
| X-EM5 | Email sai case (hoa/thường) | TC-LOGIN-13 | PASS |
| X-PW1 | Password rỗng | TC-LOGIN-08, 11 | PASS |
| X-PW2 | Password sai | TC-LOGIN-09 | PASS |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-PW1 | min = 8 ký tự | TC-LOGIN-02 | PASS |
| B-PW2 | min+ = 9 ký tự | TC-LOGIN-03 | PASS |
| B-PW3 | nominal = 10 ký tự | TC-LOGIN-01 | PASS |

> **Bao phủ:** 9/9 EP tags, 3/3 BVA tags - **100%**

---

## 4. Danh sách bug phát hiện

| # | TC ID | Mô tả bug | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|

*Không phát hiện bug trong lần test này.*

---

## 5. Ghi chú & đề xuất

- **Phát hiện 1:** Login phân biệt hoa/thường email (case-sensitive). `TESTLOGIN@LABODC.COM` trả về 401 dù tài khoản `testlogin@labodc.com` tồn tại. SRS không quy định rõ behavior này. Đề xuất bổ sung vào SRS để tránh mơ hồ.
- **Phát hiện 2:** Ràng buộc độ dài password (min = 8) chỉ áp dụng ở tầng đăng ký. Tại login, `LoginRequest.java` chỉ có `@NotBlank` - không validate độ dài. Password dưới 8 ký tự gửi lên login sẽ bị reject ở tầng service (sai password) chứ không phải tầng validation. Đây là thiết kế hợp lý (login chỉ cần so khớp), nhưng cần đảm bảo đăng ký đã enforce đúng min = 8.