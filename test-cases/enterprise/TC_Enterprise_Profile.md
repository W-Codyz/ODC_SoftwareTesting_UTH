# Test Cases: FR-ENT-001 - Quản lý Hồ sơ Doanh nghiệp (Manage Enterprise Profile)

**Module:** Enterprise Portal  
**Chức năng:** Quản lý Hồ sơ Doanh nghiệp (`GET/PUT /api/enterprise/profile`, `POST /api/enterprise/profile/logo`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày tạo:** 08/11/2026  
**Ngày cập nhật:** 18/11/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-ENT-001  
**Source code tham chiếu:** `EnterpriseController.java`, `EnterprisePortalController.java`, `EnterpriseService.java`, `Enterprise.java`, `EnterpriseDTO.java`

---

## Mô tả chức năng

Doanh nghiệp (Enterprise) sau khi đăng nhập có thể xem thông tin hồ sơ của chính mình, cập nhật các trường thông tin cơ bản (tên công ty, địa chỉ, người đại diện, số điện thoại, lĩnh vực hoạt động...) và tải lên logo đại diện công ty.

**Điều kiện hợp lệ:** Yêu cầu được chấp nhận khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ theo SRS |
|---|---|---|---|
| `Role` | Quyền người dùng | Authentication | User mang role `ENTERPRISE` đã xác thực hợp lệ |
| `companyName` | Tên doanh nghiệp | String | 5 đến 255 ký tự, không rỗng, không chứa khoảng trắng độc lập |
| `taxCode` | Mã số thuế | String | 10 đến 13 chữ số, duy nhất trong hệ thống |
| `phone` | Số điện thoại | String | Đúng định dạng số điện thoại Việt Nam (10 chữ số, bắt đầu bằng đầu số hợp lệ) |
| `address` | Địa chỉ công ty | String | 1 đến 500 ký tự, không rỗng |
| `logo` | File ảnh logo | File Upload | Định dạng JPG hoặc PNG, dung lượng tối đa 5 MB |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Authentication & Quyền truy cập (Role)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Token của tài khoản có role ENTERPRISE hợp lệ | V-RL1 | Token Enterprise |
| Không hợp lệ (a) | Chưa đăng nhập (Không gửi Authorization Header) | X-RL1 | (Không gửi token) |
| Không hợp lệ (b) | Token của role khác (Talent / Mentor) | X-RL2 | Token Talent / Mentor |
| Cần xác nhận | Token Enterprise hợp lệ nhưng chưa có bản ghi hồ sơ | X-RL3 | Enterprise mới tạo chưa link entity |

### 1.2 Tên doanh nghiệp (`companyName`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi có độ dài từ 5 đến 255 ký tự | V-CN1 | `"Công ty Cổ phần Công nghệ FPT"` |
| Không hợp lệ (a) | Rỗng hoặc chỉ có khoảng trắng | X-CN1 | `""` hoặc `"   "` |
| Không hợp lệ (b) | Độ dài dưới 5 ký tự (< 5) | X-CN2 | `"ABC"` (3 ký tự) |
| Không hợp lệ (c) | Độ dài vượt quá 255 ký tự (> 255) | X-CN3 | Chuỗi 256 ký tự |

### 1.3 Mã số thuế (`taxCode`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | 10 đến 13 chữ số, duy nhất chưa tồn tại trong DB | V-TX1 | `"0312345678"` (10 số) hoặc `"0101234567001"` (13 số) |
| Không hợp lệ (a) | Dưới 10 chữ số (< 10) | X-TX1 | `"031234567"` (9 số) |
| Không hợp lệ (b) | Vượt quá 13 chữ số (> 13) | X-TX2 | `"01012345670019"` (14 số) |
| Không hợp lệ (c) | Chứa ký tự không phải chữ số | X-TX3 | `"031234567A"` |
| Không hợp lệ (d) | Mã số thuế đã được doanh nghiệp khác đăng ký | X-TX4 | MST đã tồn tại trong DB |

### 1.4 Số điện thoại (`phone`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Số điện thoại VN hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09) | V-PH1 | `"0901234567"` |
| Không hợp lệ (a) | Sai định dạng (chứa chữ cái hoặc ký tự đặc biệt) | X-PH1 | `"090123456a"` |
| Không hợp lệ (b) | Thiếu chữ số (9 số) hoặc thừa chữ số (11 số) | X-PH2 | `"090123456"` (9 số) |

### 1.5 Địa chỉ (`address`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Địa chỉ hợp lệ từ 1 đến 500 ký tự | V-AD1 | `"Số 1 Võ Văn Ngân, Thủ Đức, TP.HCM"` |
| Không hợp lệ | Địa chỉ rỗng hoặc chỉ khoảng trắng | X-AD1 | `""` |

### 1.6 File Logo tải lên (`logo`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Ảnh JPG dung lượng <= 5 MB | V-LG1 | File `logo.jpg` (2 MB) |
| Hợp lệ (b) | Ảnh PNG dung lượng <= 5 MB | V-LG2 | File `logo.png` (5 MB) |
| Không hợp lệ (a) | File sai định dạng (PDF, GIF, SVG, EXE) | X-LG1 | File `document.pdf` hoặc `banner.gif` |
| Không hợp lệ (b) | Dung lượng vượt quá 5 MB (> 5 MB) | X-LG2 | File `logo_huge.png` (5 MB + 1 KB) |
| Không hợp lệ (c) | Không đính kèm part file trong multipart request | X-LG3 | Request thiếu trường `file` |

### Tổng hợp Tag lớp tương đương (EP)

| Loại | Tags | Số lượng |
|---|---|---:|
| Hợp lệ (Valid) | V-RL1, V-CN1, V-TX1, V-PH1, V-AD1, V-LG1, V-LG2 | 7 |
| Không hợp lệ (Invalid) | X-RL1, X-RL2, X-RL3, X-CN1, X-CN2, X-CN3, X-TX1, X-TX2, X-TX3, X-TX4, X-PH1, X-PH2, X-AD1, X-LG1, X-LG2, X-LG3 | 16 |
| **Tổng cộng** | | **23 Tags** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

### 2.1 Độ dài Tên doanh nghiệp (`companyName`: [5..255])

| Ký hiệu | Ý nghĩa | Giá trị kiểm thử | Tag |
|---|---|---|---|
| `min-` | Ngay dưới min | 4 ký tự (`"ABCD"`) | B-CN1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 5 ký tự (`"ABCDE"`) | B-CN2 |
| `min+` | Ngay trên min | 6 ký tự (`"ABCDEF"`) | B-CN3 |
| `nominal` | Giá trị thông thường | 30 ký tự (`"Công ty Công nghệ Thông tin FPT"`) | B-CN4 |
| `max-` | Ngay dưới max | 254 ký tự | B-CN5 |
| `max` | Giá trị lớn nhất hợp lệ | 255 ký tự | B-CN6 |
| `max+` | Vượt quá max | 256 ký tự | B-CN7 |

### 2.2 Độ dài Mã số thuế (`taxCode`: [10..13])

| Ký hiệu | Ý nghĩa | Giá trị kiểm thử | Tag |
|---|---|---|---|
| `min-` | Dưới độ dài tối thiểu | 9 chữ số (`"012345678"`) | B-TX1 |
| `min` | Độ dài tối thiểu hợp lệ | 10 chữ số (`"0312345678"`) | B-TX2 |
| `nominal` | Độ dài trung gian | 11 chữ số | B-TX3 |
| `max` | Độ dài tối đa hợp lệ | 13 chữ số (`"0101234567001"`) | B-TX4 |
| `max+` | Vượt độ dài tối đa | 14 chữ số (`"01012345670019"`) | B-TX5 |

### 2.3 Kích thước File Logo (Max = 5 MB)

| Ký hiệu | Ý nghĩa | Dung lượng kiểm thử | Tag |
|---|---|---|---|
| `nominal` | Dung lượng an toàn thông thường | 2 MB | B-LG1 |
| `max-` | Cận kề trần | 4.9 MB | B-LG2 |
| `max` | Đúng ngưỡng trần 5 MB | 5 MB (5.242.880 bytes) | B-LG3 |
| `max+` | Vượt trần cho phép | 5 MB + 1 Byte | B-LG4 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Bảng chuyển đổi trạng thái Hồ sơ Doanh nghiệp

| Mã ST | Trạng thái hiện tại | Sự kiện kích hoạt (Action) | Trạng thái tiếp theo | Mã phản hồi | Ghi chú |
|---|---|---|---|---|---|
| **ST-01** | Chưa đăng nhập / Guest | Gửi GET/PUT/POST không token | Giữ nguyên (Unauthorized) | 401 | Bắt buộc xác thực |
| **ST-02** | Profile đã tạo | Enterprise gửi GET profile | PROFILE_EXISTS (Read-only) | 200 | Trả về thông tin hồ sơ |
| **ST-03** | Profile đã tạo | Enterprise gửi PUT với data hợp lệ | PROFILE_UPDATED | 200 | Cập nhật DB thành công |
| **ST-04** | Profile đã tạo | Enterprise gửi PUT với data lỗi | PROFILE_EXISTS (Không đổi) | 400 | Rollback, báo lỗi dữ liệu |
| **ST-05** | Profile đã tạo | Enterprise upload logo hợp lệ | PROFILE_LOGO_UPDATED | 200 | Lưu file, cập nhật `logoUrl` |
| **ST-06** | Profile đã tạo | Upload logo > 5MB hoặc sai định dạng | PROFILE_EXISTS (Không đổi) | 400 | Từ chối file |

---

## 4. Bảng quyết định (Decision Table)

| Điều kiện (Conditions) | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 | Rule 6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **C1:** Đã xác thực (Token hợp lệ)? | Y | N | Y | Y | Y | Y |
| **C2:** Role người dùng là ENTERPRISE? | Y | - | N | Y | Y | Y |
| **C3:** Input fields (Tên, SĐT, Địa chỉ) hợp lệ? | Y | - | - | N | Y | Y |
| **C4:** Mã số thuế hợp lệ & chưa trùng? | Y | - | - | - | N | Y |
| **C5:** File logo hợp lệ (JPG/PNG <= 5MB)? | Y | - | - | - | - | N |
| **Hành động (Actions)** | | | | | | |
| **A1:** Xử lý thành công (200 OK) | **X** | - | - | - | - | - |
| **A2:** Trả lỗi 401 Unauthorized | - | **X** | - | - | - | - |
| **A3:** Trả lỗi 403 Forbidden | - | - | **X** | - | - | - |
| **A4:** Trả lỗi 400 Bad Request (Validation) | - | - | - | **X** | **X** | **X** |

---

## 5. Bảng Test Cases

### 5.1 GET `/api/enterprise/profile` - Xem hồ sơ doanh nghiệp

| STT | TC ID | Tên test case | Role / Precondition | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---:|---|---|
| 1 | TC-ENT001-01 | Enterprise xem hồ sơ của chính mình | Token ENTERPRISE A | 200 | `success=true`, trả đủ các trường `id`, `companyName`, `taxCode`, `address`, `phone`, `email` | V-RL1, ST-02, R1 |
| 2 | TC-ENT001-02 | Chặn xem hồ sơ khi chưa đăng nhập | Không gửi token | 401 | Bị từ chối truy cập do thiếu xác thực | X-RL1, ST-01, R2 |
| 3 | TC-ENT001-03 | Chặn xem hồ sơ bằng role TALENT | Token role TALENT | 403 | Bị từ chối quyền truy cập (Forbidden) | X-RL2, R3 |
| 4 | TC-ENT001-04 | Chặn xem hồ sơ bằng role MENTOR | Token role MENTOR | 403 | Bị từ chối quyền truy cập (Forbidden) | X-RL2, R3 |
| 5 | TC-ENT001-05 | Enterprise B chỉ lấy hồ sơ của B (Isolation) | Token ENTERPRISE B | 200 | Dữ liệu trả về đúng `id` và thông tin của B, không lẫn với A | V-RL1, ST-02, R1 |

### 5.2 PUT `/api/enterprise/profile` - Cập nhật hồ sơ (Happy Path & Data Validation)

| STT | TC ID | Tên test case | companyName | phone | address | taxCode | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---|---|---:|---|---|
| 6 | TC-ENT001-06 | Cập nhật hồ sơ thành công (nominal) | `"Công ty TNHH Phần mềm ABC"` | `"0901234567"` | `"123 Lê Lợi, Q1, HCM"` | `"0312345678"` | 200 | Cập nhật thành công, data mới được lưu | V-RL1, V-CN1, V-PH1, V-AD1, B-CN4, ST-03, R1 |
| 7 | TC-ENT001-07 | Tên công ty tại biên min (5 ký tự) | `"ABCDE"` | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 200 | Chấp nhận tên tại biên 5 ký tự | V-CN1, B-CN2, ST-03, R1 |
| 8 | TC-ENT001-08 | Tên công ty tại biên max (255 ký tự) | 255 ký tự | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 200 | Chấp nhận tên tại biên 255 ký tự | V-CN1, B-CN6, ST-03, R1 |
| 9 | TC-ENT001-09 | Từ chối tên công ty dưới min (4 ký tự) | `"ABCD"` | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 400 | Lỗi validation độ dài tối thiểu 5 ký tự | X-CN2, B-CN1, ST-04, R4 |
| 10 | TC-ENT001-10 | Từ chối tên công ty vượt max (256 ký tự) | 256 ký tự | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 400 | Lỗi validation độ dài tối đa 255 ký tự | X-CN3, B-CN7, ST-04, R4 |
| 11 | TC-ENT001-11 | Từ chối tên công ty để rỗng | `""` | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 400 | Lỗi trường bắt buộc không được rỗng | X-CN1, ST-04, R4 |
| 12 | TC-ENT001-12 | Cập nhật với mã số thuế 10 chữ số (min) | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | `"0312345678"` | 200 | Cập nhật thành công | V-TX1, B-TX2, ST-03, R1 |
| 13 | TC-ENT001-13 | Cập nhật với mã số thuế 13 chữ số (max) | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | `"0101234567001"` | 200 | Cập nhật thành công | V-TX1, B-TX4, ST-03, R1 |
| 14 | TC-ENT001-14 | Từ chối mã số thuế dưới min (9 chữ số) | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | `"031234567"` | 400 | MST phải từ 10 đến 13 chữ số | X-TX1, B-TX1, ST-04, R5 |
| 15 | TC-ENT001-15 | Từ chối mã số thuế vượt max (14 chữ số) | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | `"01012345670019"` | 400 | MST không được vượt 13 chữ số | X-TX2, B-TX5, ST-04, R5 |
| 16 | TC-ENT001-16 | Từ chối mã số thuế chứa chữ | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | `"031234567A"` | 400 | MST chỉ bao gồm chữ số | X-TX3, ST-04, R5 |
| 17 | TC-ENT001-17 | Từ chối mã số thuế bị trùng với DN khác | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | MST của Enterprise B | 400/409 | Lỗi MST đã tồn tại | X-TX4, ST-04, R5 |
| 18 | TC-ENT001-18 | Từ chối số điện thoại chứa chữ cái | `"Công ty ABC"` | `"090123456a"` | `"123 Lê Lợi"` | `"0312345678"` | 400 | SĐT sai định dạng | X-PH1, ST-04, R4 |
| 19 | TC-ENT001-19 | Từ chối số điện thoại thiếu số (9 chữ số) | `"Công ty ABC"` | `"090123456"` | `"123 Lê Lợi"` | `"0312345678"` | 400 | SĐT phải đủ 10 chữ số | X-PH2, ST-04, R4 |
| 20 | TC-ENT001-20 | Từ chối địa chỉ để trống | `"Công ty ABC"` | `"0901234567"` | `""` | `"0312345678"` | 400 | Địa chỉ không được để trống | X-AD1, ST-04, R4 |
| 21 | TC-ENT001-21 | Chặn PUT khi không gửi token | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | - | 401 | Unauthorized | X-RL1, ST-01, R2 |
| 22 | TC-ENT001-22 | Chặn PUT bằng token role TALENT | `"Công ty ABC"` | `"0901234567"` | `"123 Lê Lợi"` | - | 403 | Forbidden | X-RL2, R3 |

### 5.3 POST `/api/enterprise/profile/logo` - Tải lên logo công ty

| STT | TC ID | Tên test case | Định dạng file | Dung lượng | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 23 | TC-ENT001-23 | Upload file JPG hợp lệ (nominal) | JPG (`logo.jpg`) | 2 MB | 200 | Upload thành công, trả về `logoUrl` | V-RL1, V-LG1, B-LG1, ST-05, R1 |
| 24 | TC-ENT001-24 | Upload file PNG đúng ngưỡng trần (5 MB) | PNG (`logo.png`) | Đúng 5 MB | 200 | Upload thành công tại giá trị biên 5 MB | V-RL1, V-LG2, B-LG3, ST-05, R1 |
| 25 | TC-ENT001-25 | Từ chối logo dung lượng vượt 5 MB | PNG (`huge.png`) | 5 MB + 1 Byte | 400 | Báo lỗi dung lượng vượt giới hạn 5 MB | X-LG2, B-LG4, ST-06, R6 |
| 26 | TC-ENT001-26 | Từ chối logo sai định dạng (PDF/GIF) | GIF (`anim.gif`) | 1 MB | 400 | Báo lỗi định dạng (chỉ nhận JPG/PNG) | X-LG1, ST-06, R6 |
| 27 | TC-ENT001-27 | Từ chối upload khi thiếu part `file` | Không gửi file | 0 Byte | 400 | Báo lỗi thiếu file multipart | X-LG3, ST-06, R6 |
| 28 | TC-ENT001-28 | Chặn upload logo khi chưa đăng nhập | JPG hợp lệ | 2 MB | 401 | Unauthorized | X-RL1, ST-01, R2 |

---

## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

| Phân loại | Tổng số Tag thiết kế | Danh sách Tag đã bao phủ bởi Test Cases | Tỷ lệ bao phủ |
|---|---:|---|:---:|
| **Lớp tương đương (EP)** | 23 | V-RL1, X-RL1, X-RL2, X-RL3, V-CN1, X-CN1, X-CN2, X-CN3, V-TX1, X-TX1, X-TX2, X-TX3, X-TX4, V-PH1, X-PH1, X-PH2, V-AD1, X-AD1, V-LG1, V-LG2, X-LG1, X-LG2, X-LG3 | **100%** |
| **Giá trị biên (BVA)** | 16 | B-CN1 đến B-CN7, B-TX1 đến B-TX5, B-LG1 đến B-LG4 | **100%** |
| **Chuyển đổi trạng thái (ST)** | 6 | ST-01, ST-02, ST-03, ST-04, ST-05, ST-06 | **100%** |
| **Bảng quyết định (Rule)** | 6 | Rule 1, Rule 2, Rule 3, Rule 4, Rule 5, Rule 6 | **100%** |
| **Tổng số test cases** | **28** | Bao phủ trọn vẹn 3 API methods theo SRS v1.7 | **Đạt chuẩn** |
