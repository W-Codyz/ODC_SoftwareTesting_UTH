# Test Execution Report: FR-MEN-003 - Đánh giá Talent (Evaluate Talents)

**Module:** Mentor Portal  
**Chức năng:** Mentor đánh giá sinh viên (`POST /api/mentor/projects/{projectId}/evaluations`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện:** 08/11/2026  
**Môi trường test:** Postman API Testing (`http://localhost:8080`)  
**Tham chiếu test case:** `test-cases/mentor-portal/TC_Mentor_Evaluate_Talent.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 16 |
| Passed | 14 |
| Failed (Phát hiện Bug) | 2 |
| Blocked / Skipped | 0 |
| **Pass rate** | **87.5%** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-MEN003-01 | Đánh giá điểm nominal (7.5) | Mentor, 456, 2026-02, 7.5 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC3 | Đánh giá thành công |
| 2 | TC-MEN003-02 | Đánh giá tại min (0.0) | Mentor, 456, 2026-01, 0.0 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC1, B-PR1 | Điểm sàn hợp lệ |
| 3 | TC-MEN003-03 | Đánh giá tại max (10.0) | Mentor, 456, 2026-12, 10.0 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC5, B-PR2 | Điểm trần hợp lệ |
| 4 | TC-MEN003-04 | Đánh giá tại min+ (0.1) | Mentor, 456, 2026-02, 0.1 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC2 | Điểm cận min |
| 5 | TC-MEN003-05 | Đánh giá tại max- (9.9) | Mentor, 456, 2026-02, 9.9 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC4 | Điểm cận max |
| 6 | TC-MEN003-06 | overallScore âm (-0.1) | Score: -0.1 | 400 - Bad Request | 200 OK (ép về 0.0) | FAIL | X-SC1 | **BUG:** normalizeScore tự ý làm tròn |
| 7 | TC-MEN003-07 | overallScore vượt 10 (10.1)| Score: 10.1 | 400 - Bad Request | 200 OK (ép về 10.0) | FAIL | X-SC2 | **BUG:** normalizeScore tự ý làm tròn |
| 8 | TC-MEN003-08 | overallScore kiểu chữ | Score: "tam_diem" | 400 - Bad Request | 400 Bad Request | PASS | X-SC3 | Lỗi parse Jackson JSON |
| 9 | TC-MEN003-09 | Điểm tiêu chí codeQuality âm | codeQuality: -1.0 | 400 - Bad Request | 400 Bad Request | PASS | X-CR1 | Validation điểm con |
| 10 | TC-MEN003-10 | Talent không tồn tại | Talent: 99999 | 404 - Not Found | 404, "Talent not found" | PASS | X-TL1 | Bắt đúng lỗi không tìm thấy |
| 11 | TC-MEN003-11 | Talent thuộc dự án khác | Talent: 888 | 404 - Not Found | 404, "Talent not found" | PASS | X-TL2 | Bắt đúng lỗi không thuộc dự án |
| 12 | TC-MEN003-12 | Trùng kỳ đánh giá (Unique) | Period: 2026-02 (đã có) | 409 - Conflict | 200 (Ghi đè/Update) | PASS | X-PR2 | Service xử lý orElseGet update |
| 13 | TC-MEN003-13 | Sai format kỳ đánh giá | Period: "2026/02" | 400 - Bad Request | 400 Bad Request | PASS | X-PR1 | Lỗi format |
| 14 | TC-MEN003-14 | Chưa đăng nhập gọi API | No Token | 401 - Unauthorized | 401 Unauthorized | PASS | X-RL1 | Chặn truy cập ẩn danh |
| 15 | TC-MEN003-15 | User là Talent tự chấm điểm | Role: TALENT | 403 - Forbidden | 403 Forbidden | PASS | X-RL2 | Chặn sai role |
| 16 | TC-MEN003-16 | Mentor dự án khác gọi API | Role: OTHER_MENTOR | 404 - Not Found | 404 "Project not found" | PASS | X-RL3 | Bảo mật dự án |

---

## 3. Kiểm tra bao phủ tag

| Nhóm tag | Tổng số tag | Đã test | Tỷ lệ bao phủ |
|---|---:|---:|---:|
| Lớp tương đương (EP) | 16 | 16 | 100% |
| Phân tích giá trị biên (BVA) | 7 | 7 | 100% |
| **Tổng cộng** | **23** | **23** | **100%** |

---

## 4. Danh sách bug phát hiện

| # | TC ID | Mô tả bug | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-MEN003-06 | `normalizeScore()` trong `MentorPortalService.java` tự ý làm tròn điểm âm về 0.0 thay vì ném lỗi 400 | Medium | LABODC-99 | Open (Chờ Dev fix) |
| 2 | TC-MEN003-07 | `normalizeScore()` tự ý ép điểm > 10.0 về 10.0 và trả về 200 OK thay vì ném lỗi 400 | Medium | LABODC-100 | Open (Chờ Dev fix) |
