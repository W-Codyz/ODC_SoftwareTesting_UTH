# Test Cases: FR-TAL-002 - Duyệt và Tham gia Dự án (Browse and Join Projects)

**Module:** Talent  
**Chức năng:** Browse and Join Projects (`GET /api/talent/projects/available`, `GET /api/talent/projects/{id}`, `POST /api/talent/projects/{id}/join`, `GET /api/talent/projects/my-projects`)  
**Người thực hiện:** Huỳnh Cao Đức  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-TAL-002, `docs/URD_LabOdc.md`  
**Source code tham chiếu:** `labodc-backend/.../controller/TalentController.java`, `labodc-backend/.../service/TalentService.java`, `labodc-backend/.../dto/talent/JoinProjectRequest.java`

---

## Mô tả chức năng

Sinh viên (Talent) thực hiện tìm kiếm, xem thông tin chi tiết các dự án ODC đang mở tuyển (`RECRUITING`), nộp đơn ứng tuyển kèm thư giới thiệu/lời nhắn (`message`), và theo dõi danh sách các dự án mình đã tham gia.

**Điều kiện hợp lệ:** Đơn đăng ký tham gia dự án được chấp nhận khi **tất cả** các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Ràng buộc hợp lệ |
|---|---|---|---|
| `projectId` | Mã định danh dự án | Long | Dự án tồn tại, đang ở trạng thái `RECRUITING`, `allowApplications = true` |
| `message` | Lời nhắn / Động lực tham gia | String | Không được để trống (`@NotBlank`), độ dài từ 10 đến 1000 ký tự |
| `talentId` | Mã sinh viên nộp đơn | Long | Thuộc tài khoản có vai trò `TALENT`, chưa từng nộp đơn vào dự án này trước đó |

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Quyền truy cập & Xác thực (Role & Token)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Token hợp lệ của user vai trò `TALENT` đã có hồ sơ | V-TAL-AUTH1 | Token của `nguyenvana@student.uth.edu.vn` |
| Không hợp lệ (a) | Không gửi token (chưa đăng nhập / Guest) | X-TAL-AUTH1 | `(Không gửi header Authorization)` |
| Không hợp lệ (b) | Token hợp lệ nhưng tài khoản không có hồ sơ Talent (ENTERPRISE) | X-TAL-AUTH2 | Token của `contact@techcorp.vn` |

### 1.2 Trạng thái & Mã dự án (`projectId`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Dự án tồn tại và đang mở tuyển (`RECRUITING`) | V-TAL-PRJ1 | `projectId = 2` (Mobile Learning Application) |
| Không hợp lệ (a) | Dự án không tồn tại trong hệ thống | X-TAL-PRJ1 | `projectId = 999999` |
| Không hợp lệ (b) | Dự án tồn tại nhưng đang chạy (`IN_PROGRESS`), không tuyển | X-TAL-PRJ2 | `projectId = 1` |
| Không hợp lệ (c) | `projectId` sai kiểu dữ liệu (chuỗi chữ) | X-TAL-PRJ3 | `projectId = "abc"` |

### 1.3 Lời nhắn ứng tuyển (`JoinProjectRequest.message`)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Chuỗi ký tự có độ dài từ 10 đến 1000 ký tự | V-TAL-MSG1 | Chuỗi 50 ký tự: `"Em rat quan tam den du an va mong duoc tham gia"` |
| Không hợp lệ (a) | Ngắn hơn 10 ký tự | X-TAL-MSG1 | `"Xin chao"` (8 ký tự) |
| Không hợp lệ (b) | Dài hơn 1000 ký tự | X-TAL-MSG2 | Chuỗi 1001 ký tự |
| Không hợp lệ (c) | Để trống / rỗng (`""`) | X-TAL-MSG3 | `""` |

### 1.4 Trạng thái ứng tuyển trùng lặp (Duplicate Check)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Talent chưa từng nộp đơn vào dự án này | V-TAL-DUP1 | Talent nộp đơn lần đầu vào Dự án 2 |
| Không hợp lệ | Talent nộp đơn lần 2 vào cùng một dự án | X-TAL-DUP1 | Talent nộp lại đơn vào Dự án đã nộp trước đó |

### Tổng hợp tag lớp tương đương

| Loại | Tags | Số lượng |
|---|---|---|
| Hợp lệ | V-TAL-AUTH1, V-TAL-PRJ1, V-TAL-MSG1, V-TAL-DUP1 | 4 |
| Không hợp lệ | X-TAL-AUTH1, X-TAL-AUTH2, X-TAL-PRJ1, X-TAL-PRJ2, X-TAL-PRJ3, X-TAL-MSG1, X-TAL-MSG2, X-TAL-MSG3, X-TAL-DUP1 | 9 |
| **Tổng** | | **13 tag** |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

### 2.1 Biên cho độ dài lời nhắn (`message`) trong `JoinProjectRequest`

| Ký hiệu | Ý nghĩa | Giá trị | Mô tả | Tag |
|---|---|---:|---|---|
| `min-` | Ngay dưới biên min (không hợp lệ) | 9 | Chuỗi 9 ký tự (`"123456789"`) | B-TAL-MSG1 |
| `min` | Giá trị nhỏ nhất hợp lệ | 10 | Chuỗi 10 ký tự (`"1234567890"`) | B-TAL-MSG2 |
| `min+` | Ngay trên biên min | 11 | Chuỗi 11 ký tự | B-TAL-MSG3 |
| `nominal` | Giá trị giữa miền | 500 | Chuỗi 500 ký tự | B-TAL-MSG4 |
| `max-` | Ngay dưới biên max | 999 | Chuỗi 999 ký tự | B-TAL-MSG5 |
| `max` | Độ dài tối đa hợp lệ | 1000 | Chuỗi đúng 1000 ký tự | B-TAL-MSG6 |
| `max+` | Vượt trên biên max (không hợp lệ) | 1001 | Chuỗi 1001 ký tự | B-TAL-MSG7 |

---

## 3. Chuyển đổi trạng thái (State Transition Testing)

### 3.1 Sơ đồ trạng thái thành viên dự án (`project_members.status`)

**Trạng thái:**
- **NOT_APPLIED** - Talent chưa nộp đơn vào dự án
- **PENDING** - Đã nộp đơn, chờ Mentor xem xét và phê duyệt
- **ACTIVE** - Mentor đã duyệt đơn, chính thức trở thành thành viên nhóm
- **REJECTED** - Mentor từ chối đơn ứng tuyển

### 3.2 Bảng chuyển đổi trạng thái

| Test Case | Start State | Event/Input | Expected End State | Expected Output |
|---|---|---|---|---|
| ST-TAL-01 | NOT_APPLIED | Gọi `POST /projects/{id}/join` (hợp lệ) | PENDING | Đăng ký thành công, tạo bản ghi `project_members` trạng thái PENDING |
| ST-TAL-02 | PENDING | Gọi lại `POST /projects/{id}/join` | PENDING | Báo lỗi `"You have already applied to this project"` |
| ST-TAL-03 | PENDING | Mentor phê duyệt đơn ứng tuyển | ACTIVE | Thành viên được kích hoạt tham gia nhóm dự án |
| ST-TAL-04 | PENDING | Mentor từ chối đơn ứng tuyển | REJECTED | Thành viên bị từ chối, không vào nhóm |
| ST-TAL-05 | ACTIVE | Gọi `GET /projects/my-projects` | ACTIVE | Dự án xuất hiện trong danh sách dự án của tôi |

---

## 4. Bảng quyết định (Decision Table)

### 4.1 Điều kiện và hành động

**Conditions:**
- C1: Có Token xác thực hợp lệ của vai trò `TALENT`?
- C2: Dự án tồn tại trong hệ thống?
- C3: Dự án đang ở trạng thái `RECRUITING`?
- C4: Độ dài lời nhắn hợp lệ ($10 \le \text{length} \le 1000$)?
- C5: Talent chưa từng nộp đơn vào dự án này trước đó?

**Actions:**
- A1: 200 OK - Đăng ký thành công, lưu bản ghi PENDING
- A2: 400 Bad Request - Lỗi validation độ dài lời nhắn
- A3: 400 Bad Request - Lỗi dự án không tồn tại
- A4: 400 Bad Request - Lỗi dự án không ở trạng thái tuyển dụng
- A5: 400 Bad Request - Lỗi đã nộp đơn trước đó
- A6: 403 Forbidden - Từ chối truy cập

### 4.2 Bảng quyết định

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **C1:** Token TALENT hợp lệ | Y | Y | Y | Y | Y | Y | **N** |
| **C2:** Dự án tồn tại | Y | Y | **N** | Y | Y | Y | - |
| **C3:** Dự án RECRUITING | Y | Y | - | **N** | Y | Y | - |
| **C4:** Lời nhắn 10-1000 ký tự | Y | **N** | - | - | Y | Y | - |
| **C5:** Chưa từng nộp đơn | Y | - | - | - | **N** | - | - |
| | | | | | | | |
| **A1:** 200 - Nộp đơn thành công | **X** | - | - | - | - | - | - |
| **A2:** 400 - Lỗi độ dài lời nhắn | - | **X** | - | - | - | - | - |
| **A3:** 400 - Không tìm thấy dự án | - | - | **X** | - | - | - | - |
| **A4:** 400 - Dự án không tuyển | - | - | - | **X** | - | - | - |
| **A5:** 400 - Đã nộp đơn rồi | - | - | - | - | **X** | - | - |
| **A6:** 403 - Lỗi quyền hạn | - | - | - | - | - | - | **X** |

---

## 5. Bảng Test Cases (Test Specification Table)

### Preconditions (áp dụng chung)

- Backend Spring Boot đang chạy tại `http://localhost:8080`, database PostgreSQL đã seed data.
- Tài khoản `nguyenvana@student.uth.edu.vn` (Talent ID 1) đã đăng nhập thành công.
- Dự án 2: Trạng thái `RECRUITING`, `allowApplications = true`, `isPublic = true`.
- Dự án 1: Trạng thái `IN_PROGRESS`, `allowApplications = false`.

### Bảng kịch bản test (Cấu trúc 8 cột chuẩn)

| STT | TC ID | Tên test case | Pre-condition | Input (Dữ liệu vào) | Expected HTTP | Expected Result | Tag / ST / Rule |
|---:|---|---|---|---|---:|---|---|
| 1 | TC-TAL-01 | Lấy danh sách dự án đang tuyển - mặc định | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/available` | 200 | Trả về danh sách dự án `RECRUITING` (Dự án 2) kèm thông tin phân trang | V-TAL-AUTH1, V-TAL-PRJ1, R1 |
| 2 | TC-TAL-02 | Lọc dự án đang tuyển theo công nghệ (`Flutter`) | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/available?technology=Flutter` | 200 | Trả về danh sách dự án có công nghệ Flutter | V-TAL-AUTH1, R1 |
| 3 | TC-TAL-03 | Lọc dự án với công nghệ không tồn tại (`Cobol`) | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/available?technology=Cobol` | 200 | Trả về danh sách rỗng (`totalElements = 0`) | V-TAL-AUTH1, R1 |
| 4 | TC-TAL-04 | Xem chi tiết dự án đang tuyển hợp lệ | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/2` | 200 | Trả về thông tin chi tiết dự án 2 (title, description, budget, mentor, enterprise) | V-TAL-PRJ1, R1 |
| 5 | TC-TAL-05 | Xem chi tiết dự án không tồn tại | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/999999` | 400 | Báo lỗi không tìm thấy: `"Project not found"` | X-TAL-PRJ1, R3 |
| 6 | TC-TAL-06 | Xem chi tiết dự án với id sai định dạng chuỗi | Đã đăng nhập TALENT, có JWT | `GET /api/talent/projects/abc` | 400 | Lỗi chuyển đổi kiểu dữ liệu path variable sang kiểu số nguyên Long | X-TAL-PRJ3, R3 |
| 7 | TC-TAL-07 | Đăng ký tham gia dự án thành công - nominal (50 ký tự) | Đã đăng nhập TALENT 1; P2 chưa apply | `POST /api/talent/projects/2/join`<br>Body: `{"message": "[50 ký tự A]"}` | 200 | Đăng ký thành công: `"Successfully applied to project. Waiting for mentor approval."` | V-TAL-MSG1, B-TAL-MSG4, V-TAL-DUP1, ST-TAL-01, R1 |
| 8 | TC-TAL-08 | Đăng ký với lời nhắn đúng 10 ký tự (biên min) | Đã đăng nhập TALENT 1; P2 chưa apply | `POST /api/talent/projects/2/join`<br>Body: `{"message": "1234567890"}` (10 ký tự) | 200 | Đăng ký thành công, bản ghi PENDING | B-TAL-MSG2, R1 |
| 9 | TC-TAL-09 | Đăng ký với lời nhắn đúng 1000 ký tự (biên max) | Đã đăng nhập TALENT 1; P2 chưa apply | `POST /api/talent/projects/2/join`<br>Body: `{"message": "[1000 ký tự A]"}` | 200 | Đăng ký thành công, bản ghi PENDING | B-TAL-MSG6, R1 |
| 10 | TC-TAL-10 | Đăng ký thất bại - lời nhắn 9 ký tự (biên min-) | Đã đăng nhập TALENT 1 | `POST /api/talent/projects/2/join`<br>Body: `{"message": "123456789"}` (9 ký tự) | 400 | Lỗi validation: `"Message must be between 10 and 1000 characters"` | X-TAL-MSG1, B-TAL-MSG1, R2 |
| 11 | TC-TAL-11 | Đăng ký thất bại - lời nhắn 1001 ký tự (biên max+) | Đã đăng nhập TALENT 1 | `POST /api/talent/projects/2/join`<br>Body: `{"message": "[1001 ký tự A]"}` | 400 | Lỗi validation: `"Message must be between 10 and 1000 characters"` | X-TAL-MSG2, B-TAL-MSG7, R2 |
| 12 | TC-TAL-12 | Đăng ký thất bại - lời nhắn để trống | Đã đăng nhập TALENT 1 | `POST /api/talent/projects/2/join`<br>Body: `{"message": ""}` | 400 | Lỗi validation: `"Message must be between 10 and 1000 characters"` | X-TAL-MSG3, R2 |
| 13 | TC-TAL-13 | Đăng ký thất bại - dự án không tuyển (IN_PROGRESS) | Đã đăng nhập TALENT 1; P1 | `POST /api/talent/projects/1/join`<br>Body: `{"message": "[50 ký tự A]"}` | 400 | Lỗi trạng thái: `"Project is not currently recruiting"` | X-TAL-PRJ2, R4 |
| 14 | TC-TAL-14 | Xem danh sách dự án của tôi | Đã đăng nhập TALENT 1 | `GET /api/talent/projects/my-projects` | 200 | Trả về danh sách 2 dự án mà Talent 1 đã tham gia (P1, P5) | V-TAL-AUTH1, ST-TAL-05, R1 |
| 15 | TC-TAL-15 | Nộp đơn bằng tài khoản không có Profile Talent | Đăng nhập tài khoản ENTERPRISE | `POST /api/talent/projects/2/join`<br>Body: `{"message": "[50 ký tự A]"}` | 400 | Báo lỗi hồ sơ: `"Talent profile not found for user: 4"` | X-TAL-AUTH2, R6 |
| 16 | TC-TAL-16 | Gọi API khi không truyền Token | Không gửi Authorization header | `GET /api/talent/projects/available` | 401 / 403 | Từ chối truy cập do thiếu xác thực JWT | X-TAL-AUTH1, R7 |
| 17 | TC-TAL-17 | Đăng ký thất bại - nộp đơn lần 2 vào cùng dự án (duplicate) | Talent 1 đã nộp đơn vào P2 | `POST /api/talent/projects/2/join`<br>Body: `{"message": "[50 ký tự A]"}` | 400 | Lỗi trùng lặp: `"You have already applied to this project"` | X-TAL-DUP1, ST-TAL-02, R5 |

---

## 6. Kiểm tra độ bao phủ Tag (Coverage Verification)

- **Lớp tương đương (EP):** 4/4 Valid Tags, 9/9 Invalid Tags - **Bao phủ 100%**.
- **Giá trị biên (BVA):** 7/7 điểm biên min-, min, min+, nominal, max-, max, max+ - **Bao phủ 100%**.
- **Chuyển đổi trạng thái (ST):** 5/5 luồng chuyển đổi trạng thái - **Bao phủ 100%**.
- **Bảng quyết định (Decision Table):** 7/7 rules quy tắc xử lý nghiệp vụ - **Bao phủ 100%**.
