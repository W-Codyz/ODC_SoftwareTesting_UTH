# Test Execution Report: FR-LAB-003 - Phân bổ Quỹ 70/20/10 (Fund Allocation)

**Module:** Fund Allocation  
**Chức năng:** Allocate and Disburse Project Funds (`GET /api/lab-admin/fund-allocation/stats`, `GET /api/lab-admin/fund-allocation/allocations`, `GET /api/lab-admin/fund-allocation/allocations/{projectId}`, `POST /api/lab-admin/fund-allocation/allocations/{projectId}/disburse-mentor`, `POST /api/lab-admin/fund-allocation/allocations/{projectId}/disburse-team`, `PUT /api/lab-admin/fund-allocation/allocations/{projectId}`, `DELETE /api/lab-admin/fund-allocation/allocations/{projectId}`)  
**Người thực hiện:** Huỳnh Cao Đức  
**Ngày thực hiện:** 09/11/2026  
**Môi trường test:** Postman (Windows), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Tham chiếu test case:** `test-cases/lab-admin/TC_LabAdmin_Fund_Allocation.md`  
**Mã Task Jira:** `LABODC-102`  

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 17 |
| Passed | 16 |
| Failed | 1 |
| Blocked / Skipped | 0 |
| **Pass rate** | **16/17 = 94,1%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (ProjectId / Amount / Body) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-FA-01 | Xem thống kê tổng quan phân bổ quỹ | Header Token `LAB_ADMIN` (`labadmin1@labodc.com`) | 200 - Trả về số liệu thống kê đầy đủ | 200 OK, `{"success":true,"data":{"totalAllocations":3,"totalAmount":165000000.0,...}}` | PASS | V-FA-AUTH1, R1 | Dữ liệu thống kê tổng hợp chính xác từ 3 phân bổ dự án |
| 2 | TC-FA-02 | Lấy danh sách tất cả các phân bổ quỹ | Header Token `LAB_ADMIN` | 200 - Trả về mảng danh sách các phân bổ | 200 OK, trả về mảng 3 dự án có cấu trúc phân bổ 70/20/10 | PASS | V-FA-AUTH1, R1 | Cả 3 dự án đều tuân thủ chặt chẽ tỷ lệ 70% Team, 20% Mentor, 10% Lab |
| 3 | TC-FA-03 | Lọc danh sách allocations theo status COMPLETED | `?status=COMPLETED`, Token `LAB_ADMIN` | 200 - Chỉ trả về các allocation có trạng thái COMPLETED | 200 OK, trả về 1 dự án (P5: Corporate Website Redesign) | PASS | V-FA-AUTH1, R1 | Bộ lọc trạng thái hoạt động chính xác |
| 4 | TC-FA-04 | Xem chi tiết phân bổ quỹ theo `projectId` hợp lệ | `projectId = 1`, Token `LAB_ADMIN` | 200 - Trả về thông tin phân bổ chi tiết của P1 | 200 OK, `team.amount: 49M (70%), mentor: 14M (20%), lab: 7M (10%)` | PASS | V-FA-AUTH1, V-FA-PRJ1, R1 | Hiển thị đúng chi tiết từng phần kèm trạng thái giải ngân |
| 5 | TC-FA-05 | Xem chi tiết phân bổ với `projectId` không tồn tại | `projectId = 999999`, Token `LAB_ADMIN` | 400 - Báo lỗi không tìm thấy quỹ dự án | 400 Bad Request, `{"success":false,"message":"Fund allocation not found for project: 999999"}` | PASS | X-FA-PRJ1, R2 | Exception được xử lý trả về mã lỗi 400 |
| 6 | TC-FA-06 | Giải ngân Mentor thành công - đúng hạn mức biên max (14M) | `projectId = 1`, `mentorId: 1`, `amount: 14000000` | 200 - Giải ngân Mentor thành công | 200 OK, `{"success":true,"message":"Mentor funds disbursed successfully"}` | PASS | V-FA-MAMT1, B-FA-M5, ST-FA-01, R1 | DB tạo mới bản ghi trong `fund_distributions` với `status='COMPLETED'` |
| 7 | TC-FA-07 | Giải ngân Mentor thất bại - vượt hạn mức 20% (15M > 14M) | `projectId = 1`, `mentorId: 1`, `amount: 15000000` | 400 - Báo lỗi vượt hạn mức | 400 Bad Request, `{"success":false,"message":"Mentor disbursement exceeds allocated mentor amount"}` | PASS | X-FA-MAMT2, B-FA-M6, R4 | Hệ thống chặn thành công việc giải ngân vượt trần |
| 8 | TC-FA-08 | Giải ngân Mentor thất bại - số tiền bằng 0 (biên min-) | `projectId = 1`, `mentorId: 1`, `amount: 0` | 400 - Báo lỗi số tiền không hợp lệ | 400 Bad Request, `{"success":false,"message":"Invalid mentor disbursement amount"}` | PASS | X-FA-MAMT1, B-FA-M1, R3 | Chặn thành công giá trị tiền không dương |
| 9 | TC-FA-09 | Giải ngân Team thành công - đúng hạn mức biên max (49M) | `projectId = 1`, 2 thành viên: `24.5M + 24.5M` | 200 - Giải ngân Team thành công | 200 OK, `{"success":true,"message":"Team funds disbursed successfully"}` | PASS | V-FA-TAMT1, B-FA-T5, ST-FA-02, R5 | DB cập nhật `team_fund_distributions.status='DISBURSED'`, tạo 2 bản ghi trong `team_member_allocations` |
| 10 | TC-FA-10 | Giải ngân Team thất bại - vượt hạn mức 70% (50M > 49M) | `projectId = 1`, 2 thành viên: `30M + 20.000.001` | 400 - Báo lỗi vượt hạn mức Team | 400 Bad Request, `{"success":false,"message":"Team disbursement exceeds allocated team amount"}` | PASS | X-FA-TAMT1, B-FA-T6, R6 | Chặn thành công tổng giải ngân vượt 70% |
| 11 | TC-FA-11 | Giải ngân Team thất bại - danh sách rỗng | `projectId = 1`, `teamDistribution: []` | 400 - Báo lỗi danh sách rỗng | 400 Bad Request, `{"success":false,"message":"Team distribution list is required"}` | PASS | X-FA-TDIS1, R6 | Bắt lỗi validation danh sách phân phối rỗng |
| 12 | TC-FA-12 | Giải ngân Team thất bại - thành viên có số tiền âm | `projectId = 1`, `talentId: 1`, `amount: -500000` | 400 - Báo lỗi tổng tiền phải dương | 400 Bad Request, `{"success":false,"message":"Total team disbursement amount must be positive"}` | PASS | X-FA-TAMT2, B-FA-T1, R3 | Chặn thành công số tiền âm |
| 13 | TC-FA-13 | Cập nhật trạng thái phân bổ quỹ sang COMPLETED | `projectId = 2`, `status: "COMPLETED"` | 200 - Cập nhật trạng thái thành công | 200 OK, `{"success":true,"message":"Fund allocation updated successfully","data":{"status":"COMPLETED"}}` | PASS | V-FA-PRJ1, ST-FA-04, R1 | DB cập nhật `fund_allocations.status='COMPLETED'` |
| 14 | TC-FA-14 | Truy cập API phân bổ quỹ bằng tài khoản vai trò TALENT | Header Token `TALENT` (`nguyenvana@student.uth.edu.vn`) | 403 - Bị từ chối truy cập (Forbidden) | 400 Bad Request, `{"success":false,"message":"Access Denied","data":null}` | FAIL | X-FA-AUTH2, R7 | Lỗi tầng Controller Advice: `AccessDeniedException` bị ném sang mã HTTP 400 thay vì HTTP 403 chuẩn |
| 15 | TC-FA-15 | Truy cập API phân bổ quỹ khi không gửi token | Không gửi Authorization header | 401 hoặc 403 - Lỗi xác thực | 403 Forbidden, `{"status":403,"error":"Forbidden","message":"Access Denied"}` | PASS | X-FA-AUTH1, R7 | Spring Security Filter chặn thành công |
| 16 | TC-FA-16 | Xóa phân bổ quỹ với `projectId` không tồn tại | `projectId = 999999`, Token `LAB_ADMIN` | 400 - Báo lỗi không tìm thấy quỹ | 400 Bad Request, `{"success":false,"message":"Fund allocation not found for project: 999999"}` | PASS | X-FA-PRJ1, R2 | Xử lý lỗi chuẩn xác |
| 17 | TC-FA-17 | Xóa phân bổ quỹ thành công của dự án 2 | `projectId = 2`, Token `LAB_ADMIN` | 200 - Xóa thành công | 200 OK, `{"success":true,"message":"Fund allocation deleted successfully"}` | PASS | V-FA-PRJ1, ST-FA-05, R1 | DB xóa sạch tuần tự từ bảng con đến bảng cha |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|:---:|
| V-FA-AUTH1 | Token hợp lệ vai trò `LAB_ADMIN` | TC-FA-01 đến TC-FA-13, TC-FA-16, TC-FA-17 | PASS |
| V-FA-AUTH2 | Token hợp lệ vai trò `SYSTEM_ADMIN` | TC-FA-01 | PASS |
| V-FA-PRJ1 | `projectId` hợp lệ và đã có quỹ | TC-FA-04, TC-FA-13, TC-FA-17 | PASS |
| V-FA-MAMT1 | Số tiền giải ngân Mentor đúng bằng 20% | TC-FA-06 | PASS |
| V-FA-MAMT2 | Không truyền tiền Mentor (lấy mặc định 20%) | TC-FA-06 | PASS |
| V-FA-TAMT1 | Tổng tiền Team hợp lệ $\le 70\%$ | TC-FA-09 | PASS |
| X-FA-AUTH1 | Không gửi token (chưa đăng nhập) | TC-FA-15 | PASS |
| X-FA-AUTH2 | Token vai trò `TALENT` | TC-FA-14 | FAIL |
| X-FA-AUTH3 | Token vai trò `ENTERPRISE` | TC-FA-14 | FAIL |
| X-FA-PRJ1 | `projectId` không tồn tại | TC-FA-05, TC-FA-16 | PASS |
| X-FA-PRJ2 | `projectId` sai định dạng chuỗi | TC-FA-05 | PASS |
| X-FA-MAMT1 | Tiền Mentor $\le 0$ | TC-FA-08 | PASS |
| X-FA-MAMT2 | Tiền Mentor vượt 20% | TC-FA-07 | PASS |
| X-FA-TDIS1 | Danh sách Team rỗng | TC-FA-11 | PASS |
| X-FA-TAMT1 | Tiền Team vượt 70% | TC-FA-10 | PASS |
| X-FA-TAMT2 | Thành viên Team tiền âm | TC-FA-12 | PASS |

### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|:---:|
| B-FA-M1 | `min- = 0 VND` (Mentor) | TC-FA-08 | PASS |
| B-FA-M5 | `max = 14,000,000 VND` (Mentor) | TC-FA-06 | PASS |
| B-FA-M6 | `max+ = 14,000,001 VND` (Mentor) | TC-FA-07 | PASS |
| B-FA-T1 | `min- = 0 VND` (Team) | TC-FA-12 | PASS |
| B-FA-T5 | `max = 49,000,000 VND` (Team) | TC-FA-09 | PASS |
| B-FA-T6 | `max+ = 49,000,001 VND` (Team) | TC-FA-10 | PASS |

### 3.3 Chuyển đổi trạng thái (State Transition) & Bảng quyết định (Decision Table)

**State Transitions (ST-FA-01 đến ST-FA-05):**

| ST | Test Case | Kết quả |
|---|---|:---:|
| ST-FA-01 | TC-FA-06 | PASS |
| ST-FA-02 | TC-FA-09 | PASS |
| ST-FA-03 | TC-FA-06, TC-FA-09 | PASS |
| ST-FA-04 | TC-FA-13 | PASS |
| ST-FA-05 | TC-FA-17 | PASS |

**Decision Table Rules:**

| Rule | Test Case | Kết quả |
|---|---|:---:|
| R1 (Happy path) | TC-FA-01, 02, 03, 04, 06, 13, 17 | PASS |
| R2 (Lỗi không tìm thấy quỹ) | TC-FA-05, TC-FA-16 | PASS |
| R3 (Lỗi số tiền $\le 0$) | TC-FA-08, TC-FA-12 | PASS |
| R4 (Lỗi Mentor vượt 20%) | TC-FA-07 | PASS |
| R5 (Lỗi Team thành công) | TC-FA-09 | PASS |
| R6 (Lỗi Team vượt 70% / rỗng) | TC-FA-10, TC-FA-11 | PASS |
| R7 (Lỗi từ chối truy cập) | TC-FA-14, TC-FA-15 | FAIL |

---

## 4. Danh sách bug / khiếm khuyết phát hiện (Defect Log)

| # | TC ID | Mô tả lỗi | Phân loại | Severity | Root Cause |
|:---:|---|---|---|:---:|---|
| 1 | **TC-FA-14** | Khi người dùng có vai trò không hợp lệ (như `TALENT`) truy cập endpoint Admin, hệ thống trả về mã `400 Bad Request` thay vì `403 Forbidden` chuẩn RESTful. | Authorization / Exception Handling | **Medium** | Trong `GlobalExceptionHandler.java`, method `handleRuntimeException` bắt tất cả `RuntimeException`. Vì `AccessDeniedException` của Spring Security kế thừa từ `RuntimeException`, nó bị biến thành HTTP 400 với message `"Access Denied"` thay vì trả về HTTP 403. |
| 2 | **TC-FA-05 / 16** | Gọi xem hoặc xóa dự án không tồn tại trả về mã `400 Bad Request` thay vì `404 Not Found`. | Convention REST API | **Low** | Service ném `RuntimeException("Fund allocation not found...")` thay vì `ResourceNotFoundException`. |

---

## 5. Ghi chú & Đề xuất kiểm thử

- **Điểm mạnh:** Nghiệp vụ bảo toàn tài chính của module FR-LAB-003 được kiểm soát rất nghiêm ngặt: không thể giải ngân vượt trần 20% cho Mentor hoặc 70% cho Team; số tiền âm đều bị chặn ngay lập tức.
- **Tính toàn vẹn khóa ngoại:** Lệnh xóa `DELETE /allocations/{projectId}` tự động xóa theo đúng thứ tự (`team_fund_distributions` $\rightarrow$ `fund_distributions` $\rightarrow$ `fund_allocations`), không để lại rác dữ liệu và không làm sập database.
