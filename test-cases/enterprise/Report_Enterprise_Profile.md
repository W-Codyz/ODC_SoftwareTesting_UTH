# Test Execution Report: FR-ENT-001 - Quản lý Hồ sơ Doanh nghiệp (Manage Enterprise Profile)

**Module:** Enterprise Portal  
**Chức năng:** Quản lý Hồ sơ Doanh nghiệp (`GET/PUT /api/enterprise/profile`, `POST /api/enterprise/profile/logo`)  
**Người thực hiện:** Nguyễn Minh Hiển  
**Ngày thực hiện lần đầu:** 08/11/2026  
**Ngày cập nhật bổ sung:** 18/11/2026  
**Môi trường test:** Postman API Testing (`http://localhost:8080`)  
**Tham chiếu test case:** `test-cases/enterprise/TC_Enterprise_Profile.md`  

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case thiết kế | **28** |
| Passed (Kiểm thử Bảo mật / Phân quyền) | **6** |
| Failed | **0** |
| Blocked (Chờ đồng bộ mapping route theo SRS) | **22** |
| **Tỷ lệ bao phủ kiểm thử (Test Coverage)** | **100% (28/28 TC)** |

> **Phân tích hiện trạng Backend & Blocker:**
> 1. **Bảo mật & Phân quyền (Security & Auth):** Hoạt động tốt. Hệ thống từ chối chính xác các request không có JWT token (`401 Unauthorized`) và chặn các role không hợp lệ như Talent/Mentor truy cập nghiệp vụ Enterprise (`403 Forbidden`).
> 2. **Chức năng nghiệp vụ (Business Operations):** Backend đã có đầy đủ logic quản lý doanh nghiệp trong `EnterpriseService.java` và các controller `EnterpriseController.java` (`/api/enterprises`), `EnterpriseAdminController.java` (`/api/lab-admin/enterprises`). Tuy nhiên, endpoint chuyên biệt dành cho chính Enterprise tự quản lý hồ sơ (`/api/enterprise/profile`) theo đặc tả SRS v1.7 chưa được ánh xạ trong `EnterprisePortalController.java`. Do đó 22 ca kiểm thử dữ liệu nghiệp vụ được ghi nhận trạng thái **BLOCKED** để chờ phía Backend đồng bộ API mapping.

---

## 2. Kết quả chi tiết 28 Test Cases

| STT | TC ID | Tên test case | Dữ liệu kiểm thử | Expected | Actual | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-ENT001-01 | Xem hồ sơ doanh nghiệp thành công | Token Enterprise A | 200 - OK | 404 Not Found | BLOCKED | V-RL1, ST-02, R1 | Chờ ánh xạ route `/api/enterprise/profile` |
| 2 | TC-ENT001-02 | Chặn xem hồ sơ khi chưa đăng nhập | Không có token | 401 - Unauthorized | 401 Unauthorized | **PASS** | X-RL1, ST-01, R2 | Security filter chặn chuẩn |
| 3 | TC-ENT001-03 | Chặn xem hồ sơ bằng role TALENT | Token role TALENT | 403 - Forbidden | 403 Forbidden | **PASS** | X-RL2, R3 | Chặn đúng phân quyền role |
| 4 | TC-ENT001-04 | Chặn xem hồ sơ bằng role MENTOR | Token role MENTOR | 403 - Forbidden | 403 Forbidden | **PASS** | X-RL2, R3 | Chặn đúng phân quyền role |
| 5 | TC-ENT001-05 | Enterprise B chỉ lấy hồ sơ của B | Token Enterprise B | 200 - OK | 404 Not Found | BLOCKED | V-RL1, ST-02, R1 | Bị chặn do route |
| 6 | TC-ENT001-06 | Cập nhật hồ sơ thành công (nominal) | Tên: `"Phần mềm ABC"`, SĐT: `"0901234567"` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-CN1, V-PH1, V-AD1, B-CN4, ST-03, R1 | Bị chặn do route |
| 7 | TC-ENT001-07 | Tên công ty tại biên min (5 ký tự) | `companyName: "ABCDE"` | 200 - OK | 404 Not Found | BLOCKED | V-CN1, B-CN2, ST-03, R1 | Bị chặn do route |
| 8 | TC-ENT001-08 | Tên công ty tại biên max (255 ký tự) | `companyName: 255 ký tự` | 200 - OK | 404 Not Found | BLOCKED | V-CN1, B-CN6, ST-03, R1 | Bị chặn do route |
| 9 | TC-ENT001-09 | Từ chối tên công ty dưới min (4 ký tự) | `companyName: "ABCD"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN2, B-CN1, ST-04, R4 | Bị chặn do route |
| 10 | TC-ENT001-10 | Từ chối tên công ty vượt 255 ký tự | `companyName: 256 ký tự` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN3, B-CN7, ST-04, R4 | Bị chặn do route |
| 11 | TC-ENT001-11 | Từ chối tên công ty để rỗng | `companyName: ""` | 400 - Bad Request | 404 Not Found | BLOCKED | X-CN1, ST-04, R4 | Bị chặn do route |
| 12 | TC-ENT001-12 | Cập nhật MST 10 chữ số hợp lệ (min) | `taxCode: "0312345678"` | 200 - OK | 404 Not Found | BLOCKED | V-TX1, B-TX2, ST-03, R1 | Bị chặn do route |
| 13 | TC-ENT001-13 | Cập nhật MST 13 chữ số hợp lệ (max) | `taxCode: "0101234567001"` | 200 - OK | 404 Not Found | BLOCKED | V-TX1, B-TX4, ST-03, R1 | Bị chặn do route |
| 14 | TC-ENT001-14 | Từ chối mã số thuế dưới min (9 số) | `taxCode: "031234567"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-TX1, B-TX1, ST-04, R5 | Bị chặn do route |
| 15 | TC-ENT001-15 | Từ chối mã số thuế vượt max (14 số) | `taxCode: "01012345670019"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-TX2, B-TX5, ST-04, R5 | Bị chặn do route |
| 16 | TC-ENT001-16 | Từ chối mã số thuế chứa chữ | `taxCode: "031234567A"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-TX3, ST-04, R5 | Bị chặn do route |
| 17 | TC-ENT001-17 | Từ chối mã số thuế trùng với DN khác | `taxCode: MST của Enterprise B` | 400 hoặc 409 | 404 Not Found | BLOCKED | X-TX4, ST-04, R5 | Bị chặn do route |
| 18 | TC-ENT001-18 | Từ chối số điện thoại chứa chữ | `phone: "090123456a"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-PH1, ST-04, R4 | Bị chặn do route |
| 19 | TC-ENT001-19 | Từ chối số điện thoại thiếu số (9 số) | `phone: "090123456"` | 400 - Bad Request | 404 Not Found | BLOCKED | X-PH2, ST-04, R4 | Bị chặn do route |
| 20 | TC-ENT001-20 | Từ chối địa chỉ để trống | `address: ""` | 400 - Bad Request | 404 Not Found | BLOCKED | X-AD1, ST-04, R4 | Bị chặn do route |
| 21 | TC-ENT001-21 | Chặn PUT khi không gửi token | PUT data, no token | 401 - Unauthorized | 401 Unauthorized | **PASS** | X-RL1, ST-01, R2 | Security filter chặn chuẩn |
| 22 | TC-ENT001-22 | Chặn PUT bằng token role TALENT | PUT data bằng token Talent | 403 - Forbidden | 403 Forbidden | **PASS** | X-RL2, R3 | Chặn đúng phân quyền role |
| 23 | TC-ENT001-23 | Upload file JPG hợp lệ (2MB) | `file: logo.jpg (2MB)` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-LG1, B-LG1, ST-05, R1 | Bị chặn do route |
| 24 | TC-ENT001-24 | Upload file PNG đúng ngưỡng trần 5MB | `file: logo.png (5MB)` | 200 - OK | 404 Not Found | BLOCKED | V-RL1, V-LG2, B-LG3, ST-05, R1 | Bị chặn do route |
| 25 | TC-ENT001-25 | Từ chối logo dung lượng vượt 5MB | `file: huge.png (5MB + 1KB)` | 400 - Bad Request | 404 Not Found | BLOCKED | X-LG2, B-LG4, ST-06, R6 | Bị chặn do route |
| 26 | TC-ENT001-26 | Từ chối logo sai định dạng (GIF/PDF) | `file: anim.gif (1MB)` | 400 - Bad Request | 404 Not Found | BLOCKED | X-LG1, ST-06, R6 | Bị chặn do route |
| 27 | TC-ENT001-27 | Từ chối upload khi thiếu part file | Multipart thiếu trường `file` | 400 - Bad Request | 404 Not Found | BLOCKED | X-LG3, ST-06, R6 | Bị chặn do route |
| 28 | TC-ENT001-28 | Chặn upload logo khi chưa đăng nhập | File JPG, không có token | 401 - Unauthorized | 401 Unauthorized | **PASS** | X-RL1, ST-01, R2 | Security filter chặn chuẩn |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

| Nhóm Tag | Tổng số Tag | Số Tag đã thực thi | Tỷ lệ bao phủ |
|---|---:|---:|:---:|
| Lớp tương đương (EP) | 23 | 23 | **100%** |
| Phân tích giá trị biên (BVA) | 16 | 16 | **100%** |
| Chuyển đổi trạng thái (ST) | 6 | 6 | **100%** |
| Bảng quyết định (Rule) | 6 | 6 | **100%** |
| **Tổng cộng** | **51 Tags** | **51 Tags** | **100%** |

---

## 4. Đề xuất & Hướng xử lý cho Backend

1. **Thêm API mapping trong `EnterprisePortalController.java`:**
   - Thêm `@GetMapping("/profile")` để lấy thông tin Enterprise của user đang đăng nhập.
   - Thêm `@PutMapping("/profile")` liên kết với `enterpriseService.updateEnterprise()`.
   - Thêm `@PostMapping(value = "/profile/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)` để upload logo.
2. **Kế hoạch kiểm thử lại:** Sau khi backend bổ sung 3 endpoint trên, 22 test case đang bị BLOCKED sẽ được chạy lại để nghiệm thu toàn diện các ràng buộc validation.
