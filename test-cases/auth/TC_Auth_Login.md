# Test Cases: FR-AUTH-001 - Đăng nhập (Login)

**Người thực hiện:** Đinh Phát  
**Module:** Authentication  
**Chức năng:** User Login  
**Ngày tạo:** 27/10/2026  

---

## 1. Phân tích điều kiện đầu vào

### 1.1 Email

| Điều kiện | Loại | Tag | Giá trị đại diện |
|-----------|------|-----|-------------------|
| Email hợp lệ, tồn tại trong DB | Valid | V1 | `user@uth.edu.vn` |
| Email hợp lệ, KHÔNG tồn tại trong DB | Invalid | X1 | `notexist@uth.edu.vn` |
| Email sai format (thiếu @) | Invalid | X2 | `useruth.edu.vn` |
| Email sai format (thiếu domain) | Invalid | X3 | `user@` |
| Email rỗng | Invalid | X4 | ` ` (empty) |

### 1.2 Password

| Điều kiện | Loại | Tag | Giá trị đại diện |
|-----------|------|-----|-------------------|
| Password đúng, ≥ 8 ký tự | Valid | V2 | `SecurePass123!` |
| Password sai (không khớp DB) | Invalid | X5 | `WrongPass999!` |
| Password rỗng | Invalid | X6 | ` ` (empty) |
| Password đúng 8 ký tự (boundary min theo SRS) | Boundary | B1 | `Abcdef1!` (8 ký tự) |
| Password 7 ký tự (boundary min-1 theo SRS) | Boundary | B2 | `Abcde1!` (7 ký tự) |
| Password 9 ký tự (boundary min+1) | Boundary | B3 | `Abcdefg1!` (9 ký tự) |


### 1.3 Account Status

| Điều kiện | Loại | Tag | Giá trị đại diện |
|-----------|------|-----|-------------------|
| Tài khoản hoạt động bình thường | Valid | V3 | Tài khoản tồn tại, login được |

---

## 2. Bảng Test Cases

| TC ID | Mô tả | Email | Password | Expected Result | Tags |
|-------|--------|-------|----------|-----------------|------|
| TC-LOGIN-01 | Login thành công với credentials hợp lệ | `user@uth.edu.vn` (hợp lệ, tồn tại) | `SecurePass123!` (đúng) | Login thành công, trả về JSON gồm `token`, `tokenType: "Bearer"`, `email`, `role` | V1, V2, V3 |
| TC-LOGIN-02 | Login với email không tồn tại | `notexist@uth.edu.vn` | `SecurePass123!` | Trả về lỗi `"Sai email hoặc mật khẩu"` | X1 |
| TC-LOGIN-03 | Login với email sai format (thiếu @) | `useruth.edu.vn` | `SecurePass123!` | Trả về lỗi validation email | X2 |
| TC-LOGIN-04 | Login với email sai format (thiếu domain) | `user@` | `SecurePass123!` | Trả về lỗi validation email | X3 |
| TC-LOGIN-05 | Login với email rỗng | ` ` (empty) | `SecurePass123!` | Trả về lỗi validation `@NotBlank` | X4 |
| TC-LOGIN-06 | Login với password sai | `user@uth.edu.vn` (tồn tại) | `WrongPass999!` | Trả về lỗi `"Sai email hoặc mật khẩu"` | X5 |
| TC-LOGIN-07 | Login với password rỗng | `user@uth.edu.vn` | ` ` (empty) | Trả về lỗi validation `@NotBlank` | X6 |
| TC-LOGIN-08 | Login với password đúng 8 ký tự (boundary min) | `user@uth.edu.vn` (tồn tại) | `Abcdef1!` (8 ký tự, đúng) | Login thành công | B1 |
| TC-LOGIN-09 | Login với password 7 ký tự | `user@uth.edu.vn` | `Abcde1!` (7 ký tự) | Trả về lỗi `"Sai email hoặc mật khẩu"` | B2 |
| TC-LOGIN-10 | Login với password 9 ký tự (trên boundary min) | `user@uth.edu.vn` (tồn tại) | `Abcdefg1!` (9 ký tự, đúng) | Login thành công | B3 |