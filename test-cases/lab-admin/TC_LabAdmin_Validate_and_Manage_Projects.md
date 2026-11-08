# Test Cases: FR-LAB-001 - Xác thực Doanh nghiệp (Enterprise Validation)

**Module:** Lab Administrator  
**Chức năng:** Validate Enterprise (`GET /api/lab-admin/enterprises/pending`, `POST /api/lab-admin/enterprises/{id}/approve`, `POST /api/lab-admin/enterprises/{id}/reject`, `POST /api/lab-admin/enterprises/{id}/request-info`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày tạo:** 08/11/2026  
**Ngày cập nhật:** 08/11/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-LAB-001  
**Source code tham chiếu:** `labodc-backend/.../dto/labadmin/EnterpriseValidationRequest.java`, `labodc-backend/.../service/EnterpriseValidationService.java`

---

## Mô tả chức năng

Lab Admin tiến hành xác thực doanh nghiệp đăng ký mới trước khi kích hoạt tài khoản sử dụng hệ thống. Quản trị viên xem hồ sơ, kiểm tra mã số thuế (10-13 chữ số) và đưa ra quyết định: Phê duyệt (Approve), Từ chối (Reject) kèm lý do, hoặc Yêu cầu bổ sung thông tin (Request Info).

**Điều kiện hợp lệ:** Yêu cầu xác thực doanh nghiệp thành công khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `enterpriseId` | ID doanh nghiệp cần xác thực | Long | Phải tồn tại trong DB, trạng thái tài khoản đang là `PENDING` |
| `taxCode` | Mã số thuế doanh nghiệp | String | Không rỗng, 10 đến 13 chữ số, duy nhất trong hệ thống |
| `action` | Hành động xử lý | Enum | Phải thuộc một trong các giá trị: `APPROVED`, `REJECTED`, `INFO_REQUESTED` |
| `reason` | Lý do từ chối | String | Bắt buộc nhập khi `action = REJECTED`, độ dài từ 1 đến 500 ký tự |
| `note` | Ghi chú phê duyệt | String | Tùy chọn (Optional), độ dài tối đa 500 ký tự |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Tax Code (Mã số thuế)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Chuỗi đúng 10 chữ số | V-LAB-TAX1 | `"0123456789"` |
| Hợp lệ (b) | Chuỗi đúng 13 chữ số | V-LAB-TAX2 | `"0123456789012"` |
| Không hợp lệ (a) | Ít hơn 10 chữ số (9 chữ số) | X-LAB-TAX1 | `"012345678"` |
| Không hợp lệ (b) | Nhiều hơn 13 chữ số (14 chữ số) | X-LAB-TAX2 | `"01234567890123"` |
| Không hợp lệ (c) | Chứa ký tự chữ hoặc ký tự đặc biệt | X-LAB-TAX3 | `"012345678a"` |

### 1.2 Validation Action (Hành động xác thực)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (a) | Phê duyệt doanh nghiệp (`APPROVED`) | V-LAB-ACT1 | `"APPROVED"` |
| Hợp lệ (b) | Từ chối doanh nghiệp (`REJECTED`) | V-LAB-ACT2 | `"REJECTED"` |
| Hợp lệ (c) | Yêu cầu bổ sung thông tin (`INFO_REQUESTED`) | V-LAB-ACT3 | `"INFO_REQUESTED"` |
| Không hợp lệ (a) | Giá trị nằm ngoài danh mục hệ thống quy định | X-LAB-ACT1 | `"INVALID_ACTION"` |

### 1.3 Reason for Rejection (Lý do từ chối)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi từ 1 đến 500 ký tự khi `action = REJECTED` | V-LAB-RSN1 | `"Mã số thuế không tồn tại"` |
| Không hợp lệ (a) | Để trống / rỗng khi `action = REJECTED` | X-LAB-RSN1 | `""` |
| Không hợp lệ (b) | Vượt quá 500 ký tự | X-LAB-RSN2 | Chuỗi 501 ký tự |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-LAB-TAX1, V-LAB-TAX2, V-LAB-ACT1, V-LAB-ACT2, V-LAB-ACT3, V-LAB-RSN1 | 6 |
| Không hợp lệ | X-LAB-TAX1, X-LAB-TAX2, X-LAB-TAX3, X-LAB-ACT1, X-LAB-RSN1, X-LAB-RSN2 | 6 |
| **Tổng** | | **12 tag** |

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
| `min-` | Rỗng (không hợp lệ khi REJECTED) | 0 | Chuỗi rỗng | B-RSN1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 1 | `"A"` - 1 ký tự | B-RSN2 |
| `min+` | Ngay trên min | 2 | `"AB"` - 2 ký tự | B-RSN3 |
| `nominal` | Giá trị giữa miền | 250 | Chuỗi 250 ký tự | B-RSN4 |
| `max-` | Ngay dưới max | 499 | Chuỗi 499 ký tự | B-RSN5 |
| `max` | Giá trị lớn nhất hợp lệ | 500 | Chuỗi 500 ký tự | B-RSN6 |
| `max+` | Ngay trên max (không hợp lệ) | 501 | Chuỗi 501 ký tự | B-RSN7 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Sơ đồ trạng thái Enterprise Account

**Trạng thái:**
- **PENDING** - Doanh nghiệp đăng ký thành công, chờ Lab Admin xác thực
- **APPROVED** - Đã được phê duyệt, tài khoản chuyển `ACTIVE`
- **REJECTED** - Đã bị từ chối xác thực
- **INFO_REQUESTED** - Yêu cầu bổ sung thêm tài liệu kinh doanh

### 3.2 Bảng chuyển đổi trạng thái

| Test Case | Start State | Event/Input | Expected End State | Expected Output |
|---|---|---|---|---|
| ST-LAB-01 | PENDING | Lab Admin chọn Approve với MST hợp lệ | APPROVED | 200 - Phê duyệt thành công, gửi email thông báo |
| ST-LAB-02 | PENDING | Lab Admin chọn Reject kèm lý do cụ thể | REJECTED | 200 - Từ chối thành công, gửi email thông báo lý do |
| ST-LAB-03 | PENDING | Lab Admin gửi Yêu cầu bổ sung thông tin | INFO_REQUESTED | 200 - Gửi yêu cầu cập nhật hồ sơ tới doanh nghiệp |
| ST-LAB-04 | APPROVED | Lab Admin thực hiện Approve lần nữa | APPROVED | 400/409 - Doanh nghiệp đã được phê duyệt trước đó |
| ST-LAB-05 | REJECTED | Lab Admin thực hiện Approve tài khoản đã từ chối | APPROVED | 200/400 - Tùy business logic khôi phục tài khoản |

---

## 4. Bảng quyết định (Decision Table)

### 4.1 Điều kiện và hành động

**Conditions:**
- C1: Mã số thuế hợp lệ? (10-13 chữ số)
- C2: Action thuộc danh mục hợp lệ? (`APPROVED`, `REJECTED`, `INFO_REQUESTED`)
- C3: Có nhập lý do khi `action = REJECTED`? (1-500 ký tự)
- C4: Quyền người dùng là `LAB_ADMIN`?

**Actions:**
- A1: 200 OK - Xác thực thành công (cập nhật status tương ứng)
- A2: 400 Bad Request - Lỗi định dạng Mã số thuế
- A3: 400 Bad Request - Thiếu lý do từ chối
- A4: 403 Forbidden - Không có quyền thao tác

### 4.2 Bảng quyết định

| | R1 | R2 | R3 | R4 | R5 |
|---|:---:|:---:|:---:|:---:|:---:|
| **C1:** Mã số thuế hợp lệ | Y | N | Y | Y | Y |
| **C2:** Action hợp lệ | Y | - | N | Y | Y |
| **C3:** Nhập lý do (nếu REJECTED) | Y | - | - | N | Y |
| **C4:** Quyền LAB_ADMIN | Y | - | - | - | N |
| | | | | | |
| **A1:** 200 OK - Thành công | X | - | - | - | - |
| **A2:** 400 - Lỗi Mã số thuế | - | X | - | - | - |
| **A3:** 400 - Thiếu lý do / Action sai | - | - | X | X | - |
| **A4:** 403 - Forbidden | - | - | - | - | X |

---

## 5. Bảng Test Cases (Test Specification Table)

### Preconditions (áp dụng chung)

- Người dùng đã đăng nhập với vai trò `LAB_ADMIN` và có JWT Token hợp lệ.
- Doanh nghiệp test `ABC Technology` (ID: 123) đang ở trạng thái `PENDING` trong hệ thống.

### Bảng kịch bản test (Cấu trúc 8 cột chuẩn)

| STT | TC ID | Tên test case | Pre-condition | Input (Dữ liệu vào) | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-LAB-01 | Xem danh sách Doanh nghiệp chờ xác thực | Đã đăng nhập vai trò `LAB_ADMIN` | `GET /api/lab-admin/enterprises/pending` với Header Token | 200 | Trả về danh sách doanh nghiệp có trạng thái `PENDING` | V-LAB-ENTERPRISE, R1, ST-LAB-01 |
| 2 | TC-LAB-02 | Phê duyệt Doanh nghiệp với MST 10 số (Happy Path) | Doanh nghiệp ID 123 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/123/approve` Body: `{"note": "Hồ sơ hợp lệ", "taxCode": "0123456789"}` | 200 | Phê duyệt thành công, trạng thái đổi sang `APPROVED`, tài khoản user kích hoạt `ACTIVE` | V-LAB-TAX1, V-LAB-ACT1, B-TAX2, R1, ST-LAB-01 |
| 3 | TC-LAB-03 | Phê duyệt Doanh nghiệp với MST 13 số (Biên Max) | Doanh nghiệp ID 124 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/124/approve` Body: `{"note": "Đã đối soát MST 13 số", "taxCode": "0123456789012"}` | 200 | Phê duyệt thành công với MST 13 chữ số | V-LAB-TAX2, V-LAB-ACT1, B-TAX5, R1 |
| 4 | TC-LAB-04 | Từ chối Doanh nghiệp có nhập lý do hợp lệ | Doanh nghiệp ID 125 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/125/reject` Body: `{"reason": "Mã số thuế không tồn tại trên hệ thống Thuế Quốc gia"}` | 200 | Từ chối thành công, trạng thái chuyển `REJECTED`, tự động gửi email thông báo lý do | V-LAB-ACT2, V-LAB-RSN1, B-RSN4, R1, ST-LAB-02 |
| 5 | TC-LAB-05 | Từ chối Doanh nghiệp với lý do ngắn 1 ký tự (Biên Min) | Doanh nghiệp ID 126 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/126/reject` Body: `{"reason": "K"}` | 200 | Từ chối thành công với lý do độ dài 1 ký tự | B-RSN2, V-LAB-ACT2, R1 |
| 6 | TC-LAB-06 | Từ chối Doanh nghiệp với lý do 500 ký tự (Biên Max) | Doanh nghiệp ID 127 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/127/reject` Body: `{"reason": "[500 ký tự A]"}` | 200 | Từ chối thành công với lý do độ dài 500 ký tự | B-RSN6, V-LAB-ACT2, R1 |
| 7 | TC-LAB-07 | Yêu cầu bổ sung thông tin Doanh nghiệp | Doanh nghiệp ID 128 ở trạng thái `PENDING` | `POST /api/lab-admin/enterprises/128/request-info` Body: `{"note": "Vui lòng đính kèm Giấy phép đăng ký kinh doanh bản sao y công chứng"}` | 200 | Yêu cầu bổ sung thông tin gửi đi thành công, trạng thái chuyển `INFO_REQUESTED` | V-LAB-ACT3, R1, ST-LAB-03 |
| 8 | TC-LAB-08 | Mã số thuế ít hơn 10 chữ số (9 số - single fault) | Phê duyệt Doanh nghiệp | `POST /api/lab-admin/enterprises/123/approve` Body: `{"taxCode": "012345678"}` | 400 | Lỗi validation: Mã số thuế phải từ 10 đến 13 chữ số | X-LAB-TAX1, B-TAX1, R2 |
| 9 | TC-LAB-09 | Mã số thuế nhiều hơn 13 chữ số (14 số - single fault) | Phê duyệt Doanh nghiệp | `POST /api/lab-admin/enterprises/123/approve` Body: `{"taxCode": "01234567890123"}` | 400 | Lỗi validation: Mã số thuế không được vượt quá 13 chữ số | X-LAB-TAX2, B-TAX6, R2 |
| 10 | TC-LAB-10 | Mã số thuế chứa ký tự chữ (single fault) | Phê duyệt Doanh nghiệp | `POST /api/lab-admin/enterprises/123/approve` Body: `{"taxCode": "012345678a"}` | 400 | Lỗi validation: Mã số thuế chỉ được chứa ký tự số | X-LAB-TAX3, R2 |
| 11 | TC-LAB-11 | Từ chối Doanh nghiệp nhưng để trống lý do | Từ chối Doanh nghiệp | `POST /api/lab-admin/enterprises/123/reject` Body: `{"reason": ""}` | 400 | Lỗi validation: Lý do từ chối không được để trống | X-LAB-RSN1, B-RSN1, R4 |
| 12 | TC-LAB-12 | Từ chối Doanh nghiệp với lý do quá dài (501 ký tự) | Từ chối Doanh nghiệp | `POST /api/lab-admin/enterprises/123/reject` Body: `{"reason": "[501 ký tự A]"}` | 400 | Lỗi validation: Lý do từ chối không được vượt quá 500 ký tự | X-LAB-RSN2, B-RSN7, R4 |
| 13 | TC-LAB-13 | Phê duyệt lại Doanh nghiệp đã được Approve | Doanh nghiệp ID 123 đang ở trạng thái `APPROVED` | `POST /api/lab-admin/enterprises/123/approve` Body: `{"note": "Duyệt lại"}` | 400 | Lỗi nghiệp vụ: Doanh nghiệp đã được phê duyệt trước đó | ST-LAB-04, R1 |
| 14 | TC-LAB-14 | Sinh viên truy cập API xác thực Doanh nghiệp (Phân quyền) | Đăng nhập tài khoản Sinh viên (`TALENT`) | `POST /api/lab-admin/enterprises/123/approve` với Bearer Token của TALENT | 403 | Từ chối truy cập: 403 Forbidden - Không có quyền `LAB_ADMIN` | R5 |

---

## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

- **Lớp tương đương (EP):** 6/6 Valid Tags, 5/6 Invalid Tags (chưa bao phủ `X-LAB-ACT1`) - **Bao phủ ~92% (11/12 tag)**.
- **Giá trị biên (BVA):** Bao phủ toàn bộ các điểm biên quan trọng (`min-`, `min`, `max`, `max+`) của Mã số thuế (`B-TAX1`, `B-TAX2`, `B-TAX5`, `B-TAX6`) và Lý do từ chối (`B-RSN1`, `B-RSN2`, `B-RSN4`, `B-RSN6`, `B-RSN7`) - **Bao phủ 100% điểm biên chính**.
- **Chuyển đổi trạng thái (ST):** 4/5 luồng trạng thái xác thực doanh nghiệp (`ST-LAB-01` đến `ST-LAB-04`) - **Bao phủ 80%**.