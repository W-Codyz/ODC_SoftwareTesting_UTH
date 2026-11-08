# THIẾT KẾ TEST CASE HỘP ĐEN (BLACK-BOX TEST DESIGN)
## MODULE: FR-TL-002 - NỘP BÁO CÁO NHÓM (SUBMIT TEAM REPORT)

> **Người thực hiện:** Nguyễn Minh Hiển  
> **Dự án:** ODC Software Testing (LabODC)  
> **Tài liệu tham chiếu:** `docs/SRS_LabOdc.md` (FR-TL-002)  
> **Phương pháp áp dụng:** Phân hoạch tương đương (Equivalence Partitioning - EP) & Phân tích giá trị biên (Boundary Value Analysis - BVA)  

---

### I. CƠ SỞ TEST & XÁC ĐỊNH ĐIỀU KIỆN TEST (TEST CONDITIONS)

#### 1. Mô tả nghiệp vụ
Chức năng cho phép **Trưởng nhóm sinh viên (Talent Leader)** nộp báo cáo tiến độ định kỳ (tuần, tháng, tổng kết) của dự án cho Người hướng dẫn (Mentor) và Ban quản lý Lab (Lab Admin).

#### 2. Danh sách biến đầu vào & Ràng buộc
- **`projectId`**: ID của dự án (Số nguyên dương, dự án phải tồn tại).
- **`reportType`**: Loại báo cáo (`WEEKLY`, `MONTHLY`, `FINAL`).
- **`reportingPeriod`**: Kỳ báo cáo định dạng `YYYY-MM` (Ví dụ: `2026-02`).
- **`overallProgress`**: Tiến độ tổng thể (Giá trị số thực/nguyên: `0 <= overallProgress <= 100`).
- **`tasksCompleted`**: Danh sách nhiệm vụ đã hoàn thành (Mảng JSON, tối thiểu 0 phần tử).
- **`tasksInProgress`**: Danh sách nhiệm vụ đang thực hiện (Mảng JSON).
- **`issues`**: Danh sách các rủi ro/vấn đề phát sinh.

#### 3. Bảng phân hoạch lớp tương đương & Xác định giá trị biên (Slide Chuẩn Trang 32)

| Điều kiện kiểm thử (Conditions) | Lớp tương đương hợp lệ (Valid Partitions) | Tag | Lớp tương đương không hợp lệ (Invalid Partitions) | Tag | Giá trị biên hợp lệ (Standard Boundaries) | Tag |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| **Vai trò người dùng (Role/Permission)** | - Là TALENT giữ vai trò TEAM_LEADER của dự án | **V1** | - Chưa đăng nhập<br>- Là TALENT không phải Leader<br>- Là TALENT của dự án khác | **X1**<br>**X2**<br>**X3** | - Đúng user Leader của dự án | **B1** |
| **Loại báo cáo (reportType)** | - Thuộc danh mục: {WEEKLY, MONTHLY, FINAL} | **V2** | - Bỏ trống/null<br>- Giá trị không thuộc danh mục (vd: DAILY, YEARLY) | **X4**<br>**X5** | - WEEKLY<br>- MONTHLY<br>- FINAL | **B2**<br>**B3**<br>**B4** |
| **Kỳ báo cáo (reportingPeriod)** | - Định dạng chuẩn YYYY-MM (tháng 01..12) | **V3** | - Sai định dạng (vd: 2026/02, 02-2026)<br>- Tháng ngoài khoảng 01..12 (vd: 2026-13, 2026-00) | **X6**<br>**X7** | - Tháng đầu năm (2026-01)<br>- Tháng cuối năm (2026-12) | **B5**<br>**B6** |
| **Tiến độ hoàn thành (overallProgress)** | - Số thực/nguyên trong khoảng [0, 100] | **V4** | - Giá trị âm (< 0)<br>- Giá trị vượt ngưỡng (> 100)<br>- Không phải kiểu số | **X8**<br>**X9**<br>**X10** | - min = 0<br>- min+ = 1<br>- nominal = 50<br>- max- = 99<br>- max = 100 | **B7**<br>**B8**<br>**B9**<br>**B10**<br>**B11** |
| **Danh sách task hoàn thành (tasksCompleted)** | - Mảng JSON hợp lệ, rỗng hoặc >= 1 phần tử | **V5** | - Sai định dạng JSON | **X11** | - Mảng rỗng (0 task)<br>- Mảng có 1 task | **B12**<br>**B13** |

---

### II. BẢNG THIẾT KẾ TEST CASE (DESIGN TEST CASES)
*(Áp dụng Phân hoạch tương đương & Standard BVA 4n + 1 )*

| STT | TestCaseID | Tên Test Case | Vai trò gọi API | reportType | reportingPeriod | overallProgress | tasksCompleted | Expected Result | Kết Quả Mong Đợi Chi Tiết | Tag Được Bao Phủ |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| 1 | **TC-TL002-01** | Báo cáo tiến độ tại giá trị min (0%) | TEAM_LEADER | MONTHLY | 2026-02 | 0 | [] (0 task) | **TRUE** | HTTP 201/200: Tạo báo cáo thành công, progress = 0% | V1, V2, V3, V4, V5, B1, B3, B7, B12 |
| 2 | **TC-TL002-02** | Báo cáo tiến độ tại giá trị max (100%) | TEAM_LEADER | FINAL | 2026-02 | 100 | [Task 101, 102] | **TRUE** | HTTP 201/200: Nộp báo cáo nghiệm thu hoàn tất 100% | V1, V2, V3, V4, V5, B1, B4, B11, B13 |
| 3 | **TC-TL002-03** | Báo cáo tiến độ tại giá trị nominal (50%) | TEAM_LEADER | MONTHLY | 2026-02 | 50 | [Task 101] | **TRUE** | HTTP 201/200: Tạo báo cáo thành công mức trung bình | V1, V2, V3, V4, V5, B1, B3, B9, B13 |
| 4 | **TC-TL002-04** | Báo cáo tiến độ tại giá trị min+ (1%) | TEAM_LEADER | WEEKLY | 2026-01 | 1 | [Task 101] | **TRUE** | HTTP 201/200: Tạo báo cáo thành công mức 1%, đầu năm | V1, V2, V3, V4, V5, B1, B2, B5, B8 |
| 5 | **TC-TL002-05** | Báo cáo tiến độ tại giá trị max- (99%) | TEAM_LEADER | WEEKLY | 2026-12 | 99 | [Task 101] | **TRUE** | HTTP 201/200: Tạo báo cáo thành công mức 99%, cuối năm | V1, V2, V3, V4, V5, B1, B2, B6, B10 |
| 6 | **TC-TL002-06** | overallProgress ngay dưới min (-1) | TEAM_LEADER | MONTHLY | 2026-02 | -1 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Tiến độ không được nhỏ hơn 0 | X8 |
| 7 | **TC-TL002-07** | overallProgress ngay trên max (101) | TEAM_LEADER | MONTHLY | 2026-02 | 101 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Tiến độ không được vượt quá 100 | X9 |
| 8 | **TC-TL002-08** | overallProgress không phải kiểu số | TEAM_LEADER | MONTHLY | 2026-02 | "nam-muoi" | [Task 101] | **FALSE** | HTTP 400 Bad Request: Sai kiểu dữ liệu tiến độ | X10 |
| 9 | **TC-TL002-09** | reportType không thuộc danh mục | TEAM_LEADER | DAILY | 2026-02 | 50 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Loại báo cáo DAILY không hợp lệ | X5 |
| 10 | **TC-TL002-10** | reportType để trống (null/empty) | TEAM_LEADER | "" | 2026-02 | 50 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Loại báo cáo là bắt buộc | X4 |
| 11 | **TC-TL002-11** | reportingPeriod sai định dạng tháng (>12) | TEAM_LEADER | MONTHLY | 2026-13 | 50 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Kỳ báo cáo không hợp lệ (tháng 13) | X7 |
| 12 | **TC-TL002-12** | reportingPeriod sai format (DD-MM-YYYY) | TEAM_LEADER | MONTHLY | 15-02-2026 | 50 | [Task 101] | **FALSE** | HTTP 400 Bad Request: Format bắt buộc YYYY-MM | X6 |
| 13 | **TC-TL002-13** | User chưa đăng nhập gọi API | UNAUTHENTICATED | MONTHLY | 2026-02 | 50 | [Task 101] | **FALSE** | HTTP 401 Unauthorized: Chưa xác thực token | X1 |
| 14 | **TC-TL002-14** | Thành viên thường (không phải Leader) nộp | TALENT_MEMBER | MONTHLY | 2026-02 | 50 | [Task 101] | **FALSE** | HTTP 403 Forbidden: Chỉ Trưởng nhóm mới có quyền nộp | X2 |
| 15 | **TC-TL002-15** | Leader của dự án khác nộp báo cáo | TALENT_OTHER_PRJ | MONTHLY | 2026-02 | 50 | [Task 101] | **FALSE** | HTTP 403 Forbidden: Không có quyền trên dự án này | X3 |