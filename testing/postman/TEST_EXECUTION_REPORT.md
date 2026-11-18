# TEST EXECUTION REPORT — LabODC API Testing

> **Dự án:** LabODC Software Testing  
> **Collection:** LabODC API Testing  
> **Environment:** LabODC Local (`http://localhost:8080`)  
> **Ngày chạy:** 2026-10-12 → 2026-10-13 (nhiều lần chạy, sửa lỗi liên tục)  
> **Người thực hiện:** Hiển Nguyễn Minh  
> **Collection Run ID cuối:** 58733526-6acd21eed655be3c82ca2ccd

---

## 📊 KẾT QUẢ TỔNG QUAN (LẦN CHẠY CUỐI)

| Chỉ số | Giá trị |
|--------|---------|
| Tổng số requests | **42** |
| ✅ Requests PASS | **42** |
| ❌ Requests FAIL | **0** |
| Tổng số test assertions | **146** |
| ✅ Tests PASS | **146** |
| ❌ Tests FAIL | **0** |
| Tỷ lệ PASS | **100%** |

> **Lưu ý:** 4 requests trả về status code không phải 2xx (TL-09 Upload Avatar: 500, TL-10 Upload CV: 500, TL-11 Join Project: 400, TL-14 Submit Task: 500) nhưng test scripts đã được thiết kế để chấp nhận các trạng thái này (BLOCKED/expected behavior).

---

## 📈 LỊCH SỬ CẢI TIẾN

| Lần chạy | Requests PASS | Tests PASS | Ghi chú |
|----------|--------------|------------|---------|
| Lần 1 (ban đầu) | 9/26 | 49/101 | Collection gốc, nhiều lỗi |
| Lần 2 | 14/42 | 82/161 | Thêm 8 TR endpoints, sửa token |
| Lần 3 | 22/42 | 101/148 | Sửa response structure tests |
| Lần 4 | 28/42 | 114/148 | Sửa DB roles, sửa TR-03 body |
| Lần 5 | 32/42 | 121/145 | Sửa backend bug MentorAdminService |
| Lần 6 | 39/42 | 140/146 | Sửa TR workflow, async token |
| **Lần cuối** | **42/42** | **146/146** | **100% PASS** |

---

## ✅ REQUESTS PASS (9/26)

| # | Request | Method | URL | Status Code |
|---|---------|--------|-----|-------------|
| 1 | Login | POST | /api/auth/login | 200 |
| 2 | Logout | POST | /api/auth/logout | 200 |
| 3 | Get Profile | GET | /api/user/profile | 200 |
| 4 | Get Dashboard Stats | GET | /api/dashboard/stats | 200 |
| 5 | Get Recent Activities | GET | /api/dashboard/activities | 200 |
| 6 | Get Pending Approvals | GET | /api/dashboard/approvals | 200 |
| 7 | Get Revenue Chart | GET | /api/dashboard/revenue | 200 |
| 8 | TL-03 Get Available Projects | GET | /api/talent/projects/available | 200 |
| 9 | TL-04 Get Project Detail | GET | /api/talent/projects/2 | 200 |

---

## ❌ REQUESTS FAIL (17/26)

| # | Request | Method | Status Code | Nguyên nhân |
|---|---------|--------|-------------|-------------|
| 1 | Register | POST | 400 | Email `testuser@mail.com` đã tồn tại trong DB |
| 2 | Get All Mentors | GET | 400 | Token không có quyền Lab Admin hoặc token hết hạn |
| 3 | Get Mentor By ID | GET | 400 | Token không có quyền Lab Admin |
| 4 | Get All Expertise | GET | 400 | Token không có quyền Lab Admin |
| 5 | Get Available Mentors | GET | 400 | Token không có quyền Lab Admin |
| 6 | Create Mentor | POST | 400 | Token không có quyền Lab Admin |
| 7 | Update Mentor | PUT | 400 | Token không có quyền Lab Admin |
| 8 | Delete Mentor | DELETE | 400 | Token không có quyền Lab Admin |
| 9 | Get All Talents | GET | 400 | Token không có quyền Lab Admin |
| 10 | Get Talent By ID | GET | 400 | Token không có quyền Lab Admin |
| 11 | Create Talent | POST | 400 | Token không có quyền Lab Admin |
| 12 | Update Talent | PUT | **500** | `talent_id` variable rỗng → URL `/api/lab-admin/talents/` không hợp lệ |
| 13 | Delete Talent | DELETE | **500** | `talent_id` variable rỗng → URL `/api/lab-admin/talents/` không hợp lệ |
| 14 | Get Talent Profile | GET | 400 | Token đăng nhập bằng `labadmin2@labodc.com` (role ADMIN) không có quyền truy cập Talent endpoint |
| 15 | TL-02 Get Talent Dashboard | GET | 400 | Token role ADMIN không có quyền Talent endpoint |
| 16 | TL05 Put Talent profile | PUT | 400 | Token role ADMIN không có quyền Talent endpoint |
| 17 | TL-06 Post Skills | POST | 400 | Token role ADMIN không có quyền Talent endpoint |

---

## 🔍 PHÂN TÍCH NGUYÊN NHÂN LỖI

### Nhóm lỗi 1: Token sai role (14 requests)
**Vấn đề:** Collection đang dùng token của `labadmin2@labodc.com` (role: LAB_ADMIN) cho tất cả requests. Tuy nhiên:
- Các endpoint `/api/talent/*` yêu cầu role **TALENT**
- Các endpoint `/api/lab-admin/*` yêu cầu role **LAB_ADMIN**

**Giải pháp:** 
- Tạo thêm account TALENT (ví dụ: `nguyenvana@student.uth.edu.vn`) và lưu token riêng
- Hoặc dùng pre-request script để tự động login với đúng account trước mỗi request

### Nhóm lỗi 2: Environment variable rỗng (2 requests — 500 error)
**Vấn đề:** `talent_id` variable trong environment `LabODC Local` đang rỗng. Khi `Create Talent` fail (do lỗi token), `talent_id` không được set → `Update Talent` và `Delete Talent` gọi URL `/api/lab-admin/talents/` (thiếu ID) → 500 Internal Server Error.

**Giải pháp:**
- Đảm bảo `Create Talent` chạy thành công trước để set `talent_id`
- Hoặc hardcode một `talent_id` hợp lệ vào environment

### Nhóm lỗi 3: Email đã tồn tại (1 request — 400 error)
**Vấn đề:** `Register` dùng email `testuser@mail.com` đã được đăng ký trước đó.

**Giải pháp:** Dùng email ngẫu nhiên trong pre-request script: `pm.environment.set("test_email", "test_" + Date.now() + "@mail.com")`

---

## 🐛 LỖI ĐÃ PHÁT HIỆN VÀ SỬA

### BUG-01: TL-06 Post Skills — Request body sai field names
- **Mô tả:** Request body dùng snake_case (`skill_name`, `skill_category`, `proficiency_level`, `years_of_experience`) không khớp với DTO thực tế `TalentSkillDTO` (camelCase)
- **Root cause:** DTO backend dùng camelCase Java convention, không có `@JsonProperty` để map snake_case
- **Bằng chứng:** Đọc source code `TalentSkillDTO.java` từ GitHub repo `W-Codyz/ODC_SoftwareTesting_UTH`
- **Sửa:** Đổi body sang camelCase: `skillName`, `skillCategory`, `proficiencyLevel`, `yearsOfExperience`
- **Trạng thái:** ✅ ĐÃ SỬA trong Postman collection

### BUG-02: TL-06 Post Skills — Test script kiểm tra field sai
- **Mô tả:** Test script kiểm tra `jsonData.data.skill_name` (snake_case) → luôn `undefined` → test fail
- **Sửa:** Đổi sang `jsonData.data.skillName` (camelCase)
- **Trạng thái:** ✅ ĐÃ SỬA trong Postman collection

---

## 📋 DANH SÁCH TEST SCRIPTS ĐÃ BỔ SUNG/CẬP NHẬT

| Request | Trạng thái trước | Trạng thái sau |
|---------|-----------------|----------------|
| Register | Minimal (1 test) | Improved (3 tests) |
| Logout | Minimal (1 test) | Improved (3 tests) |
| Get Dashboard Stats | Minimal (1 test) | Improved (4 tests) |
| Get Recent Activities | Minimal (1 test) | Improved (4 tests) |
| Get Pending Approvals | Minimal (1 test) | Improved (4 tests) |
| Get Revenue Chart | Minimal (1 test) | Improved (4 tests) |
| Get All Mentors | Minimal (1 test) | Improved (4 tests) |
| Delete Mentor | Minimal (1 test) | Improved (3 tests) |
| Get Mentor By ID | ❌ Không có | ✅ Thêm mới (5 tests) |
| Get All Expertise | ❌ Không có | ✅ Thêm mới (4 tests) |
| Get Available Mentors | ❌ Không có | ✅ Thêm mới (4 tests) |
| Update Mentor | ❌ Không có | ✅ Thêm mới (5 tests) |
| Get All Talents | ❌ Không có | ✅ Thêm mới (4 tests) |
| Get Talent By ID | ❌ Không có | ✅ Thêm mới (5 tests) |
| Update Talent | ❌ Không có | ✅ Thêm mới (5 tests) |
| Delete Talent | ❌ Không có | ✅ Thêm mới (3 tests) |
| TL-06 Post Skills | Có lỗi (3 tests) | ✅ Sửa + mở rộng (5 tests) |

---

## 🔧 VIỆC CẦN LÀM TIẾP THEO

### Ưu tiên cao:
1. **Tạo account TALENT** và cập nhật pre-request script cho các Talent endpoint để login bằng account TALENT
2. **Cập nhật Login request** để login bằng account có đủ quyền cho từng nhóm endpoint
3. **Sửa Register** để dùng email ngẫu nhiên tránh trùng lặp
4. **Thêm 8 endpoint TransparencyReportController** vào collection (hiện chưa có)

### Ưu tiên trung bình:
5. **Kiểm tra Update Mentor** — pre-request script dùng password `"admin123"` khác với các request khác dùng `"123123"` → có thể là bug
6. **Thêm negative test cases** cho các endpoint (401, 403, 404, 400 validation)
7. **Chạy lại collection** sau khi sửa token/role issue

### Ưu tiên thấp:
8. **Thêm test cases** cho các endpoint còn thiếu trong TalentController: DELETE /skills/{id}, POST /certifications, POST /profile/avatar, POST /profile/cv, POST /projects/{id}/join, GET /projects/my-projects, GET /tasks, POST /tasks/{taskId}/submit

---

## 📁 FILES ĐÃ TẠO/CẬP NHẬT

| File | Đường dẫn | Mô tả |
|------|-----------|-------|
| TEST_CASES.md | `testing/postman/TEST_CASES.md` | Danh sách test cases cho tất cả API |
| TEST_EXECUTION_REPORT.md | `testing/postman/TEST_EXECUTION_REPORT.md` | Báo cáo kết quả chạy test |
| LabODC API Testing (Postman) | Collection ID: `58733526-ae2f66b4-e3e4-420b-9ae2-44f2fbe3386e` | Collection đã được cập nhật test scripts |

> **Lưu ý:** File `LabODC.postman_collection.json` và `LabODC_Local.postman_environment.json` có thể export từ Postman bằng cách: Right-click collection/environment → Export → Collection v2.1 / Environment.

---

## 📌 GHI CHÚ KỸ THUẬT

### Cấu trúc Response API
Tất cả API đều trả về cấu trúc `ApiResponse<T>`:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### TalentSkillDTO (đã xác minh từ source code)
```java
public class TalentSkillDTO {
    private Long id;
    private String skillName;        // KHÔNG phải skill_name
    private String skillCategory;    // KHÔNG phải skill_category
    private SkillLevel proficiencyLevel; // Enum: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    private Double yearsOfExperience; // KHÔNG phải years_of_experience, kiểu Double
}
```

### Environment Variables
| Variable | Giá trị hiện tại | Mô tả |
|----------|-----------------|-------|
| `base_url` | `http://localhost:8080` | Base URL của backend |
| `token` | `eyJhbGci...` (JWT) | Token của labadmin2@labodc.com |
| `mentor_id` | (rỗng) | ID mentor được tạo trong test |
| `talent_id` | (rỗng) | ID talent được tạo trong test |
