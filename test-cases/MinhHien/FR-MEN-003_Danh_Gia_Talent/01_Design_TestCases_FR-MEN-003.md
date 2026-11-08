# THIẾT KẾ TEST CASE HỘP ĐEN (BLACK-BOX TEST DESIGN)
## MODULE: FR-MEN-003 - ĐÁNH GIÁ TALENT (EVALUATE TALENTS)

> **Người thực hiện:** Nguyễn Minh Hiển  
> **Dự án:** ODC Software Testing (LabODC)  
> **Tài liệu tham chiếu:** `docs/SRS_LabOdc.md` (FR-MEN-003), `MentorPortalController.java`  
> **Phương pháp áp dụng:** Phân hoạch tương đương (Equivalence Partitioning - EP) & Phân tích giá trị biên (Boundary Value Analysis - BVA)  

---

### I. CƠ SỞ TEST & XÁC ĐỊNH ĐIỀU KIỆN TEST (TEST CONDITIONS)

#### 1. Mô tả nghiệp vụ
Chức năng cho phép **Người hướng dẫn (Mentor)** thực hiện đánh giá kết quả, thái độ và năng lực kỹ thuật của từng sinh viên (Talent) trong nhóm dự án theo định kỳ hàng tháng (thang điểm 0.0 đến 10.0 kèm nhận xét chi tiết).

#### 2. Danh sách biến đầu vào & Ràng buộc
- **`projectId`**: ID dự án (Số nguyên dương, Mentor phải được chỉ định hướng dẫn dự án này).
- **`talentId`**: ID sinh viên được đánh giá (Số nguyên dương, phải là thành viên trong dự án).
- **`evaluationPeriod`**: Kỳ đánh giá (Định dạng chuẩn `YYYY-MM`). Ràng buộc duy nhất: Mỗi cặp `(projectId, talentId, evaluationPeriod)` chỉ được đánh giá 1 lần.
- **`overallScore`**: Điểm số tổng thể (Kiểu số thực `0.0 <= overallScore <= 10.0`).
- **Điểm tiêu chí thành phần** (Kỹ thuật `technicalSkills`, Giải quyết vấn đề `problemSolving`, Làm việc nhóm `teamwork`, Giao tiếp `communication`, Chất lượng code `codeQuality`, Tác phong `punctuality`): Thang điểm `[0.0, 10.0]`.
- **Nhận xét**: `strengths` (Điểm mạnh), `weaknesses` (Điểm yếu), `recommendations` (Khuyến nghị).

#### 3. Bảng phân hoạch lớp tương đương & Xác định giá trị biên (Slide Chuẩn Trang 32)

| Điều kiện kiểm thử (Conditions) | Lớp tương đương hợp lệ (Valid Partitions) | Tag | Lớp tương đương không hợp lệ (Invalid Partitions) | Tag | Giá trị biên hợp lệ (Standard Boundaries) | Tag |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| **Quyền hạn người dùng (Role & Assignment)** | - User có vai trò MENTOR và được assign vào dự án | **V1** | - Chưa đăng nhập<br>- Không có role MENTOR<br>- MENTOR không phụ trách dự án này | **X1**<br>**X2**<br>**X3** | - Đúng Mentor phụ trách dự án | **B1** |
| **Đối tượng sinh viên (talentId)** | - Talent ID hợp lệ và thuộc dự án | **V2** | - Talent không tồn tại<br>- Talent thuộc dự án khác | **X4**<br>**X5** | - Sinh viên đầu tiên trong nhóm<br>- Sinh viên cuối cùng trong nhóm | **B2**<br>**B3** |
| **Kỳ đánh giá (evaluationPeriod)** | - Định dạng YYYY-MM hợp lệ và chưa từng đánh giá | **V3** | - Sai định dạng YYYY-MM<br>- Trùng lặp kỳ đánh giá đã tồn tại | **X6**<br>**X7** | - Tháng đầu năm (2026-01)<br>- Tháng cuối năm (2026-12) | **B4**<br>**B5** |
| **Điểm tổng thể (overallScore)** | - Số thực trong đoạn [0.0, 10.0] | **V4** | - Điểm âm (< 0.0)<br>- Điểm vượt trần (> 10.0)<br>- Không phải kiểu số | **X8**<br>**X9**<br>**X10** | - min = 0.0<br>- min+ = 0.1<br>- nominal = 7.5<br>- max- = 9.9<br>- max = 10.0 | **B6**<br>**B7**<br>**B8**<br>**B9**<br>**B10** |
| **Điểm các tiêu chí con (Criteria Scores)** | - Tất cả tiêu chí trong khoảng [0.0, 10.0] | **V5** | - Có ít nhất 1 tiêu chí < 0.0 hoặc > 10.0 | **X11** | - Tất cả tiêu chí tại 0.0<br>- Tất cả tiêu chí tại 10.0 | **B11**<br>**B12** |

---

### II. BẢNG THIẾT KẾ TEST CASE (DESIGN TEST CASES)
*(Áp dụng Phân hoạch tương đương & Standard BVA )*

| STT | TestCaseID | Tên Test Case | Vai trò gọi API | talentId | evaluationPeriod | overallScore | Criteria Scores | Expected Result | Kết Quả Mong Đợi Chi Tiết | Tag Được Bao Phủ |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| 1 | **TC-MEN003-01** | Đánh giá tại điểm min (0.0) | ASSIGNED_MENTOR | 456 | 2026-02 | 0.0 | Tất cả 0.0 | **TRUE** | HTTP 201/200: Tạo đánh giá thành công mức điểm 0 | V1, V2, V3, V4, V5, B1, B2, B6, B11 |
| 2 | **TC-MEN003-02** | Đánh giá tại điểm max (10.0) | ASSIGNED_MENTOR | 456 | 2026-02 | 10.0 | Tất cả 10.0 | **TRUE** | HTTP 201/200: Tạo đánh giá thành công xuất sắc 10 | V1, V2, V3, V4, V5, B1, B2, B10, B12 |
| 3 | **TC-MEN003-03** | Đánh giá tại điểm nominal (7.5) | ASSIGNED_MENTOR | 456 | 2026-02 | 7.5 | Điểm 7.0 - 8.0 | **TRUE** | HTTP 201/200: Tạo đánh giá thành công mức khá giỏi | V1, V2, V3, V4, V5, B1, B2, B8 |
| 4 | **TC-MEN003-04** | Đánh giá tại điểm min+ (0.1) | ASSIGNED_MENTOR | 456 | 2026-01 | 0.1 | Tất cả 0.1 | **TRUE** | HTTP 201/200: Tạo đánh giá thành công mức cận min | V1, V2, V3, V4, V5, B1, B2, B4, B7 |
| 5 | **TC-MEN003-05** | Đánh giá tại điểm max- (9.9) | ASSIGNED_MENTOR | 457 | 2026-12 | 9.9 | Tất cả 9.9 | **TRUE** | HTTP 201/200: Tạo đánh giá thành công mức cận max | V1, V2, V3, V4, V5, B1, B3, B5, B9 |
| 6 | **TC-MEN003-06** | overallScore ngay dưới min (-0.1) | ASSIGNED_MENTOR | 456 | 2026-02 | -0.1 | Điểm 7.0 | **FALSE** | HTTP 400 Bad Request: Điểm không được nhỏ hơn 0.0 | X8 |
| 7 | **TC-MEN003-07** | overallScore ngay trên max (10.1) | ASSIGNED_MENTOR | 456 | 2026-02 | 10.1 | Điểm 7.0 | **FALSE** | HTTP 400 Bad Request: Điểm không được lớn hơn 10.0 | X9 |
| 8 | **TC-MEN003-08** | overallScore không phải kiểu số | ASSIGNED_MENTOR | 456 | 2026-02 | "tam_diem" | Điểm 7.0 | **FALSE** | HTTP 400 Bad Request: Sai kiểu dữ liệu điểm số | X10 |
| 9 | **TC-MEN003-09** | Tiêu chí codeQuality âm (-1.0) | ASSIGNED_MENTOR | 456 | 2026-02 | 8.0 | codeQuality = -1 | **FALSE** | HTTP 400 Bad Request: Điểm thành phần không được âm | X11 |
| 10 | **TC-MEN003-10** | Talent không tồn tại trong hệ thống | ASSIGNED_MENTOR | 99999 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 404 Not Found: Sinh viên không tồn tại | X4 |
| 11 | **TC-MEN003-11** | Talent không thuộc dự án này | ASSIGNED_MENTOR | 888 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 400/404: Sinh viên không tham gia dự án này | X5 |
| 12 | **TC-MEN003-12** | Đánh giá trùng kỳ (Unique constraint) | ASSIGNED_MENTOR | 456 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 409 Conflict: Kỳ đánh giá đã tồn tại, dùng PUT | X7 |
| 13 | **TC-MEN003-13** | Sai định dạng kỳ đánh giá | ASSIGNED_MENTOR | 456 | 2026/02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 400 Bad Request: Sai định dạng YYYY-MM | X6 |
| 14 | **TC-MEN003-14** | User chưa đăng nhập gọi API | UNAUTHENTICATED | 456 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 401 Unauthorized: Chưa truyền Token | X1 |
| 15 | **TC-MEN003-15** | User không phải Mentor (Talent đánh giá) | TALENT_USER | 456 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 403 Forbidden: Chỉ Mentor mới được đánh giá | X2 |
| 16 | **TC-MEN003-16** | Mentor khác không phụ trách dự án | OTHER_MENTOR | 456 | 2026-02 | 8.5 | Điểm 8.0 | **FALSE** | HTTP 403 Forbidden: Không có quyền trên dự án này | X3 |