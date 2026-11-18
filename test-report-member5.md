# BÁO CÁO KẾT QUẢ KIỂM THỬ API — MEMBER 5

| Thông tin | Chi tiết |
|---|---|
| **Collection** | Member 5 - FR-TL-002, FR-MEN-003, FR-ENT-001 |
| **Environment** | Member 5 - Local Testing (`http://localhost:8080`) |
| **Thời gian chạy** | 2026-11-17T08:37:38Z |
| **Người thực hiện** | Member 5 — Hiển Nguyễn Minh |
| **Công cụ** | Postman (local workspace) |

---

## TÓM TẮT KẾT QUẢ

| Chỉ số | Giá trị |
|---|---|
| Tổng test case | **15** |
| ✅ Passed | **3** |
| ❌ Failed | **12** |
| Pass Rate | **20.00%** |

> ⚠️ **Lưu ý quan trọng:** 12 test case thất bại đều do **1 nguyên nhân gốc rễ duy nhất** từ phía backend — không phải do lỗi logic của test case. Xem phần Phân tích nguyên nhân bên dưới.

---

## PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ

### 🔴 Lỗi chính: Backend thiếu cột `last_login_ip` trong bảng `users`

**Triệu chứng:** Tất cả 3 request Login đều trả về HTTP 400 với lỗi JDBC:

```
ERROR: column u1_0.last_login_ip does not exist
```

**Nguyên nhân:** JPA entity `User` hoặc query trong backend tham chiếu đến cột `last_login_ip` trong bảng `users`, nhưng cột này chưa được tạo trong database (schema SQL chưa cập nhật hoặc chưa chạy lại sau khi code thay đổi).

**Hiệu ứng lan truyền (Cascade):**
```
Login thất bại (HTTP 400)
    → Không lấy được JWT token
        → enterprise_token = rỗng
        → mentor_token = rỗng  
        → talent_token = rỗng
            → Tất cả request có xác thực nhận được HTTP 401
                → 12 test case FAIL
```

**Cách khắc phục:**
```sql
-- Chạy lệnh này trong PostgreSQL để fix:
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
```
Hoặc chạy lại toàn bộ schema:
```bash
docker exec -i labodc-postgres psql -U root -d labodc < src/database/schema.sql
```

---

## KẾT QUẢ ĐĂNG NHẬP (Prerequisites)

| Request | HTTP Status | Kết quả | Ghi chú |
|---|---|---|---|
| Login Enterprise | 400 | ❌ FAIL | JDBC error: `last_login_ip` không tồn tại |
| Login Mentor | 400 | ❌ FAIL | JDBC error: `last_login_ip` không tồn tại |
| Login Talent Leader | 400 | ❌ FAIL | JDBC error: `last_login_ip` không tồn tại |

---

## CHI TIẾT TỪNG MODULE

---

### FR-TL-002 — Submit Team Report (Talent Leader nộp báo cáo)

**Endpoint chính:** `GET/POST /api/talent-leader/projects/{project_id}/reports`  
**Token yêu cầu:** `talent_token`

| TC ID | Tên Test Case | Loại | HTTP Thực tế | HTTP Mong đợi | Kết quả | Assertion |
|---|---|---|---|---|---|---|
| TC-TL002-PM-01 | Get team reports | Positive | 401 | 200 | ❌ FAIL | SRS route is available (expected HTTP 200) → FAIL |
| TC-TL002-PM-02 | [WRITE] Submit a valid team report | Write | 401 | 201 | ❌ FAIL | SRS valid report is accepted (expected HTTP 201) → FAIL |
| TC-TL002-PM-03 | Get report by ID | Positive | 401 | 200 | ❌ FAIL | SRS detail route is available (expected HTTP 200) → FAIL |
| TC-TL002-PM-04 | Reject progress below zero | Negative | 401 | 400 | ❌ FAIL | Invalid progress is rejected (expected HTTP 400) → FAIL |
| TC-TL002-PM-05 | No token | Negative | 401 | 401 | ✅ PASS | Unauthenticated request is rejected (expected HTTP 401) → PASS |

**Module kết quả: 1/5 PASS**

> TC-TL002-PM-01 đến PM-04 thất bại hoàn toàn do `talent_token` rỗng (Login Talent Leader bị lỗi JDBC).  
> TC-TL002-PM-05 pass đúng vì không cần token — test case này xác nhận API từ chối truy cập không xác thực.

---

### FR-MEN-003 — Evaluate Talents (Mentor đánh giá Talent)

**Endpoint chính:** `GET/POST /api/mentor/projects/{project_id}/evaluations`  
**Token yêu cầu:** `mentor_token`

| TC ID | Tên Test Case | Loại | HTTP Thực tế | HTTP Mong đợi | Kết quả | Assertion |
|---|---|---|---|---|---|---|
| TC-MEN003-PM-01 | Get mentor projects | Positive | 401 | 200 | ❌ FAIL | Mentor projects returns HTTP 200 → FAIL |
| TC-MEN003-PM-02 | Get talents in project | Positive | 401 | 200 | ❌ FAIL | Project talents returns HTTP 200 → FAIL |
| TC-MEN003-PM-03 | Get project evaluations | Positive | 401 | 200 | ❌ FAIL | Project evaluations returns HTTP 200 → FAIL |
| TC-MEN003-PM-04 | [WRITE] Submit valid evaluation | Write | 401 | 200 | ❌ FAIL | Valid evaluation is accepted (expected HTTP 200) → FAIL |
| TC-MEN003-PM-05 | Reject overallScore below zero | Negative | 401 | 400 | ❌ FAIL | Score below zero is rejected (expected HTTP 400) → FAIL |
| TC-MEN003-PM-06 | No token | Negative | 401 | 401 | ✅ PASS | Unauthenticated request is rejected (expected HTTP 401) → PASS |

**Module kết quả: 1/6 PASS**

> TC-MEN003-PM-01 đến PM-05 thất bại do `mentor_token` rỗng (Login Mentor bị lỗi JDBC).  
> TC-MEN003-PM-06 pass đúng — xác nhận API từ chối truy cập không xác thực.

---

### FR-ENT-001 — Manage Enterprise Profile (Enterprise quản lý hồ sơ)

**Endpoint chính:** `GET/PUT /api/enterprise/profile`  
**Token yêu cầu:** `enterprise_token`

| TC ID | Tên Test Case | Loại | HTTP Thực tế | HTTP Mong đợi | Kết quả | Assertion |
|---|---|---|---|---|---|---|
| TC-ENT001-PM-01 | Get enterprise profile | Positive | 401 | 200 | ❌ FAIL | SRS profile route is available (expected HTTP 200) → FAIL |
| TC-ENT001-PM-02 | [WRITE] Update enterprise profile | Write | 401 | 200 | ❌ FAIL | SRS profile update is accepted (expected HTTP 200) → FAIL |
| TC-ENT001-PM-03 | [WRITE] Upload enterprise logo | Write | 401 | 200 | ❌ FAIL | SRS logo upload route is available (expected HTTP 200) → FAIL |
| TC-ENT001-PM-04 | No token | Negative | 401 | 401 | ✅ PASS | Unauthenticated request is rejected (expected HTTP 401) → PASS |

**Module kết quả: 1/4 PASS**

> TC-ENT001-PM-01 đến PM-03 thất bại do `enterprise_token` rỗng (Login Enterprise bị lỗi JDBC).  
> TC-ENT001-PM-04 pass đúng — xác nhận API từ chối truy cập không xác thực.

---

## BẢNG TỔNG HỢP TẤT CẢ TEST CASE

| TC ID | Module | Tên | Loại | Kết quả |
|---|---|---|---|---|
| TC-TL002-PM-01 | FR-TL-002 | Get team reports | Positive | ❌ FAIL |
| TC-TL002-PM-02 | FR-TL-002 | Submit a valid team report | Write | ❌ FAIL |
| TC-TL002-PM-03 | FR-TL-002 | Get report by ID | Positive | ❌ FAIL |
| TC-TL002-PM-04 | FR-TL-002 | Reject progress below zero | Negative | ❌ FAIL |
| TC-TL002-PM-05 | FR-TL-002 | No token | Negative | ✅ PASS |
| TC-MEN003-PM-01 | FR-MEN-003 | Get mentor projects | Positive | ❌ FAIL |
| TC-MEN003-PM-02 | FR-MEN-003 | Get talents in project | Positive | ❌ FAIL |
| TC-MEN003-PM-03 | FR-MEN-003 | Get project evaluations | Positive | ❌ FAIL |
| TC-MEN003-PM-04 | FR-MEN-003 | Submit valid evaluation | Write | ❌ FAIL |
| TC-MEN003-PM-05 | FR-MEN-003 | Reject overallScore below zero | Negative | ❌ FAIL |
| TC-MEN003-PM-06 | FR-MEN-003 | No token | Negative | ✅ PASS |
| TC-ENT001-PM-01 | FR-ENT-001 | Get enterprise profile | Positive | ❌ FAIL |
| TC-ENT001-PM-02 | FR-ENT-001 | Update enterprise profile | Write | ❌ FAIL |
| TC-ENT001-PM-03 | FR-ENT-001 | Upload enterprise logo | Write | ❌ FAIL |
| TC-ENT001-PM-04 | FR-ENT-001 | No token | Negative | ✅ PASS |

---

## KẾT LUẬN VÀ KHUYẾN NGHỊ

### Kết luận
- **3/15 test case PASS** — tất cả là các test case "No token" (negative test), hoạt động đúng như thiết kế.
- **12/15 test case FAIL** — toàn bộ do một lỗi backend duy nhất: thiếu cột `last_login_ip` trong bảng `users`.
- Đây **KHÔNG phải lỗi logic của test case**. Test case được viết đúng. Lỗi nằm ở phía backend/database.

### Khuyến nghị
1. **[Ưu tiên cao] Fix backend:** Thêm cột `last_login_ip` vào bảng `users` hoặc bỏ tham chiếu này khỏi JPA entity.
2. **Sau khi fix:** Chạy lại toàn bộ collection để có kết quả chính xác.
3. **Nên log lên Jira:** 1 bug cho lỗi JDBC `last_login_ip` — ảnh hưởng toàn bộ luồng đăng nhập.

### Những gì đã xác nhận được hoạt động đúng
- ✅ API `/api/talent-leader/projects/{id}/reports` — từ chối đúng khi không có token (401)
- ✅ API `/api/mentor/projects/{id}/evaluations` — từ chối đúng khi không có token (401)
- ✅ API `/api/enterprise/profile` — từ chối đúng khi không có token (401)
- ✅ Header `WWW-Authenticate: Bearer` được trả về đúng chuẩn

---

*Báo cáo được tạo tự động bởi Postman Agent — 2026-11-17*  
*File JSON đầy đủ: `test-report-member5.json`*
