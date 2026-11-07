# Test Execution Report: FR-AUTH-002 - Đăng ký tài khoản (Registration)

**Module:** Authentication
**Chức năng:** User Registration (`POST /api/auth/register`)
**Người thực hiện:** Đặng Thành Đình Phát
**Ngày tạo report:** 07/11/2026
**Môi trường test:** Postman, 00 - Authentication
**Tham chiếu test case:** `test-cases/auth/TC_Auth_Register.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 25 |
| Passed | |
| Failed | |
| Blocked / Skipped | |
| **Pass rate** | |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input (Email / Password / ConfirmPassword / Role) | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-REG-01 | Đăng ký Talent thành công - happy path | `newtalent@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / TALENT | 200 - Đăng ký thành công, status PENDING | | | V-EM1, V-PW1, V-CP1, V-RL1, B-PW4, ST-01, R1 | |
| 2 | TC-REG-02 | Đăng ký Enterprise thành công - happy path | `newcompany@example.com` / `SecurePass123!` / `SecurePass123!` / ENTERPRISE | 200 - Đăng ký thành công, status PENDING | | | V-EM2, V-PW1, V-CP1, V-RL2, ST-02, R1 | |
| 3 | TC-REG-03 | Email rỗng | `""` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Email is required" | | | X-EM1, R2 | |
| 4 | TC-REG-04 | Email chỉ có khoảng trắng | `"   "` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - Lỗi validation email | | | X-EM1, R2 | |
| 5 | TC-REG-05 | Email thiếu @ | `newtalentuth.edu.vn` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Email must be valid" | | | X-EM2, R2 | |
| 6 | TC-REG-06 | Email thiếu domain | `newtalent@` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Email must be valid" | | | X-EM3, R2 | |
| 7 | TC-REG-07 | Email đã tồn tại | `sv1@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Email already registered" | | | X-EM4, ST-06, R3 | |
| 8 | TC-REG-08 | Talent dùng email domain không phải @uth.edu.vn | `talent@gmail.com` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Talent phải dùng email @uth.edu.vn" | | | X-EM5, R4 | SRS yêu cầu domain validation nhưng code chưa implement |
| 9 | TC-REG-09 | Password rỗng | `newtalent2@uth.edu.vn` / `""` / `""` / TALENT | 400 - "Password is required" | | | X-PW1, R5 | |
| 10 | TC-REG-10 | Password chỉ có khoảng trắng | `newtalent3@uth.edu.vn` / `"   "` / `"   "` / TALENT | 400 - Lỗi validation password | | | X-PW1, R5 | |
| 11 | TC-REG-11 | Password < 8 ký tự | `newtalent4@uth.edu.vn` / `Ab1!xyz` / `Ab1!xyz` / TALENT | 400 - "Password must be at least 8 characters" | | | X-PW2, B-PW1, R5 | |
| 12 | TC-REG-12 | Password thiếu uppercase | `newtalent5@uth.edu.vn` / `securepass123!` / `securepass123!` / TALENT | 400 - Lỗi password không đủ mạnh | | | X-PW3, R6 | SRS yêu cầu password strength nhưng code chỉ có @Size(min=8) |
| 13 | TC-REG-13 | Password thiếu lowercase | `newtalent6@uth.edu.vn` / `SECUREPASS123!` / `SECUREPASS123!` / TALENT | 400 - Lỗi password không đủ mạnh | | | X-PW4, R6 | Tương tự TC-REG-12 |
| 14 | TC-REG-14 | Password thiếu số | `newtalent7@uth.edu.vn` / `SecurePass!!!` / `SecurePass!!!` / TALENT | 400 - Lỗi password không đủ mạnh | | | X-PW5, R6 | Tương tự TC-REG-12 |
| 15 | TC-REG-15 | Password thiếu ký tự đặc biệt | `newtalent8@uth.edu.vn` / `SecurePass123` / `SecurePass123` / TALENT | 400 - Lỗi password không đủ mạnh | | | X-PW6, R6 | Tương tự TC-REG-12 |
| 16 | TC-REG-16 | ConfirmPassword rỗng | `newtalent9@uth.edu.vn` / `SecurePass123!` / `""` / TALENT | 400 - "Confirm password is required" | | | X-CP1, R7 | |
| 17 | TC-REG-17 | ConfirmPassword không khớp | `newtalent10@uth.edu.vn` / `SecurePass123!` / `DifferentPass1!` / TALENT | 400 - "Passwords do not match" | | | X-CP2, R7 | |
| 18 | TC-REG-18 | Role null | `newtalent11@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / `null` | 400 - "Role is required" | | | X-RL1, R8 | |
| 19 | TC-REG-19 | Role không hợp lệ | `newtalent12@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / `"STUDENT"` | 400 - Lỗi role không nằm trong enum | | | X-RL2, R8 | |
| 20 | TC-REG-20 | Password = 8 ký tự (min) | `newtalent13@uth.edu.vn` / `Abcdef1!` / `Abcdef1!` / TALENT | 200 - Đăng ký thành công | | | V-EM1, V-CP1, V-RL1, B-PW2 | |
| 21 | TC-REG-21 | Password = 9 ký tự (min+) | `newtalent14@uth.edu.vn` / `Abcdefg1!` / `Abcdefg1!` / TALENT | 200 - Đăng ký thành công | | | V-EM1, V-CP1, V-RL1, B-PW3 | |
| 22 | TC-REG-22 | Đăng ký trùng email đang ACTIVE | `sv1@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / TALENT | 400 - "Email already registered" | | | ST-06, X-EM4, R3 | |
| 23 | TC-REG-23 | Kiểm tra status sau đăng ký Talent | `checkstatus@uth.edu.vn` / `SecurePass123!` / `SecurePass123!` / TALENT | 200, DB: status=PENDING, emailVerified=false | | | ST-01 |  |
| 24 | TC-REG-24 | Kiểm tra status sau đăng ký Enterprise | `checkstatus@company.com` / `SecurePass123!` / `SecurePass123!` / ENTERPRISE | 200, DB: status=PENDING, emailVerified=false | | | ST-02 |  |
| 25 | TC-REG-25 | Happy path Enterprise với domain .com.vn | `newent@company.com.vn` / `StrongPass1!` / `StrongPass1!` / ENTERPRISE | 200 - Đăng ký thành công | | | V-EM2, V-PW1, V-CP1, V-RL2, R1 | |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-EM1 | Email hợp lệ domain @uth.edu.vn (Talent) | TC-REG-01, 20, 21, 23 | |
| V-EM2 | Email hợp lệ domain khác (Enterprise) | TC-REG-02, 24, 25 | |
| V-PW1 | Password đủ mạnh | TC-REG-01, 02, 25 | |
| V-CP1 | ConfirmPassword khớp | TC-REG-01, 02, 20, 21, 25 | |
| V-RL1 | Role = TALENT | TC-REG-01, 20, 21, 23 | |
| V-RL2 | Role = ENTERPRISE | TC-REG-02, 24, 25 | |
| X-EM1 | Email rỗng/khoảng trắng | TC-REG-03, 04 | |
| X-EM2 | Email sai format thiếu @ | TC-REG-05 | |
| X-EM3 | Email thiếu domain | TC-REG-06 | |
| X-EM4 | Email đã tồn tại | TC-REG-07, 22 | |
| X-EM5 | Talent domain sai | TC-REG-08 | |
| X-PW1 | Password rỗng/khoảng trắng | TC-REG-09, 10 | |
| X-PW2 | Password < 8 ký tự | TC-REG-11 | |
| X-PW3 | Password thiếu uppercase | TC-REG-12 | |
| X-PW4 | Password thiếu lowercase | TC-REG-13 | |
| X-PW5 | Password thiếu số | TC-REG-14 | |
| X-PW6 | Password thiếu ký tự đặc biệt | TC-REG-15 | |
| X-CP1 | ConfirmPassword rỗng | TC-REG-16 | |
| X-CP2 | ConfirmPassword không khớp | TC-REG-17 | |
| X-RL1 | Role null | TC-REG-18 | |
| X-RL2 | Role không hợp lệ | TC-REG-19 | |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-PW1 | min- = 7 ký tự | TC-REG-11 | |
| B-PW2 | min = 8 ký tự | TC-REG-20 | |
| B-PW3 | min+ = 9 ký tự | TC-REG-21 | |
| B-PW4 | nominal = 14 ký tự | TC-REG-01 | |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | CHƯA ĐĂNG KÝ + Talent register hợp lệ → PENDING | TC-REG-01, 23 | |
| ST-02 | CHƯA ĐĂNG KÝ + Enterprise register hợp lệ → PENDING | TC-REG-02, 24 | |
| ST-03 | PENDING (Talent) + verify email → ACTIVE | Ngoài scope endpoint register | - |
| ST-04 | PENDING (Enterprise) + verify email → PENDING_APPROVAL | Ngoài scope endpoint register | - |
| ST-05 | PENDING + link hết hạn 24h → PENDING | Ngoài scope endpoint register | - |
| ST-06 | ĐÃ TỒN TẠI + register trùng email → Error | TC-REG-07, 22 | |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ → 200 Đăng ký thành công | TC-REG-01, 02, 20, 21, 25 | |
| R2 | Email format sai → 400 | TC-REG-03, 04, 05, 06 | |
| R3 | Email đã tồn tại → 400 | TC-REG-07, 22 | |
| R4 | Domain sai (Talent) → 400 | TC-REG-08 | |
| R5 | Password lỗi → 400 | TC-REG-09, 10, 11 | |
| R6 | Password yếu → 400 | TC-REG-12, 13, 14, 15 | |
| R7 | Password không khớp → 400 | TC-REG-16, 17 | |
| R8 | Role lỗi → 400 | TC-REG-18, 19 | |

> **Bao phủ thiết kế:** 21/21 EP tags, 4/4 BVA tags, 6/6 state transitions (3 ngoài scope), 8/8 decision rules - **100%**.
