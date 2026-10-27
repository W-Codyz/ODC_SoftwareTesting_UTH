# Test Cases: FR-TAL-001 - Quản lý Hồ sơ Cá nhân (Manage Talent Profile)

**Người thực hiện:** Thành Nhân  
**Module:** Talent  
**Chức năng:** Manage Talent Profile  
**Ngày tạo:** 27/10/2026  

---

## 1. Phân tích điều kiện đầu vào

### 1.1 Số điện thoại (Phone)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| Số điện thoại Việt Nam hợp lệ (10 chữ số, bắt đầu bằng 0) | Valid | V1 | `0901234567` |
| Số điện thoại sai định dạng (chứa chữ/ký tự đặc biệt) | Invalid | X1 | `0901234abc` |
| Số điện thoại không đủ/quá số lượng chữ số (ví dụ: 8 hoặc 12 số) | Invalid | X2 | `0901234` |
| Số điện thoại rỗng | Invalid | X3 | `(empty)` |

### 1.2 Portfolio URL

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| URL hợp lệ (đúng định dạng link web/GitHub) | Valid | V2 | `https://github.com/tranthic` |
| URL sai định dạng (thiếu protocol http/https hoặc domain) | Invalid | X4 | `github.com/tranthic` |
| URL rỗng (cho phép bỏ trống) | Valid | V3 | `(empty)` |

### 1.3 Kỹ năng (Skill)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| Tên kỹ năng, level và kinh nghiệm hợp lệ | Valid | V4 | `Name: Python, Level: Intermediate, Exp: 2.0` |
| Tên kỹ năng rỗng | Invalid | X5 | `Name: (empty), Level: Beginner` |
| Số năm kinh nghiệm âm (< 0) | Invalid | X6 | `Exp: -1.0` |

### 1.4 File Ảnh Đại diện (Avatar)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| File ảnh hợp lệ (JPG/PNG, kích thước $\le$ 5MB) | Valid | V5 | `avatar.jpg (2MB)` |
| Định dạng file không hỗ trợ (ví dụ: PDF, ZIP, EXE) | Invalid | X7 | `document.pdf` |
| Kích thước file vượt quá giới hạn (> 5MB) | Boundary | B1 | `large_avatar.png (6MB)` |

### 1.5 File CV

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| File CV hợp lệ (PDF/DOC/DOCX, kích thước $\le$ 20MB) | Valid | V6 | `cv.pdf (3MB)` |
| Định dạng file không hỗ trợ (ví dụ: PNG, MP4) | Invalid | X8 | `cv_video.mp4` |
| Kích thước file vượt quá giới hạn (> 20MB) | Boundary | B2 | `heavy_cv.pdf (25MB)` |

---

## 2. Bảng Test Cases

| TC ID | Mô tả | Phone | Portfolio URL | Avatar / CV / Skill | Expected Result | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TAL-01** | Xem thông tin hồ sơ cá nhân thành công | `0901234567` | `https://github.com/tranthic` | Valid data | Trả về JSON thông tin cá nhân, danh sách skills, certs, avatarUrl, cvUrl và averageRating | V1, V2, V4 |
| **TC-TAL-02** | Cập nhật hồ sơ thành công với thông tin hợp lệ | `0901234568` | `https://github.com/newtran` | - | Cập nhật thành công, trả về message "Cập nhật hồ sơ thành công" | V1, V2 |
| **TC-TAL-03** | Cập nhật hồ sơ với Số điện thoại sai định dạng | `0901234abc` | `https://github.com/tranthic` | - | Trả về lỗi validation "Số điện thoại không hợp lệ" | X1 |
| **TC-TAL-04** | Cập nhật hồ sơ với Số điện thoại không đủ độ dài | `0901234` | `https://github.com/tranthic` | - | Trả về lỗi validation "Số điện thoại không đủ 10 chữ số" | X2 |
| **TC-TAL-05** | Cập nhật hồ sơ với Portfolio URL sai định dạng | `0901234567` | `github.com/tranthic` | - | Trả về lỗi validation "URL không hợp lệ" | X4 |
| **TC-TAL-06** | Thêm kỹ năng mới thành công | - | - | `Name: Python, Level: Intermediate, Exp: 2` | Thêm kỹ năng thành công, trả về skillId mới và thông tin kỹ năng | V4 |
| **TC-TAL-07** | Thêm kỹ năng mới nhưng để trống Tên kỹ năng | - | - | `Name: (empty), Level: Beginner` | Trả về lỗi validation "Tên kỹ năng không được để trống" | X5 |
| **TC-TAL-08** | Thêm kỹ năng mới với số năm kinh nghiệm âm | - | - | `Name: Java, Exp: -1` | Trả về lỗi validation "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0" | X6 |
| **TC-TAL-09** | Upload Ảnh đại diện (Avatar) thành công | - | - | `avatar.jpg (2MB)` | Upload thành công lên Cloudinary, trả về avatarUrl và thumbnailUrl | V5 |
| **TC-TAL-10** | Upload Avatar sai định dạng file (file PDF) | - | - | `document.pdf` | Trả về lỗi "Định dạng file không được hỗ trợ (chỉ chấp nhận JPG/PNG)" | X7 |
| **TC-TAL-11** | Upload Avatar vượt quá kích thước cho phép (> 5MB) | - | - | `large_avatar.png (6MB)` | Trả về lỗi "Kích thước file vượt quá giới hạn 5MB" | B1 |
| **TC-TAL-12** | Upload CV thành công (File PDF $\le$ 20MB) | - | - | `cv.pdf (3MB)` | Upload CV thành công lên Cloudinary, trả về cvUrl | V6 |
| **TC-TAL-13** | Upload CV vượt quá kích thước cho phép (> 20MB) | - | - | `heavy_cv.pdf (25MB)` | Trả về lỗi "Kích thước file CV vượt quá giới hạn 20MB" | B2 |
| **TC-TAL-14** | Xóa kỹ năng khỏi hồ sơ cá nhân thành công | - | - | `skillId: 1` | Xóa thành công kỹ năng khỏi hồ sơ | V4 |