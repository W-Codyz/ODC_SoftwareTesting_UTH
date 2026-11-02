# Test Cases: FR-TAL-002 - Xem Dashboard Talent (View Talent Dashboard)

**Module:** Talent  
**Chức năng:** View Talent Dashboard (`GET /api/talent/dashboard`)  
**Người thực hiện:** Hiển Nguyễn Minh  
**Mã Task Jira:** LABODC-67  
**Ngày tạo:** 28/10/2026  
**Ngày cập nhật:** 02/11/2026  
**Nguồn đặc tả:** `docs/SRS_LabOdc.md` - mục FR-TAL-002, `docs/URD_LabOdc.md`  
**Source code tham chiếu:** `TalentController.java`, `TalentService.java`, `TalentDashboardDTO.java`

---

## Mô tả chức năng

Sinh viên (Talent) sau khi đăng nhập thành công vào hệ thống có thể truy cập trang Dashboard để theo dõi tổng quan quá trình tham gia:
- **Thống kê (Stats):** Tổng số dự án (`totalProjects`), số dự án đang tham gia (`ongoing`), số dự án đã hoàn thành (`completed`), tổng số kỹ năng (`totalSkills`), tổng số chứng chỉ (`totalCerts`).
- **Dự án gần đây (Recent Projects):** Danh sách tối đa 5 dự án gần nhất mà Talent đang/đã tham gia.

Yêu cầu xác thực: Endpoint yêu cầu Bearer Token với quyền vai trò là `TALENT`.

---

## 1. Phân hoạch lớp tương đương (Equivalence Partitioning)

### 1.1 Trạng thái xác thực & Quyền hạn (Authentication & Authorization)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ | Token hợp lệ của user có role `TALENT` đang hoạt động (ACTIVE) | V-AUTH1 | Token của `nguyenvana@student.uth.edu.vn` |
| Không hợp lệ (a) | Không gửi token (chưa đăng nhập / Guest) | X-AUTH1 | No Auth Header |
| Không hợp lệ (b) | Token không hợp lệ / hết hạn / sai định dạng | X-AUTH2 | `Bearer invalid.jwt.token` |
| Không hợp lệ (c) | Token hợp lệ nhưng sai vai trò (Role `ENTERPRISE`, `MENTOR`, `ADMIN`) | X-AUTH3 | Token của `contact@techcorp.vn` |

### 1.2 Dữ liệu của Talent trong hệ thống (Talent Data State)

| Lớp | Mô tả | Tag | Giá trị đại diện |
|---|---|---|---|
| Hợp lệ (Đầy đủ) | Talent đã tham gia dự án, có kỹ năng và chứng chỉ | V-DATA1 | Talent ID 1 (có memberships, skills, certs) |
| Hợp lệ (Mới/Trống) | Talent mới đăng ký, chưa tham gia dự án nào, chưa thêm skill/cert | V-DATA2 | Talent mới tạo (0 dự án, 0 skills, 0 certs) |
| Không hợp lệ | User tồn tại nhưng chưa có bản ghi trong bảng `talents` | X-DATA1 | User có role TALENT nhưng thiếu record `talents` |

---

## 2. Phân tích giá trị biên (Boundary Value Analysis)

Kiểm tra số lượng dự án hiển thị trong danh sách `recentProjects` (Giới hạn tối đa là 5 dự án theo `limit(5)` trong service):

| Ký hiệu | Ý nghĩa | Số lượng dự án tham gia | Kết quả mong đợi danh sách `recentProjects` | Tag |
|---|---|---:|---|---|
| `min` | Không có dự án nào | 0 | Trả về mảng rỗng `[]`, `totalProjects = 0` | B-PR0 |
| `min+` | Có 1 dự án | 1 | Trả về 1 dự án trong danh sách | B-PR1 |
| `boundary` | Đúng ngưỡng giới hạn | 5 | Trả về đủ 5 dự án gần nhất | B-PR5 |
| `boundary+` | Vượt ngưỡng giới hạn | 6 | Chỉ trả về đúng 5 dự án gần nhất, `totalProjects = 6` | B-PR6 |

---

## 3. Decision Table (Bảng quyết định)

| Điều kiện / Quy tắc | R1 | R2 | R3 | R4 | R5 | R6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Token hợp lệ & đúng Role TALENT? | Có | Có | Không | Có (Sai Role) | Có | Không |
| Profile Talent tồn tại trong DB? | Có | Có | - | - | Không | - |
| Có dữ liệu dự án / kỹ năng? | Có (>0) | Không (=0) | - | - | - | - |
| **HTTP Status Code** | **200** | **200** | **401/403** | **403** | **404/500** | **401** |
| **Kết quả hiển thị** | Stats đầy đủ, list dự án | Stats = 0, list rỗng | Báo lỗi Auth | Từ chối truy cập | Báo lỗi hồ sơ | Chuyển Login |

---

## 4. Bảng Test Cases Chi tiết

| STT | TC ID | Tên test case | Preconditions | Input / Token | Expected HTTP | Expected Result | Tag bao phủ |
|---:|---|---|---|---|---:|---|---|
| 1 | **TC-DASH-01** | Xem Dashboard thành công - Talent có đầy đủ dữ liệu (nominal) | User `nguyenvana@student.uth.edu.vn` đã có dự án, kỹ năng | Bearer Token hợp lệ (TALENT) | 200 | `success: true`, `stats` có `totalProjects > 0`, `recentProjects` chứa danh sách dự án | V-AUTH1, V-DATA1 |
| 2 | **TC-DASH-02** | Xem Dashboard thành công - Talent mới (chưa có dự án, kỹ năng) | Talent mới kích hoạt tài khoản | Bearer Token hợp lệ (TALENT mới) | 200 | `success: true`, `totalProjects: 0`, `ongoing: 0`, `completed: 0`, `totalSkills: 0`, `recentProjects: []` | V-AUTH1, V-DATA2, B-PR0 |
| 3 | **TC-DASH-03** | Giới hạn hiển thị tối đa 5 dự án gần đây khi tham gia >5 dự án | Talent tham gia từ 6 dự án trở lên | Bearer Token hợp lệ (TALENT) | 200 | `recentProjects.length == 5`, trong khi `stats.totalProjects >= 6` | V-AUTH1, B-PR5, B-PR6 |
| 4 | **TC-DASH-04** | Truy cập Dashboard không truyền Authorization token (chưa đăng nhập) | Hệ thống đang chạy | Không gửi Header Authorization | 401 / 403 | Trả về Unauthorized / Forbidden, không lộ dữ liệu | X-AUTH1 |
| 5 | **TC-DASH-05** | Truy cập Dashboard với Bearer Token sai / giả mạo / hết hạn | Hệ thống đang chạy | `Bearer eyJhbGciOi...invalid` | 401 / 403 | Trả về lỗi xác thực token không hợp lệ | X-AUTH2 |
| 6 | **TC-DASH-06** | Truy cập Dashboard bằng tài khoản khác role (ENTERPRISE / MENTOR / ADMIN) | Tài khoản Enterprise đã login | Bearer Token của role ENTERPRISE | 403 | Từ chối truy cập do không đúng vai trò TALENT | X-AUTH3 |
| 7 | **TC-DASH-07** | Thời gian phản hồi API Dashboard (Performance/NFR) | Server tải bình thường | Request hợp lệ | 200 | Thời gian phản hồi < 2000ms theo tiêu chuẩn NFR trong SRS | V-AUTH1 |

---

## 5. Tổng kết kiểm tra độ bao phủ

- **Lớp tương đương:** 100% các lớp xác thực (V-AUTH1, X-AUTH1, X-AUTH2, X-AUTH3) và trạng thái dữ liệu (V-DATA1, V-DATA2) đều có test case tương ứng.
- **Biên:** Kiểm tra đầy đủ từ mốc 0 dự án (B-PR0) đến biên trên vượt giới hạn hiển thị (B-PR5, B-PR6).
