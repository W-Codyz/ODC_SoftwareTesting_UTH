# Test Execution Report: FR-LAB-001 - Xác thực Doanh nghiệp (Enterprise Validation)

**Module:** Lab Administrator  
**Chức năng:** Validate Enterprise (`GET /api/lab-admin/enterprises/pending`, `GET /api/lab-admin/enterprises/{id}`, `POST /api/lab-admin/enterprises/{id}/verify`, `DELETE /api/lab-admin/enterprises/{id}?reason={reason}`)  
**Giao diện:** Quản lý → Doanh nghiệp (`/admin/enterprises-crud`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày thực hiện:** 08/11/2026  
**Ngày cập nhật:** 17/11/2026 
**Môi trường test:** Postman, Frontend Localhost (:3000), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Script automation:** `e2e-tests/lab-admin/enterprise_validation_test.js`  
**Tham chiếu test case:** `test-cases/lab-admin/TC_LabAdmin_Validate_and_Manage_Projects.md`

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 17 |
| Passed | 17 |
| Failed | 0 |
| **Pass rate** | **17/17 = 100%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (Reason / Action) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-LAB-01 | Xem danh sách doanh nghiệp PENDING | UI: lọc "Chờ xác minh"; API: `GET /api/lab-admin/enterprises/pending` | `200` - Chỉ trả về doanh nghiệp `PENDING` | `HTTP 200` - chỉ trả về enterprise `PENDING` | PASS | FR-LAB-001 - GET pending enterprises | |
| 2 | TC-LAB-02 | Xem chi tiết Doanh nghiệp | Enterprise `APPROVED` (seed); UI: lọc "Đã duyệt", mở "Chỉnh sửa"; API: `GET /api/lab-admin/enterprises/{id}` | `200` - Trả về thông tin enterprise | `HTTP 200` - trả về đúng thông tin enterprise | PASS | GET detail | |
| 3 | TC-LAB-03 | Verify doanh nghiệp đang PENDING | Enterprise `PENDING` (seed); bấm "Duyệt" trên UI | `200` - Enterprise `APPROVED` | `HTTP 200` - enterprise chuyển `APPROVED` | PASS | V-LAB-ACT1, ST-LAB-01 | |
| 4 | TC-LAB-04 | Reject doanh nghiệp với reason hợp lệ | Enterprise `PENDING` (seed); UI: lý do "Mã số thuế không hợp lệ" | `200` - Enterprise `REJECTED` | `HTTP 200` - enterprise chuyển `REJECTED` | PASS | V-LAB-RSN1, B-RSN4, V-LAB-ACT2, ST-LAB-02 | |
| 5 | TC-LAB-05 | Reject với reason rỗng | API: `reason=`; UI: để trống lý do rồi bấm OK | `400` - Không reject; UI báo lỗi bắt buộc, không gửi request | `HTTP 400` - "Reason is required and cannot be empty".| PASS | X-LAB-RSN1, B-RSN1 | |
| 6 | TC-LAB-06 | Reject với reason dài 501 ký tự | UI: lý do 501 ký tự | `400` - Lý do không vượt quá 500 ký tự | `HTTP 400` - Reason for not exceeding 500 characters | PASS | X-LAB-RSN2, B-RSN7 | |
| 7 | TC-LAB-07 | Verify lại doanh nghiệp đã APPROVED | Enterprise `APPROVED` (seed) | `409` - Trạng thái không đổi | `HTTP 409` - giữ nguyên `APPROVED` | PASS | ST-LAB-03 | |
| 8 | TC-LAB-08 | Reject với reason tại biên min (1 ký tự) | UI: lý do `A` | `200` - Enterprise `REJECTED` | `HTTP 200` - enterprise chuyển `REJECTED` | PASS | V-LAB-RSN1, B-RSN2, R1 | |
| 9 | TC-LAB-09 | Reject với reason ngay trên min (2 ký tự) | UI: lý do `AB` | `200` - Enterprise `REJECTED` | `HTTP 200` - enterprise chuyển `REJECTED` | PASS | V-LAB-RSN1, B-RSN3, R1 | |
| 10 | TC-LAB-10 | Reject với reason ngay dưới max (499 ký tự) | UI: lý do 499 ký tự | `200` - Enterprise `REJECTED` | `HTTP 200` - enterprise chuyển `REJECTED` | PASS | V-LAB-RSN1, B-RSN5, R1 | |
| 11 | TC-LAB-11 | Reject với reason tại biên max (500 ký tự) | UI: lý do 500 ký tự | `200` - Enterprise `REJECTED` | `HTTP 200` - enterprise chuyển `REJECTED` | PASS | V-LAB-RSN1, B-RSN6, R1 | |
| 12 | TC-LAB-12 | Reject với reason chỉ chứa khoảng trắng | UI: lý do `"   "` | `400` - Giữ nguyên `PENDING` | `HTTP 400` - "Reason is required and cannot be empty". | PASS | X-LAB-RSN3, R4 | |
| 13 | TC-LAB-13 | Verify doanh nghiệp đã bị REJECTED | Enterprise `REJECTED`; Postman: `POST /api/lab-admin/enterprises/{rejectedId}/verify` | `409` - Không verify, giữ nguyên `REJECTED` | `HTTP 409` - "Enterprise is not in PENDING status (current status: REJECTED)" | PASS | X-LAB-ID3, ST-LAB-04, R3 | |
| 14 | TC-LAB-14 | Reject doanh nghiệp đã APPROVED | Enterprise `APPROVED`; Postman: `DELETE /api/lab-admin/enterprises/{approvedId}?reason=Test reject` | `409` - Không reject, giữ nguyên `APPROVED` | `HTTP 409` - "Enterprise is not in PENDING status (current status: APPROVED)" | PASS | X-LAB-ID3, ST-LAB-05, R3 | |
| 15 | TC-LAB-15 | Verify doanh nghiệp không tồn tại | Postman: `POST /api/lab-admin/enterprises/99999/verify` | `404` - Báo lỗi không tìm thấy enterprise | `HTTP 404` - "Enterprise not found with id: 99999" | PASS | X-LAB-ID1, R2 | |
| 16 | TC-LAB-16 | Tài khoản không phải admin gọi API verify | Enterprise `PENDING`; Postman: `POST /verify` với token `ENTERPRISE` | `401` (Unauthorized - Chưa xác thực) | `HTTP 401` - Invalid or expired token | PASS | R5 | |
| 17 | TC-LAB-17 | Gọi API verify không có token | Enterprise `PENDING`; Postman: `POST /verify` không có header `Authorization` | `401` - Từ chối truy cập, giữ nguyên `PENDING` | `HTTP 401` - "Invalid or expired token" | PASS | R6 | |

---


## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|---|
| V-LAB-ACT1 | Action = APPROVED | TC-LAB-03 | PASS |
| V-LAB-ACT2 | Action = REJECTED | TC-LAB-04 | PASS |
| V-LAB-RSN1 | Lý do từ chối hợp lệ (1-500 ký tự) | TC-LAB-04, 08, 09, 10, 11 | PASS |
| X-LAB-RSN1 | Lý do từ chối rỗng | TC-LAB-05 | PASS |
| X-LAB-RSN2 | Lý do từ chối > 500 ký tự | TC-LAB-06 | PASS |
| X-LAB-RSN3 | Lý do từ chối chỉ chứa khoảng trắng | TC-LAB-12 | PASS |
| V-LAB-ID1 | Enterprise tồn tại và `PENDING` | TC-LAB-03, 04 | PASS |
| X-LAB-ID1 | Enterprise không tồn tại | TC-LAB-15 | PASS |
| X-LAB-ID3 | Enterprise không ở `PENDING` | TC-LAB-07, 13, 14 | PASS - `409` |


### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|---|
| B-RSN1 | min- = 0 ký tự | TC-LAB-05 | PASS - `400` |
| B-RSN2 | min = 1 ký tự | TC-LAB-08 | PASS - `200` |
| B-RSN3 | min+ = 2 ký tự | TC-LAB-09 | PASS - `200` |
| B-RSN4 | nominal | TC-LAB-04 | PASS - `200` |
| B-RSN5 | max- = 499 ký tự | TC-LAB-10 | PASS - `200` |
| B-RSN6 | max = 500 ký tự | TC-LAB-11 | PASS - `200` |
| B-RSN7 | max+ = 501 ký tự | TC-LAB-06 | PASS - `400` |

### 3.3 Chuyển đổi trạng thái (ST) & Bảng quyết định (Decision Table)

**State Transitions:**

| ST | Test Case | Kết quả |
|---|---|:---:|
| ST-LAB-01 | TC-LAB-03 | PASS |
| ST-LAB-02 | TC-LAB-04 | PASS |
| ST-LAB-03 | TC-LAB-07 | PASS - `409` |
| ST-LAB-04 | TC-LAB-13 | PASS - `409` |
| ST-LAB-05 | TC-LAB-14 | PASS - `409` |

**Decision Table Rules:**

| Rule | Test Case | Kết quả |
|---|---|:---:|
| R1 (Xử lý hợp lệ - 200) | TC-LAB-03, 04, TC-LAB-08 → 11 | PASS |
| R2 (Enterprise không tồn tại - 404) | TC-LAB-15 | PASS - `404` |
| R3 (Enterprise không ở PENDING - 409) | TC-LAB-07, 13, 14 | PASS - `409` |
| R4 (Request không hợp lệ - 400) | TC-LAB-05, 06, 12 | PASS - `400` |
| R5 (Không có quyền admin - 401) | TC-LAB-16 | PASS - `401` |
| R6 (Chưa xác thực - 401) | TC-LAB-17 | PASS - `401` |

---

