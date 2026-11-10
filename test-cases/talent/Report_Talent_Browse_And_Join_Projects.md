# Test Execution Report: FR-TAL-002 - Duyệt và Tham gia Dự án (Browse and Join Projects)

**Module:** Talent  
**Chức năng:** Browse and Join Projects (`GET /api/talent/projects/available`, `GET /api/talent/projects/{id}`, `POST /api/talent/projects/{id}/join`, `GET /api/talent/projects/my-projects`)  
**Người thực hiện:** Huỳnh Cao Đức  
**Ngày thực hiện:** 09/11/2026  
**Môi trường test:** Postman (Windows), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_Browse_And_Join_Projects.md`  
**Mã Task Jira:** `LABODC-101`  

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 17 |
| Passed | 13 |
| Failed | 4 |
| Blocked / Skipped | 0 |
| **Pass rate** | **13/17 = 76,5%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (ProjectId / Message / Query) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-TAL-01 | Lấy danh sách dự án đang tuyển - mặc định | Header Token của `nguyenvana@student.uth.edu.vn` | 200 - Trả về danh sách dự án `RECRUITING` (P2) | 200 OK, trả về đúng JSON danh sách gồm Dự án 2 | PASS | V-TAL-AUTH1, V-TAL-PRJ1, R1 | Phân trang và dữ liệu dự án hiển thị chính xác |
| 2 | TC-TAL-02 | Lọc dự án đang tuyển theo công nghệ (`Flutter`) | `?technology=Flutter`, Token `TALENT` | 200 - Trả về dự án có công nghệ Flutter | 200 OK, `data.content[0].title: "Mobile Learning Application"` | PASS | V-TAL-AUTH1, R1 | Bộ lọc công nghệ hoạt động tốt |
| 3 | TC-TAL-03 | Lọc dự án với công nghệ không tồn tại (`Cobol`) | `?technology=Cobol`, Token `TALENT` | 200 - Trả về danh sách rỗng (`totalElements = 0`) | 200 OK, `data.content: [], totalElements: 0` | PASS | V-TAL-AUTH1, R1 | Trả về mảng rỗng `[]`, không gây lỗi server |
| 4 | TC-TAL-04 | Xem chi tiết dự án đang tuyển hợp lệ | `projectId = 2`, Token `TALENT` | 200 - Trả về thông tin chi tiết dự án 2 | 200 OK, `id: 2, title: "Mobile Learning Application"` | PASS | V-TAL-PRJ1, R1 | Đầy đủ thông tin đối tác, mentor và budget |
| 5 | TC-TAL-05 | Xem chi tiết dự án không tồn tại | `projectId = 999999`, Token `TALENT` | 400 - Báo lỗi không tìm thấy | 400 Bad Request, `{"success":false,"message":"Project not found"}` | PASS | X-TAL-PRJ1, R3 | Bắt lỗi đúng `IllegalArgumentException` |
| 6 | TC-TAL-06 | Xem chi tiết dự án với id sai định dạng chuỗi | `projectId = "abc"`, Token `TALENT` | 400 - Lỗi chuyển đổi kiểu dữ liệu | 400 Bad Request, `message: "Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'"` | PASS | X-TAL-PRJ3, R3 | Spring MVC chặn lỗi type mismatch tự động |
| 7 | TC-TAL-07 | Đăng ký tham gia dự án thành công - nominal (50 ký tự) | `projectId = 2`, `message: "[50 ký tự A]"` | 200 - Đăng ký thành công, trạng thái PENDING | 400 Bad Request, `could not execute statement [ERROR: invalid input value for enum project_member_status_enum: "PENDING"]` | FAIL | V-TAL-MSG1, B-TAL-MSG4, V-TAL-DUP1, ST-TAL-01, R1 | Lỗi cơ sở dữ liệu: Enum `project_member_status_enum` trong PostgreSQL thiếu giá trị `'PENDING'` |
| 8 | TC-TAL-08 | Đăng ký với lời nhắn đúng 10 ký tự (biên min) | `projectId = 2`, `message: "1234567890"` (10 ký tự) | 200 - Đăng ký thành công | 400 Bad Request, `ERROR: invalid input value for enum project_member_status_enum: "PENDING"` | FAIL | B-TAL-MSG2, R1 | Bị lỗi DB enum tương tự TC-TAL-07 |
| 9 | TC-TAL-09 | Đăng ký với lời nhắn đúng 1000 ký tự (biên max) | `projectId = 2`, `message: "[1000 ký tự A]"` | 200 - Đăng ký thành công | 400 Bad Request, `ERROR: invalid input value for enum project_member_status_enum: "PENDING"` | FAIL | B-TAL-MSG6, R1 | Bị lỗi DB enum tương tự TC-TAL-07 |
| 10 | TC-TAL-10 | Đăng ký thất bại - lời nhắn 9 ký tự (biên min-) | `projectId = 2`, `message: "123456789"` (9 ký tự) | 400 - Lỗi validation độ dài | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"message":"Message must be between 10 and 1000 characters"}}` | PASS | X-TAL-MSG1, B-TAL-MSG1, R2 | Tầng Bean Validation `@Size(min=10)` chặn trước khi xuống DB |
| 11 | TC-TAL-11 | Đăng ký thất bại - lời nhắn 1001 ký tự (biên max+) | `projectId = 2`, `message: "[1001 ký tự A]"` | 400 - Lỗi validation độ dài | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"message":"Message must be between 10 and 1000 characters"}}` | PASS | X-TAL-MSG2, B-TAL-MSG7, R2 | Tầng Bean Validation `@Size(max=1000)` chặn thành công |
| 12 | TC-TAL-12 | Đăng ký thất bại - lời nhắn để trống | `projectId = 2`, `message: ""` | 400 - Lỗi validation không được rỗng | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"message":"Message must be between 10 and 1000 characters"}}` | PASS | X-TAL-MSG3, R2 | Chặn thành công chuỗi rỗng |
| 13 | TC-TAL-13 | Đăng ký thất bại - dự án không tuyển (IN_PROGRESS) | `projectId = 1`, `message: "[50 ký tự A]"` | 400 - Báo lỗi dự án không tuyển | 400 Bad Request, `{"success":false,"message":"Project is not currently recruiting"}` | PASS | X-TAL-PRJ2, R4 | Kiểm tra trạng thái dự án ở tầng Service chặn thành công |
| 14 | TC-TAL-14 | Xem danh sách dự án của tôi | Token của `nguyenvana@student.uth.edu.vn` | 200 - Trả về mảng 2 dự án (P1, P5) | 200 OK, trả về mảng 2 dự án mà Talent 1 đã tham gia | PASS | V-TAL-AUTH1, ST-TAL-05, R1 | Lấy đúng danh sách dự án đã tham gia |
| 15 | TC-TAL-15 | Nộp đơn bằng tài khoản không có Profile Talent | Token role `ENTERPRISE`, `message: "[50 ký tự A]"` | 400 - Báo lỗi hồ sơ Talent không tồn tại | 400 Bad Request, `{"success":false,"message":"Talent profile not found for user: 4"}` | PASS | X-TAL-AUTH2, R6 | Bắt lỗi đúng khi user không có bản ghi trong bảng `talents` |
| 16 | TC-TAL-16 | Gọi API khi không truyền Token | Không gửi Authorization header | 401 hoặc 403 - Lỗi xác thực | 403 Forbidden | PASS | X-TAL-AUTH1, R7 | Spring Security Filter chặn thành công |
| 17 | TC-TAL-17 | Đăng ký thất bại - nộp đơn lần 2 vào cùng dự án (duplicate) | Nộp lần 2 vào Dự án 2 | 400 - Báo lỗi đã nộp đơn trước đó | 400 Bad Request, `could not execute statement [ERROR: invalid input value for enum project_member_status_enum: "PENDING"]` | FAIL | X-TAL-DUP1, ST-TAL-02, R5 | Do TC-TAL-07 bị lỗi insert DB, chưa có bản ghi nên lần gọi 2 tiếp tục văng lỗi enum thay vì trả về message trùng lặp |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|:---:|
| V-TAL-AUTH1 | Token hợp lệ vai trò `TALENT` | TC-TAL-01 đến TC-TAL-04, TC-TAL-14 | PASS |
| V-TAL-PRJ1 | Dự án tồn tại & `RECRUITING` | TC-TAL-01, TC-TAL-04 | PASS |
| V-TAL-MSG1 | Độ dài lời nhắn hợp lệ (10-1000 ký tự) | TC-TAL-07 | FAIL |
| V-TAL-DUP1 | Ứng tuyển lần đầu hợp lệ | TC-TAL-07 | FAIL |
| X-TAL-AUTH1 | Không gửi token (Guest) | TC-TAL-16 | PASS |
| X-TAL-AUTH2 | Token vai trò `ENTERPRISE` (không có profile Talent) | TC-TAL-15 | PASS |
| X-TAL-PRJ1 | Dự án không tồn tại | TC-TAL-05 | PASS |
| X-TAL-PRJ2 | Dự án không tuyển (`IN_PROGRESS`) | TC-TAL-13 | PASS |
| X-TAL-PRJ3 | `projectId` sai kiểu dữ liệu | TC-TAL-06 | PASS |
| X-TAL-MSG1 | Lời nhắn < 10 ký tự | TC-TAL-10 | PASS |
| X-TAL-MSG2 | Lời nhắn > 1000 ký tự | TC-TAL-11 | PASS |
| X-TAL-MSG3 | Lời nhắn để trống | TC-TAL-12 | PASS |
| X-TAL-DUP1 | Ứng tuyển trùng lặp lần 2 | TC-TAL-17 | FAIL |

### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|:---:|
| B-TAL-MSG1 | `min- = 9 ký tự` | TC-TAL-10 | PASS |
| B-TAL-MSG2 | `min = 10 ký tự` | TC-TAL-08 | FAIL |
| B-TAL-MSG4 | `nominal = 50 ký tự` | TC-TAL-07 | FAIL |
| B-TAL-MSG6 | `max = 1000 ký tự` | TC-TAL-09 | FAIL |
| B-TAL-MSG7 | `max+ = 1001 ký tự` | TC-TAL-11 | PASS |

### 3.3 Chuyển đổi trạng thái (State Transition) & Bảng quyết định (Decision Table)

**State Transitions (ST-TAL-01 đến ST-TAL-05):**

| ST | Test Case | Kết quả |
|---|---|:---:|
| ST-TAL-01 | TC-TAL-07 | FAIL |
| ST-TAL-02 | TC-TAL-17 | FAIL |
| ST-TAL-03 | Chưa kiểm thử (do ST-TAL-01 fail) | Blocked |
| ST-TAL-04 | Chưa kiểm thử (do ST-TAL-01 fail) | Blocked |
| ST-TAL-05 | TC-TAL-14 | PASS |

**Decision Table Rules:**

| Rule | Test Case | Kết quả |
|---|---|:---:|
| R1 (Happy path - Apply thành công) | TC-TAL-01, 02, 03, 04, 07, 08, 09, 14 | FAIL |
| R2 (Lỗi độ dài lời nhắn) | TC-TAL-10, 11, 12 | PASS |
| R3 (Lỗi không tìm thấy dự án) | TC-TAL-05, 06 | PASS |
| R4 (Lỗi dự án không tuyển) | TC-TAL-13 | PASS |
| R5 (Lỗi nộp đơn trùng lặp) | TC-TAL-17 | FAIL |
| R6 (Lỗi tài khoản không có Profile) | TC-TAL-15 | PASS |
| R7 (Lỗi từ chối truy cập do thiếu token) | TC-TAL-16 | PASS |

---

## 4. Danh sách bug / khiếm khuyết phát hiện (Defect Log)

| # | TC ID | Mô tả lỗi | Phân loại | Severity | Root Cause |
|:---:|---|---|---|:---:|---|
| 1 | **TC-TAL-07, 08, 09, 17** | Khi Talent gửi đơn ứng tuyển hợp lệ vào dự án (`POST /projects/{id}/join`), server ném lỗi database `500/400`: `ERROR: invalid input value for enum project_member_status_enum: "PENDING"`. | Database Schema Mismatch | **High** | Trong database PostgreSQL, kiểu enum `project_member_status_enum` chỉ được khởi tạo với 3 giá trị: `'ACTIVE'`, `'LEFT'`, `'REMOVED'` mà thiếu mất giá trị `'PENDING'`. Trong khi đó, mã nguồn Java `ProjectMember.java` và `TalentService.java` dòng 154 gán `status = MemberStatus.PENDING`. Khi Hibernate thực thi lệnh INSERT, PostgreSQL reject câu lệnh. |
| 2 | **TC-TAL-05** | Truy vấn chi tiết dự án không tồn tại (`GET /projects/999999`) trả về mã `400 Bad Request` thay vì mã chuẩn `404 Not Found`. | Convention REST API | **Low** | `TalentService.java` dòng 392 ném `IllegalArgumentException("Project not found")` thay vì `ResourceNotFoundException`. |

---

## 5. Ghi chú & Đề xuất kiểm thử

- **Về lỗi bất đồng bộ Schema (Database Enum Mismatch):**
  - Đây là một phát hiện khiếm khuyết quan trọng (Bug High). Tester tuân thủ nguyên tắc **chỉ ghi nhận báo cáo kết quả thực tế, không can thiệp sửa code backend hay sửa cấu trúc database** theo đúng yêu cầu đề bài.
  - Đề xuất cho đội ngũ Backend & DBA: Cần chạy câu lệnh bổ sung enum trong migration script:
    ```sql
    ALTER TYPE project_member_status_enum ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE';
    ```
- **Về tính năng duyệt và xem dự án:**
  - Các endpoint lấy danh sách `GET /projects/available`, `GET /projects/{id}`, `GET /projects/my-projects` hoạt động rất mượt mà, phân trang và bộ lọc công nghệ/ngân sách trả về kết quả chuẩn xác.
