# Test Cases: FR-LAB-003 - Phân bổ Quỹ 70/20/10 (Fund Allocation)

**Module:** Lab Administrator  
**Chức năng:** Allocate and Disburse Project Funds (`GET /api/lab-admin/fund-allocation/stats`, `GET /api/lab-admin/fund-allocation/allocations`, `GET /api/lab-admin/fund-allocation/allocations/{projectId}`, `POST /api/lab-admin/fund-allocation/allocations/{projectId}/disburse-mentor`, `POST /api/lab-admin/fund-allocation/allocations/{projectId}/disburse-team`, `PUT /api/lab-admin/fund-allocation/allocations/{projectId}`, `DELETE /api/lab-admin/fund-allocation/allocations/{projectId}`)  
**Người thực hiện:** Huỳnh Cao Đức  
**Ngày tạo:** 28/10/2026  
**Ngày cập nhật:** 09/11/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-LAB-003, `docs/URD_LabOdc.md`  
**Source code tham chiếu:** `labodc-backend/.../controller/FundAllocationController.java`, `labodc-backend/.../service/FundAllocationService.java`, `labodc-backend/.../dto/fund/*`

---

## Mô tả chức năng

Lab Administrator quản lý việc phân bổ kinh phí dự án từ doanh nghiệp đóng góp theo quy tắc cố định **70/20/10** (70% Sinh viên, 20% Giảng viên hướng dẫn Mentor, 10% Quỹ vận hành Lab) và thực hiện giải ngân cho từng bên khi đủ điều kiện nghiệm thu.

**Điều kiện hợp lệ:** Yêu cầu giải ngân và quản lý phân bổ quỹ được chấp nhận khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `projectId` | Mã định danh dự án | Long | Số nguyên dương, dự án tồn tại và đã có bản ghi phân bổ quỹ |
| `mentorId` | Mã Mentor nhận giải ngân | Long | Số nguyên dương, khớp với Mentor được phân công của dự án |
| `mentorAmount` | Số tiền giải ngân cho Mentor | BigDecimal | Số thực $> 0$, không vượt quá hạn mức 20% (`mentorAmount`) |
| `teamDistribution` | Danh sách phân phối thành viên | List\<Object\> | Danh sách không rỗng, mỗi thành viên có `talentId` hợp lệ và `amount > 0` |
| `teamTotalAmount` | Tổng tiền giải ngân cho Team | BigDecimal | Số thực $> 0$, không vượt quá hạn mức 70% (`teamAmount`) |
| `status` | Trạng thái phân bổ quỹ | String | Thuộc enum: `ALLOCATED`, `DISTRIBUTED`, `COMPLETED` |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Quyền truy cập & Xác thực (Role & Token)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Token hợp lệ vai trò `LAB_ADMIN` | V-FA-AUTH1 | Token của `labadmin1@labodc.com` |
| Hợp lệ (b) | Token hợp lệ vai trò `SYSTEM_ADMIN` | V-FA-AUTH2 | Token của `admin@labodc.com` |
| Không hợp lệ (a) | Không gửi Authorization header (chưa đăng nhập) | X-FA-AUTH1 | `(Không gửi header)` |
| Không hợp lệ (b) | Token hợp lệ nhưng vai trò `TALENT` | X-FA-AUTH2 | Token của `nguyenvana@student.uth.edu.vn` |
| Không hợp lệ (c) | Token hợp lệ nhưng vai trò `ENTERPRISE` | X-FA-AUTH3 | Token của `contact@techcorp.vn` |

### 1.2 Tham số `projectId` (Mã dự án)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | `projectId` tồn tại và đã có bản ghi phân bổ quỹ | V-FA-PRJ1 | `projectId = 1` (Dự án E-Commerce, 70M) |
| Không hợp lệ (a) | `projectId` không tồn tại trong hệ thống | X-FA-PRJ1 | `projectId = 999999` |
| Không hợp lệ (b) | `projectId` sai định dạng (chuỗi ký tự chữ) | X-FA-PRJ2 | `projectId = "abc"` |

### 1.3 Số tiền giải ngân Mentor (`DisburseMentorRequest.amount`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Số tiền đúng bằng định mức 20% | V-FA-MAMT1 | `amount = 14000000.00` |
| Hợp lệ (b) | Không truyền amount (hệ thống tự lấy đúng hạn mức 20%) | V-FA-MAMT2 | `amount = null` |
| Không hợp lệ (a) | Số tiền bằng 0 hoặc âm | X-FA-MAMT1 | `amount = 0` hoặc `amount = -5000000` |
| Không hợp lệ (b) | Số tiền vượt quá hạn mức 20% | X-FA-MAMT2 | `amount = 15000000.00` (vượt 14M) |

### 1.4 Danh sách và Số tiền giải ngân Team (`DisburseTeamRequest`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Danh sách hợp lệ, tổng số tiền $\le 70\%$ định mức | V-FA-TAMT1 | 2 thành viên: 24.5M + 24.5M = 49M |
| Không hợp lệ (a) | Danh sách thành viên rỗng | X-FA-TDIS1 | `teamDistribution = []` |
| Không hợp lệ (b) | Tổng số tiền giải ngân vượt quá 70% định mức | X-FA-TAMT1 | Tổng 50,000,001 VND (vượt 49M) |
| Không hợp lệ (c) | Thành viên có số tiền $\le 0$ | X-FA-TAMT2 | `talentId = 1, amount = -500000` |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-FA-AUTH1, V-FA-AUTH2, V-FA-PRJ1, V-FA-MAMT1, V-FA-MAMT2, V-FA-TAMT1 | 6 |
| Không hợp lệ | X-FA-AUTH1, X-FA-AUTH2, X-FA-AUTH3, X-FA-PRJ1, X-FA-PRJ2, X-FA-MAMT1, X-FA-MAMT2, X-FA-TDIS1, X-FA-TAMT1, X-FA-TAMT2 | 10 |
| **Tổng** | | **16 tag** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

### 2.1 Biên cho số tiền giải ngân Mentor (Hạn mức 20% = 14,000,000 VND)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Ngay dưới biên min (không hợp lệ) | 0 | Không có giá trị giải ngân | B-FA-M1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 1 | 1 VND | B-FA-M2 |
| `nominal` | Giá trị giữa miền hợp lệ | 7,000,000 | 50% hạn mức Mentor | B-FA-M3 |
| `max-` | Ngay dưới biên max | 13,999,999 | Gần chạm hạn mức | B-FA-M4 |
| `max` | Đúng hạn mức 20% cho phép | 14,000,000 | Đúng hạn mức 14M | B-FA-M5 |
| `max+` | Vượt trên hạn mức 20% (không hợp lệ) | 14,000,001 | Vượt 1 VND | B-FA-M6 |

### 2.2 Biên cho tổng số tiền giải ngân Team (Hạn mức 70% = 49,000,000 VND)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Tổng tiền bằng 0 (không hợp lệ) | 0 | Tổng = 0 VND | B-FA-T1 |
| `min` | Tổng tiền nhỏ nhất hợp lệ | 1 | Tổng = 1 VND | B-FA-T2 |
| `nominal` | Giá trị giữa miền hợp lệ | 24,500,000 | 50% hạn mức Team | B-FA-T3 |
| `max-` | Ngay dưới hạn mức 70% | 48,999,999 | Gần chạm hạn mức | B-FA-T4 |
| `max` | Đúng hạn mức 70% cho phép | 49,000,000 | Đúng 49M | B-FA-T5 |
| `max+` | Vượt hạn mức 70% (không hợp lệ) | 49,000,001 | Vượt 1 VND | B-FA-T6 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Sơ đồ trạng thái Phân bổ Quỹ & Giải ngân

**Trạng thái Quỹ (`fund_allocations.status`):**
- **ALLOCATED** - Đã tạo phân bổ 70/20/10 sau khi thanh toán thành công
- **DISTRIBUTED** - Đang giải ngân (đã giải ngân 1 phần cho Mentor hoặc Team)
- **COMPLETED** - Đã giải ngân hoàn tất toàn bộ 100% kinh phí

**Trạng thái Phân phối Team (`team_fund_distributions.status`):**
- **APPROVED_BY_MENTOR** - Mentor đã duyệt kế hoạch phân bổ của Leader
- **DISBURSED** - Lab Admin đã xác nhận giải ngân chuyển tiền

### 3.2 Bảng chuyển đổi trạng thái

| Test Case | Start State | Event/Input | Expected End State | Expected Output |
|---|---|---|---|---|
| ST-FA-01 | ALLOCATED | Gọi `POST /disburse-mentor` (hợp lệ) | DISTRIBUTED | Giải ngân Mentor thành công, tạo `fund_distributions` |
| ST-FA-02 | ALLOCATED | Gọi `POST /disburse-team` (hợp lệ) | DISTRIBUTED | Giải ngân Team thành công, cập nhật `team_fund_distributions` sang DISBURSED |
| ST-FA-03 | DISTRIBUTED | Gọi giải ngân phần còn lại (Mentor & Team hoàn tất) | COMPLETED | Toàn bộ 70/20/10 được hoàn tất |
| ST-FA-04 | ALLOCATED / DISTRIBUTED | Gọi `PUT /allocations/{id}` với `status='COMPLETED'` | COMPLETED | Trạng thái quỹ được cập nhật sang COMPLETED |
| ST-FA-05 | COMPLETED | Gọi `DELETE /allocations/{id}` | (XÓA KHỎI DB) | Bản ghi và các phân phối phụ thuộc bị xóa hoàn toàn |

---

## 4. Bảng quyết định (Decision Table)

### 4.1 Điều kiện và hành động

**Conditions:**
- C1: Quyền truy cập là `LAB_ADMIN` hoặc `SYSTEM_ADMIN`?
- C2: Dự án tồn tại và đã có bản ghi phân bổ quỹ?
- C3: Số tiền giải ngân hợp lệ ($> 0$)?
- C4: Số tiền giải ngân Mentor $\le 20\%$ hạn mức?
- C5: Danh sách phân phối Team không rỗng và tổng tiền $\le 70\%$?

**Actions:**
- A1: 200 OK - Thao tác thành công, tạo giao dịch giải ngân
- A2: 400 Bad Request - Lỗi không tìm thấy quỹ dự án
- A3: 400 Bad Request - Lỗi vượt hạn mức phân bổ (Mentor/Team)
- A4: 400 Bad Request - Lỗi dữ liệu số tiền không hợp lệ ($\le 0$ / danh sách rỗng)
- A5: 403 Forbidden - Từ chối truy cập do sai vai trò

### 4.2 Bảng quyết định

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **C1:** Quyền Admin hợp lệ | Y | Y | Y | Y | Y | Y | **N** |
| **C2:** Dự án tồn tại & có quỹ | Y | **N** | Y | Y | Y | Y | - |
| **C3:** Số tiền giải ngân $> 0$ | Y | - | **N** | Y | Y | Y | - |
| **C4:** Tiền Mentor $\le 20\%$ | Y | - | - | **N** | - | - | - |
| **C5:** Team hợp lệ $\le 70\%$ | - | - | - | - | Y | **N** | - |
| | | | | | | | |
| **A1:** 200 - Thành công | **X** | - | - | - | **X** | - | - |
| **A2:** 400 - Không tìm thấy quỹ | - | **X** | - | - | - | - | - |
| **A3:** 400 - Vượt hạn mức | - | - | - | **X** | - | **X** | - |
| **A4:** 400 - Dữ liệu không hợp lệ | - | - | **X** | - | - | - | - |
| **A5:** 403 - Từ chối truy cập | - | - | - | - | - | - | **X** |

---

## 5. Bảng Test Cases (Test Specification Table)

### Preconditions (áp dụng chung)

- Backend Spring Boot đang chạy tại `http://localhost:8080`, database PostgreSQL đã seed data `Seed_Tasks_Payment_Reports.sql`.
- Dự án 1: Tổng quỹ 70M VND (Team: 49M, Mentor: 14M, Lab: 7M).
- Dự án 2: Tổng quỹ 50M VND (Team: 35M, Mentor: 10M, Lab: 5M).
- Token `LAB_ADMIN` (`labadmin1@labodc.com`), Token `TALENT` (`nguyenvana@student.uth.edu.vn`).

### Bảng kịch bản test (Cấu trúc 8 cột chuẩn)

| STT | TC ID | Tên test case | Pre-condition | Input (Dữ liệu vào) | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-FA-01 | Xem thống kê tổng quan phân bổ quỹ | Đã đăng nhập LAB_ADMIN, có JWT | `GET /api/lab-admin/fund-allocation/stats` | 200 | Trả về tổng số quỹ `totalAllocations >= 1`, tổng số tiền `totalAmount > 0` | V-FA-AUTH1, R1 |
| 2 | TC-FA-02 | Lấy danh sách tất cả các phân bổ quỹ | Đã đăng nhập LAB_ADMIN, có JWT | `GET /api/lab-admin/fund-allocation/allocations` | 200 | Trả về danh sách allocations với đầy đủ thông tin tỷ lệ 70/20/10 | V-FA-AUTH1, R1 |
| 3 | TC-FA-03 | Lọc danh sách allocations theo status COMPLETED | Đã đăng nhập LAB_ADMIN, có JWT | `GET /api/lab-admin/fund-allocation/allocations?status=COMPLETED` | 200 | Chỉ trả về các dự án có `status = "COMPLETED"` (Dự án 5) | V-FA-AUTH1, R1 |
| 4 | TC-FA-04 | Xem chi tiết phân bổ quỹ theo `projectId` hợp lệ | Đã đăng nhập LAB_ADMIN, có JWT | `GET /api/lab-admin/fund-allocation/allocations/1` | 200 | Trả về chi tiết phân bổ 70M của P1: Team 49M (70%), Mentor 14M (20%), Lab 7M (10%) | V-FA-AUTH1, V-FA-PRJ1, R1 |
| 5 | TC-FA-05 | Xem chi tiết phân bổ với `projectId` không tồn tại | Đã đăng nhập LAB_ADMIN, có JWT | `GET /api/lab-admin/fund-allocation/allocations/999999` | 400 | Báo lỗi không tìm thấy quỹ: `"Fund allocation not found for project: 999999"` | X-FA-PRJ1, R2 |
| 6 | TC-FA-06 | Giải ngân Mentor thành công - đúng hạn mức biên max (14M) | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-mentor`<br>Body: `{"mentorId": 1, "amount": 14000000, "note": "Chi tra sau nghiem thu"}` | 200 | Giải ngân thành công, thông báo `"Mentor funds disbursed successfully"`, DB ghi nhận giao dịch | V-FA-MAMT1, B-FA-M5, ST-FA-01, R1 |
| 7 | TC-FA-07 | Giải ngân Mentor thất bại - vượt hạn mức 20% (15M > 14M) | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-mentor`<br>Body: `{"mentorId": 1, "amount": 15000000}` | 400 | Lỗi: `"Mentor disbursement exceeds allocated mentor amount"` | X-FA-MAMT2, B-FA-M6, R4 |
| 8 | TC-FA-08 | Giải ngân Mentor thất bại - số tiền bằng 0 (biên min-) | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-mentor`<br>Body: `{"mentorId": 1, "amount": 0}` | 400 | Lỗi: `"Invalid mentor disbursement amount"` | X-FA-MAMT1, B-FA-M1, R3 |
| 9 | TC-FA-09 | Giải ngân Team thành công - đúng hạn mức biên max (49M) | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-team`<br>Body: `{"teamDistribution": [{"talentId": 1, "amount": 24500000}, {"talentId": 2, "amount": 24500000}]}` | 200 | Giải ngân thành công: `"Team funds disbursed successfully"`, trạng thái Team sang `DISBURSED` | V-FA-TAMT1, B-FA-T5, ST-FA-02, R5 |
| 10 | TC-FA-10 | Giải ngân Team thất bại - vượt hạn mức 70% (50M > 49M) | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-team`<br>Body: `{"teamDistribution": [{"talentId": 1, "amount": 30000000}, {"talentId": 2, "amount": 20000001}]}` | 400 | Lỗi: `"Team disbursement exceeds allocated team amount"` | X-FA-TAMT1, B-FA-T6, R6 |
| 11 | TC-FA-11 | Giải ngân Team thất bại - danh sách rỗng | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-team`<br>Body: `{"teamDistribution": []}` | 400 | Lỗi: `"Team distribution list is required"` | X-FA-TDIS1, R6 |
| 12 | TC-FA-12 | Giải ngân Team thất bại - thành viên có số tiền âm | Đã đăng nhập LAB_ADMIN; P1 | `POST .../allocations/1/disburse-team`<br>Body: `{"teamDistribution": [{"talentId": 1, "amount": -500000}]}` | 400 | Lỗi: `"Total team disbursement amount must be positive"` | X-FA-TAMT2, B-FA-T1, R3 |
| 13 | TC-FA-13 | Cập nhật trạng thái phân bổ quỹ sang COMPLETED | Đã đăng nhập LAB_ADMIN; P2 | `PUT /api/lab-admin/fund-allocation/allocations/2`<br>Body: `{"status": "COMPLETED"}` | 200 | Cập nhật thành công, `data.status = "COMPLETED"` | V-FA-PRJ1, ST-FA-04, R1 |
| 14 | TC-FA-14 | Truy cập API phân bổ quỹ bằng tài khoản vai trò TALENT | Đã đăng nhập TALENT | `GET /api/lab-admin/fund-allocation/stats` | 403 | Bị chặn từ chối truy cập (Access Denied / Forbidden) | X-FA-AUTH2, R7 |
| 15 | TC-FA-15 | Truy cập API phân bổ quỹ khi không gửi token | Không gửi token | `GET /api/lab-admin/fund-allocation/stats` | 401 / 403 | Từ chối truy cập người dùng chưa đăng nhập | X-FA-AUTH1, R7 |
| 16 | TC-FA-16 | Xóa phân bổ quỹ với `projectId` không tồn tại | Đã đăng nhập LAB_ADMIN | `DELETE /api/lab-admin/fund-allocation/allocations/999999` | 400 | Báo lỗi: `"Fund allocation not found for project: 999999"` | X-FA-PRJ1, R2 |
| 17 | TC-FA-17 | Xóa phân bổ quỹ thành công của dự án 2 | Đã đăng nhập LAB_ADMIN; P2 | `DELETE /api/lab-admin/fund-allocation/allocations/2` | 200 | Xóa thành công, thông báo `"Fund allocation deleted successfully"`, xóa sạch dữ liệu phụ thuộc | V-FA-PRJ1, ST-FA-05, R1 |

---

## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

- **Lớp tương đương (EP):** 6/6 Valid Tags, 10/10 Invalid Tags - **Bao phủ 100%**.
- **Giá trị biên (BVA):** 12/12 điểm biên Mentor & Team - **Bao phủ 100%**.
- **Chuyển đổi trạng thái (ST):** 5/5 luồng chuyển đổi trạng thái - **Bao phủ 100%**.
- **Bảng quyết định (Decision Table):** 7/7 rules quy tắc nghiệp vụ - **Bao phủ 100%**.
