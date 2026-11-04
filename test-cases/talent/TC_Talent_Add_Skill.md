# Test Cases: FR-TAL-003 - Thêm Kỹ năng cho Talent (Add Talent Skill)

**Module:** Talent  
**Chức năng:** Add Talent Skill (`POST /api/talent/skills`)  
**Người thực hiện:** Hiển Nguyễn Minh  
**Mã Task Jira:** LABODC-78  
**Ngày tạo:** 02/11/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-TAL-001/003, `docs/URD_LabOdc.md`  
**Source code tham chiếu:** `TalentController.java`, `TalentService.java`, `TalentSkillDTO.java`

---

## Mô tả chức năng

Sinh viên (Talent) thêm kỹ năng chuyên môn vào hồ sơ của mình để phục vụ cho việc ứng tuyển vào các dự án.
- Endpoint: `POST /api/talent/skills`
- Request Body JSON:
  - `skillName` (String): Tên kỹ năng (bắt buộc, không rỗng).
  - `skillCategory` (String): Danh mục kỹ năng (Frontend, Backend, DevOps, Testing, Database...).
  - `proficiencyLevel` (Enum): Trình độ (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`).
  - `yearsOfExperience` (Double): Số năm kinh nghiệm (số thực >= 0).
- Ràng buộc nghiệp vụ: Một Talent không được thêm kỹ năng bị trùng tên (duplicate skill name) trong hồ sơ cá nhân.

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Tên Kỹ năng (skillName)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Tên kỹ năng hợp lệ, chưa từng có trong hồ sơ của Talent | V-SK1 | `"Docker"` |
| Không hợp lệ (a) | Tên kỹ năng rỗng hoặc chỉ toàn khoảng trắng | X-SK1 | `""` hoặc `"   "` |
| Không hợp lệ (b) | Tên kỹ năng đã tồn tại trong hồ sơ của Talent | X-SK2 | `"Java"` (nếu đã có trong profile) |

### 1.2 Trình độ kỹ năng (proficiencyLevel)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Thuộc một trong các giá trị enum (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`) | V-LV1 | `INTERMEDIATE` |
| Không hợp lệ | Giá trị không thuộc danh sách Enum định nghĩa | X-LV1 | `"MASTER"` |

### 1.3 Số năm kinh nghiệm (yearsOfExperience)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Số thực dương hoặc bằng 0 | V-YR1 | `2.5` |
| Không hợp lệ | Số âm (< 0) | X-YR1 | `-1.0` |

### 1.4 Quyền truy cập (Authorization)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Token của user role `TALENT` | V-AUTH1 | Token `nguyenvana@student.uth.edu.vn` |
| Không hợp lệ | Không có token / Sai role (ADMIN, ENTERPRISE...) | X-AUTH1 | No Token / Token của Enterprise |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

Áp dụng cho trường **Số năm kinh nghiệm (`yearsOfExperience`)**:

| Ký hiệu | Ý nghĩa | Giá trị | Kết quả mong đợi | Tag |
|---|---|---:|---|---|
| `min-` | Ngay dưới min (< 0) | -0.1 | Báo lỗi validation không hợp lệ | B-YR_MIN_MINUS |
| `min` | Giá trị nhỏ nhất hợp lệ | 0.0 | Thêm thành công (sinh viên mới học kỹ năng) | B-YR_MIN |
| `min+` | Ngay trên min | 0.5 | Thêm thành công | B-YR_MIN_PLUS |
| `nominal` | Giá trị thông thường | 2.0 | Thêm thành công | B-YR_NOM |

---

## 3. Bảng Test Cases Chi tiết

| STT | TC ID | Tên test case | Input Body | Expected HTTP | Expected Result | Tag bao phủ |
|---:|---|---|---|---:|---|---|
| 1 | **TC-SKILL-01** | Thêm kỹ năng thành công - Dữ liệu hợp lệ (nominal) | `{"skillName": "Docker", "skillCategory": "DevOps", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0}` | 200 | Trả về `success: true`, tạo mới kỹ năng và trả về `id` | V-SK1, V-LV1, V-YR1, B-YR_NOM, V-AUTH1 |
| 2 | **TC-SKILL-02** | Thêm kỹ năng với số năm kinh nghiệm bằng 0 (Biên min) | `{"skillName": "Kubernetes", "skillCategory": "DevOps", "proficiencyLevel": "BEGINNER", "yearsOfExperience": 0.0}` | 200 | Thêm thành công với 0 năm kinh nghiệm | V-SK1, V-LV1, B-YR_MIN |
| 3 | **TC-SKILL-03** | Thêm kỹ năng trùng lặp tên đã có trong hồ sơ | `{"skillName": "Java", "proficiencyLevel": "ADVANCED", "yearsOfExperience": 3.0}` (đã có Java) | 400 | Báo lỗi `400 Bad Request`: `"Skill already exists: Java"` | X-SK2 |
| 4 | **TC-SKILL-04** | Thêm kỹ năng để trống skillName (rỗng) | `{"skillName": "", "proficiencyLevel": "BEGINNER", "yearsOfExperience": 1.0}` | 400 | Báo lỗi validation `@NotBlank` hoặc Bad Request | X-SK1 |
| 5 | **TC-SKILL-05** | Thêm kỹ năng với số năm kinh nghiệm âm (< 0) | `{"skillName": "GoLang", "proficiencyLevel": "BEGINNER", "yearsOfExperience": -1.0}` | 400 | Báo lỗi validation số năm kinh nghiệm không được âm | X-YR1, B-YR_MIN_MINUS |
| 6 | **TC-SKILL-06** | Thêm kỹ năng với proficiencyLevel sai Enum | `{"skillName": "VueJS", "proficiencyLevel": "GOD_LEVEL", "yearsOfExperience": 1.0}` | 400 | Báo lỗi Deserialize JSON Enum / Bad Request | X-LV1 |
| 7 | **TC-SKILL-07** | Thêm kỹ năng khi chưa đăng nhập / Không gửi Token | `{"skillName": "React", ...}` (Không gửi Header Auth) | 401 / 403 | Từ chối truy cập | X-AUTH1 |
| 8 | **TC-SKILL-08** | Thêm kỹ năng bằng tài khoản vai trò khác (ENTERPRISE) | Gửi token của Enterprise | 403 | Từ chối truy cập do sai quyền vai trò | X-AUTH1 |
