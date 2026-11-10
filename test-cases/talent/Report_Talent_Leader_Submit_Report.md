# Test Execution Report: FR-TL-002 - Nộp Báo cáo Nhóm (Submit Team Report)

**Module:** Talent Leader / Project Management  
**Chức năng:** Nộp Báo cáo Tiến độ Nhóm (`POST /api/talent-leader/projects/{projectId}/reports`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện:** 08/11/2026  
**Môi trường test:** Postman API Testing (`http://localhost:8080`)  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_Leader_Submit_Report.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 15 |
| Passed (Khớp kỳ vọng) | 0 |
| Failed (Lỗi do thiếu API) | 15 |
| Blocked / Skipped | 0 |
| **Pass rate** | **0% (Chờ Backend implement)** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-TL002-01 | Nộp báo cáo nominal (50%) | Leader, MONTHLY, 2026-02, 50 | 201 - Created | 404 Not Found | FAIL | V-RL1, V-TY1, V-PR1, V-PG1, B-PG3 | Backend chưa có route `/api/talent-leader/**` |
| 2 | TC-TL002-02 | Nộp báo cáo min (0%) | Leader, WEEKLY, 2026-01, 0 | 201 - Created | 404 Not Found | FAIL | V-RL1, V-TY1, V-PR1, V-PG1, B-PG1 | Lỗi 404 |
| 3 | TC-TL002-03 | Nộp báo cáo max (100%) | Leader, FINAL, 2026-12, 100 | 201 - Created | 404 Not Found | FAIL | V-RL1, V-TY1, V-PR1, V-PG1, B-PG5 | Lỗi 404 |
| 4 | TC-TL002-04 | Nộp báo cáo min+ (1%) | Leader, MONTHLY, 2026-02, 1 | 201 - Created | 404 Not Found | FAIL | V-RL1, V-TY1, V-PR1, V-PG1, B-PG2 | Lỗi 404 |
| 5 | TC-TL002-05 | Nộp báo cáo max- (99%) | Leader, MONTHLY, 2026-02, 99 | 201 - Created | 404 Not Found | FAIL | V-RL1, V-TY1, V-PR1, V-PG1, B-PG4 | Lỗi 404 |
| 6 | TC-TL002-06 | overallProgress âm (-1) | Progress: -1 | 400 - Bad Request | 404 Not Found | FAIL | X-PG1 | Lỗi 404 |
| 7 | TC-TL002-07 | overallProgress vượt 100 (101)| Progress: 101 | 400 - Bad Request | 404 Not Found | FAIL | X-PG2 | Lỗi 404 |
| 8 | TC-TL002-08 | overallProgress kiểu chữ | Progress: "nam_muoi" | 400 - Bad Request | 404 Not Found | FAIL | X-PG3 | Lỗi 404 |
| 9 | TC-TL002-09 | reportType sai danh mục | Type: "DAILY" | 400 - Bad Request | 404 Not Found | FAIL | X-TY2 | Lỗi 404 |
| 10 | TC-TL002-10 | reportType rỗng | Type: "" | 400 - Bad Request | 404 Not Found | FAIL | X-TY1 | Lỗi 404 |
| 11 | TC-TL002-11 | reportingPeriod tháng 13 | Period: "2026-13" | 400 - Bad Request | 404 Not Found | FAIL | X-PR2 | Lỗi 404 |
| 12 | TC-TL002-12 | reportingPeriod sai format | Period: "15-02-2026" | 400 - Bad Request | 404 Not Found | FAIL | X-PR1 | Lỗi 404 |
| 13 | TC-TL002-13 | Chưa đăng nhập gọi API | No Token | 401 - Unauthorized | 404 Not Found | FAIL | X-RL1 | Lỗi 404 |
| 14 | TC-TL002-14 | Member thường gọi nộp | Role: TALENT_MEMBER | 403 - Forbidden | 404 Not Found | FAIL | X-RL2 | Lỗi 404 |
| 15 | TC-TL002-15 | Leader dự án khác gọi nộp | Role: TALENT_OTHER_PRJ | 403 - Forbidden | 404 Not Found | FAIL | X-RL3 | Lỗi 404 |

---

## 3. Kiểm tra bao phủ tag

| Nhóm tag | Tổng số tag | Đã test | Tỷ lệ bao phủ |
|---|---:|---:|---:|
| Lớp tương đương (EP) | 14 | 14 | 100% |
| Phân tích giá trị biên (BVA) | 7 | 7 | 100% |
| **Tổng cộng** | **21** | **21** | **100%** |

---

## 4. Danh sách bug phát hiện

| # | TC ID | Mô tả bug | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-TL002-01..15 | Endpoint POST `/api/talent-leader/projects/{id}/reports` trả về 404 Not Found do backend chưa triển khai | High | LABODC-98 | Open (Chờ Dev fix) |
