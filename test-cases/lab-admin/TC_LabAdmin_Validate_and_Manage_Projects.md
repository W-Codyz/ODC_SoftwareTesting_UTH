# Test Cases: FR-LAB-001 - Xác thực Doanh nghiệp (Enterprise Validation)

**Module:** Lab Administrator  
**Chức năng:** Validate Enterprise (`GET /api/lab-admin/enterprises/pending`, `GET /api/lab-admin/enterprises/{id}`, `POST /api/lab-admin/enterprises/{id}/verify`, `DELETE /api/lab-admin/enterprises/{id}?reason={reason}`)    
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày tạo:** 08/11/2026  
**Ngày cập nhật:** 17/11/2026
 
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-LAB-001  
**Source code tham chiếu:** `labodc-backend/src/main/java/com/uth/labodc/controller/EnterpriseAdminController.java`, `labodc-backend/src/main/java/com/uth/labodc/service/EnterpriseService.java`

---

## Mô tả chức năng

Lab Admin tiến hành xác thực doanh nghiệp đăng ký mới trước khi kích hoạt tài khoản sử dụng hệ thống. Quản trị viên xem hồ sơ, sau đó xác minh hoặc từ chối doanh nghiệp. Việc kiểm tra và xác thực mã số thuế thuộc luồng đăng ký/profile enterprise, không nhập lại trong API Lab Admin.

**Điều kiện hợp lệ:** Yêu cầu xác thực doanh nghiệp thành công khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `enterpriseId` | ID doanh nghiệp cần xác thực | Long | Phải tồn tại trong DB, trạng thái tài khoản đang là `PENDING` |
| `taxCode` | Mã số thuế doanh nghiệp | String | Dữ liệu đã được kiểm tra ở luồng đăng ký/profile; Lab Admin không gửi lại trường này khi verify/reject |
| `action` | Hành động xác thực | Enum | `APPROVED` hoặc `REJECTED` |
| `reason` | Lý do từ chối | String | Bắt buộc khi reject, độ dài từ 1 đến 500 ký tự |
| `details` | Chi tiết lý do từ chối | String | Optional khi reject; nếu có phải là nội dung mô tả chi tiết |
| `note` | Ghi chú xử lý | String | Optional khi verify; tối đa 500 ký tự |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Tax Code (Mã số thuế)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Chuỗi đúng 10 chữ số | V-LAB-TAX1 | `"0123456789"` |
| Hợp lệ (b) | Chuỗi đúng 13 chữ số | V-LAB-TAX2 | `"0123456789012"` |
| Không hợp lệ (a) | Ít hơn 10 chữ số | X-LAB-TAX1 | `"012345678"` |
| Không hợp lệ (b) | Nhiều hơn 13 chữ số | X-LAB-TAX2 | `"01234567890123"` |
| Không hợp lệ (c) | Chứa ký tự không phải chữ số | X-LAB-TAX3 | `"012345678a"` |
| Không hợp lệ (d) | Trùng mã số thuế enterprise khác | X-LAB-TAX4 | `"0123456789"` đã tồn tại |

### 1.2 Validation Action (Hành động xác thực)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Phê duyệt doanh nghiệp | V-LAB-ACT1 | `APPROVED` |
| Hợp lệ (b) | Từ chối doanh nghiệp | V-LAB-ACT2 | `REJECTED` |

### 1.3 Reason for Rejection (Lý do từ chối)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi từ 1 đến 500 ký tự | V-LAB-RSN1 | `"Mã số thuế không hợp lệ"` |
| Không hợp lệ (a) | Để trống / rỗng | X-LAB-RSN1 | `""` |
| Không hợp lệ (b) | Vượt quá 500 ký tự | X-LAB-RSN2 | Chuỗi 501 ký tự |
| Không hợp lệ (c) | Chỉ chứa khoảng trắng | X-LAB-RSN3 | `"   "` |
| Không hợp lệ (d) | Không truyền tham số `reason` | X-LAB-RSN4 | `DELETE /api/lab-admin/enterprises/{id}` (không có query) |

### 1.4 Enterprise ID (Mã doanh nghiệp)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Tồn tại trong DB và đang `PENDING` | V-LAB-ID1 | ID enterprise `PENDING` thực tế |
| Không hợp lệ (a) | Không tồn tại trong DB | X-LAB-ID1 | `99999` |
| Không hợp lệ (b) | Sai kiểu dữ liệu (không phải số) | X-LAB-ID2 | `abc` |
| Không hợp lệ (c) | Tồn tại nhưng không ở `PENDING` (`APPROVED`/`REJECTED`) | X-LAB-ID3 | ID `7` (`APPROVED`) |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-LAB-TAX1, V-LAB-TAX2, V-LAB-ACT1, V-LAB-ACT2, V-LAB-RSN1, V-LAB-ID1 | 6 |
| Không hợp lệ | X-LAB-TAX1, X-LAB-TAX2, X-LAB-TAX3, X-LAB-TAX4, X-LAB-RSN1, X-LAB-RSN2, X-LAB-RSN3, X-LAB-RSN4, X-LAB-ID1, X-LAB-ID2, X-LAB-ID3 | 11 |
| **Tổng** | | **17 tag** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

### 2.1 Biên cho Độ dài Mã số thuế (Tax Code Length)


| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Ngay dưới min (không hợp lệ) | 9 | 9 chữ số | B-TAX1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 10 | 10 chữ số | B-TAX2 |
| `min+` | Ngay trên min | 11 | 11 chữ số | B-TAX3 |
| `nominal` | Giá trị giữa miền | 12 | 12 chữ số | B-TAX4 |
| `max` | Giá trị lớn nhất hợp lệ | 13 | 13 chữ số | B-TAX5 |
| `max+` | Ngay trên max (không hợp lệ) | 14 | 14 chữ số | B-TAX6 |

### 2.2 Biên cho Độ dài Lý do từ chối (Reason Length)

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Rỗng (không hợp lệ) | 0 | Chuỗi rỗng | B-RSN1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 1 | 1 ký tự | B-RSN2 |
| `min+` | Ngay trên min | 2 | 2 ký tự | B-RSN3 |
| `nominal` | Giá trị giữa miền | 250 | Chuỗi 250 ký tự | B-RSN4 |
| `max-` | Ngay dưới max | 499 | Chuỗi 499 ký tự | B-RSN5 |
| `max` | Giá trị lớn nhất hợp lệ | 500 | Chuỗi 500 ký tự | B-RSN6 |
| `max+` | Ngay trên max (không hợp lệ) | 501 | Chuỗi 501 ký tự | B-RSN7 |

### 2.3 Biên cho Độ dài Ghi chú (Note Length)


| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `optional` | Không nhập khi approve | N/A | Giá trị được phép bỏ qua | B-NOTE1 |
| `max-` | Ngay dưới max | 499 | Chuỗi 499 ký tự | B-NOTE2 |
| `max` | Giá trị lớn nhất hợp lệ | 500 | Chuỗi 500 ký tự | B-NOTE3 |
| `max+` | Vượt quá max (không hợp lệ) | 501 | Chuỗi 501 ký tự | B-NOTE4 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Sơ đồ trạng thái Enterprise Account

**Trạng thái:**
- **PENDING** - Doanh nghiệp đăng ký thành công, chờ Lab Admin xác thực
- **APPROVED** - Đã được phê duyệt, tài khoản chuyển `ACTIVE`
- **REJECTED** - Đã bị từ chối xác thực

### 3.2 Bảng chuyển đổi trạng thái

| Test Case | Start State | Event/Input | Expected End State | Expected Output |
|---|---|---|---|---|
| ST-LAB-01 | PENDING | Lab Admin thực hiện Verify | APPROVED | Response confirmation theo SRS; cập nhật trạng thái xác minh |
| ST-LAB-02 | PENDING | Lab Admin thực hiện Reject với reason | REJECTED | Response confirmation theo SRS; lưu lý do từ chối |
| ST-LAB-03 | APPROVED | Lab Admin thực hiện Verify lần nữa | APPROVED | Không thực hiện verify lần hai; trả lỗi `409 Conflict` |
| ST-LAB-04 | REJECTED | Lab Admin thực hiện Verify doanh nghiệp đã từ chối | REJECTED | Không thực hiện verify; trả lỗi `409 Conflict` vì enterprise không ở trạng thái `PENDING` |
| ST-LAB-05 | APPROVED | Lab Admin thực hiện Reject doanh nghiệp đã phê duyệt | APPROVED | Không thực hiện reject; trả lỗi `409 Conflict` vì enterprise không ở trạng thái `PENDING` |

---

## 4. Bảng quyết định (Decision Table)

### 4.1 Điều kiện và hành động

**Conditions:**
- C1: Enterprise có tồn tại không?
- C2: Enterprise có ở trạng thái `PENDING` không?
- C3: Dữ liệu request có hợp lệ không?
- C4: Người thực hiện có quyền `LAB_ADMIN` hoặc `SYSTEM_ADMIN` không?
- C5: Request có JWT token hợp lệ không?

**Actions:**
- A1: `200 OK` - Xử lý thành công và cập nhật status tương ứng theo SRS
- A2: `404 Not Found` - Không xử lý enterprise không tồn tại
- A3: `409 Conflict` - Không xử lý enterprise không ở trạng thái PENDING
- A4: `401 Unauthorized` - Token hợp lệ nhưng không có quyền `LAB_ADMIN`/`SYSTEM_ADMIN`, từ chối thao tác
- A5: `400 Bad Request` - Dữ liệu request không hợp lệ, không cập nhật trạng thái
- A6: `401 Unauthorized` - Chưa xác thực hoặc token không hợp lệ

### 4.2 Bảng quyết định

| | R1 | R2 | R3 | R4 | R5 | R6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **C5:** Có JWT hợp lệ | Y | Y | Y | Y | Y | N |
| **C4:** Có quyền LAB_ADMIN/SYSTEM_ADMIN | Y | Y | Y | Y | N | - |
| **C3:** Dữ liệu request hợp lệ | Y | Y | Y | N | - | - |
| **C1:** Enterprise tồn tại | Y | N | Y | - | - | - |
| **C2:** Status là PENDING | Y | - | N | - | - | - |
| | | | | | | |
| **A1:** 200 - Xử lý thành công | X | - | - | - | - | - |
| **A2:** 404 - Enterprise không tồn tại | - | X | - | - | - | - |
| **A3:** 409 - Enterprise không ở PENDING | - | - | X | - | - | - |
| **A4:** 401 - Không có quyền admin | - | - | - | - | X | - |
| **A5:** 400 Bad Request | - | - | - | X | - | - |
| **A6:** 401 Unauthorized | - | - | - | - | - | X |


---

## 5. Bảng Test Cases (Test Specification Table)

### Preconditions (áp dụng chung)

- Người dùng đã đăng nhập với vai trò `LAB_ADMIN` và có JWT Token hợp lệ.
- Với test verify/reject thành công, phải sử dụng enterprise ID thực tế ở trạng thái `PENDING`.

### Bảng kịch bản test (Cấu trúc 8 cột chuẩn)

| STT | TC ID | Tên test case | Pre-condition | Input (Dữ liệu vào) | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-LAB-01 | Xem danh sách doanh nghiệp PENDING | Đã đăng nhập vai trò `LAB_ADMIN`; có enterprise `PENDING`, `APPROVED`, `REJECTED` | UI: lọc "Chờ xác minh"; API: `GET /api/lab-admin/enterprises/pending` với Header Token | `200` | Chỉ hiển thị / trả về doanh nghiệp có `status = PENDING` | FR-LAB-001 - GET pending enterprises |
| 2 | TC-LAB-02 | Xem chi tiết Doanh nghiệp | Có enterprise `APPROVED` | UI: lọc "Đã duyệt", mở "Chỉnh sửa" xem thông tin; API: `GET /api/lab-admin/enterprises/{id}` | `200` | Hiển thị / trả về đúng tên, MST, trạng thái enterprise | FR-LAB-001 - GET detail |
| 3 | TC-LAB-03 | Verify doanh nghiệp đang PENDING | Có enterprise ID thực tế ở trạng thái `PENDING`; thông tin MST đã được kiểm tra trước đó | `POST /api/lab-admin/enterprises/{pendingId}/verify` không có body | `200` | Trả response xác nhận theo SRS và enterprise chuyển `APPROVED` | V-LAB-ACT1, ST-LAB-01 |
| 4 | TC-LAB-04 | Reject doanh nghiệp với reason hợp lệ | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason=Mã số thuế không hợp lệ` | `200` | Enterprise chuyển `REJECTED` | V-LAB-RSN1, B-RSN4, V-LAB-ACT2, ST-LAB-02 |
| 5 | TC-LAB-05 | Reject với reason rỗng | Có enterprise ID thực tế ở trạng thái `PENDING` | API: `DELETE /api/lab-admin/enterprises/{pendingId}?reason=`; UI: để trống "Lý do từ chối" rồi bấm OK | `400 Bad Request` | Không chuyển trạng thái; API báo lỗi reason bắt buộc; UI báo lỗi bắt buộc và không gửi request | X-LAB-RSN1, B-RSN1 |
| 6 | TC-LAB-06 | Reject với reason dài 501 ký tự | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason={501_chars}` | `400 Bad Request` | Không chuyển trạng thái; báo lỗi reason vượt quá 500 ký tự | X-LAB-RSN2, B-RSN7 |
| 7 | TC-LAB-07 | Verify lại doanh nghiệp đã APPROVED | Doanh nghiệp ID 7 đang `APPROVED` | `POST /api/lab-admin/enterprises/7/verify` không có body | `409 Conflict` | Không verify lần hai; trạng thái không thay đổi | ST-LAB-03 |
| 8 | TC-LAB-08 | Reject với reason tại biên min (1 ký tự) | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason=A` | `200` | Enterprise chuyển `REJECTED`, lưu reason `"A"` | V-LAB-RSN1, B-RSN2, R1 |
| 9 | TC-LAB-09 | Reject với reason ngay trên min (2 ký tự) | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason=AB` | `200` | Enterprise chuyển `REJECTED` | V-LAB-RSN1, B-RSN3, R1 |
| 10 | TC-LAB-10 | Reject với reason ngay dưới max (499 ký tự) | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason={499_chars}` | `200` | Enterprise chuyển `REJECTED`, reason được lưu đầy đủ 499 ký tự | V-LAB-RSN1, B-RSN5, R1 |
| 11 | TC-LAB-11 | Reject với reason tại biên max (500 ký tự) | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason={500_chars}` | `200` | Enterprise chuyển `REJECTED`, reason được lưu đầy đủ 500 ký tự | V-LAB-RSN1, B-RSN6, R1 |
| 12 | TC-LAB-12 | Reject với reason chỉ chứa khoảng trắng | Có enterprise ID thực tế ở trạng thái `PENDING` | `DELETE /api/lab-admin/enterprises/{pendingId}?reason=%20%20%20` | `400 Bad Request` | Không chuyển trạng thái; báo lỗi reason bắt buộc | X-LAB-RSN3, R4 |
| 13 | TC-LAB-13 | Verify doanh nghiệp đã bị REJECTED | Có enterprise ID thực tế ở trạng thái `REJECTED` | `POST /api/lab-admin/enterprises/{rejectedId}/verify` không có body | `409 Conflict` | Không verify; trạng thái giữ nguyên `REJECTED`; báo lỗi enterprise không ở trạng thái `PENDING` | X-LAB-ID3, ST-LAB-04, R3 |
| 14 | TC-LAB-14 | Reject doanh nghiệp đã APPROVED | Có enterprise ID thực tế ở trạng thái `APPROVED` | `DELETE /api/lab-admin/enterprises/{approvedId}?reason=Test reject` | `409 Conflict` | Không reject; trạng thái giữ nguyên `APPROVED`; báo lỗi enterprise không ở trạng thái `PENDING` | X-LAB-ID3, ST-LAB-05, R3 |
| 15 | TC-LAB-15 | Verify doanh nghiệp không tồn tại | Enterprise ID `99999` không tồn tại trong DB | `POST /api/lab-admin/enterprises/99999/verify` không có body | `404 Not Found` | Báo lỗi không tìm thấy enterprise; không có dữ liệu nào thay đổi | X-LAB-ID1, R2 |
| 16 | TC-LAB-16 | Tài khoản không phải admin gọi API verify | Đăng nhập bằng tài khoản role `ENTERPRISE` (user `ACTIVE`); có enterprise ID thực tế ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/{pendingId}/verify` với token `ENTERPRISE` | `401 Unauthorized` | Từ chối thao tác; enterprise giữ nguyên `PENDING` | R5 |
| 17 | TC-LAB-17 | Gọi API verify không có token | Có enterprise ID thực tế ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/{pendingId}/verify` không gửi header `Authorization` | `401 Unauthorized` | Từ chối truy cập; enterprise giữ nguyên `PENDING` | R6 |



## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

- **Lớp tương đương (EP):** Bao phủ V-LAB-ACT1, V-LAB-ACT2, V-LAB-RSN1, V-LAB-ID1, X-LAB-RSN1 → X-LAB-RSN3, X-LAB-ID1 (TC-LAB-15), X-LAB-ID3 (TC-LAB-07, 13, 14). X-LAB-RSN4, X-LAB-ID2 kiểm thử bằng Postman. Các lớp MST (V/X-LAB-TAX*) thuộc phạm vi Enterprise Registration/Profile, không thuộc bộ test Lab Admin này.
- **Giá trị biên (BVA):** Bao phủ đủ 7 điểm biên của `reason` (B-RSN1 → B-RSN7: TC-LAB-05, 08, 09, 04, 10, 11, 06). Biên `taxCode` thuộc luồng đăng ký/profile. Biên `note` (B-NOTE*) không kiểm thử trong bộ test này.
- **Chuyển đổi trạng thái (ST):** Bao phủ `ST-LAB-01` → `ST-LAB-05` (TC-LAB-03, 04, 07, 13, 14).
- **Bảng quyết định (Decision Table):** Bao phủ R1 → R6 (R1: TC-LAB-03/04/08-11; R2: TC-LAB-15; R3: TC-LAB-07/13/14; R4: TC-LAB-05/06/12; R5: TC-LAB-16; R6: TC-LAB-17).