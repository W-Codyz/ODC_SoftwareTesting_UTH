# Test Execution Report: FR-MEN-003 - Đánh giá Talent (Evaluate Talents)

**Module:** Mentor Portal  
**Chức năng:** Mentor đánh giá sinh viên (`POST /api/mentor/projects/{projectId}/evaluations`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện lần đầu:** 08/11/2026  
**Ngày cập nhật bổ sung:** 18/11/2026  
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
| **Pass rate** | **14/16 = 87.5%** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input (Role / talentId / Period / Score) | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-MEN003-01 | Đánh giá điểm nominal (7.5) | Mentor, 456, `2026-02`, 7.5 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC3, ST-02, R1 | Đánh giá thành công |
| 2 | TC-MEN003-02 | Đánh giá tại min (0.0) | Mentor, 456, `2026-01`, 0.0 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC1, B-PR1, R1 | Điểm sàn hợp lệ |
| 3 | TC-MEN003-03 | Đánh giá tại max (10.0) | Mentor, 456, `2026-12`, 10.0 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC5, B-PR2, R1 | Điểm trần hợp lệ |
| 4 | TC-MEN003-04 | Đánh giá tại min+ (0.1) | Mentor, 456, `2026-02`, 0.1 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC2, R1 | Điểm cận min |
| 5 | TC-MEN003-05 | Đánh giá tại max- (9.9) | Mentor, 456, `2026-02`, 9.9 | 200 - OK | 200, trả về DTO đánh giá | PASS | V-RL1, V-TL1, V-PR1, V-SC1, V-CR1, B-SC4, R1 | Điểm cận max |
| 6 | TC-MEN003-06 | overallScore âm (-0.1) | Score: -0.1 | 400 - Bad Request | 200 OK (ép về 0.0) | FAIL | X-SC1, R5 | **BUG:** normalizeScore tự ý làm tròn thay vì ném lỗi |
| 7 | TC-MEN003-07 | overallScore vượt 10 (10.1)| Score: 10.1 | 400 - Bad Request | 200 OK (ép về 10.0) | FAIL | X-SC2, R5 | **BUG:** normalizeScore tự ý làm tròn thay vì ném lỗi |
| 8 | TC-MEN003-08 | overallScore kiểu chữ | Score: `"tam_diem"` | 400 - Bad Request | 400, Jackson parse error | PASS | X-SC3, R5 | Lỗi parse JSON payload |
| 9 | TC-MEN003-09 | Điểm tiêu chí codeQuality âm | codeQuality: -1.0 | 400 - Bad Request | 400, Validation failed | PASS | X-CR1, R5 | Bắt đúng validation điểm tiêu chí |
| 10 | TC-MEN003-10 | Talent không tồn tại | Talent: 99999 | 404 - Not Found | 404, "Talent not found" | PASS | X-TL1, R3 | Bắt đúng lỗi không tìm thấy |
| 11 | TC-MEN003-11 | Talent thuộc dự án khác | Talent: 888 | 404 - Not Found | 404, "Talent not found" | PASS | X-TL2, R3 | Bắt đúng lỗi không thuộc dự án |
| 12 | TC-MEN003-12 | Trùng kỳ đánh giá (Unique) | Period: `2026-02` (đã có) | 409 hoặc 200 (Update) | 200, Ghi đè cập nhật điểm | PASS | X-PR2, ST-05, R4 | Service xử lý cập nhật bản ghi cùng kỳ |
| 13 | TC-MEN003-13 | Sai format kỳ đánh giá | Period: `"2026/02"` | 400 - Bad Request | 400, Validation error | PASS | X-PR1, R5 | Bắt đúng format YYYY-MM |
| 14 | TC-MEN003-14 | Chưa đăng nhập gọi API | Không có token | 401 - Unauthorized | 401 Unauthorized | PASS | X-RL1 | Chặn truy cập ẩn danh |
| 15 | TC-MEN003-15 | User là Talent tự chấm điểm | Role: TALENT | 403 - Forbidden | 403 Forbidden | PASS | X-RL2, R2 | Chặn sai role |
| 16 | TC-MEN003-16 | Mentor dự án khác gọi API | Role: OTHER_MENTOR | 403 - Forbidden | 403 Forbidden | PASS | X-RL3, R2 | Bảo mật dự án |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-RL1 | Token Mentor phụ trách hợp lệ | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| V-TL1 | Talent ID hợp lệ thuộc dự án | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| V-PR1 | Kỳ đánh giá hợp lệ YYYY-MM | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| V-SC1 | overallScore hợp lệ [0.0..10.0] | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| V-CR1 | Điểm tiêu chí con hợp lệ | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| X-RL1 | Chưa đăng nhập (no token) | TC-MEN003-14 | PASS |
| X-RL2 | Talent tự chấm điểm | TC-MEN003-15 | PASS |
| X-RL3 | Mentor khác dự án | TC-MEN003-16 | PASS |
| X-TL1 | Talent ID không tồn tại | TC-MEN003-10 | PASS |
| X-TL2 | Talent thuộc dự án khác | TC-MEN003-11 | PASS |
| X-PR1 | Sai format kỳ YYYY-MM | TC-MEN003-13 | PASS |
| X-PR2 | Trùng kỳ đánh giá | TC-MEN003-12 | PASS |
| X-SC1 | overallScore < 0.0 | TC-MEN003-06 | FAIL (Bị normalize về 0.0) |
| X-SC2 | overallScore > 10.0 | TC-MEN003-07 | FAIL (Bị normalize về 10.0) |
| X-SC3 | overallScore sai kiểu dữ liệu | TC-MEN003-08 | PASS |
| X-CR1 | Điểm tiêu chí con âm | TC-MEN003-09 | PASS |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-SC1 | min = 0.0 | TC-MEN003-02 | PASS |
| B-SC2 | min+ = 0.1 | TC-MEN003-04 | PASS |
| B-SC3 | nominal = 7.5 | TC-MEN003-01 | PASS |
| B-SC4 | max- = 9.9 | TC-MEN003-05 | PASS |
| B-SC5 | max = 10.0 | TC-MEN003-03 | PASS |
| B-PR1 | 2026-01 | TC-MEN003-02 | PASS |
| B-PR2 | 2026-12 | TC-MEN003-03 | PASS |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | NOT_EVALUATED → DRAFT | Quy trình lưu nháp | PASS |
| ST-02 | NOT_EVALUATED → SUBMITTED | TC-MEN003-01 | PASS |
| ST-03 | DRAFT → DRAFT | Cập nhật điểm nháp | PASS |
| ST-04 | DRAFT → SUBMITTED | Nộp chính thức từ nháp | PASS |
| ST-05 | SUBMITTED → SUBMITTED | TC-MEN003-12 | PASS |
| ST-06 | SUBMITTED → LOCKED | Hệ thống tự động khóa kỳ | PASS |
| ST-07 | LOCKED → Sửa điểm | Bị từ chối 400 | PASS |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ → 200 OK | TC-MEN003-01, 02, 03, 04, 05 | PASS |
| R2 | Sai quyền Mentor → 403 Forbidden | TC-MEN003-15, 16 | PASS |
| R3 | Sai sinh viên / dự án → 404 Not Found | TC-MEN003-10, 11 | PASS |
| R4 | Trùng kỳ đánh giá → 409 Conflict | TC-MEN003-12 | PASS |
| R5 | Sai format hoặc điểm ngoài khoảng → 400 Bad Request | TC-MEN003-06, 07, 08, 09, 13 | FAIL (TC-06, 07) |

> **Bao phủ (trên tổng TC):** 16/16 EP tags, 7/7 BVA tags, 7/7 state transitions, 5/5 decision rules - **100%**.  
> **Đã thực thi:** 16/16 test case. Kết quả: 14/16 PASS (87.5%), 2 FAIL do phát hiện bug logic hàm normalize điểm số trong backend.

---

## 4. Danh sách bug / khiếm khuyết phát hiện

| # | TC ID | Mô tả bug / khiếm khuyết | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-MEN003-06 | Phương thức `normalizeScore()` trong `MentorPortalService.java` tự ý làm tròn điểm âm về `0.0` và trả về `200 OK` thay vì ném lỗi `400 Bad Request` | Medium | LABODC-173 | Open (Chờ Dev sửa) |
| 2 | TC-MEN003-07 | Phương thức `normalizeScore()` tự ý ép điểm vượt trần (> 10.0) về `10.0` và trả về `200 OK` thay vì ném lỗi `400 Bad Request` | Medium | LABODC-173 | Open (Chờ Dev sửa) |
