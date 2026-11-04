# Test Cases: FR-TAL-001 - Quản lý Hồ sơ Cá nhân (Manage Talent Profile)

**Người thực hiện:** Thành Nhân
**Module:** Talent  
**Chức năng:** Manage Talent Profile   
**Ngày thực thi:** 28/10/2026  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ (EXECUTION SUMMARY)

### 1.1 Thống kê trạng thái thực thi

| Chỉ số | Số lượng | Tỷ lệ (%) |
| :--- | :---: | :---: |
| **Tổng số Test Cases** | **18** | **100.0%** |
| **Passed (Đạt)** | **15** | **83.3%** |
| **Failed (Lỗi)** | **3** | **16.7%** |
| **Blocked / Skipped (Bị nghẽn / Bỏ qua)** | **0** | **0.0%** |

### 1.2 Danh sách lỗi phát hiện (Defect Log)

| Defect ID | Mức độ (Severity) | Mô tả ngắn gọn về lỗi | Trạng thái |
| :--- | :---: | :--- | :---: |
| **1** | Medium | Hệ thống không validate protocol (http/https) đối với Portfolio URL (nhập `github.com/abc` vẫn lưu thành công). | Open |
| **2** | High | Upload CV dung lượng vượt quá 20MB bị lỗi server HTTP 500 thay vì trả về lỗi validation HTTP 400. | Open |
| **3** | Low | Đăng ký/cập nhật Bằng cấp với Ngày cấp (`issueDate`) ở thời điểm tương lai vẫn lưu thành công. | Open |

---

## 2. PHÂN TÍCH ĐIỀU KIỆN ĐẦU VÀO (INPUT DOMAIN ANALYSIS)

### 2.1 Số điện thoại (Phone)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| Số điện thoại Việt Nam hợp lệ (10 chữ số, bắt đầu bằng 0) | Valid | V1 | `0901234567` |
| Số điện thoại sai định dạng (chứa chữ/ký tự đặc biệt) | Invalid | X1 | `0901234abc` |
| Số điện thoại không đủ/quá số lượng chữ số (8 số) | Invalid | X2 | `0901234` |
| Số điện thoại rỗng | Invalid | X3 | `(empty)` |

### 2.2 Portfolio URL

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| URL hợp lệ (đúng định dạng link web/GitHub) | Valid | V2 | `https://github.com/tranthic` |
| URL sai định dạng (thiếu protocol http/https hoặc domain) | Invalid | X4 | `github.com/tranthic` |
| URL rỗng (cho phép bỏ trống) | Valid | V3 | `(empty)` |

### 2.3 Kỹ năng (Skill)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| Tên kỹ năng, level và kinh nghiệm hợp lệ | Valid | V4 | `Python (Intermediate, 2.0 yrs)` |
| Tên kỹ năng rỗng | Invalid | X5 | `(empty)` |
| Số năm kinh nghiệm âm (< 0) | Invalid | X6 | `-1.0` |

### 2.4 File Ảnh Đại diện (Avatar)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| File ảnh hợp lệ (JPG/PNG, kích thước ≤ 5MB) | Valid | V5 | `avatar.jpg (2MB)` |
| Định dạng file không hỗ trợ (file PDF) | Invalid | X7 | `document.pdf` |
| Kích thước file vượt quá giới hạn (> 5MB) | Boundary | B1 | `large_avatar.png (6MB)` |

### 2.5 File CV

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| File CV hợp lệ (PDF/DOC/DOCX, kích thước ≤ 20MB) | Valid | V6 | `cv.pdf (3MB)` |
| Định dạng file không hỗ trợ (file MP4) | Invalid | X8 | `cv_video.mp4` |
| Kích thước file vượt quá giới hạn (> 20MB) | Boundary | B2 | `heavy_cv.pdf (25MB)` |

### 2.6 Chứng chỉ (Certification)

| Điều kiện | Loại | Tag | Giá trị đại diện |
| :--- | :--- | :--- | :--- |
| Tên chứng chỉ, đơn vị cấp, ngày cấp hợp lệ | Valid | V7 | `AWS Cloud Practitioner` |
| Ngày cấp lớn hơn ngày hiện tại (thời điểm tương lai) | Invalid | X9 | `2028-12-31` |

---

## 3. BẢNG CHI TIẾT KẾT QUẢ KIỂM THỬ (DETAILED TEST EXECUTION)

| TC ID | Mô tả Test Case | Phone | Portfolio URL | Skill / Cert Input | File Input (Avatar/CV) | Expected Result | Tags | Actual Result | Status | Executed At | Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **TC-TAL-01** | Xem thông tin hồ sơ cá nhân thành công | `0901234567` | `https://github.com/tranthic` | `ReactJS` | `avatar.jpg` | Trả về JSON thông tin cá nhân, danh sách skills, certs, avatarUrl, cvUrl và averageRating | V1, V2, V4 | Trả về đủ dữ liệu JSON theo đúng cấu trúc SRS | **PASS** | 28/10/2026 | - |
| **TC-TAL-02** | Cập nhật hồ sơ thành công với thông tin hợp lệ | `0901234568` | `https://github.com/newtran` | `Default` | `Default` | Cập nhật thành công, trả về message "Cập nhật hồ sơ thành công" | V1, V2 | Cập nhật thành công, HTTP Status 200 OK | **PASS** | 28/10/2026 | - |
| **TC-TAL-03** | Cập nhật hồ sơ với Số điện thoại sai định dạng | `0901234abc` | `https://github.com/tranthic` | `Default` | `Default` | Trả về lỗi validation "Số điện thoại không hợp lệ" | X1 | Hiển thị đúng lỗi validation | **PASS** | 28/10/2026 | - |
| **TC-TAL-04** | Cập nhật hồ sơ với Số điện thoại không đủ độ dài | `0901234` | `https://github.com/tranthic` | `Default` | `Default` | Trả về lỗi validation "Số điện thoại không đủ 10 chữ số" | X2 | Hiển thị đúng lỗi validation | **PASS** | 28/10/2026 | - |
| **TC-TAL-05** | Cập nhật hồ sơ với Portfolio URL sai định dạng | `0901234567` | `github.com/tranthic` | `Default` | `Default` | Trả về lỗi validation "URL không hợp lệ" | X4 | Hệ thống vẫn chấp nhận lưu URL dù thiếu `https://` | **FAIL** | 28/10/2026 | `1` |
| **TC-TAL-06** | Thêm kỹ năng mới thành công | `0901234567` | `https://github.com/tranthic` | `Python, Intermediate, 2 yrs` | `Default` | Thêm kỹ năng thành công, trả về skillId mới và thông tin kỹ năng | V4 | Thêm skill thành công, HTTP Status 201 Created | **PASS** | 28/10/2026 | - |
| **TC-TAL-07** | Thêm kỹ năng mới nhưng để trống Tên kỹ năng | `0901234567` | `https://github.com/tranthic` | `Name: (empty), Beginner` | `Default` | Trả về lỗi validation "Tên kỹ năng không được để trống" | X5 | Hiển thị đúng lỗi validation | **PASS** | 28/10/2026 | - |
| **TC-TAL-08** | Thêm kỹ năng mới với số năm kinh nghiệm âm | `0901234567` | `https://github.com/tranthic` | `Java, Exp: -1` | `Default` | Trả về lỗi validation "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0" | X6 | Hiển thị đúng lỗi validation | **PASS** | 28/10/2026 | - |
| **TC-TAL-09** | Upload Ảnh đại diện (Avatar) thành công | `0901234567` | `https://github.com/tranthic` | `Default` | `avatar.jpg (2MB)` | Upload thành công lên Cloudinary, trả về avatarUrl và thumbnailUrl | V5 | Upload thành công, trả về đúng Cloudinary URL | **PASS** | 28/10/2026 | - |
| **TC-TAL-10** | Upload Avatar sai định dạng file (file PDF) | `0901234567` | `https://github.com/tranthic` | `Default` | `document.pdf` | Trả về lỗi "Định dạng file không được hỗ trợ (chỉ chấp nhận JPG/PNG)" | X7 | Báo lỗi không hỗ trợ định dạng | **PASS** | 28/10/2026 | - |
| **TC-TAL-11** | Upload Avatar vượt quá kích thước cho phép (> 5MB) | `0901234567` | `https://github.com/tranthic` | `Default` | `large_avatar.png (6MB)` | Trả về lỗi "Kích thước file vượt quá giới hạn 5MB" | B1 | Trả về lỗi 400 Bad Request kèm thông báo | **PASS** | 28/10/2026 | - |
| **TC-TAL-12** | Upload CV thành công (File PDF ≤ 20MB) | `0901234567` | `https://github.com/tranthic` | `Default` | `cv.pdf (3MB)` | Upload CV thành công lên Cloudinary, trả về cvUrl | V6 | Upload CV thành công | **PASS** | 28/10/2026 | - |
| **TC-TAL-13** | Upload CV vượt quá kích thước cho phép (> 20MB) | `0901234567` | `https://github.com/tranthic` | `Default` | `heavy_cv.pdf (25MB)` | Trả về lỗi "Kích thước file CV vượt quá giới hạn 20MB" | B2 | Server trả về lỗi 500 thay vì 400 validation error | **FAIL** | 28/10/2026 | `2` |
| **TC-TAL-14** | Xóa kỹ năng khỏi hồ sơ cá nhân thành công | `0901234567` | `https://github.com/tranthic` | `Delete skillId: 1` | `Default` | Xóa thành công kỹ năng khỏi hồ sơ | V4 | Xóa skill thành công khỏi DB | **PASS** | 28/10/2026 | - |
| **TC-TAL-15** | Thêm chứng chỉ hợp lệ | `0901234567` | `https://github.com/tranthic` | `AWS Cloud Practitioner, AWS, 2025-06-15` | `Default` | Thêm chứng chỉ thành công, lưu thông tin vào DB | V7 | Thêm chứng chỉ thành công, HTTP Status 201 | **PASS** | 28/10/2026 | - |
| **TC-TAL-16** | Thêm chứng chỉ với ngày cấp ở tương lai | `0901234567` | `https://github.com/tranthic` | `PMP, PMI, 2028-12-31` | `Default` | Trả về lỗi validation "Ngày cấp không được vượt quá ngày hiện tại" | X9 | Hệ thống vẫn cho lưu chứng chỉ có ngày cấp ở tương lai | **FAIL** | 28/10/2026 | `3` |
| **TC-TAL-17** | Upload CV định dạng DOCX thành công | `0901234567` | `https://github.com/tranthic` | `Default` | `resume.docx (4MB)` | Upload CV thành công, trả về cvUrl | V6 | Upload thành công | **PASS** | 28/10/2026 | - |
| **TC-TAL-18** | Upload CV sai định dạng (File MP4) | `0901234567` | `https://github.com/tranthic` | `Default` | `video_cv.mp4` | Trả về lỗi "Định dạng file không hỗ trợ (chỉ chấp nhận PDF/DOC/DOCX)" | X8 | Trả về lỗi không hỗ trợ định dạng | **PASS** | 28/10/2026 | - |

---

## 4. KẾT LUẬN VÀ ĐỀ XUẤT (CONCLUSION & RECOMMENDATIONS)

### 4.1 Đánh giá chung
- **Trạng thái chung:** Chức năng `Manage Talent Profile` cơ bản đạt yêu cầu ở các luồng chức năng chính (Happy Path).
- **Tỷ lệ vượt qua:** **83.3%** (15/18 Test Cases).

### 4.2 Khuyến nghị xử lý Lỗi (Defect Recommendations)
1. **Ưu tiên High (1):** Cần cấu hình Exception Handler tại Spring Boot (`@ControllerAdvice`) để bắt lỗi `MaxUploadSizeExceededException`, trả về HTTP Status `400 Bad Request` kèm thông báo lỗi thay vì phát sinh lỗi `500 Internal Server Error`.
2. **Ưu tiên Medium (2):** Bổ sung validation `@URL` tại DTO cho trường `portfolioUrl`.
3. **Ưu tiên Low (3):** Thêm annotation `@PastOrPresent` cho thuộc tính `issueDate` trong entity / DTO của Certification.