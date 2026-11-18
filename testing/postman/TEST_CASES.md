# TEST CASES — LabODC API Testing

> **Dự án:** LabODC Software Testing  
> **Collection:** LabODC API Testing  
> **Environment:** LabODC Local (`http://localhost:8080`)  
> **Ngày tạo:** 2026-10-12  
> **Tổng số API được kiểm thử:** 26 requests (bao gồm Auth, User, Dashboard, Mentor Admin, Talent Admin, Talent)

---

## 1. AUTH ENDPOINTS

### TC-AUTH-01: Login
- **Method:** POST `/api/auth/login`
- **Body:** `{ "email": "labadmin2@labodc.com", "password": "123123" }`
- **Test Cases:**
  - ✅ TC-AUTH-01-P1: Status code là 200
  - ✅ TC-AUTH-01-P2: Response có chứa token
  - ✅ TC-AUTH-01-P3: Token được lưu vào environment variable `token`

### TC-AUTH-02: Register
- **Method:** POST `/api/auth/register`
- **Body:** `{ "email": "testuser@mail.com", "password": "test123123", "confirmPassword": "test123123", "role": "TALENT" }`
- **Test Cases:**
  - ✅ TC-AUTH-02-P1: Status code là 200 hoặc 201
  - ✅ TC-AUTH-02-P2: Response có trường `success`
  - ✅ TC-AUTH-02-P3: Response time < 3000ms
  - ⚠️ TC-AUTH-02-N1: Email đã tồn tại → 400 Bad Request (email trùng lặp)

### TC-AUTH-03: Logout
- **Method:** POST `/api/auth/logout`
- **Test Cases:**
  - ✅ TC-AUTH-03-P1: Status code là 200
  - ✅ TC-AUTH-03-P2: Response `success` là true
  - ✅ TC-AUTH-03-P3: Response time < 2000ms

---

## 2. USER ENDPOINTS

### TC-USER-01: Get Profile
- **Method:** GET `/api/user/profile`
- **Auth:** Bearer token
- **Test Cases:**
  - ✅ TC-USER-01-P1: Status code là 200
  - ✅ TC-USER-01-P2: Response có trường email của user đang đăng nhập
  - ✅ TC-USER-01-P3: Response time < 2000ms

---

## 3. DASHBOARD ENDPOINTS

### TC-DASH-01: Get Dashboard Stats
- **Method:** GET `/api/dashboard/stats`
- **Auth:** Bearer token
- **Test Cases:**
  - ✅ TC-DASH-01-P1: Status code là 200
  - ✅ TC-DASH-01-P2: Response `success` là true
  - ✅ TC-DASH-01-P3: Dashboard stats data tồn tại
  - ✅ TC-DASH-01-P4: Response time < 2000ms

### TC-DASH-02: Get Recent Activities
- **Method:** GET `/api/dashboard/activities?limit=10`
- **Auth:** Bearer token
- **Test Cases:**
  - ✅ TC-DASH-02-P1: Status code là 200
  - ✅ TC-DASH-02-P2: Response `success` là true
  - ✅ TC-DASH-02-P3: Activities data tồn tại
  - ✅ TC-DASH-02-P4: Response time < 2000ms

### TC-DASH-03: Get Pending Approvals
- **Method:** GET `/api/dashboard/approvals?limit=10`
- **Auth:** Bearer token
- **Test Cases:**
  - ✅ TC-DASH-03-P1: Status code là 200
  - ✅ TC-DASH-03-P2: Response `success` là true
  - ✅ TC-DASH-03-P3: Approvals data tồn tại
  - ✅ TC-DASH-03-P4: Response time < 2000ms

### TC-DASH-04: Get Revenue Chart
- **Method:** GET `/api/dashboard/revenue?months=6`
- **Auth:** Bearer token
- **Test Cases:**
  - ✅ TC-DASH-04-P1: Status code là 200
  - ✅ TC-DASH-04-P2: Response `success` là true
  - ✅ TC-DASH-04-P3: Revenue chart data tồn tại
  - ✅ TC-DASH-04-P4: Response time < 2000ms

---

## 4. MENTOR ADMIN ENDPOINTS

### TC-MENTOR-01: Get All Mentors
- **Method:** GET `/api/lab-admin/mentors?page=0&size=10`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-01-P1: Status code là 200
  - ✅ TC-MENTOR-01-P2: Response `success` là true
  - ✅ TC-MENTOR-01-P3: Mentors data tồn tại
  - ✅ TC-MENTOR-01-P4: Response time < 2000ms
  - ⚠️ TC-MENTOR-01-N1: Không có token → 401 Unauthorized

### TC-MENTOR-02: Get Mentor By ID
- **Method:** GET `/api/lab-admin/mentors/1`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-02-P1: Status code là 200
  - ✅ TC-MENTOR-02-P2: Response `success` là true
  - ✅ TC-MENTOR-02-P3: Mentor data tồn tại
  - ✅ TC-MENTOR-02-P4: Mentor có trường `fullName`
  - ✅ TC-MENTOR-02-P5: Response time < 2000ms
  - ⚠️ TC-MENTOR-02-N1: ID không tồn tại → 404 Not Found

### TC-MENTOR-03: Get All Expertise
- **Method:** GET `/api/lab-admin/mentors/expertise/all`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-03-P1: Status code là 200
  - ✅ TC-MENTOR-03-P2: Response `success` là true
  - ✅ TC-MENTOR-03-P3: Expertise data là array
  - ✅ TC-MENTOR-03-P4: Response time < 2000ms

### TC-MENTOR-04: Get Available Mentors
- **Method:** GET `/api/lab-admin/mentors/available?technologies=Java,Spring`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-04-P1: Status code là 200
  - ✅ TC-MENTOR-04-P2: Response `success` là true
  - ✅ TC-MENTOR-04-P3: Available mentors data tồn tại
  - ✅ TC-MENTOR-04-P4: Response time < 2000ms

### TC-MENTOR-05: Create Mentor
- **Method:** POST `/api/lab-admin/mentors`
- **Auth:** Bearer token (Lab Admin)
- **Body:** `{ "fullName": "...", "title": "...", "currentPosition": "...", ... }`
- **Test Cases:**
  - ✅ TC-MENTOR-05-P1: Status code là 200
  - ✅ TC-MENTOR-05-P2: `mentor_id` được lưu vào environment
  - ⚠️ TC-MENTOR-05-N1: Thiếu required fields → 400 Bad Request

### TC-MENTOR-06: Update Mentor
- **Method:** PUT `/api/lab-admin/mentors/{{mentor_id}}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-06-P1: Status code là 200
  - ✅ TC-MENTOR-06-P2: Response `success` là true
  - ✅ TC-MENTOR-06-P3: Updated mentor data tồn tại
  - ✅ TC-MENTOR-06-P4: Mentor ID không null
  - ✅ TC-MENTOR-06-P5: Response time < 2000ms
  - ⚠️ TC-MENTOR-06-N1: ID không tồn tại → 404 Not Found

### TC-MENTOR-07: Delete Mentor
- **Method:** DELETE `/api/lab-admin/mentors/{{mentor_id}}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-MENTOR-07-P1: Status code là 200
  - ✅ TC-MENTOR-07-P2: Response `success` là true
  - ✅ TC-MENTOR-07-P3: Response time < 2000ms
  - ⚠️ TC-MENTOR-07-N1: ID không tồn tại → 404 Not Found

---

## 5. TALENT ADMIN ENDPOINTS

### TC-TALENT-ADMIN-01: Get All Talents
- **Method:** GET `/api/lab-admin/talents?page=0&size=10`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TALENT-ADMIN-01-P1: Status code là 200
  - ✅ TC-TALENT-ADMIN-01-P2: Response `success` là true
  - ✅ TC-TALENT-ADMIN-01-P3: Talents data tồn tại
  - ✅ TC-TALENT-ADMIN-01-P4: Response time < 2000ms

### TC-TALENT-ADMIN-02: Get Talent By ID
- **Method:** GET `/api/lab-admin/talents/11`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TALENT-ADMIN-02-P1: Status code là 200
  - ✅ TC-TALENT-ADMIN-02-P2: Response `success` là true
  - ✅ TC-TALENT-ADMIN-02-P3: Talent data tồn tại
  - ✅ TC-TALENT-ADMIN-02-P4: Talent có trường `fullName`
  - ✅ TC-TALENT-ADMIN-02-P5: Response time < 2000ms

### TC-TALENT-ADMIN-03: Create Talent
- **Method:** POST `/api/lab-admin/talents`
- **Auth:** Bearer token (Lab Admin)
- **Body:** `{ "fullName": "Tran Test Talent", "studentId": "TEST001", "university": "UTH", "major": "Information Technology", "yearOfStudy": 3, "bio": "Test talent student" }`
- **Test Cases:**
  - ✅ TC-TALENT-ADMIN-03-P1: Status code là 200
  - ✅ TC-TALENT-ADMIN-03-P2: `talent_id` được lưu vào environment
  - ⚠️ TC-TALENT-ADMIN-03-N1: Thiếu required fields → 400 Bad Request

### TC-TALENT-ADMIN-04: Update Talent
- **Method:** PUT `/api/lab-admin/talents/{{talent_id}}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TALENT-ADMIN-04-P1: Status code là 200
  - ✅ TC-TALENT-ADMIN-04-P2: Response `success` là true
  - ✅ TC-TALENT-ADMIN-04-P3: Updated talent data tồn tại
  - ✅ TC-TALENT-ADMIN-04-P4: Talent `fullName` không null
  - ✅ TC-TALENT-ADMIN-04-P5: Response time < 2000ms

### TC-TALENT-ADMIN-05: Delete Talent
- **Method:** DELETE `/api/lab-admin/talents/{{talent_id}}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TALENT-ADMIN-05-P1: Status code là 200
  - ✅ TC-TALENT-ADMIN-05-P2: Response `success` là true
  - ✅ TC-TALENT-ADMIN-05-P3: Response time < 2000ms

---

## 6. TALENT ENDPOINTS (TalentController — 14 endpoints)

### TC-TL-01: Get Talent Profile
- **Method:** GET `/api/talent/profile`
- **Auth:** Bearer token (Talent role)
- **Test Cases:**
  - ✅ TC-TL-01-P1: Status code là 200
  - ✅ TC-TL-01-P2: Response `success` là true
  - ✅ TC-TL-01-P3: Profile có email của talent đang đăng nhập
  - ✅ TC-TL-01-P4: Response time < 2000ms
  - ⚠️ TC-TL-01-N1: Không có token → 401 Unauthorized

### TC-TL-02: Get Talent Dashboard
- **Method:** GET `/api/talent/dashboard`
- **Auth:** Bearer token (Talent role)
- **Test Cases:**
  - ✅ TC-TL-02-P1: Status code là 200
  - ✅ TC-TL-02-P2: Response `success` là true
  - ✅ TC-TL-02-P3: Dashboard data tồn tại
  - ⚠️ TC-TL-02-N1: Không có token → 401 Unauthorized

### TC-TL-03: Get Available Projects
- **Method:** GET `/api/talent/projects/available?page=0&size=20`
- **Auth:** Bearer token (Talent role)
- **Test Cases:**
  - ✅ TC-TL-03-P1: Status code là 200
  - ✅ TC-TL-03-P2: Response `success` là true
  - ✅ TC-TL-03-P3: Projects data tồn tại
  - ⚠️ TC-TL-03-N1: Không có token → 401 Unauthorized

### TC-TL-04: Get Project Detail
- **Method:** GET `/api/talent/projects/2`
- **Auth:** Bearer token (Talent role)
- **Test Cases:**
  - ✅ TC-TL-04-P1: Status code là 200
  - ✅ TC-TL-04-P2: Response `success` là true
  - ✅ TC-TL-04-P3: Project data tồn tại
  - ✅ TC-TL-04-P4: Project ID là 2
  - ⚠️ TC-TL-04-N1: ID không tồn tại → 404 Not Found

### TC-TL-05: Update Talent Profile
- **Method:** PUT `/api/talent/profile`
- **Auth:** Bearer token (Talent role)
- **Body:** `{ "fullName": "...", "studentId": "...", "faculty": "...", ... }`
- **Test Cases:**
  - ✅ TC-TL-05-P1: Status code là 200
  - ✅ TC-TL-05-P2: Response có data object
  - ✅ TC-TL-05-P3: Email khớp với input
  - ✅ TC-TL-05-P4: Full name khớp với input
  - ⚠️ TC-TL-05-N1: Thiếu required fields → 400 Bad Request

### TC-TL-06: Post Skills
- **Method:** POST `/api/talent/skills`
- **Auth:** Bearer token (Talent role)
- **Body (đã sửa):** `{ "skillName": "Java", "skillCategory": "Programming", "proficiencyLevel": "INTERMEDIATE", "yearsOfExperience": 2.0 }`
- **DTO:** `TalentSkillDTO` — fields: `skillName`, `skillCategory`, `proficiencyLevel` (enum: BEGINNER/INTERMEDIATE/ADVANCED/EXPERT), `yearsOfExperience` (Double)
- **Lỗi đã phát hiện:** Body gốc dùng snake_case (`skill_name`, `skill_category`, ...) → 400 Bad Request
- **Sửa:** Đổi sang camelCase theo DTO thực tế
- **Test Cases:**
  - ✅ TC-TL-06-P1: Status code là 200 hoặc 201
  - ✅ TC-TL-06-P2: Response `success` là true
  - ✅ TC-TL-06-P3: `skillName` không null
  - ✅ TC-TL-06-P4: `skillName` khớp với input ("Java")
  - ✅ TC-TL-06-P5: `proficiencyLevel` là giá trị enum hợp lệ
  - ⚠️ TC-TL-06-N1: `proficiencyLevel` không hợp lệ → 400 Bad Request
  - ⚠️ TC-TL-06-N2: Thiếu `skillName` → 400 Bad Request

---

## 7. TRANSPARENCY REPORT ENDPOINTS (TransparencyReportController — 8 endpoints)

> **Lưu ý:** 8 endpoint này chưa có trong collection hiện tại. Cần bổ sung thêm.

### TC-TR-01: Get All Transparency Reports
- **Method:** GET `/api/lab-admin/transparency-reports`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-01-P1: Status code là 200
  - ✅ TC-TR-01-P2: Response `success` là true
  - ✅ TC-TR-01-P3: Reports data tồn tại

### TC-TR-02: Get Transparency Report By ID
- **Method:** GET `/api/lab-admin/transparency-reports/{reportId}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-02-P1: Status code là 200
  - ✅ TC-TR-02-P2: Report data tồn tại
  - ⚠️ TC-TR-02-N1: ID không tồn tại → 404 Not Found

### TC-TR-03: Create Transparency Report
- **Method:** POST `/api/lab-admin/transparency-reports`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-03-P1: Status code là 200 hoặc 201
  - ✅ TC-TR-03-P2: Report được tạo thành công

### TC-TR-04: Publish Transparency Report
- **Method:** POST `/api/lab-admin/transparency-reports/{reportId}/publish`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-04-P1: Status code là 200
  - ✅ TC-TR-04-P2: Report status chuyển sang PUBLISHED

### TC-TR-05: Delete Transparency Report
- **Method:** DELETE `/api/lab-admin/transparency-reports/{reportId}`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-05-P1: Status code là 200
  - ✅ TC-TR-05-P2: Response `success` là true
  - ⚠️ TC-TR-05-N1: ID không tồn tại → 404 Not Found

### TC-TR-06: Export Report to Excel
- **Method:** GET `/api/lab-admin/transparency-reports/{reportId}/export/excel`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-06-P1: Status code là 200
  - ✅ TC-TR-06-P2: Content-Type là application/vnd.ms-excel hoặc application/octet-stream

### TC-TR-07: Archive Transparency Report
- **Method:** POST `/api/lab-admin/transparency-reports/{reportId}/archive`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-07-P1: Status code là 200
  - ✅ TC-TR-07-P2: Report status chuyển sang ARCHIVED

### TC-TR-08: Download Transparency Report
- **Method:** GET `/api/lab-admin/transparency-reports/{reportId}/download`
- **Auth:** Bearer token (Lab Admin)
- **Test Cases:**
  - ✅ TC-TR-08-P1: Status code là 200
  - ✅ TC-TR-08-P2: Response có file content

---

## TỔNG KẾT TEST CASES

| Controller | Số endpoint | Số test case |
|---|---|---|
| Auth | 3 | 9 |
| User | 1 | 3 |
| Dashboard | 4 | 16 |
| Mentor Admin | 7 | 27 |
| Talent Admin | 5 | 17 |
| Talent (TalentController) | 6 (trong collection) | 24 |
| TransparencyReport | 8 (chưa có trong collection) | 18 |
| **TỔNG** | **34** | **114** |

> **Ghi chú:** Collection hiện tại có 26 requests. 8 endpoint TransparencyReportController chưa được thêm vào collection.
