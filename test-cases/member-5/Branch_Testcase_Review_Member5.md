# Báo cáo rà soát branch testcase - Member 5

- **Ngày rà soát:** 17/11/2026
- **Branch đang checkout:** `fix/LABODC-99-talent-email-domain`
- **Phạm vi:** Các branch test-case/testcase đang có trong local refs và cached `origin/*`; testcase của FR-TL-002, FR-MEN-003, FR-ENT-001; báo cáo Postman Member 5.
- **Thao tác Git:** Chỉ đọc. Không fetch, checkout, commit hoặc push.

## 1. Kết luận chính

1. Có testcase và execution report cho **FR-TL-002** và **FR-MEN-003** trong repo. Các tài liệu hiện hành trên `origin/main` là:
   - [TC_Mentor_Evaluate_Talent.md](../mentor-portal/TC_Mentor_Evaluate_Talent.md)
   - [Report_Mentor_Evaluate_Talent.md](../mentor-portal/Report_Mentor_Evaluate_Talent.md)
   - [TC_Talent_Leader_Submit_Report.md](../talent/TC_Talent_Leader_Submit_Report.md)
   - [Report_Talent_Leader_Submit_Report.md](../talent/Report_Talent_Leader_Submit_Report.md)
2. Khi rà soát ban đầu chưa có testcase riêng cho **FR-ENT-001 – Manage Enterprise Profile**. Trong follow-up này đã bổ sung [TC_Enterprise_Profile.md](../enterprise/TC_Enterprise_Profile.md) theo SRS và mẫu repo; đây là thiết kế mới, chưa chạy.
3. Source hiện tại có các route chính của FR-MEN-003 trong `MentorPortalController`. Không thấy route `/api/talent-leader/...` trong `TalentController` hoặc `/api/enterprise/profile` trong `EnterprisePortalController`.
4. Báo cáo Postman gần nhất ghi 3/15 test pass; 12 request nhận 401 vì token không có. Các ca cần đăng nhập nên được ghi **BLOCKED/Chưa kiểm tra được**, không kết luận chức năng nghiệp vụ thất bại.
5. Branch `testcase/LABODC-88-submit-report-and-evaluate-talent` là branch local cũ, lệch nhiều commit so với `origin/main`. Không nên push/merge nguyên branch này; các testcase mục tiêu đã có trong cây hiện tại của `origin/main`.

## 2. Branch liên quan trực tiếp

| Branch/ref | Tình trạng so với cached `origin/main` | Nội dung liên quan | Nhận xét |
|---|---:|---|---|
| `testcase/LABODC-118-submit-report-and-evaluate-talent` và `origin/testcase/LABODC-118-submit-report-and-evaluate-talent` | Cùng trỏ `c738516`; 0 commit ahead, 85 behind | Commit về testcase, state-transition table và decision table cho FR-TL-002, FR-MEN-003 | Commit đã nằm trong lịch sử `origin/main`; dùng các tài liệu hiện có trên `origin/main`, không cần đẩy branch cũ. |
| `testcase/LABODC-107-team-report-e2e` và `origin/testcase/LABODC-107-team-report-e2e` | Cùng trỏ `7e3fcbe`; 0 ahead, 74 behind | E2E cho FR-TL-002, gồm `e2e-tests/team-report/submit_report_test.js` | Branch cũ; có thể tham khảo ý tưởng E2E nhưng không phải bằng chứng chạy Postman hiện tại. |
| `testcase/LABODC-88-submit-report-and-evaluate-talent` | Commit `8ef2fe3`; 1 ahead, 86 behind | Tài liệu FR-MEN-003 và FR-TL-002, cùng các thay đổi tổ chức testcase | Branch chỉ có ở local với tên này; cây branch thiếu nhiều testcase có trên `origin/main`. Không push nguyên branch. |
| `origin/testcase/LABODC-89-mentor-submit-report` | 1 ahead, 87 behind | FR-MEN-004 – Mentor nộp báo cáo | Module khác FR-MEN-003; hữu ích làm mẫu báo cáo execution chi tiết. |
| `origin/test-case/LABODC-81-mentor-list_project` | 1 ahead | Mentor xem danh sách project | Chỉ tham khảo; không phải testcase đánh giá talent. |
| `origin/test-case/LABODC-82-mentor-invitations` | 2 ahead | Mentor invitations | Không thuộc ba module được giao. |
| `origin/testcase/labodc-141-module-FR-MEN-002` | 5 ahead, 3 behind | FR-MEN-002 – Mentor task breakdown | Module Mentor lân cận, nhưng không thay thế FR-MEN-003. |

**Tên branch dễ nhầm:** `origin/testcase/LABODC-88-lab-admin-manage-projects` là branch về Lab Admin, khác với branch local `testcase/LABODC-88-submit-report-and-evaluate-talent`.

Trong 25 tên branch test-case/testcase khác nhau ở các refs hiện có, phần còn lại chủ yếu thuộc Auth, Talent profile/join/dashboard, Lab Admin, invitations, fund allocation hoặc các FR khác; không phải bằng chứng hoàn tất FR-ENT-001.

## 3. Đối chiếu testcase với source

### FR-MEN-003 – Evaluate Talents

- Tài liệu thiết kế có phân hoạch lớp tương đương, giá trị biên, role/assignment, Talent, evaluation period, overall score và criteria score.
- Execution report branch ghi 16 test case, 14 PASS và 2 FAIL; hai ca lỗi là điểm ngoài miền `[0,10]` bị chuẩn hóa thay vì bị từ chối.
- Có một điểm không nhất quán trong report: TC-MEN003-12 ghi expected `409`, actual `200`, nhưng status lại là `PASS`. Cần đối chiếu yêu cầu duplicate-period để sửa expected hoặc status.
- Source có các route Mentor projects, project talents, evaluations GET/POST trong `MentorPortalController`.

### FR-TL-002 – Submit Team Report

- Tài liệu thiết kế chi tiết gồm lớp tương đương, giá trị biên, quyền Leader, loại báo cáo, kỳ báo cáo và progress.
- Execution report cũ ghi 15/15 request nhận `404` do thiếu route. Test “No token” trong report đó cũng nhận `404` thay vì expected `401`.
- Source `TalentController` hiện không có route `/api/talent-leader/...`; do đó chưa thể kết luận các quy tắc validation nghiệp vụ chỉ từ các request này. Trước tiên cần xác nhận route trên đúng branch/build; nếu route thực sự thiếu, ghi riêng lỗi route.

### FR-ENT-001 – Manage Enterprise Profile

- Không tìm thấy testcase branch cũ tương đương `TC_Enterprise_Profile`; testcase Enterprise có sẵn trước đó tập trung vào Submit Project. Follow-up hiện đã bổ sung [TC_Enterprise_Profile.md](../enterprise/TC_Enterprise_Profile.md) theo SRS.
- Kế hoạch Postman Member 5 có các ca GET/PUT profile, upload logo và no-token, nhưng `EnterprisePortalController` hiện không có `/api/enterprise/profile`.
- Kết quả 401 khi không có token chỉ kiểm tra được yêu cầu xác thực; không chứng minh route hồ sơ doanh nghiệp tồn tại.

## 4. Đối chiếu với bộ Postman và báo cáo Member 5

- [Kế hoạch Postman Member 5](TC_Member5_Postman_Test_Plan.md) có 24 ca được liệt kê: 9 FR-TL-002, 9 FR-MEN-003, 6 FR-ENT-001.
- [Collection Postman Member 5](../../postman/member-5-functional-testing/Member5-Functional-Tests.postman_collection.json) hiện có 15 request chức năng: 5 FR-TL-002, 6 FR-MEN-003, 4 FR-ENT-001; cộng thêm 3 request đăng nhập. Như vậy collection chưa bao phủ đủ kế hoạch.
- [Báo cáo JSON](../../test-report-member5.json) và [báo cáo Markdown](../../test-report-member5.md) ghi 3/15 PASS và 12/15 FAIL. Ba ca PASS là kiểm tra không có token; 12 ca còn lại nhận 401 do login không cấp token.
- 401 do thiếu token không xác nhận API nghiệp vụ bị lỗi; đánh dấu các ca đó **BLOCKED** cho đến khi login hoạt động và chạy lại với token hợp lệ.
- Login từng trả lỗi JDBC về `users.last_login_ip`. Dù đã thêm cột trong pgAdmin, lần thử login sau đó vẫn hiển thị cùng lỗi; vì vậy tình trạng backend/database thực tế chưa được xác nhận là đã khắc phục. Báo cáo cần giữ nguyên đây là blocker, không ghi login PASS.

## 5. Đề xuất bước tiếp theo

1. Giữ bộ tài liệu FR-TL-002 và FR-MEN-003 trên `origin/main` làm nguồn testcase chính; dùng báo cáo branch như tài liệu tham khảo, không push branch cũ.
2. Giải quyết blocker đăng nhập trên đúng database mà backend đang dùng; sau đó login Mentor/Talent Leader/Enterprise và lưu token trong Postman environment.
3. Chạy lại từng request có xác thực; phân loại rõ `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.
4. Với FR-TL-002 và FR-ENT-001, xác nhận route trên đúng build sau khi có token trước khi kết luận lỗi API.
5. Hoàn tất xác nhận các điểm mở trong testcase FR-ENT-001, nhất là quyền cập nhật `taxCode` và hành vi khi Enterprise chưa có hồ sơ.
6. Sửa mâu thuẫn expected/actual/status trong TC-MEN003-12 và hoàn thiện collection để bao phủ các ca còn thiếu.

## 6. Giới hạn rà soát và thay đổi

- Branches được rà soát là refs có sẵn tại local; không fetch để làm mới remote refs.
- Worktree vốn đã có nhiều thay đổi/untracked files. Các thay đổi không liên quan được giữ nguyên.
- Bổ sung testcase thiết kế FR-ENT-001 và liên kết vào kế hoạch Member 5; cập nhật báo cáo rà soát để phản ánh testcase mới. Không sửa testcase hiện có của FR-TL-002/FR-MEN-003.
- Không checkout branch, commit hoặc push.
