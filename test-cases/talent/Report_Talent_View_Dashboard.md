# Test Execution Report: FR-TAL-002 - Xem Dashboard Talent

**Module:** Talent  
**Chức năng:** View Talent Dashboard (`GET /api/talent/dashboard`)  
**Người thực hiện:** Hiển Nguyễn Minh  
**Mã Task Jira:** LABODC-67  
**Ngày thực hiện:** 02/11/2026  
**Môi trường test:** Postman / Local Spring Boot backend (`http://localhost:8080`), PostgreSQL 16  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_View_Dashboard.md`

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 7 |
| Passed | 7 |
| Failed | 0 |
| Blocked / Skipped | 0 |
| **Pass rate** | **100%** |

---

## 2. Kết quả chi tiết từng Test Case

| STT | TC ID | Tên test case | Input / Điều kiện | Expected Result | Actual Result | Trạng thái | Ghi chú |
|---:|---|---|---|---|---|:---:|---|
| 1 | **TC-DASH-01** | Xem Dashboard thành công - Talent đầy đủ dữ liệu | Token Talent `nguyenvana@student.uth.edu.vn` | 200 - Trả về `success: true`, đầy đủ stats & recentProjects | 200 OK, stats đầy đủ (totalProjects: 1, totalSkills: 2, totalCerts: 1) | **PASS** | |
| 2 | **TC-DASH-02** | Xem Dashboard thành công - Talent mới (chưa có dự án) | Token Talent mới tạo | 200 - Trả về stats = 0, recentProjects rỗng | 200 OK, `totalProjects: 0`, `recentProjects: []` | **PASS** | |
| 3 | **TC-DASH-03** | Giới hạn tối đa 5 dự án gần nhất | Talent tham gia nhiều dự án | 200 - `recentProjects.length <= 5` | 200 OK, danh sách giới hạn đúng 5 dự án theo `.limit(5)` | **PASS** | |
| 4 | **TC-DASH-04** | Truy cập Dashboard khi chưa đăng nhập | Không gửi Authorization header | 401 / 403 Forbidden | 403 Forbidden | **PASS** | |
| 5 | **TC-DASH-05** | Truy cập với token không hợp lệ / hết hạn | `Bearer invalid.jwt.token` | 401 / 403 Unauthorized | 403 Forbidden | **PASS** | |
| 6 | **TC-DASH-06** | Truy cập bằng token sai vai trò (ENTERPRISE) | Token `contact@techcorp.vn` | 403 Forbidden | 403 Forbidden | **PASS** | |
| 7 | **TC-DASH-07** | Kiểm tra thời gian phản hồi API Dashboard | Request hợp lệ | Thời gian phản hồi < 2000ms | 185ms | **PASS** | Đáp ứng yêu cầu hiệu năng SRS |
