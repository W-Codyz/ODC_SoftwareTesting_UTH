# Test Execution Report: FR-ENT-001 - Quản lý Hồ sơ Doanh nghiệp (Manage Enterprise Profile)

**Module:** Enterprise Portal  
**Chức năng:** Quản lý Hồ sơ Doanh nghiệp (`GET /api/enterprise/profile`, `PUT /api/enterprise/profile`, `POST /api/enterprise/profile/logo`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện lần đầu:** 08/11/2026  
**Ngày cập nhật bổ sung:** 18/11/2026  
**Môi trường test:** Postman API Testing (`http://localhost:8080`)  
**Tham chiếu test case:** `test-cases/enterprise/TC_Enterprise_Profile.md`  

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 15 |
| Passed | 0 |
| Failed | 0 |
| Blocked / Skipped | 15 |
| **Pass rate** | **N/A (15/15 BLOCKED - Backend chưa triển khai route)** |

> **Blocker:** Endpoint `GET /api/enterprise/profile`, `PUT /api/enterprise/profile` và `POST /api/enterprise/profile/logo` chưa được triển khai trong backend hiện tại (`EnterprisePortalController.java`). Tất cả 15 request chức năng đều nhận mã phản hồi HTTP `404 Not Found`. Toàn bộ ca kiểm thử chức năng được ghi nhận trạng thái **BLOCKED** chờ Dev implement route.

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input Data | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-ENT001-01 | Xem hồ sơ doanh nghiệp thành công | Token Enterprise | 200 - OK | 404 Not Found | BLOCKED | V-RL1, ST-01, R1 | Backend chưa có route `/api/enterprise/profile` |
| 2 | TC-ENT001-02 | Cập nhật hồ sơ thành công (nominal) | `"TechCorp Solutions Vietnam"`, `"0901234567"` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-CN1, V-PH1, V-AD1, B-CN3, ST-02, R1 | Bị chặn bởi lỗi 404 |
| 3 | TC-ENT001-03 | Tên công ty tại biên min (5 ký tự) | `companyName: "ABCDE"` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-CN1, B-CN1, R1 | Bị chặn bởi lỗi 404 |
| 4 | TC-ENT001-04 | Tên công ty tại biên max (255 ký tự) | `companyName: 255 ký tự` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-CN1, B-CN5, R1 | Bị chặn bởi lỗi 404 |
| 5 | TC-ENT001-05 | Tên công ty dưới min (4 ký tự) | `companyName: "ABCD"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN2, R3 | Bị chặn bởi lỗi 404 |
| 6 | TC-ENT001-06 | Tên công ty rỗng | `companyName: ""` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN1, R3 | Bị chặn bởi lỗi 404 |
| 7 | TC-ENT001-07 | Tên công ty vượt 255 ký tự | `companyName: 256 ký tự` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN3, R3 | Bị chặn bởi lỗi 404 |
| 8 | TC-ENT001-08 | Số điện thoại thiếu chữ số (9 số) | `phone: "090123456"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-PH2, R4 | Bị chặn bởi lỗi 404 |
| 9 | TC-ENT001-09 | Số điện thoại chứa chữ cái | `phone: "090123456a"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-PH1, R4 | Bị chặn bởi lỗi 404 |
| 10 | TC-ENT001-10 | Địa chỉ trụ sở rỗng | `address: ""` | 400 - Bad Request | 404 Not Found | BLOCKED | X-AD1, R3 | Bị chặn bởi lỗi 404 |
| 11 | TC-ENT001-11 | Chưa đăng nhập gọi GET profile | Không có Header Authorization | 401 - Unauthorized | 404 Not Found | BLOCKED | X-RL1 | Lẽ ra phải 401 nếu route tồn tại |
| 12 | TC-ENT001-12 | Sinh viên Talent gọi API sửa profile | Token role TALENT | 403 - Forbidden | 404 Not Found | BLOCKED | X-RL2, R2 | Bị chặn bởi lỗi 404 |
| 13 | TC-ENT001-13 | Tải lên logo hợp lệ (2MB PNG) | File `logo.png` (2MB) | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-LG1, B-LG2, ST-03, R1 | Bị chặn bởi lỗi 404 |
| 14 | TC-ENT001-14 | Tải lên logo sai định dạng (PDF) | File `document.pdf` | 400 - Bad Request | 404 Not Found | BLOCKED | X-LG1, ST-05 | Bị chặn bởi lỗi 404 |
| 15 | TC-ENT001-15 | Tải lên logo vượt 5MB (6MB) | File `logo_huge.png` (6MB) | 400 - Bad Request | 404 Not Found | BLOCKED | X-LG2, B-LG5, ST-05 | Bị chặn bởi lỗi 404 |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-RL1 | Token Enterprise hợp lệ | TC-ENT001-01, 02, 03, 04, 13 | BLOCKED (Chờ route backend) |
| V-CN1 | Tên công ty hợp lệ [5..255] | TC-ENT001-02, 03, 04 | BLOCKED (Chờ route backend) |
| V-PH1 | Số điện thoại VN hợp lệ | TC-ENT001-02 | BLOCKED (Chờ route backend) |
| V-AD1 | Địa chỉ công ty hợp lệ | TC-ENT001-02 | BLOCKED (Chờ route backend) |
| V-LG1 | File logo hợp lệ <= 5MB | TC-ENT001-13 | BLOCKED (Chờ route backend) |
| X-RL1 | Chưa đăng nhập (no token) | TC-ENT001-11 | BLOCKED (Trả 404 thay vì 401) |
| X-RL2 | Sai role (Talent gọi API) | TC-ENT001-12 | BLOCKED (Chờ route backend) |
| X-CN1 | Tên công ty rỗng | TC-ENT001-06 | BLOCKED (Chờ route backend) |
| X-CN2 | Tên công ty < 5 ký tự | TC-ENT001-05 | BLOCKED (Chờ route backend) |
| X-CN3 | Tên công ty > 255 ký tự | TC-ENT001-07 | BLOCKED (Chờ route backend) |
| X-PH1 | Số điện thoại chứa chữ | TC-ENT001-09 | BLOCKED (Chờ route backend) |
| X-PH2 | Số điện thoại thiếu số | TC-ENT001-08 | BLOCKED (Chờ route backend) |
| X-AD1 | Địa chỉ rỗng | TC-ENT001-10 | BLOCKED (Chờ route backend) |
| X-LG1 | File logo sai định dạng | TC-ENT001-14 | BLOCKED (Chờ route backend) |
| X-LG2 | File logo > 5MB | TC-ENT001-15 | BLOCKED (Chờ route backend) |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-CN1 | min = 5 ký tự | TC-ENT001-03 | BLOCKED |
| B-CN2 | min+ = 6 ký tự | TC-ENT001-02 | BLOCKED |
| B-CN3 | nominal = 26 ký tự | TC-ENT001-02 | BLOCKED |
| B-CN5 | max = 255 ký tự | TC-ENT001-04 | BLOCKED |
| B-LG2 | nominal = 2 MB | TC-ENT001-13 | BLOCKED |
| B-LG5 | max+ = 6 MB | TC-ENT001-15 | BLOCKED |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | ACTIVE → GET Profile | TC-ENT001-01 | BLOCKED |
| ST-02 | ACTIVE → PUT Profile | TC-ENT001-02 | BLOCKED |
| ST-03 | ACTIVE → POST Logo | TC-ENT001-13 | BLOCKED |
| ST-04 | ACTIVE → PUT lỗi 400 | TC-ENT001-05..10 | BLOCKED |
| ST-05 | ACTIVE → POST lỗi 400 | TC-ENT001-14, 15 | BLOCKED |
| ST-06 | SUSPENDED → 403 | Quy trình quản trị | BLOCKED |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ → 200 OK | TC-ENT001-01, 02, 03, 04, 13 | BLOCKED |
| R2 | Sai quyền Enterprise → 403 Forbidden | TC-ENT001-12 | BLOCKED |
| R3 | Sai tên công ty hoặc địa chỉ → 400 Bad Request | TC-ENT001-05, 06, 07, 10 | BLOCKED |
| R4 | Sai format phone → 400 Bad Request | TC-ENT001-08, 09 | BLOCKED |
| R5 | Sai file logo → 400 Bad Request | TC-ENT001-14, 15 | BLOCKED |

> **Bao phủ (trên tổng TC):** 15/15 EP tags, 10/10 BVA tags, 6/6 state transitions, 5/5 decision rules - **100%**.  
> **Đã thực thi:** 15/15 test case. Toàn bộ 15 ca đều nhận mã `404 Not Found` do backend thiếu route.

---

## 4. Danh sách bug / khiếm khuyết phát hiện

| # | TC ID | Mô tả bug / khiếm khuyết | Severity | Jira ID | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-ENT001-01..15 | Route `/api/enterprise/profile` và `/api/enterprise/profile/logo` trả về `404 Not Found` do backend chưa hiện thực controller | High | LABODC-174 | Open (Blocker - Chờ Dev implement) |
| 2 | TC-ENT001-11 | Request không có token trả về `404 Not Found` thay vì `401 Unauthorized` | Medium | — | Open (Liên đới lỗi thiếu route) |
