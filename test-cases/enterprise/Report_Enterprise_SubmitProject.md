# Test Execution Report: FR-ENT-002 - Enterprise Submit Project Proposal

**Module:** Project Management
**Chức năng:** Enterprise tạo và quản lý đề xuất dự án (`POST /api/projects`, `GET /api/projects`, `GET /api/projects/{id}`, `GET /api/projects/enterprise/{enterpriseId}`)
**Người thực hiện:** Đặng Thành Đình Phát
**Ngày tạo report:** 12/11/2026
**Môi trường test:** Postman, 01 - Project Management
**Tham chiếu test case:** `test-cases/enterprise/TC_Enterprise_SubmitProject.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 36 |
| Passed | 21 |
| Failed | 15 |
| Blocked / Skipped | 0 |
| **Pass rate** | **58%** |

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input chính | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-ENT-01 | Enterprise tạo dự án thành công - happy path | role=ENTERPRISE, name=`"Dự án AI Chatbot cho UTH"`, description=`"Xây dựng hệ thống chatbot"`, startDate=`2027-01-15`, endDate=`2027-06-15`, budget=`10000000`, requiredTalents=`3` | 200 - Tạo thành công, status=PENDING_VALIDATION, slug generated | 200 OK - Tạo thành công (id=2) | PASS | V-RL1, V-NM1, V-DS1, V-SD1, V-ED1, V-BG1, V-RT1, V-TK1, B-BG3, B-DT4, ST-01, R1 | |
| 2 | TC-ENT-02 | Lab Admin tạo dự án thành công | role=LAB_ADMIN, name=`"Dự án Data Analytics"`, enterpriseId=`{ent_test_id}`, requiredTalents=`5` | 200 - Tạo thành công, enterpriseId gán đúng | 200 OK - Tạo thành công (id=3) | PASS | V-RL2, V-NM1, V-DS1, V-SD1, V-ED1, V-BG1, V-RT1, B-RT4, ST-02, R1 | |
| 3 | TC-ENT-03 | Talent không được tạo dự án | role=TALENT, các field hợp lệ | 400 - "Chỉ doanh nghiệp hoặc quản trị có thể tạo dự án" | 400 Bad Request - "Chỉ doanh nghiệp hoặc quản trị có thể tạo dự án" | PASS | X-RL1, ST-03, R3 | |
| 4 | TC-ENT-04 | Mentor không được tạo dự án | role=MENTOR, các field hợp lệ | 400 - "Chỉ doanh nghiệp hoặc quản trị có thể tạo dự án" | 400 Bad Request - "Chỉ doanh nghiệp hoặc quản trị có thể tạo dự án" | PASS | X-RL2, ST-03, R3 | |
| 5 | TC-ENT-05 | Enterprise không có hồ sơ doanh nghiệp | role=ENTERPRISE (ent_noprofile), các field hợp lệ | 400 - "Không tìm thấy hồ sơ Doanh nghiệp" | 400 Bad Request - "Không tìm thấy hồ sơ Doanh nghiệp" | PASS | X-RL3, ST-03, R4 | |
| 6 | TC-ENT-06 | Lab Admin thiếu enterpriseId | role=LAB_ADMIN, enterpriseId=null | 400 - "Thiếu enterpriseId cho dự án" | 400 Bad Request - "Thiếu enterpriseId cho dự án" | PASS | X-RL4, ST-03, R4 | |
| 7 | TC-ENT-07 | Không có token | Không gửi Authorization header | 401 - Unauthorized | 403 Forbidden - "Access Denied" | FAIL | X-TK1, X-RL5, R2 | |
| 8 | TC-ENT-08 | Token hết hạn | Token JWT đã expire | 401 - Unauthorized / Token expired | 500 Internal Server Error - "JWT signature does not match locally computed signature. JWT validity cannot be asserted and should not be trusted." | FAIL | X-TK2, R2 | |
| 9 | TC-ENT-09 | Token sai format | `"Bearer invalid_xyz"` | 401 - Unauthorized | 500 Internal Server Error - "Invalid compact JWT string: Compact JWSs must contain exactly 2 period characters, and compact JWEs must contain exactly 4.  Found: 0" | FAIL | X-TK3, R2 | |
| 10 | TC-ENT-10 | Name rỗng | name=`""` | 400 - Validation error (name blank) | 200 OK Tạo thành công | FAIL | X-NM1, ST-03, R5 | |
| 11 | TC-ENT-11 | Name null | name=(null) | 400 - Validation error (name null) | 400, trả về lỗi database "null value in column 'title' violates not-null constraint" | FAIL | X-NM2, ST-03, R5 | Thiếu validate @Valid ở Controller. Lỗi Database thô trả về thay vì message 400. |
| 12 | TC-ENT-12 | Description rỗng | description=`""` | 400 - Validation error (description blank) | 200 OK - Tạo thành công dự án id=6 dù description rỗng | FAIL | X-DS1, ST-03, R6 | |
| 13 | TC-ENT-13 | Description null | description=(null) | 400 - Validation error (description null) | 400 Bad Request - Lỗi Database: "null value in column 'description' violates not-null constraint" | FAIL | X-DS2, ST-03, R6 | Lỗi Database thô trả về thay vì message Validation. |
| 14 | TC-ENT-14 | StartDate null | startDate=(null) | 400 - Validation error (startDate null) | 400 Bad Request - Lỗi Database: "null value in column 'start_date' violates not-null constraint" | FAIL | X-SD1, ST-03, R7 | |
| 15 | TC-ENT-15 | EndDate null | endDate=(null) | 400 - Validation error (endDate null) | 400 Bad Request - Lỗi Database: "null value in column 'end_date' violates not-null constraint" | FAIL | X-ED1, ST-03, R7 | |
| 16 | TC-ENT-16 | StartDate sau EndDate | startDate=`2027-06-15`, endDate=`2027-01-15` | 400 - "Ngày bắt đầu phải trước ngày kết thúc" | 400 Bad Request - "Ngày bắt đầu phải trước ngày kết thúc" | PASS | X-ED2, B-DT3, ST-03, R8 | |
| 17 | TC-ENT-17 | StartDate sai format | startDate=`"15/01/2027"` | 400 - JSON parse error | 400 - JSON parse error: Cannot deserialize value of type `java.time.LocalDate` from String \"15/01/2027\": Failed to deserialize java.time.LocalDate: (java.time.format.DateTimeParseException) Text '15/01/2027' could not be parsed at index 0 | PASS | X-SD2, ST-03 | Hệ thống chặn đứng định dạng ngày tháng sai ở tầng Parse JSON |
| 18 | TC-ENT-18 | Budget null | budget=(null) | 400 - Validation error (budget null) | 400 Bad Request - Lỗi Database: "null value in column 'budget' violates not-null constraint" | FAIL | X-BG1, ST-03, R7 | |
| 19 | TC-ENT-19 | RequiredTalents null | requiredTalents=(null) | 400 - Validation error | 400 Bad Request - Lỗi Database: "null value in column 'number_of_students' violates not-null constraint" | FAIL | X-RT1, ST-03, R7 | |
| 20 | TC-ENT-20 | RequiredTalents = 0 (dưới min) | requiredTalents=`0` | 400 - Validation error (min 1) | 400 Bad Request - Lỗi Database: "violates check constraint 'check_students'" | FAIL | X-RT2, B-RT1, ST-03, R9 | |
| 21 | TC-ENT-21 | RequiredTalents = -1 (âm) | requiredTalents=`-1` | 400 - Validation error (min 1) | 400 Bad Request - Lỗi Database: "violates check constraint 'check_students'" | FAIL | X-RT3, ST-03, R9 | |
| 22 | TC-ENT-22 | RequiredTalents = 1 (min boundary) | requiredTalents=`1` | 200 - Tạo thành công | 200 ok - tạo thành công dự án (id 22) | PASS | V-RL1, V-NM1, V-DS1, B-RT2, ST-01, R1 |  |
| 23 | TC-ENT-23 | RequiredTalents = 2 (min+) | requiredTalents=`2` | 200 - Tạo thành công | 200 OK - Tạo thành công dự án (id 23) | PASS | V-RL1, B-RT3, ST-01, R1 |  |
| 24 | TC-ENT-24 | StartDate = EndDate (cùng ngày) | startDate=`2027-03-01`, endDate=`2027-03-01` | 200 - Tạo thành công | 200 OK- tạo thành công dự án | PASS | V-RL1, V-SD2, B-DT1, ST-01, R1 |  |
| 25 | TC-ENT-25 | StartDate = EndDate - 1 ngày | startDate=`2027-02-28`, endDate=`2027-03-01` | 200 - Tạo thành công | 200 OK - Tạo thành công dự án (id=17) | PASS | V-RL1, B-DT2, ST-01, R1 | |
| 26 | TC-ENT-26 | Budget = 0 | budget=`0` | 400 - Validation error (budget phải > 0) | 400 Bad Request - Lỗi Database: "violates check constraint 'check_budget'" | FAIL | V-RL1, X-BG3, B-BG1, ST-03 | SRS: budget > 0, code chưa có @Min, nhưng DB constraint: budget > 0 |
| 27 | TC-ENT-27 | Budget = -1 (âm) | budget=`-1` | 400 - Validation error (budget phải > 0) | 400 Bad Request - Lỗi Database: "violates check constraint 'check_budget'" | FAIL | V-RL1, X-BG2, B-BG4, ST-03 | SRS: budget > 0, code chưa có @Min, nhưng DB constraint: budget > 0 |
| 28 | TC-ENT-28 | Budget = 1 (nhỏ nhất dương) | budget=`1` | 200 - Tạo thành công | 200 OK - Tạo thành công dự án (id=20) | PASS | V-RL1, B-BG2, ST-01, R1 | |
| 29 | TC-ENT-29 | Lấy danh sách tất cả dự án | GET /api/projects (không filter) | 200 - Trả về danh sách dự án | 200 OK - Trả về được danh sách dự án | PASS | V-TK1, V-ST1, ST-05 | |
| 30 | TC-ENT-30 | Lấy danh sách theo status pending | GET /api/projects?status=pending | 200 - Trả về dự án có status pending | 200 OK - Trả về danh sách dự án có status pending | PASS | V-TK1, V-ST2, ST-05 | |
| 31 | TC-ENT-31 | Lấy danh sách với status không tồn tại | GET /api/projects?status=UNKNOWN | 200 - Trả về danh sách rỗng hoặc tất cả | 200 OK - Trả về danh sách tất cả dự án | PASS | V-TK1, X-ST1 | |
| 32 | TC-ENT-32 | Lấy chi tiết dự án hợp lệ | GET /api/projects/{id tồn tại} | 200 - Trả về chi tiết dự án đầy đủ | 200 OK - Trả về chi tiết dự án đầy đủ | PASS | V-TK1, V-PID1, ST-04 | |
| 33 | TC-ENT-33 | Lấy dự án không tồn tại | GET /api/projects/999999 | 404 - "Project not found" hoặc null | 404 - "Project not found with id: 999999" | PASS | V-TK1, X-PID1 | |
| 34 | TC-ENT-34 | ID không phải số | GET /api/projects/abc | 400 - Bad request (type mismatch) | 400 - Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'; For input string: "abc" | PASS | V-TK1, X-PID2 | |
| 35 | TC-ENT-35 | Lấy dự án của enterprise hợp lệ | GET /api/projects/enterprise/{id enterprise tồn tại} | 200 - Trả về danh sách dự án | 200 ok - trả về danh sách dự án của enterprise | PASS | V-TK1, V-PID1 | Dùng enterprise ent_test |
| 36 | TC-ENT-36 | Enterprise không có dự án nào | GET /api/projects/enterprise/{id ent_empty} | 200 - Trả về danh sách rỗng `[]` | 200 OK - trả về `{"success":true,"message":"Success","data":[]}` | PASS | V-TK1 | Dùng enterprise ent_empty |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| V-RL1 | Role = ENTERPRISE, có hồ sơ DN | TC-ENT-01, 22, 23, 24, 25, 26, 27, 28 | PASS |
| V-RL2 | Role = LAB_ADMIN, có enterpriseId | TC-ENT-02 | PASS |
| V-NM1 | Name không rỗng | TC-ENT-01, 02, 22 | PASS |
| V-DS1 | Description không rỗng | TC-ENT-01, 02, 22 | PASS |
| V-SD1 | StartDate hợp lệ, trước endDate | TC-ENT-01, 02 | PASS |
| V-SD2 | StartDate = EndDate (bằng nhau) | TC-ENT-24 | PASS |
| V-ED1 | EndDate hợp lệ, sau startDate | TC-ENT-01, 02 | PASS |
| V-BG1 | Budget số dương | TC-ENT-01, 02 | PASS |
| V-RT1 | RequiredTalents >= 1 | TC-ENT-01 | PASS |
| V-TK1 | Token JWT hợp lệ | TC-ENT-01, 29, 30, 31, 32, 33, 34, 35, 36 | PASS |
| V-PID1 | Project ID tồn tại | TC-ENT-32, 35 | PASS |
| V-ST1 | Không gửi status filter | TC-ENT-29 | PASS |
| V-ST2 | Status filter hợp lệ | TC-ENT-30 | PASS |
| X-RL1 | Role = TALENT | TC-ENT-03 | PASS |
| X-RL2 | Role = MENTOR | TC-ENT-04 | PASS |
| X-RL3 | ENTERPRISE không có hồ sơ DN | TC-ENT-05 | PASS |
| X-RL4 | LAB_ADMIN thiếu enterpriseId | TC-ENT-06 | PASS |
| X-RL5 | Không có token | TC-ENT-07 | FAIL |
| X-NM1 | Name rỗng/khoảng trắng | TC-ENT-10 | FAIL |
| X-NM2 | Name null | TC-ENT-11 | FAIL |
| X-DS1 | Description rỗng | TC-ENT-12 | FAIL |
| X-DS2 | Description null | TC-ENT-13 | FAIL |
| X-SD1 | StartDate null | TC-ENT-14 | FAIL |
| X-SD2 | StartDate sai format | TC-ENT-17 | PASS |
| X-ED1 | EndDate null | TC-ENT-15 | FAIL |
| X-ED2 | EndDate trước startDate | TC-ENT-16 | PASS |
| X-BG1 | Budget null | TC-ENT-18 | FAIL |
| X-BG2 | Budget âm | TC-ENT-27 | FAIL |
| X-BG3 | Budget = 0 | TC-ENT-26 | FAIL |
| X-RT1 | RequiredTalents null | TC-ENT-19 | FAIL |
| X-RT2 | RequiredTalents = 0 | TC-ENT-20 | FAIL |
| X-RT3 | RequiredTalents âm | TC-ENT-21 | FAIL |
| X-TK1 | Không có token | TC-ENT-07 | FAIL |
| X-TK2 | Token hết hạn | TC-ENT-08 | FAIL |
| X-TK3 | Token sai format | TC-ENT-09 | FAIL |
| X-PID1 | Project ID không tồn tại | TC-ENT-33 | PASS |
| X-PID2 | Project ID không phải số | TC-ENT-34 | PASS |
| X-ST1 | Status filter không tồn tại | TC-ENT-31 | PASS |

### Giá trị biên

| Tag | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|
| B-RT1 | requiredTalents = 0 (min-) | TC-ENT-20 | FAIL |
| B-RT2 | requiredTalents = 1 (min) | TC-ENT-22 | PASS |
| B-RT3 | requiredTalents = 2 (min+) | TC-ENT-23 | PASS |
| B-RT4 | requiredTalents = 5 (nominal) | TC-ENT-02 | PASS |
| B-BG1 | budget = 0 (zero) | TC-ENT-26 | FAIL |
| B-BG2 | budget = 1 (min+) | TC-ENT-28 | PASS |
| B-BG3 | budget = 10000000 (nominal) | TC-ENT-01 | PASS |
| B-BG4 | budget = -1 (negative) | TC-ENT-27 | FAIL |
| B-DT1 | startDate = endDate | TC-ENT-24 | PASS |
| B-DT2 | startDate = endDate - 1 ngày | TC-ENT-25 | PASS |
| B-DT3 | startDate = endDate + 1 ngày | TC-ENT-16 | PASS |
| B-DT4 | nominal (5 tháng) | TC-ENT-01 | PASS |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | (Chưa tồn tại) + tạo thành công -> PENDING_VALIDATION | TC-ENT-01, 22 đến 28 | PASS |
| ST-02 | (Chưa tồn tại) + Lab Admin tạo -> PENDING_VALIDATION | TC-ENT-02 | PASS |
| ST-03 | (Chưa tồn tại) + validation fail -> (Không tạo) | TC-ENT-03 đến 21, 26, 27 | PASS |
| ST-04 | PENDING_VALIDATION + xem chi tiết -> PENDING_VALIDATION | TC-ENT-32 | PASS |
| ST-05 | PENDING_VALIDATION + xem danh sách -> PENDING_VALIDATION | TC-ENT-29, 30 | PASS |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ -> 200 OK | TC-ENT-01, 02 | PASS |
| R2 | Token lỗi -> 401 | TC-ENT-07, 08, 09 | FAIL |
| R3 | Role không hợp lệ -> 400 | TC-ENT-03, 04 | PASS |
| R4 | Không có hồ sơ / thiếu enterpriseId -> 400 | TC-ENT-05, 06 | PASS |
| R5 | Name lỗi -> 400 | TC-ENT-10, 11 | FAIL |
| R6 | Description lỗi -> 400 | TC-ENT-12, 13 | FAIL |
| R7 | Null fields -> 400 | TC-ENT-14, 15, 18, 19 | FAIL |
| R8 | StartDate sau endDate -> 400 | TC-ENT-16 | PASS |
| R9 | RequiredTalents < 1 -> 400 | TC-ENT-20, 21 | FAIL |

> **Bao phủ thiết kế:** 13/13 Valid EP tags, 25/25 Invalid EP tags, 12/12 BVA tags, 5/5 state transitions, 9/9 decision rules - **100%**.

---

## 4. Danh sách bug / khiếm khuyết phát hiện (Defect Log)

| # | TC ID | Mô tả lỗi | Phân loại | Severity | Root Cause |
|:---:|---|---|---|:---:|---|
| 1 | TC-ENT-07 | Không có token trả về 403 Forbidden thay vì 401 Unauthorized | Bug | Medium | Security filter trả về 403 thay vì 401 khi thiếu Authorization header |
| 2 | TC-ENT-08 | Token hết hạn trả về 500 Internal Server Error thay vì 401 | Bug | High | Chưa xử lý exception JWT expired — lỗi rò ra response thô |
| 3 | TC-ENT-09 | Token sai format trả về 500 Internal Server Error thay vì 401 | Bug | High | Chưa xử lý exception JWT parse error — lỗi rò ra response thô |
| 4 | TC-ENT-10 | Name rỗng vẫn tạo thành công (200) thay vì 400 | Bug | High | Thiếu `@Valid` trong `ProjectController.createProject()` — DTO annotation `@NotBlank` không được enforce |
| 5 | TC-ENT-11 | Name null trả về DB error thô thay vì validation message 400 | Bug | High | Thiếu `@Valid` trong controller; DB NOT NULL constraint bắt lỗi nhưng message không friendly |
| 6 | TC-ENT-12 | Description rỗng vẫn tạo thành công (200) thay vì 400 | Bug | High | Thiếu `@Valid` trong controller — `@NotBlank` không được enforce |
| 7 | TC-ENT-13 | Description null trả về DB error thô thay vì validation message 400 | Bug | High | Thiếu `@Valid` trong controller |
| 8 | TC-ENT-14 | StartDate null trả về DB error thô thay vì validation message 400 | Bug | Medium | Thiếu `@Valid` trong controller |
| 9 | TC-ENT-15 | EndDate null trả về DB error thô thay vì validation message 400 | Bug | Medium | Thiếu `@Valid` trong controller |
| 10 | TC-ENT-18 | Budget null trả về DB error thô thay vì validation message 400 | Bug | Medium | Thiếu `@Valid` trong controller |
| 11 | TC-ENT-19 | RequiredTalents null trả về DB error thô thay vì validation message 400 | Bug | Medium | Thiếu `@Valid` trong controller |
| 12 | TC-ENT-20 | RequiredTalents=0 trả về DB constraint error thay vì validation error | Bug | Low | DB constraint `check_students (>= 3)` chặt hơn SRS — thiếu `@Min` annotation ở tầng code |
| 13 | TC-ENT-21 | RequiredTalents=-1 trả về DB constraint error thay vì validation error | Bug | Low | Cùng root cause với TC-ENT-20 |
| 14 | TC-ENT-26 | Budget=0 trả về DB constraint error thay vì validation error | Bug | Low | Thiếu `@Min` annotation ở tầng code — DB constraint `budget > 0` bắt lỗi thay thế |
| 15 | TC-ENT-27 | Budget=-1 trả về DB constraint error thay vì validation error | Bug | Low | Cùng root cause với TC-ENT-26 |

