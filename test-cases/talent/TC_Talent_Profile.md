# Test Cases: FR-TAL-001 - Quản lý Hồ sơ Cá nhân (Talent Profile)

**Module:** Talent  
**Chức năng:** Manage Talent Profile (`GET /api/talent/profile`, `PUT /api/talent/profile`, `POST /api/talent/skills`, `POST /api/talent/profile/avatar`, `POST /api/talent/profile/cv`, `DELETE /api/talent/skills/{id}`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày tạo:** 27/10/2026  
**Ngày cập nhật:** 07/11/2026  
                   17/11/2026
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-TAL-001  
**Source code tham chiếu:** `labodc-backend/.../dto/talent/ProfileRequest.java`, `labodc-backend/.../service/TalentService.java`

---

## Mô tả chức năng

Sinh viên (Talent) thực hiện quản lý hồ sơ cá nhân, bao gồm cập nhật thông tin liên hệ (số điện thoại, link portfolio), thêm/xóa kỹ năng chuyên môn, và tải lên tệp đại diện (Avatar), tệp hồ sơ cá nhân (CV).

**Điều kiện hợp lệ:** Yêu cầu cập nhật thông tin được chấp nhận khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `phone` | Số điện thoại liên hệ | String | Định dạng SĐT Việt Nam, 10 chữ số, bắt đầu bằng số `0` |
| `skillName` | Tên kỹ năng chuyên môn | String | Không được rỗng, độ dài từ 1 đến 100 ký tự, không trùng lặp |
| `yearsOfExperience` | Số năm kinh nghiệm | Float | Số thực từ `0.0` đến `50.0` (1 chữ số thập phân) |
| `avatar` | File ảnh đại diện | File (Image) | Định dạng JPG, PNG; Dung lượng $\le 5.0$ MB |
| `cv` | File hồ sơ cá nhân | File (Document) | Định dạng PDF, DOC, DOCX; Dung lượng $\le 20.0$ MB |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Phone (Số điện thoại)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi 10 chữ số, bắt đầu bằng số `0` | V-TEL-PHONE1 | `"0901234567"` |
| Không hợp lệ (a) | Chuỗi ít hơn 10 chữ số | X-TEL-PHONE1 | `"090123456"` |
| Không hợp lệ (b) | Chuỗi nhiều hơn 10 chữ số | X-TEL-PHONE2 | `"09012345678"` |
| Không hợp lệ (c) | Chuỗi chứa ký tự chữ hoặc ký tự đặc biệt | X-TEL-PHONE3 | `"090123456a"` |
| Không hợp lệ (d) | Chuỗi 10 chữ số nhưng không bắt đầu bằng `0` | X-TEL-PHONE4 | `"1901234567"` |

### 1.2 Skill Name (Tên kỹ năng)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi từ 1 đến 100 ký tự | V-TEL-SKILL1 | `"ReactJS"` |
| Không hợp lệ (a) | Để trống / rỗng | X-TEL-SKILL1 | `""` |
| Không hợp lệ (b) | Vượt quá 100 ký tự | X-TEL-SKILL2 | Chuỗi 101 ký tự |
| Không hợp lệ (c) | Trùng với tên kỹ năng đã có trong hồ sơ | X-TEL-SKILL3 | `"ReactJS"` (đã tồn tại) |

### 1.3 Years of Experience (Số năm kinh nghiệm)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Số thực từ 0.0 đến 50.0 | V-TEL-EXP1 | `2.5` |
| Không hợp lệ (a) | Nhỏ hơn 0.0 (số âm) | X-TEL-EXP1 | `-0.1` |
| Không hợp lệ (b) | Lớn hơn 50.0 | X-TEL-EXP2 | `50.1` |

### 1.4 Avatar & CV File (Tệp đính kèm)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ Avatar | Định dạng JPG/PNG, dung lượng $\le 5.0$ MB | V-TEL-AVT1 | File PNG 2.5 MB |
| Hợp lệ CV | Định dạng PDF/DOC/DOCX, dung lượng $\le 20.0$ MB | V-TEL-CV1 | File PDF 10.0 MB |
| Không hợp lệ (a) | Avatar vượt quá 5.0 MB | X-TEL-AVT1 | File JPG 5.1 MB |
| Không hợp lệ (b) | Avatar sai định dạng (không phải JPG/PNG) | X-TEL-AVT2 | File `avatar.txt` |
| Không hợp lệ (c) | CV vượt quá 20.0 MB | X-TEL-CV1 | File PDF 20.1 MB |
| Không hợp lệ (d) | CV sai định dạng | X-TEL-CV2 | File `cv.txt` |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-TEL-PHONE1, V-TEL-SKILL1, V-TEL-EXP1, V-TEL-AVT1, V-TEL-CV1 | 5 |
| Không hợp lệ | X-TEL-PHONE1, X-TEL-PHONE2, X-TEL-PHONE3, X-TEL-PHONE4, X-TEL-SKILL1, X-TEL-SKILL2, X-TEL-SKILL3, X-TEL-EXP1, X-TEL-EXP2, X-TEL-AVT1, X-TEL-AVT2, X-TEL-CV1, X-TEL-CV2 | 13 |
| **Tổng** | | **18 tag** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

### 2.1 Biên cho Tên kỹ năng (Skill Name Length)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min` | Độ dài tối thiểu hợp lệ | 1 | `"A"` - 1 ký tự | B-SKILL1 |
| `min+` | Ngay trên min | 2 | `"AB"` - 2 ký tự | B-SKILL2 |
| `nominal` | Giá trị giữa miền | 50 | Chuỗi 50 ký tự | B-SKILL3 |
| `max-` | Ngay dưới max | 99 | Chuỗi 99 ký tự | B-SKILL4 |
| `max` | Độ dài tối đa hợp lệ | 100 | Chuỗi 100 ký tự | B-SKILL5 |

### 2.2 Biên cho Số năm kinh nghiệm (Years of Experience)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Ngay dưới min (không hợp lệ) | -0.1 | Số âm | B-EXP1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 0.0 | 0.0 năm | B-EXP2 |
| `min+` | Ngay trên min | 0.1 | 0.1 năm | B-EXP3 |
| `nominal` | Giá trị giữa miền | 25.0 | 25.0 năm | B-EXP4 |
| `max-` | Ngay dưới max | 49.9 | 49.9 năm | B-EXP5 |
| `max` | Giá trị lớn nhất hợp lệ | 50.0 | 50.0 năm | B-EXP6 |
| `max+` | Ngay trên max (không hợp lệ) | 50.1 | Vượt trần | B-EXP7 |

### 2.3 Biên dung lượng file

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `max` Avatar | Dung lượng Avatar lớn nhất hợp lệ | 5.0 MB | File JPG đúng 5.0 MB | B-AVT6 |
| `max+` Avatar | Dung lượng Avatar vượt giới hạn | 5.1 MB | File JPG 5.1 MB | B-AVT7 |
| `max` CV | Dung lượng CV lớn nhất hợp lệ | 20.0 MB | File PDF đúng 20.0 MB | B-CV6 |
| `max+` CV | Dung lượng CV vượt giới hạn | 20.1 MB | File PDF 20.1 MB | B-CV7 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Sơ đồ trạng thái Profile & Skills

**Trạng thái:**
- **PROFILE_VIEW** - Xem thông tin hồ sơ
- **PROFILE_EDITING** - Mở form chỉnh sửa SĐT/Portfolio
- **SKILL_ADDED** - Kỹ năng mới đã được tạo thành công
- **FILE_UPLOADING** - Chọn và gửi tệp Avatar/CV

### 3.2 Bảng chuyển đổi trạng thái

| Test Case | Start State | Event/Input | Expected End State | Expected Output |
|---|---|---|---|---|
| ST-TEL-01 | PROFILE_VIEW | Nhấn "Chỉnh sửa hồ sơ" | PROFILE_EDITING | Form cho phép chỉnh sửa hiển thị dữ liệu cũ |
| ST-TEL-02 | PROFILE_EDITING | Nhấn "Lưu thay đổi" (Dữ liệu hợp lệ) | PROFILE_VIEW | Cập nhật thành công, hiển thị thông tin mới |
| ST-TEL-03 | PROFILE_VIEW | Nhập dữ liệu hợp lệ, nhấn nút "Thêm" | SKILL_ADDED | Kỹ năng được tạo thành công |
| ST-TEL-04 | PROFILE_VIEW | Nhấn biểu tượng "Xóa" tại 1 kỹ năng | PROFILE_VIEW | Kỹ năng bị biến mất khỏi danh sách |

---

## 4. Bảng quyết định (Decision Table)

### 4.1 Điều kiện và hành động

**Conditions:**
- C1: SĐT hợp lệ? (10 chữ số, bắt đầu bằng `0`)
- C2: Tên kỹ năng hợp lệ? (1-100 ký tự, không rỗng, không trùng)
- C3: Số năm kinh nghiệm hợp lệ? (0.0 đến 50.0)
- C4: File Avatar hợp lệ? (JPG/PNG, $\le 5.0$ MB)
- C5: File CV hợp lệ? (PDF/DOC/DOCX, $\le 20.0$ MB)

**Actions:**
- A1: 200 OK - Cập nhật thành công
- A2: 400 Bad Request - Lỗi định dạng SĐT
- A3: 400 Bad Request - Lỗi validation kỹ năng
- A4: 400 Bad Request - Lỗi định dạng/dung lượng File

### 4.2 Bảng quyết định

| | R1 | R2 | R3 | R4 | R5 |
|---|:---:|:---:|:---:|:---:|:---:|
| **C1:** SĐT hợp lệ | Y | N | Y | Y | Y |
| **C2:** Tên kỹ năng hợp lệ | Y | - | N | Y | Y |
| **C3:** Số năm kinh nghiệm hợp lệ | Y | - | N | Y | Y |
| **C4:** File Avatar hợp lệ | Y | - | - | N | Y |
| **C5:** File CV hợp lệ | Y | - | - | - | N |
| | | | | | |
| **A1:** 200 - Thành công | X | - | - | - | - |
| **A2:** 400 - Lỗi SĐT | - | X | - | - | - |
| **A3:** 400 - Lỗi Kỹ năng | - | - | X | - | - |
| **A4:** 400 - Lỗi File | - | - | - | X | X |

---

## 5. Bảng Test Cases (Test Specification Table)

### Preconditions (áp dụng chung)

- Tài khoản `hoangvane@student.uth.edu.vn` thuộc vai trò `TALENT` đã đăng nhập thành công.
- Có JWT Bearer Token hợp lệ.

### Bảng kịch bản test (Cấu trúc 8 cột chuẩn)

| STT | TC ID | Tên test case | Pre-condition | Input (Dữ liệu vào) | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-TAL-01 | Lấy thông tin hồ sơ cá nhân | Account TALENT `hoangvane@student.uth.edu.vn` ở trạng thái ACTIVE, có JWT Token |  `Authorization: Bearer <token>` | 200 | Trả về thông tin hồ sơ cá nhân đầy đủ (`id`, `fullName`, `studentId`, `faculty`, `skills`, `certifications`) | V-TEL-PROFILE, R1, ST-TEL-01 |
| 2 | TC-TAL-02 | Cập nhật thông tin hồ sơ hợp lệ - Nominal | Đã đăng nhập TALENT, có JWT Token | Body: `{"phone": "0901234568", "portfolioUrl": "https://github.com/hoangvane"}` | 200 | Cập nhật thông tin SĐT và Portfolio URL thành công | V-TEL-PHONE1, R1, ST-TEL-02 |
| 3 | TC-TAL-03 | Cập nhật thông tin hồ sơ hợp lệ tại biên Min | Đã đăng nhập TALENT, có JWT Token | Body: `{"phone": "0901234567", "portfolioUrl": "https://github.com/h"}` | 200 | Cập nhật thông tin thành công với portfolio URL biên ngắn | R1 |
| 4 | TC-TAL-04 | Cập nhật thông tin hồ sơ hợp lệ tại biên Max | Đã đăng nhập TALENT, có JWT Token | Body: `{"phone": "0987654321", "portfolioUrl": "https://github.com/hoangvane/my-awesome-talent-portfolio-project-labodc-uth-testing-2026-v2"}` | 200 | Cập nhật thông tin thành công với portfolio URL biên dài hợp lệ | R1 |
| 5 | TC-TAL-05 | SĐT ít hơn 10 chữ số (single fault) | Đang chỉnh sửa SĐT | Body: `{"phone": "090123456"}` | 400 | Lỗi validation: SĐT phải đủ 10 chữ số | X-TEL-PHONE1, R2 |
| 6 | TC-TAL-06 | SĐT nhiều hơn 10 chữ số (single fault) | Đang chỉnh sửa SĐT | Body: `{"phone": "09012345678"}` | 400 | Lỗi validation: SĐT phải đủ 10 chữ số | X-TEL-PHONE2, R2 |
| 7 | TC-TAL-07 | SĐT chứa ký tự chữ (single fault) | Đang chỉnh sửa SĐT | Body: `{"phone": "090123456a"}` | 400 | Lỗi validation: SĐT chỉ được chứa chữ số | X-TEL-PHONE3, R2 |
| 8 | TC-TAL-08 | SĐT không bắt đầu bằng số 0 | Đang chỉnh sửa SĐT | Body: `{"phone": "1901234567"}` | 400 | Lỗi validation: SĐT không hợp lệ | X-TEL-PHONE4, R2 |
| 9 | TC-TAL-09 | Tên kỹ năng để trống | Đang mở modal thêm skill | Body: `{"name": "", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0}` | 400 | Lỗi validation: Tên kỹ năng không được để trống | X-TEL-SKILL1, R3 |
| 10 | TC-TAL-10 | Tên kỹ năng dài 101 ký tự | Đang mở modal thêm skill | Body: `{"name": "[101 ký tự A]", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0}` | 400 | Lỗi validation: Tên kỹ năng tối đa 100 ký tự | X-TEL-SKILL2, R3 |
| 11 | TC-TAL-11 | Thêm kỹ năng trùng tên đã có | Hồ sơ đã có `Sketch` | Body: `{"name": "Sketch", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 1.5}` | 400 | Lỗi validation: `"Skill already exists: Sketch"` | X-TEL-SKILL3, R3 |
| 12 | TC-TAL-12 | Số năm kinh nghiệm âm (-0.1) | Đang mở modal thêm skill | Body: `{"name": "Python", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": -0.1}` | 400 | Lỗi validation: Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.0 | X-TEL-EXP1, B-EXP1, R3 |
| 13 | TC-TAL-13 | Số năm kinh nghiệm vượt tối đa (50.1) | Đang mở modal thêm skill | Body: `{"name": "Python", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 50.1}` | 400 | Lỗi validation: Số năm kinh nghiệm tối đa là 50.0 | X-TEL-EXP2, B-EXP7, R3 |
| 14 | TC-TAL-14 | Avatar vượt dung lượng (5.1 MB) | Đang upload Avatar | Multipart: `file: avatar_large.jpg` (5.1 MB) | 400 | Lỗi validation: Dung lượng ảnh đại diện vượt quá 5MB | X-TEL-AVT1, B-AVT7, R4 |
| 15 | TC-TAL-15 | Avatar sai định dạng (.txt) | Đang upload Avatar | Multipart: `file: avatar.txt` | 400 | Lỗi validation: Định dạng ảnh không hỗ trợ | X-TEL-AVT2, R4 |
| 16 | TC-TAL-16 | CV vượt dung lượng (20.1 MB) | Đang upload CV | Multipart: `file: cv_large.pdf` (20.1 MB) | 400 | Lỗi validation: Dung lượng file CV vượt quá 20MB | X-TEL-CV1, B-CV7, R5 |
| 17 | TC-TAL-17 | Xóa kỹ năng khỏi hồ sơ | Hồ sơ đang có `NodeJS` (ID: 2) | `DELETE /api/talent/skills/2` | 200 | Xóa kỹ năng thành công, thông báo thành công | ST-TEL-04, R1 |
| 18 | TC-TAL-18 | Thêm kỹ năng mới với ID database không bị trùng | Talent đã đăng nhập; tên kỹ năng chưa tồn tại; sequence ID của bảng `talent_skills` đồng bộ với dữ liệu hiện tại | `POST /api/talent/skills`<br>Body: `{"name": "Q", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 1.0}` | 200 | Kỹ năng được tạo thành công, sinh ID mới không trùng và xuất hiện trong danh sách | ST-TEL-03, R1 |
| 19 | TC-TAL-19 | Tên kỹ năng tại biên min (1 ký tự) | Đang mở modal thêm skill | Body: `{"name": "A", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0}` | 200 | Thêm kỹ năng thành công | B-SKILL1, R1 |
| 20 | TC-TAL-20 | Tên kỹ năng ngay trên min (2 ký tự) | Đang mở modal thêm skill | Body: `{"name": "AB", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0}` | 200 | Thêm kỹ năng thành công | B-SKILL2, R1 |
| 21 | TC-TAL-21 | Tên kỹ năng tại giá trị nominal (50 ký tự) | Đang mở modal thêm skill | Body có `name` dài 50 ký tự, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 200 | Thêm kỹ năng thành công | B-SKILL3, R1 |
| 22 | TC-TAL-22 | Tên kỹ năng ngay dưới max (99 ký tự) | Đang mở modal thêm skill | Body có `name` dài 99 ký tự, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 200 | Thêm kỹ năng thành công | B-SKILL4, R1 |
| 23 | TC-TAL-23 | Tên kỹ năng tại biên max (100 ký tự) | Đang mở modal thêm skill | Body có `name` dài 100 ký tự, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 200 | Thêm kỹ năng thành công | B-SKILL5, R1 |
| 24 | TC-TAL-24 | Kinh nghiệm tại biên min (0.0) | Đang mở modal thêm skill | Body: `{"name": "Skill Exp 0", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 0.0}` | 200 | Thêm kỹ năng thành công | B-EXP2, R1 |
| 25 | TC-TAL-25 | Kinh nghiệm ngay trên min (0.1) | Đang mở modal thêm skill | Body: `{"name": "Skill Exp 01", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 0.1}` | 200 | Thêm kỹ năng thành công | B-EXP3, R1 |
| 26 | TC-TAL-26 | Kinh nghiệm tại giá trị nominal (25.0) | Đang mở modal thêm skill | Body: `{"name": "Skill Exp 25", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 25.0}` | 200 | Thêm kỹ năng thành công | B-EXP4, R1 |
| 27 | TC-TAL-27 | Kinh nghiệm ngay dưới max (49.9) | Đang mở modal thêm skill | Body: `{"name": "Skill Exp 499", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 49.9}` | 200 | Thêm kỹ năng thành công | B-EXP5, R1 |
| 28 | TC-TAL-28 | Kinh nghiệm tại biên max (50.0) | Đang mở modal thêm skill | Body: `{"name": "Skill Exp 50", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 50.0}` | 200 | Thêm kỹ năng thành công | B-EXP6, R1 |
| 29 | TC-TAL-29 | Upload Avatar hợp lệ | Đang upload Avatar | Multipart: file PNG 2.5 MB | 200 | Upload Avatar thành công và cập nhật hồ sơ | V-TEL-AVT1, R1 |
| 30 | TC-TAL-30 | Upload CV hợp lệ | Đang upload CV | Multipart: file PDF 10.0 MB | 200 | Upload CV thành công và cập nhật hồ sơ | V-TEL-CV1, R1 |
| 31 | TC-TAL-31 | Avatar tại đúng giới hạn 5.0 MB | Đang upload Avatar | Multipart: file JPG đúng 5.0 MB | 200 | Upload Avatar thành công | B-AVT6, R1 |
| 32 | TC-TAL-32 | CV tại đúng giới hạn 20.0 MB | Đang upload CV | Multipart: file PDF đúng 20.0 MB | 200 | Upload CV thành công | B-CV6, R1 |
| 33 | TC-TAL-33 | CV sai định dạng | Đang upload CV | Multipart: file `cv.txt` | 400 | Lỗi validation: Định dạng CV không hỗ trợ | X-TEL-CV2, R4 |

---

## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

- **Lớp tương đương (EP):** 5/5 Valid Tags, 13/13 Invalid Tags - **Bao phủ 100%**.
- **Giá trị biên (BVA):** Bao phủ toàn bộ các điểm biên min-, min, min+, nominal, max-, max, max+ - **Bao phủ 100%**.
- **Chuyển đổi trạng thái (ST):** 4/4 luồng thao tác - **Bao phủ 100%**.
- **Bảng quyết định (Decision Table):** 5/5 rules quy định xử lý nghiệp vụ - **Bao phủ 100%**.