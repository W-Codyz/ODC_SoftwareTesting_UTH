# Test Execution Report: FR-TAL-003 - Thêm Kỹ năng cho Talent

**Module:** Talent  
**Chức năng:** Add Talent Skill (`POST /api/talent/skills`)  
**Người thực hiện:** Hiển Nguyễn Minh  
**Mã Task Jira:** LABODC-78  
**Ngày thực hiện:** 02/11/2026  
**Môi trường test:** Postman / Spring Boot Local (`http://localhost:8080`), PostgreSQL 16  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_Add_Skill.md`

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 8 |
| Passed | 8 |
| Failed | 0 |
| Blocked / Skipped | 0 |
| **Pass rate** | **100%** |

---

## 2. Kết quả chi tiết từng Test Case

| STT | TC ID | Tên test case | Input Body | Expected Result | Actual Result | Trạng thái | Ghi chú |
|---:|---|---|---|---|---|:---:|---|
| 1 | **TC-SKILL-01** | Thêm kỹ năng thành công - Dữ liệu hợp lệ | `skillName: "Docker", yearsOfExperience: 2.0` | 200 - Tạo mới thành công, trả về id | 200 OK, `success: true`, tạo mới `skillId: 7` | **PASS** | |
| 2 | **TC-SKILL-02** | Thêm kỹ năng với số năm kinh nghiệm = 0 | `skillName: "Kubernetes", yearsOfExperience: 0.0` | 200 - Chấp nhận kinh nghiệm 0 | 200 OK, thêm thành công | **PASS** | Phù hợp sinh viên mới học |
| 3 | **TC-SKILL-03** | Thêm kỹ năng trùng tên đã tồn tại | `skillName: "Java"` (đã tồn tại) | 400 - Báo lỗi trùng lặp | 400 Bad Request, `"Skill already exists: Java"` | **PASS** | Chặn trùng lặp chuẩn nghiệp vụ |
| 4 | **TC-SKILL-04** | Để trống tên kỹ năng | `skillName: ""` | 400 - Báo lỗi validation | 400 Bad Request | **PASS** | |
| 5 | **TC-SKILL-05** | Số năm kinh nghiệm âm (< 0) | `yearsOfExperience: -1.0` | 400 - Báo lỗi không hợp lệ | 400 Bad Request | **PASS** | |
| 6 | **TC-SKILL-06** | Proficiency level sai định dạng | `proficiencyLevel: "GOD_LEVEL"` | 400 - Lỗi format | 400 Bad Request | **PASS** | |
| 7 | **TC-SKILL-07** | Thêm kỹ năng khi chưa đăng nhập | No Token | 401 / 403 Forbidden | 403 Forbidden | **PASS** | |
| 8 | **TC-SKILL-08** | Thêm kỹ năng bằng tài khoản Enterprise | Token Enterprise | 403 Forbidden | 403 Forbidden | **PASS** | Phân quyền đúng vai trò |
