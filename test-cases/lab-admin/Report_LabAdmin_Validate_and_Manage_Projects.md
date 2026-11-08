# Test Execution Report: FR-LAB-001 - Xác thực Doanh nghiệp (Enterprise Validation)

**Module:** Lab Administrator  
**Chức năng:** Validate Enterprise (`GET /api/lab-admin/enterprises/pending`, `POST /api/lab-admin/enterprises/{id}/approve`, `POST /api/lab-admin/enterprises/{id}/reject`, `POST /api/lab-admin/enterprises/{id}/request-info`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày thực hiện:** 08/11/2026  
**Môi trường test:** Postman (Windows), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Tham chiếu test case:** `test-cases/labadmin/FR-LAB-001_TestCases.md`  
**Mã Task Jira:** `LABODC-46`

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 14 |
| Passed | 0 |
| Failed | 14 |
| Blocked / Skipped | 0 |
| **Pass rate** | **0/14 = 0%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (TaxCode / Reason / Action) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-LAB-01 | Xem danh sách Doanh nghiệp chờ xác thực | Bearer Token của `LAB_ADMIN` | 200 - Trả về danh sách Doanh nghiệp PENDING | 403 Forbidden - Response Body: {"success": false, "message": "Access Denied", "data": null}. | FAIL | V-LAB-ENTERPRISE, ST-LAB-01, R1 | |
| 2 | TC-LAB-02 | Phê duyệt Doanh nghiệp với MST 10 số | `taxCode: "0123456789"`, `action: "APPROVED"` | 200 - Phê duyệt thành công | HTTP 500/404 No static resource | FAIL | V-LAB-TAX1, V-LAB-ACT1, B-TAX2, R1, ST-LAB-01 | |
| 3 | TC-LAB-03 | Phê duyệt Doanh nghiệp với MST 13 số | `taxCode: "0123456789012"`, `action: "APPROVED"` | 200 - Phê duyệt thành công |  HTTP 500/404 No static resource | FAIL | V-LAB-TAX2, V-LAB-ACT1, B-TAX5, R1 | |
| 4 | TC-LAB-04 | Từ chối Doanh nghiệp có lý do hợp lệ | `reason: "Mã số thuế không tồn tại"` | 200 - Từ chối thành công | HTTP 500/404 No static resource | FAIL | V-LAB-ACT2, V-LAB-RSN1, B-RSN4, R1, ST-LAB-02 | |
| 5 | TC-LAB-05 | Từ chối Doanh nghiệp với lý do 1 ký tự | `reason: "K"` | 200 - Từ chối thành công | HTTP 500/404 No static resource | FAIL | B-RSN2, V-LAB-ACT2, R1 | |
| 6 | TC-LAB-06 | Từ chối Doanh nghiệp với lý do 500 ký tự | `reason: "[500 ký tự A]"` | 200 - Từ chối thành công | HTTP 500/404 No static resource | FAIL | B-RSN6, V-LAB-ACT2, R1 | |
| 7 | TC-LAB-07 | Yêu cầu bổ sung thông tin Doanh nghiệp | `note: "Yêu cầu bổ sung GPKD sao y"` | 200 - Gửi yêu cầu bổ sung thành công | HTTP 500/404 No static resource | FAIL | V-LAB-ACT3, R1, ST-LAB-03 | |
| 8 | TC-LAB-08 | MST ít hơn 10 chữ số (9 số) | `taxCode: "012345678"` | 400 - Lỗi validation MST | HTTP 500/404 No static resource | FAIL | X-LAB-TAX1, B-TAX1, R2 | |
| 9 | TC-LAB-09 | MST nhiều hơn 13 chữ số (14 số) | `taxCode: "01234567890123"` | 400 - Lỗi validation MST | HTTP 500/404 No static resource | FAIL | X-LAB-TAX2, B-TAX6, R2 | |
| 10 | TC-LAB-10 | MST chứa ký tự chữ | `taxCode: "012345678a"` | 400 - Lỗi validation MST | HTTP 500/404 No static resource | FAIL | X-LAB-TAX3, R2 | |
| 11 | TC-LAB-11 | Từ chối Doanh nghiệp nhưng để trống lý do | `reason: ""` | 400 - Lỗi lý do trống | HTTP 500/404 No static resource | FAIL | X-LAB-RSN1, B-RSN1, R4 | |
| 12 | TC-LAB-12 | Lý do từ chối quá dài (501 ký tự) | `reason: "[501 ký tự A]"` | 400 - Lỗi độ dài lý do | HTTP 500/404 No static resource | FAIL | X-LAB-RSN2, B-RSN7, R4 | |
| 13 | TC-LAB-13 | Phê duyệt lại Doanh nghiệp đã được Approve | ID 123 đang ở trạng thái `APPROVED` | 400 - Doanh nghiệp đã duyệt | HTTP 500/404 No static resource | FAIL | ST-LAB-04, R1 | |
| 14 | TC-LAB-14 | Sinh viên gọi API xác thực Doanh nghiệp | Token của vai trò `TALENT` | 403 - Forbidden | HTTP 500/404 No static resource | FAIL | R5 | |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|---|
| V-LAB-TAX1 | MST hợp lệ 10 số | TC-LAB-02 | FAIL |
| V-LAB-TAX2 | MST hợp lệ 13 số | TC-LAB-03 | FAIL |
| V-LAB-ACT1 | Action = APPROVED | TC-LAB-02, TC-LAB-03 | FAIL |
| V-LAB-ACT2 | Action = REJECTED | TC-LAB-04, TC-LAB-05, TC-LAB-06 | FAIL |
| V-LAB-ACT3 | Action = INFO_REQUESTED | TC-LAB-07 | FAIL |
| V-LAB-RSN1 | Lý do từ chối hợp lệ (1-500 ký tự) | TC-LAB-04, TC-LAB-05, TC-LAB-06 | FAIL |
| X-LAB-TAX1 | MST < 10 chữ số | TC-LAB-08 | FAIL |
| X-LAB-TAX2 | MST > 13 chữ số | TC-LAB-09 | FAIL |
| X-LAB-TAX3 | MST chứa ký tự chữ | TC-LAB-10 | FAIL |
| X-LAB-RSN1 | Lý do từ chối rỗng | TC-LAB-11 | FAIL |
| X-LAB-RSN2 | Lý do từ chối > 500 ký tự | TC-LAB-12 | FAIL |

### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|---|
| B-TAX1 | min- = 9 chữ số | TC-LAB-08 | FAIL |
| B-TAX2 | min = 10 chữ số | TC-LAB-02 | FAIL |
| B-TAX5 | max = 13 chữ số | TC-LAB-03 | FAIL |
| B-TAX6 | max+ = 14 chữ số | TC-LAB-09 | FAIL |
| B-RSN1 | min- = 0 ký tự (rỗng) | TC-LAB-11 | FAIL |
| B-RSN2 | min = 1 ký tự | TC-LAB-05 | FAIL |
| B-RSN4 | nominal = 250 ký tự | TC-LAB-04 | FAIL |
| B-RSN6 | max = 500 ký tự | TC-LAB-06 | FAIL |
| B-RSN7 | max+ = 501 ký tự | TC-LAB-12 | FAIL |

### 3.3 Chuyển đổi trạng thái (ST) & Bảng quyết định (Decision Table)

**State Transitions (ST-LAB-01 đến ST-LAB-05):**

| ST | Test Case | Kết quả |
|---|---|:---:|
| ST-LAB-01 | TC-LAB-01, TC-LAB-02 | FAIL |
| ST-LAB-02 | TC-LAB-04 | FAIL |
| ST-LAB-03 | TC-LAB-07 | FAIL |
| ST-LAB-04 | TC-LAB-13 | FAIL |
| ST-LAB-05 | Chưa có test case | Chưa kiểm thử |

**Decision Table Rules:**

| Rule | Test Case | Kết quả |
|---|---|:---:|
| R1 (Phê duyệt hợp lệ) | TC-LAB-01 đến TC-LAB-07, TC-LAB-13 | FAIL |
| R2 (Lỗi Mã số thuế) | TC-LAB-08 đến TC-LAB-10 | FAIL |
| R3 | Chưa có test case | Chưa kiểm thử |
| R4 (Lỗi Lý do từ chối) | TC-LAB-11, TC-LAB-12 | FAIL |
| R5 (Lỗi Phân quyền) | TC-LAB-14 | FAIL |

---
