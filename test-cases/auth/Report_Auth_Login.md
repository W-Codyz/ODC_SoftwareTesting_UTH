# Test Execution Report: FR-AUTH-001 - Đăng nhập (Login)

**Module:** Authentication  
**Chức năng:** User Login (`POST /auth/login`)  
**Người thực hiện:** Đặng Thành Đình Phát  
**Ngày thực hiện lần đầu:** 31/10/2026
**Ngày cập nhật bổ sung:** 06/11/2026
**Môi trường test:** Postman, 00 - Authentication  
**Tham chiếu test case:** `test-cases/auth/TC_Auth_Login.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 20 |
| Passed | 14 |
| Failed | 6 |
| Blocked / Skipped | 0 |
| **Pass rate** | **14/20 = 70%** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input (Email / Password) | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-LOGIN-01 | Login thành công - nominal | `testlogin@labodc.com` / `Secure@123` | 200 - Trả về token | 200, trả về token | PASS | V-EM1, V-PW1, V-ACC1, B-PW3, ST-01, R1 | |
| 2 | TC-LOGIN-02 | Login thành công - password min (8 ký tự) | `testmin@labodc.com` / `Abcdef1!` | 200 - Login thành công | 200, trả về token | PASS | V-EM1, V-PW1, V-ACC1, B-PW1, R1 | |
| 3 | TC-LOGIN-03 | Login thành công - password min+ (9 ký tự) | `testminplus@labodc.com` / `Abcdefg1!` | 200 - Login thành công | 200, trả về token | PASS | V-EM1, V-PW1, V-ACC1, B-PW2, R1 | |
| 4 | TC-LOGIN-04 | Email rỗng | `""` / `Secure@123` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email is required"}}` | PASS | X-EM1, R2 | |
| 5 | TC-LOGIN-05 | Email thiếu @ | `testloginlabodc.com` / `Secure@123` | 400 - Lỗi `@Email` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM2, R2 | |
| 6 | TC-LOGIN-06 | Email thiếu domain | `testlogin@` / `Secure@123` | 400 - Lỗi `@Email` | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM3, R2 | |
| 7 | TC-LOGIN-07 | Email không tồn tại | `ghost@labodc.com` / `Secure@123` | 401 - `"Invalid email or password"` | 401, `{"success":false,"message":"Invalid email or password","data":null}` | PASS | X-EM4, R3 | |
| 8 | TC-LOGIN-08 | Password rỗng | `testlogin@labodc.com` / `""` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"password":"Password is required"}}` | PASS | X-PW1, R4 | |
| 9 | TC-LOGIN-09 | Password sai - đủ dài nhưng không khớp | `testlogin@labodc.com` / `WrongPass999!` | 401 - `"Invalid email or password"` | 401, `{"success":false,"message":"Invalid email or password","data":null}` | PASS | X-PW2, R5 | |
| 10 | TC-LOGIN-10 | Email chỉ có khoảng trắng | `"   "` / `Secure@123` | 400 - Lỗi validation | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email is required"}}` | PASS | X-EM1, R2 | |
| 11 | TC-LOGIN-11 | Password chỉ có khoảng trắng | `testlogin@labodc.com` / `"   "` | 400 - Lỗi `@NotBlank` | 400, `{"success":false,"message":"Validation failed","data":{"password":"Password must be at least 6 characters"}}` | PASS | X-PW1, R4 | Validation message ghi "6 characters" thay vì "8 characters" theo SRS |
| 12 | TC-LOGIN-12 | Email có khoảng trắng đầu/cuối | `" testlogin@labodc.com "` / `Secure@123` | 400 hoặc 401 | 400, `{"success":false,"message":"Validation failed","data":{"email":"Email must be valid"}}` | PASS | X-EM2, R2 | |
| 13 | TC-LOGIN-13 | Email viết hoa - case sensitivity | `TESTLOGIN@LABODC.COM` / `Secure@123` | 401 - `"Invalid email or password"` | 401, `"Invalid email or password"` | PASS | X-EM5, R3 | Phân biệt hoa/thường nhưng trong SRS chưa quy định rõ |
| 14 | TC-LOGIN-14 | **[ST-03]** Login sai lần thứ 5 - khóa tài khoản | `testlogin@labodc.com` / `WrongPass5th!` | 403 - account chuyển LOCKED | 401, counter không tăng | FAIL | ST-03, X-PW2 | FAIL vì TC-LOGIN-18 đã test FAIL trước đó |
| 15 | TC-LOGIN-15 | **[ST-05]** Login khi account đã bị khóa | `testlocked@labodc.com` / password đúng | 403 - `"Tài khoản đã bị khóa"` | 400, `{"success":false,"message":"Account is not active. Status: LOCKED","data":null}` | FAIL | ST-05, X-ACC1, R6 | Sai HTTP status code: trả 400 thay vì 403 |
| 16 | TC-LOGIN-16 | **[ST-07]** Login khi account chưa kích hoạt | `testinactive@labodc.com` / password đúng | 403 - `"Tài khoản chưa kích hoạt"` | 400, `{"success":false,"message":"Account is not active. Status: PENDING","data":null}` | FAIL | ST-07, X-ACC2, R6 | Sai HTTP status code: trả 400 thay vì 403 |
| 17 | TC-LOGIN-17 | **[ST-04]** Login đúng khi có 4 lần sai - reset counter | `testlogin@labodc.com` / `Secure@123` | 200 - Login OK, counter reset về 0 | trả về 200, counter reset về 0 | PASS | ST-04, V-EM1, V-PW1 |  |
| 18 | TC-LOGIN-18 | **[ST-02]** Login sai lần đầu - tăng counter | `testlogin@labodc.com` / `WrongFirst!` | 401 - counter tăng lên 1 | trả về 401, nhưng counter không tăng | FAIL | ST-02, X-PW2 |  |
| 19 | TC-LOGIN-19 | **[ST-06]** Login sau khi auto-unlock (30 phút) | `testlocked@labodc.com` / password đúng | 200 - tự động unlock | 400, `{"success":false,"message":"Account is not active. Status: LOCKED","data":null}` | FAIL | ST-06 | Code không implement auto unlock - không kiểm tra locked_until đã hết hạn | |
| 20 | TC-LOGIN-20 | **[R6]** Login account LOCKED + password sai | `testlocked@labodc.com` / `WrongPass!` | 403 - `"Tài khoản đã bị khóa"` | 401, `{"success":false,"message":"Invalid email or password","data":null}` | FAIL | ST-05, X-ACC1, R6 | Code check password trước status - trả 401 thay vì 403. Lộ thông tin password đúng/sai trên account LOCKED |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-EM1 | Email hợp lệ + tồn tại | TC-LOGIN-01, 02, 03, 17 | PASS |
| V-PW1 | Password hợp lệ + khớp | TC-LOGIN-01, 02, 03, 17 | PASS |
| V-ACC1 | Account ACTIVE | TC-LOGIN-01, 02, 03 | PASS |
| X-EM1 | Email rỗng | TC-LOGIN-04, 10 | PASS |
| X-EM2 | Email sai format | TC-LOGIN-05, 12 | PASS |
| X-EM3 | Email thiếu domain | TC-LOGIN-06 | PASS |
| X-EM4 | Email không tồn tại | TC-LOGIN-07 | PASS |
| X-EM5 | Email sai case (hoa/thường) | TC-LOGIN-13 | PASS |
| X-PW1 | Password rỗng | TC-LOGIN-08, 11 | PASS |
| X-PW2 | Password sai | TC-LOGIN-09, 14, 18 | PASS (9), FAIL (14, 18) |
| X-ACC1 | Account LOCKED | TC-LOGIN-15, 20 | FAIL |
| X-ACC2 | Account INACTIVE/PENDING | TC-LOGIN-16 | FAIL |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-PW1 | min = 8 ký tự | TC-LOGIN-02 | PASS |
| B-PW2 | min+ = 9 ký tự | TC-LOGIN-03 | PASS |
| B-PW3 | nominal = 10 ký tự | TC-LOGIN-01 | PASS |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | ACTIVE (cnt=0) + đúng → Login success | TC-LOGIN-01 | PASS |
| ST-02 | ACTIVE (cnt=0) + sai → ACTIVE (cnt=1) | TC-LOGIN-18 | FAIL |
| ST-03 | ACTIVE (cnt=4) + sai → LOCKED | TC-LOGIN-14 | FAIL |
| ST-04 | ACTIVE (cnt=4) + đúng → ACTIVE (cnt=0) | TC-LOGIN-17 | PASS |
| ST-05 | LOCKED + login → 403 | TC-LOGIN-15, 20 | FAIL |
| ST-06 | LOCKED + 30 phút → ACTIVE | TC-LOGIN-19 | FAIL |
| ST-07 | INACTIVE + login → 403 | TC-LOGIN-16 | FAIL |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ → 200 Login success | TC-LOGIN-01, 02, 03, 17, 19 | PASS (1-3, 17), FAIL (19) |
| R2 | Email format sai → 400 | TC-LOGIN-04, 05, 06, 10, 12 | PASS |
| R3 | Email không tồn tại → 401 | TC-LOGIN-07, 13 | PASS |
| R4 | Password rỗng → 400 | TC-LOGIN-08, 11 | PASS |
| R5 | Password sai → 401 | TC-LOGIN-09, 14, 18 | PASS (9), FAIL (14, 18) |
| R6 | Account locked/inactive → 403 | TC-LOGIN-15, 16, 20 | FAIL |

> **Bao phủ (trên tổng TC):** 12/12 EP tags, 3/3 BVA tags, 7/7 state transitions, 6/6 decision rules - **100%**.  
> **Đã thực thi:** 20/20 test case. Kết quả: 9/12 EP tags PASS (3 FAIL: X-PW2, X-ACC1, X-ACC2), 3/3 BVA tags PASS, 2/7 state transitions PASS (ST-01, ST-04), 3/6 decision rules PASS (R2, R3, R4).