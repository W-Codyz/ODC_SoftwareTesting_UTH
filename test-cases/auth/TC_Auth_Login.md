# Test Cases: FR-AUTH-001 - Đăng nhập (Login)

**Module:** Authentication  
**Chức năng:** User Login (`POST /auth/login`)  
**Người thực hiện:** Đặng Thành Đình Phát  
**Ngày tạo:** 27/10/2026  
**Ngày cập nhật:** 31/10/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-AUTH-001  
**Source code tham chiếu:** `auth-service/.../dto/LoginRequest.java`, `auth-service/.../service/AuthFacade.java`

---

## Mô tả chức năng

Người dùng gửi request `POST /auth/login` với body JSON gồm `email` và `password`. Hệ thống validate đầu vào, xác thực thông tin, và trả về JWT token nếu thành công.

**Điều kiện hợp lệ:** Yêu cầu login được chấp nhận khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `email` | Email đăng nhập | String | Không rỗng, đúng format email (RFC), đúng case, tồn tại trong DB |
| `password` | Mật khẩu | String | Không rỗng, khớp với password đã hash trong DB |

**Giả định:**

1. Chỉ xét đầu vào gửi qua API (`Content-Type: application/json`). Các trường hợp thiếu field hoặc sai kiểu JSON không nằm trong phạm vi test này.
2. Validation tầng controller do Spring `@Valid` xử lý: `@NotBlank` và `@Email` trên `LoginRequest`.
3. Xác thực nghiệp vụ (email tồn tại, password khớp) do `AuthFacade.login()` xử lý, trả về message chung `"Invalid email or password"` cho cả hai trường hợp sai email lẫn sai password (bảo mật).

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Email

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Email đúng format, đúng case, không rỗng, tồn tại trong DB | V-EM1 | `testlogin@labodc.com` |
| Không hợp lệ (a) | Email rỗng / chỉ có khoảng trắng | X-EM1 | `""` |
| Không hợp lệ (b) | Email sai format - thiếu `@` | X-EM2 | `testloginlabodc.com` |
| Không hợp lệ (c) | Email sai format - thiếu domain | X-EM3 | `testlogin@` |
| Không hợp lệ (d) | Email đúng format nhưng không tồn tại trong DB | X-EM4 | `ghost@labodc.com` |
| Không hợp lệ (e) | Email đúng format, tồn tại nhưng sai case (hoa/thường) | X-EM5 | `TESTLOGIN@LABODC.COM` |

### 1.2 Password

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Password không rỗng, khớp với DB | V-PW1 | `Secure@123` (10 ký tự) |
| Không hợp lệ (a) | Password rỗng / chỉ có khoảng trắng | X-PW1 | `""` |
| Không hợp lệ (b) | Password không rỗng nhưng sai (không khớp DB) | X-PW2 | `WrongPass999!` |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-EM1, V-PW1 | 2 |
| Không hợp lệ | X-EM1, X-EM2, X-EM3, X-EM4, X-EM5, X-PW1, X-PW2 | 7 |
| **Tổng** | | **9 tag** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

Biến có biên số học rõ ràng là **độ dài password** (SRS quy định min = 8 ký tự ở tầng đăng ký). Tại login, hệ thống không validate độ dài mà chỉ so khớp hash - do đó BVA chỉ áp dụng **phía hợp lệ**: kiểm tra rằng tài khoản đã đăng ký với password tại các giá trị biên có thể login thành công.

Email không có ràng buộc độ dài cụ thể trong SRS nên không áp dụng BVA cho email.

### 2.1 Độ dài Password (phía hợp lệ)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min` | Giá trị nhỏ nhất hợp lệ | 8 | `Abcdef1!` - 8 ký tự | B-PW1 |
| `min+` | Ngay trên min | 9 | `Abcdefg1!` - 9 ký tự | B-PW2 |
| `nominal` | Giá trị đại diện giữa miền | 10 | `Secure@123` - 10 ký tự | B-PW3 |

> **Ghi chú:** Giá trị biên `min-` (7 ký tự) không áp dụng cho login vì login không validate độ dài password - password dưới 8 ký tự tại login chỉ đơn giản là "sai password" (không khớp hash), bản chất giống lớp X-PW2. Ràng buộc min = 8 được ràng buộc ở tầng đăng ký. Phía max không quy định trong SRS nên BVA cũng không áp dụng.

### Tổng hợp tag biên

| Tags | Số lượng |
|---|---|
| B-PW1, B-PW2, B-PW3 | 3 tag |

---

## 3. Bảng Test Cases

### Nguyên tắc thiết kế

- **Test case hợp lệ:** Tất cả biến đều hợp lệ (email đúng format + đúng case + tồn tại, password đúng).
- **Test case không hợp lệ:** Tuân thủ nguyên tắc **single fault** - mỗi test chỉ có đúng **một** biến sai, biến còn lại giữ hợp lệ, để xác định chính xác nguyên nhân gây lỗi.

### Preconditions (áp dụng cho tất cả test case)

- Auth-service đang chạy và kết nối DB.
- Tài khoản test `testlogin@labodc.com` đã đăng ký với password `Secure@123` (10 ký tự), trạng thái ACTIVE.
- Tài khoản test `testmin@labodc.com` đã đăng ký với password `Abcdef1!` (8 ký tự).
- Tài khoản test `testminplus@labodc.com` đã đăng ký với password `Abcdefg1!` (9 ký tự).

### Bảng test case

| STT | TC ID | Tên test case | Email | Password | Expected HTTP | Expected Result | Tag được bao phủ |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-LOGIN-01 | Login thành công - tất cả hợp lệ (nominal) | `testlogin@labodc.com` | `Secure@123` (10 ký tự, đúng) | 200 | Trả về JSON: `token`, `tokenType: "Bearer"`, `email`, `role` | V-EM1, V-PW1, B-PW3 |
| 2 | TC-LOGIN-02 | Login thành công - password tại biên min (8 ký tự) | `testmin@labodc.com` | `Abcdef1!` (8 ký tự, đúng) | 200 | Login thành công, trả về token | V-EM1, V-PW1, B-PW1 |
| 3 | TC-LOGIN-03 | Login thành công - password tại biên min+ (9 ký tự) | `testminplus@labodc.com` | `Abcdefg1!` (9 ký tự, đúng) | 200 | Login thành công, trả về token | V-EM1, V-PW1, B-PW2 |
| 4 | TC-LOGIN-04 | Email rỗng (single fault) | `""` | `Secure@123` | 400 | Lỗi validation `@NotBlank` - email không được rỗng | X-EM1 |
| 5 | TC-LOGIN-05 | Email sai format - thiếu @ (single fault) | `testloginlabodc.com` | `Secure@123` | 400 | Lỗi validation `@Email` - email không hợp lệ | X-EM2 |
| 6 | TC-LOGIN-06 | Email sai format - thiếu domain (single fault) | `testlogin@` | `Secure@123` | 400 | Lỗi validation `@Email` - email không hợp lệ | X-EM3 |
| 7 | TC-LOGIN-07 | Email không tồn tại trong DB (single fault) | `ghost@labodc.com` | `Secure@123` | 401 | `"Invalid email or password"` | X-EM4 |
| 8 | TC-LOGIN-08 | Password rỗng (single fault) | `testlogin@labodc.com` | `""` | 400 | Lỗi validation `@NotBlank` - password không được rỗng | X-PW1 |
| 9 | TC-LOGIN-09 | Password sai - đủ dài nhưng không khớp (single fault) | `testlogin@labodc.com` | `WrongPass999!` (14 ký tự) | 401 | `"Invalid email or password"` | X-PW2 |
| 10 | TC-LOGIN-10 | Email chỉ có khoảng trắng | `"   "` | `Secure@123` | 400 | Lỗi validation - email rỗng sau trim | X-EM1 |
| 11 | TC-LOGIN-11 | Password chỉ có khoảng trắng | `testlogin@labodc.com` | `"   "` | 400 | Lỗi validation `@NotBlank` | X-PW1 |
| 12 | TC-LOGIN-12 | Email có khoảng trắng đầu/cuối (edge case) | `" testlogin@labodc.com "` | `Secure@123` | 400 hoặc 401 | Tùy implementation: lỗi format hoặc không tìm thấy user | X-EM2 |
| 13 | TC-LOGIN-13 | Email viết hoa - case sensitivity (single fault) | `TESTLOGIN@LABODC.COM` | `Secure@123` | 401 | `"Invalid email or password"` - hệ thống phân biệt hoa/thường email | X-EM5 |

### Kiểm tra bao phủ

**Lớp tương đương:**

| Tag | Bao phủ bởi | 
|---|---|
| V-EM1 | TC-LOGIN-01, 02, 03 | 
| V-PW1 | TC-LOGIN-01, 02, 03 | 
| X-EM1 | TC-LOGIN-04, 10 | 
| X-EM2 | TC-LOGIN-05, 12 | 
| X-EM3 | TC-LOGIN-06 | 
| X-EM4 | TC-LOGIN-07 | 
| X-EM5 | TC-LOGIN-13 | 
| X-PW1 | TC-LOGIN-08, 11 | 
| X-PW2 | TC-LOGIN-09 | 

**Giá trị biên:**

| Tag | Bao phủ bởi |
|---|---|
| B-PW1 (min = 8) | TC-LOGIN-02 | 
| B-PW2 (min+ = 9) | TC-LOGIN-03 | 
| B-PW3 (nominal = 10) | TC-LOGIN-01 | 

> **Kết luận:** 9/9 tag lớp tương đương và 3/3 tag biên đã được bao phủ đầy đủ. Không có tag nào bị bỏ sót.

---

### Các trường hợp chưa test (nằm ngoài scope hiện tại)

- Account bị lock sau 5 lần sai (SRS có quy định, code chưa implement).
- Account status INACTIVE/PENDING.
- JWT token content validation (thuộc FR-AUTH-003 Validate).
- Rate limiting / brute force protection.
- SQL injection trong email field.
- Password rất dài / stress test - thuộc non-functional testing, ngoài scope EP/BVA.
- Password dưới 8 ký tự tại login - ràng buộc độ dài thuộc tầng đăng ký.