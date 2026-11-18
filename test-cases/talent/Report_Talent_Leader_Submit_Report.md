# Test Execution Report: FR-TL-002 - Nộp Báo cáo Nhóm (Submit Team Report)

**Module:** Talent Leader / Project Management  
**Chức năng:** Nộp Báo cáo Tiến độ Nhóm (`POST /api/talent-leader/projects/{projectId}/reports`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện lần đầu:** 08/11/2026  
**Ngày cập nhật bổ sung:** 18/11/2026  
**Môi trường test:** Postman API Testing (`http://localhost:8080`)  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_Leader_Submit_Report.md`  

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 16 |
| Passed | 0 |
| Failed | 0 |
| Blocked / Skipped | 16 |
| **Pass rate** | **N/A (16/16 BLOCKED - Backend chưa triển khai route)** |

> **Blocker:** Endpoint `POST /api/talent-leader/projects/{projectId}/reports` và các route liên quan (`/api/talent-leader/**`) chưa tồn tại trong source code backend (`TalentController.java`). Tất cả 16 request đều nhận mã phản hồi HTTP `404 Not Found`. Toàn bộ ca kiểm thử chức năng được ghi nhận trạng thái **BLOCKED** để chờ phía Backend triển khai API.

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input (Role / Project / Type / Period / Progress) | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-TL002-01 | Nộp báo cáo nominal (50%) | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, 50 | 201 - Created | 404 Not Found | BLOCKED | V-RL1, V-TY1, V-PR1, V-PG1, V-UQ1, B-PG3, ST-02, R1 | Route `/api/talent-leader/**` chưa có |
| 2 | TC-TL002-02 | Nộp báo cáo min (0%) | TEAM_LEADER, prj=1, `WEEKLY`, `2026-01`, 0 | 201 - Created | 404 Not Found | BLOCKED | V-RL1, V-TY1, V-PR1, V-PG1, B-PG1, B-TY1, B-PR1, R1 | Bị chặn bởi lỗi 404 |
| 3 | TC-TL002-03 | Nộp báo cáo max (100%) | TEAM_LEADER, prj=1, `FINAL`, `2026-12`, 100 | 201 - Created | 404 Not Found | BLOCKED | V-RL1, V-TY1, V-PR1, V-PG1, B-PG5, B-TY1, B-PR1, R1 | Bị chặn bởi lỗi 404 |
| 4 | TC-TL002-04 | Nộp báo cáo min+ (1%) | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, 1 | 201 - Created | 404 Not Found | BLOCKED | V-RL1, V-TY1, V-PR1, V-PG1, B-PG2, R1 | Bị chặn bởi lỗi 404 |
| 5 | TC-TL002-05 | Nộp báo cáo max- (99%) | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, 99 | 201 - Created | 404 Not Found | BLOCKED | V-RL1, V-TY1, V-PR1, V-PG1, B-PG4, R1 | Bị chặn bởi lỗi 404 |
| 6 | TC-TL002-06 | overallProgress âm (-1) | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, -1 | 400 - Bad Request | 404 Not Found | BLOCKED | X-PG1, R6 | Bị chặn bởi lỗi 404 |
| 7 | TC-TL002-07 | overallProgress vượt 100 (101) | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, 101 | 400 - Bad Request | 404 Not Found | BLOCKED | X-PG2, R6 | Bị chặn bởi lỗi 404 |
| 8 | TC-TL002-08 | overallProgress kiểu chữ | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, `"nam_muoi"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-PG3, R6 | Bị chặn bởi lỗi 404 |
| 9 | TC-TL002-09 | reportType sai danh mục | TEAM_LEADER, prj=1, `DAILY`, `2026-02`, 50 | 400 - Bad Request | 404 Not Found | BLOCKED | X-TY2, R4 | Bị chặn bởi lỗi 404 |
| 10 | TC-TL002-10 | reportType rỗng | TEAM_LEADER, prj=1, `""`, `2026-02`, 50 | 400 - Bad Request | 404 Not Found | BLOCKED | X-TY1, R4 | Bị chặn bởi lỗi 404 |
| 11 | TC-TL002-11 | reportingPeriod tháng 13 | TEAM_LEADER, prj=1, `MONTHLY`, `2026-13`, 50 | 400 - Bad Request | 404 Not Found | BLOCKED | X-PR2, R5 | Bị chặn bởi lỗi 404 |
| 12 | TC-TL002-12 | reportingPeriod sai định dạng | TEAM_LEADER, prj=1, `MONTHLY`, `15-02-2026`, 50 | 400 - Bad Request | 404 Not Found | BLOCKED | X-PR1, R5 | Bị chặn bởi lỗi 404 |
| 13 | TC-TL002-13 | Chưa đăng nhập gọi API | Không token, prj=1, `MONTHLY`, `2026-02`, 50 | 401 - Unauthorized | 404 Not Found | BLOCKED | X-RL1 | Lẽ ra phải 401 nếu route tồn tại |
| 14 | TC-TL002-14 | Member thường gọi nộp | TALENT_MEMBER, prj=1, `MONTHLY`, `2026-02`, 50 | 403 - Forbidden | 404 Not Found | BLOCKED | X-RL2, R3 | Bị chặn bởi lỗi 404 |
| 15 | TC-TL002-15 | Leader dự án khác gọi nộp | TALENT_OTHER_PRJ, prj=1, `MONTHLY`, `2026-02`, 50 | 403 - Forbidden | 404 Not Found | BLOCKED | X-RL3, R3 | Bị chặn bởi lỗi 404 |
| 16 | TC-TL002-16 | Trùng kỳ báo cáo đã nộp | TEAM_LEADER, prj=1, `MONTHLY`, `2026-02`, 70 | 400 hoặc 409 | 404 Not Found | BLOCKED | X-UQ1, R5 | Bị chặn bởi lỗi 404 |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-RL1 | Token Team Leader hợp lệ | TC-TL002-01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 16 | BLOCKED (Chờ route backend) |
| V-TY1 | reportType hợp lệ | TC-TL002-01, 02, 03, 04, 05 | BLOCKED (Chờ route backend) |
| V-PR1 | reportingPeriod đúng định dạng | TC-TL002-01, 02, 03, 04, 05 | BLOCKED (Chờ route backend) |
| V-PG1 | overallProgress hợp lệ [0..100] | TC-TL002-01, 02, 03, 04, 05 | BLOCKED (Chờ route backend) |
| V-UQ1 | Kỳ báo cáo mới, chưa trùng | TC-TL002-01 | BLOCKED (Chờ route backend) |
| X-RL1 | Không có token | TC-TL002-13 | BLOCKED (Trả 404 thay vì 401) |
| X-RL2 | Talent Member thường | TC-TL002-14 | BLOCKED (Chờ route backend) |
| X-RL3 | Leader dự án khác | TC-TL002-15 | BLOCKED (Chờ route backend) |
| X-TY1 | reportType rỗng | TC-TL002-10 | BLOCKED (Chờ route backend) |
| X-TY2 | reportType sai enum | TC-TL002-09 | BLOCKED (Chờ route backend) |
| X-PR1 | reportingPeriod sai format | TC-TL002-12 | BLOCKED (Chờ route backend) |
| X-PR2 | reportingPeriod tháng sai | TC-TL002-11 | BLOCKED (Chờ route backend) |
| X-PG1 | overallProgress âm | TC-TL002-06 | BLOCKED (Chờ route backend) |
| X-PG2 | overallProgress > 100 | TC-TL002-07 | BLOCKED (Chờ route backend) |
| X-PG3 | overallProgress kiểu chuỗi | TC-TL002-08 | BLOCKED (Chờ route backend) |
| X-UQ1 | Trùng kỳ báo cáo | TC-TL002-16 | BLOCKED (Chờ route backend) |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-PG1 | min = 0% | TC-TL002-02 | BLOCKED |
| B-PG2 | min+ = 1% | TC-TL002-04 | BLOCKED |
| B-PG3 | nominal = 50% | TC-TL002-01 | BLOCKED |
| B-PG4 | max- = 99% | TC-TL002-05 | BLOCKED |
| B-PG5 | max = 100% | TC-TL002-03 | BLOCKED |
| B-TY1 | WEEKLY, FINAL | TC-TL002-02, 03 | BLOCKED |
| B-PR1 | 2026-01, 2026-12 | TC-TL002-02, 03 | BLOCKED |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | Non-Existent → DRAFT | Quy trình nộp nháp | BLOCKED |
| ST-02 | Non-Existent → SUBMITTED | TC-TL002-01 | BLOCKED |
| ST-03 | DRAFT → DRAFT | Cập nhật nháp | BLOCKED |
| ST-04 | DRAFT → SUBMITTED | Nộp chính thức từ nháp | BLOCKED |
| ST-05 | SUBMITTED → UNDER_REVIEW | Quy trình duyệt Mentor | BLOCKED |
| ST-06 | UNDER_REVIEW → APPROVED | Phê duyệt đạt | BLOCKED |
| ST-07 | UNDER_REVIEW → NEEDS_REVISION | Yêu cầu chỉnh sửa | BLOCKED |
| ST-08 | NEEDS_REVISION → SUBMITTED | Nộp lại sau sửa | BLOCKED |
| ST-09 | APPROVED → sửa báo cáo | Bị từ chối 400 | BLOCKED |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ (SUBMITTED) → 201 Created | TC-TL002-01, 02, 03, 04, 05 | BLOCKED |
| R2 | Tất cả hợp lệ (DRAFT) → 201 Created | ST-01 (Lưu nháp) | BLOCKED |
| R3 | Sai quyền Leader → 403 Forbidden | TC-TL002-14, 15 | BLOCKED |
| R4 | Sai reportType → 400 Bad Request | TC-TL002-09, 10 | BLOCKED |
| R5 | Sai kỳ hoặc trùng kỳ → 400 Bad Request | TC-TL002-11, 12, 16 | BLOCKED |
| R6 | Sai khoảng tiến độ → 400 Bad Request | TC-TL002-06, 07, 08 | BLOCKED |

> **Bao phủ (trên tổng TC):** 16/16 EP tags, 7/7 BVA tags, 9/9 state transitions, 6/6 decision rules - **100%**.  
> **Đã thực thi:** 16/16 test case. Toàn bộ 16 ca đều nhận mã `404 Not Found` do backend thiếu route.

---

## 4. Danh sách bug / khiếm khuyết phát hiện

| # | TC ID | Mô tả bug / khiếm khuyết | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-TL002-01..16 | Endpoint `POST /api/talent-leader/projects/{projectId}/reports` và các route liên quan `/api/talent-leader/**` trả về `404 Not Found` do backend chưa hiện thực controller | High | LABODC-172 | Open (Blocker - Chờ Dev implement) |
| 2 | TC-TL002-13 | Khi gửi request không có JWT token, hệ thống trả về `404 Not Found` thay vì `401 Unauthorized` (Security filter không chặn trước route 404) | Medium | — | Open (Liên đới lỗi thiếu route) |
