# Member 5 - Postman Test Plan

**Người thực hiện:** Nguyễn Minh Hiển  
**Module Test:** FR-TL-002, FR-MEN-003, FR-ENT-001  
**Công cụ:** Postman  
**Nguồn yêu cầu:** `docs/SRS_LabOdc.md`  
**Ngày thực hiện:** [điền ngày chạy test]  
**Môi trường:** [local/staging, base URL, version/commit]

## 1. Phạm vi và tài liệu liên quan

| FR | Chức năng | Testcase tham khảo | Postman folder |
|---|---|---|---|
| FR-TL-002 | Talent Leader nộp báo cáo nhóm | [TC_Talent_Leader_Submit_Report.md](../talent/TC_Talent_Leader_Submit_Report.md) | `01 - FR-TL-002 - Submit Team Report` |
| FR-MEN-003 | Mentor đánh giá Talent | [TC_Mentor_Evaluate_Talent.md](../mentor-portal/TC_Mentor_Evaluate_Talent.md) | `02 - FR-MEN-003 - Evaluate Talents` |
| FR-ENT-001 | Enterprise quản lý hồ sơ công ty | [TC_Enterprise_Profile.md](../enterprise/TC_Enterprise_Profile.md) | `03 - FR-ENT-001 - Manage Enterprise Profile` |

### Tình trạng route theo source code đã rà soát

- FR-TL-002 định nghĩa `/api/talent-leader/...`, nhưng hiện không thấy controller route tương ứng trong backend.
- FR-ENT-001 định nghĩa `/api/enterprise/profile`, nhưng hiện không thấy route này trong `EnterprisePortalController`.
- FR-MEN-003 có các route GET/POST trong `MentorPortalController`.

Vì vậy FR-TL-002 và FR-ENT-001 có khả năng trả `404` khi chạy trên phiên bản hiện tại. Ghi đúng kết quả thực tế; không sửa expected result để biến lỗi thành pass. Kiểm tra lại source/nhánh trước khi mở Jira để tránh báo lỗi đã được sửa ở phiên bản khác.

## 2. Chuẩn bị trước khi test

1. Dùng database và tài khoản test; không dùng production.
2. Khởi động backend và xác nhận `{{base_url}}/api/auth/test` trả `200`.
3. Import collection `postman/member-5-functional-testing/Member5-Functional-Tests.postman_collection.json`.
4. Import environment `postman/member-5-functional-testing/Member5-Local.postman_environment.json`, rồi chọn environment này ở góc trên bên phải Postman.
5. Điền `base_url` nếu backend không chạy ở `http://localhost:8080`.
6. Điền email/mật khẩu của các tài khoản Mentor, Talent Leader và Enterprise vào environment. Không ghi password/token vào testcase, ảnh chụp Jira, hoặc commit.
7. Login lần lượt bằng các request trong `00 - Authentication`; script sẽ lưu token vào environment tương ứng.
8. Dùng `Login Talent Leader` với đúng tài khoản đang là Team Leader của project cần test.
9. Gọi `Login Mentor` và request `Get mentor projects`; lấy project ID được Mentor phụ trách. Gọi `Get talents in project` và lấy Talent ID ACTIVE. Điền hai ID vào environment.
10. Chọn kỳ báo cáo và kỳ đánh giá hợp lệ, chưa được dùng trước đó. Nếu gọi POST thành công, dữ liệu có thể được lưu lâu dài; collection không tự xóa dữ liệu.
11. Trước khi thử PUT profile Enterprise, chạy GET profile để lưu lại dữ liệu gốc. Chỉ thử PUT trên tài khoản test và khôi phục dữ liệu gốc sau khi test.
12. Không bấm “Run collection” cho toàn bộ collection. Gửi từng request một, đọc response trước khi chạy request ghi dữ liệu.

## 3. Test case FR-TL-002 - Nộp báo cáo nhóm

| TC ID | Request / dữ liệu chính | Kết quả mong đợi theo SRS | Kết quả thực tế |
|---|---|---|---|
| TC-TL002-PM-01 | GET danh sách báo cáo của project với Talent Leader hợp lệ | `200`, trả danh sách báo cáo | [điền] |
| TC-TL002-PM-02 | POST báo cáo hợp lệ, `overallProgress=45`, kỳ chưa trùng | `201`, trạng thái `SUBMITTED`, có report ID | [điền] |
| TC-TL002-PM-03 | GET báo cáo vừa tạo theo ID | `200`, dữ liệu khớp POST (kiểm tra persistence) | [điền] |
| TC-TL002-PM-04 | POST với `overallProgress=-1` | `400`, từ chối giá trị ngoài `[0,100]` | [điền] |
| TC-TL002-PM-05 | GET không gửi token | `401` theo yêu cầu xác thực | [điền] |
| TC-TL002-PM-06 | POST với `overallProgress=101` | `400`, từ chối giá trị ngoài `[0,100]` | [điền] |
| TC-TL002-PM-07 | POST với kỳ sai định dạng, ví dụ `2026-13` | `400`, báo kỳ không hợp lệ | [điền] |
| TC-TL002-PM-08 | POST cùng project và kỳ báo cáo đã nộp | Từ chối báo cáo trùng; ghi lại status/message thực tế | [điền] |
| TC-TL002-PM-09 | Gọi POST bằng Talent không phải Leader của project | `403` theo phân quyền | [điền] |

## 4. Test case FR-MEN-003 - Mentor đánh giá Talent

| TC ID | Request / dữ liệu chính | Kết quả mong đợi theo testcase | Kết quả thực tế |
|---|---|---|---|
| TC-MEN003-PM-01 | GET `/api/mentor/projects` bằng Mentor | `200`, trả project được giao | [điền] |
| TC-MEN003-PM-02 | GET `/projects/{projectId}/talents` | `200`, có Talent ACTIVE | [điền] |
| TC-MEN003-PM-03 | POST evaluation, điểm `8.5`, kỳ chưa trùng | `200`, trả evaluation đã tạo | [điền] |
| TC-MEN003-PM-04 | GET evaluations sau POST | `200`, tìm thấy đúng Talent/kỳ/điểm (persistence) | [điền] |
| TC-MEN003-PM-05 | POST với `overallScore=-0.1` | `400`, từ chối điểm dưới 0 | [điền] |
| TC-MEN003-PM-06 | POST với `overallScore=10.1` | `400`, từ chối điểm trên 10 | [điền] |
| TC-MEN003-PM-07 | GET evaluations không gửi token | `401` theo yêu cầu xác thực | [điền] |
| TC-MEN003-PM-08 | Talent hoặc Mentor không được giao gọi API | `403` theo phân quyền | [điền] |
| TC-MEN003-PM-09 | POST trùng Talent và evaluation period | Từ chối trùng kỳ; ghi status/message thực tế | [điền] |

**Lưu ý:** Source code hiện có xử lý chuẩn hóa điểm ở một số luồng. Nếu điểm ngoài `[0,10]` bị kẹp về biên thay vì trả `400`, lưu response làm bằng chứng và so sánh với SRS/testcase.

## 5. Test case FR-ENT-001 - Quản lý hồ sơ doanh nghiệp

| TC ID | Request / dữ liệu chính | Kết quả mong đợi theo SRS | Kết quả thực tế |
|---|---|---|---|
| TC-ENT001-PM-01 | GET `/api/enterprise/profile` bằng Enterprise | `200`, trả thông tin hồ sơ hiện tại | [điền] |
| TC-ENT001-PM-02 | PUT profile với dữ liệu hợp lệ trên tài khoản test | `200`, trả hồ sơ cập nhật | [điền] |
| TC-ENT001-PM-03 | GET sau PUT | `200`, dữ liệu đã cập nhật được lưu | [điền] |
| TC-ENT001-PM-04 | GET không gửi token | `401` theo yêu cầu xác thực | [điền] |
| TC-ENT001-PM-05 | POST logo JPG/PNG nhỏ hơn 5 MB | `200`, trả logo URL | [điền] |
| TC-ENT001-PM-06 | POST logo sai loại file hoặc vượt 5 MB | Bị từ chối; ghi status/message thực tế | [điền] |

SRS hiện không mô tả đầy đủ status/error cho mọi trường hợp validation của FR-ENT-001. Với những ca đó, ghi actual result và đối chiếu thêm với tiêu chí của giảng viên/nhóm trước khi kết luận bug.

## 6. Ghi nhận kết quả và bằng chứng

Mỗi lần chạy, điền cột “Kết quả thực tế” và lưu:

- TC ID và thời điểm chạy.
- Method + URL (che token/query nhạy cảm nếu có).
- Request body đã gửi, sau khi xóa password/token/thông tin cá nhân.
- HTTP status, response body, response time.
- Ảnh chụp Postman có tên request, status và response; không để lộ Authorization header.
- Environment/version/commit đang test.

Không ghi kết quả là PASS nếu chưa thực sự gửi request. Nếu status/response khác expected, đánh dấu FAIL hoặc BLOCKED và giữ nguyên bằng chứng.

## 7. Quy trình tạo Jira bug khi xác nhận lỗi

1. Chạy lại đúng testcase một lần để xác nhận lỗi có thể tái hiện; không gửi lại request ghi dữ liệu nếu chưa chắc tác động.
2. Kiểm tra `base_url`, role/token, project ID, Talent ID và dữ liệu test để loại trừ lỗi cấu hình.
3. Mở Jira project của lớp, chọn **Create** → loại issue **Bug** (nếu được cấu hình).
4. Đặt Summary theo mẫu: `[BUG][FR-MEN-003][TC-MEN003-PM-05] Điểm âm được chấp nhận thay vì trả 400`.
5. Điền Description theo mẫu:

   ```text
   Module/FR:
   Test Case ID:
   Environment / build:
   Preconditions:
   Steps to reproduce:
   1.
   2.
   3.

   Request (đã xóa token/password):
   Expected result:
   Actual result:
   HTTP status:
   Reproducibility: __/__
   Severity/Priority:
   Evidence: [ảnh Postman hoặc file response đã loại bỏ dữ liệu nhạy cảm]
   ```

6. Chọn Severity/Priority theo quy ước nhóm; không tự gán mức Critical nếu chưa có tiêu chí.
7. Không đính kèm environment export có credentials, JWT, password, dữ liệu cá nhân hoặc production data.
8. Tạo issue và ghi Jira key vào cột “Jira” của testcase execution report. Một bug nên gắn với một hành vi sai rõ ràng; gom các ca cùng một nguyên nhân chỉ khi nhóm/giảng viên chấp thuận.

## 8. Jira tracking

| TC ID | Kết quả | Jira Key | Ghi chú |
|---|---|---|---|
| [điền TC ID] | PASS / FAIL / BLOCKED / NOT RUN | [điền] | [điền] |
