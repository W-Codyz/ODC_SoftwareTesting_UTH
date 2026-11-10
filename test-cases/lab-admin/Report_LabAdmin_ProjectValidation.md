# Test Execution Report: FR-LAB-002 - Quản lý dự án (Validate Project và Assign Mentor)

**Module:** Lab Administrator
**Chức năng:** Project Validation (list, detail, approve, reject, assign-mentor)  
**Người thực hiện:** Nguyễn Duy Đức  
**Ngày thực hiện:** 08/11/2026  
**Môi trường test:** Postman, 15 - ProjectValidation, LabODC Local (`http://localhost:8080`)  
**Tham chiếu test case:** test-cases/lab-admin/TC_LabAdmin_ProjectValidation.md  


## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---|
| Tổng số test case | 69 |
| Passed | 19 |
| Failed | 50 |
| Cần xác minh body | 0 |
| Blocked / chạy lại | 0 |
| Pass rate (trên 69 TC) | 27.5% |

Quy ước Status:

- **PASS / FAIL**: so status code thực tế với Expected trong file design.
- **CẦN XÁC MINH**: status code khớp Expected nhưng Expected còn điều kiện về body hoặc DB mà file export không có. Mở request trong Postman hoặc kiểm tra DB để chốt PASS/FAIL.
- **BLOCKED**: kết quả nghi do cấu hình request, chưa phản ánh hành vi của hệ thống. Lần chạy cuối không còn TC nào Blocked.

Pass/fail của script Postman (242 pass, 128 fail ở lần chạy cuối) không dùng để đánh giá, vì 5 test chung chỉ đúng với TC mong đợi 200.

Thay đổi so với bản report trước: 22 TC Blocked đã chạy lại với token đúng (TC-PV-12, 21, 36, 48, 52 và 53 đến 69), TC-PV-13 và 14 đổi từ 200 sang 400 (lần trước dùng nhầm token chung), TC-PV-37 và 38 chạy lại và xác nhận FAIL, đã xem body của TC-PV-02, 03, 04, 06, 15, 22, 39, 49, 67: TC-PV-02, 03, 04 PASS, TC-PV-06, 15, 22, 49 FAIL (và TC-PV-66 FAIL suy ra từ TC-PV-49), TC-PV-39 và 50 xác nhận FAIL bằng DB, TC-PV-07 PASS (ghi nhận), TC-PV-69 chạy lại với body JSON hợp lệ và PASS (ghi nhận), TC-PV-67 FAIL (G17) và TC-PV-64 FAIL (G24). TC-PV-58, 68 ban đầu gán sai mentor so với fixture, chạy lại với mentorId đúng và FAIL; TC-PV-60 được thêm fixture skill cho dự án 39, chạy lại và FAIL.

## 2. Kết quả chi tiết

| STT | TC ID | Endpoint | Tên test case | Input | Expected | Actual | Status | Tag | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
| 1 | TC-PV-01 | GET /projects | Lấy danh sách, không truyền filter | Không có status (Pre: LAB_ADMIN) | 200; trả danh sách dự án (SRS không quy định có loại dự án CANCELLED hay không; ghi nhận kết quả thực tế) | 200  | PASS | V-AUTH1, V-FLT1 | Danh sách có dự án CANCELLED, SRS không quy định nên ghi nhận thực tế (xem TC-PV-06, G28) |
| 2 | TC-PV-02 | GET /projects | Filter PENDING | status=PENDING (Pre: LAB_ADMIN; DP-PEND, DP-APPR) | 200; chỉ dự án pending | 200 | PASS | V-FLT1 | Cả 15 item đều có status PENDING_VALIDATION và validated=pending, đúng filter |
| 3 | TC-PV-03 | GET /projects | Filter APPROVED | status=APPROVED (Pre: LAB_ADMIN; DP-APPR) | 200; chỉ dự án approved | 200 | PASS | V-FLT1 | Cả 19 item đều validated=approved (status hiển thị RECRUITING, khớp G2) |
| 4 | TC-PV-04 | GET /projects | Filter REJECTED | status=REJECTED (Pre: LAB_ADMIN; DP-REJ) | 200; chỉ dự án rejected | 200 | PASS | V-FLT1 | Cả 11 item đều status REJECTED, validated=rejected |
| 5 | TC-PV-05 | GET /projects | Filter không hợp lệ | status=abc (Pre: LAB_ADMIN) | 400, thông báo status không hợp lệ | 200 | FAIL | X-FLT1 | Filter không hợp lệ không bị từ chối, trả 200 (G12) |
| 6 | TC-PV-06 | GET /projects | Dự án CANCELLED bị loại khỏi danh sách | Không truyền status (Pre: LAB_ADMIN; DP-CANC) | 200; không chứa dự án CANCELLED (chờ SRS) | 200 | FAIL | V-FLT1 | Danh sách không filter vẫn chứa 3 dự án CANCELLED (id 46, 47, 48), xác nhận G28; Expected còn ghi chờ SRS nên cần đối chiếu SRS |
| 7 | TC-PV-07 | GET /projects | SYSTEM_ADMIN gọi danh sách | Không có status (Pre: SYSTEM_ADMIN (chờ SRS xác nhận role được phép)) | 200 | 200 | PASS | V-AUTH2 | SYSTEM_ADMIN gọi được danh sách (200); SRS chưa quy định role được phép nên ghi nhận kết quả thực tế |
| 8 | TC-PV-08 | GET /projects | Field của item trong danh sách | Không có status (Pre: LAB_ADMIN) | Mỗi item có đủ field SRS (enterprise, duration, feasibilityScore...) (chờ SRS) | 200 | FAIL | V-FLT1 | Item có enterprise, startDate, endDate, duration, feasibilityScore đều null, thiếu field theo SRS (G29); đã xác nhận qua body TC-PV-02 |
| 9 | TC-PV-09 | GET /projects/pending (URL theo SRS) | Endpoint pending riêng theo SRS | GET .../projects/pending (Pre: LAB_ADMIN) | 200; danh sách dự án pending (theo SRS) | 400 - {"success":false,"message":"Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'; For input string: \"pending\"","data":null} | FAIL | V-AUTH1 | Không có endpoint /pending, `pending` bị parse thành {id}, lỗi ép kiểu Long (G1) |
| 10 | TC-PV-10 | GET /projects | Không gửi token | Không có Authorization (Pre: Không có) | 401 | 403 | FAIL | X-AUTH1 | Không gửi token trả 403 thay vì 401 |
| 11 | TC-PV-11 | GET /projects | Token sai | Bearer abc (Pre: Token sai) | 401 | 500- {"status":500,"error":"Internal Server Error","message":"Invalid compact JWT string: ... Found: 0"} | FAIL | X-AUTH2 | Token sai format gây 500 (exception JWT không được xử lý, message lộ chi tiết thư viện): "Compact JWSs must contain exactly 2 period characters... Found: 0" |
| 12 | TC-PV-12 | GET /projects | Role TALENT | Token TALENT còn hạn (Pre: TALENT) | 403 | 400 | FAIL | X-AUTH3 | Sai role (TALENT) trả 400 thay vì 403 (G14); nên xem body để xác nhận 400 do role |
| 13 | TC-PV-13 | GET /projects | Role MENTOR | Token MENTOR còn hạn (Pre: MENTOR) | 403 | 400 | FAIL | X-AUTH4 | Token MENTOR bị từ chối bằng 400 thay vì 403 (G14); trước đó 200 là do dùng nhầm token chung |
| 14 | TC-PV-14 | GET /projects | Role ENTERPRISE | Token ENTERPRISE còn hạn (Pre: ENTERPRISE) | 403 | 400 | FAIL | X-AUTH5 | Token ENTERPRISE bị từ chối bằng 400 thay vì 403 (G14); trước đó 200 là do dùng nhầm token chung |
| 15 | TC-PV-15 | GET /projects/{id} | Xem chi tiết dự án tồn tại | id hợp lệ (Pre: LAB_ADMIN; DP-PEND) | 200; response là DTO chi tiết theo SRS (không phải entity thô) | 200 | FAIL | V-PJ1 | Body là entity thô: có enterpriseId, slug, validatedBy, deletedAt, rejectedBy, technologies... không phải DTO theo SRS (G11); budget null trong khi list trả 0 |
| 16 | TC-PV-16 | GET /projects/{id} | Id không tồn tại | id=99999 (Pre: LAB_ADMIN) | 404 | 400 | FAIL | X-PJ1 | Id không tồn tại trả 400 thay vì 404 (G13) |
| 17 | TC-PV-17 | GET /projects/{id} | Id sai kiểu | id=abc (Pre: LAB_ADMIN) | 400 | 400 | PASS | X-PJ2 |  |
| 18 | TC-PV-18 | GET /projects/{id} | Id = 0 | id=0 (Pre: LAB_ADMIN) | 404 (SRS không quy định; theo REST) | 400 | FAIL | B-PJ1 | Id không tồn tại trả 400 thay vì 404 (G13) |
| 19 | TC-PV-19 | GET /projects/{id} | Id = -1 | id=-1 (Pre: LAB_ADMIN) | 404 (SRS không quy định; theo REST) | 400 | FAIL | B-PJ2 | Id không tồn tại trả 400 thay vì 404 (G13) |
| 20 | TC-PV-20 | GET /projects/{id} | Không gửi token | Không có Authorization (Pre: Không có) | 401 | 403 | FAIL | X-AUTH1 | Không gửi token trả 403 thay vì 401 |
| 21 | TC-PV-21 | GET /projects/{id} | Role TALENT | Token TALENT (Pre: TALENT) | 403 | 400 | FAIL | X-AUTH3 | Sai role (TALENT) trả 400 thay vì 403 (G14) |
| 22 | TC-PV-22 | POST /{id}/approve | Approve dự án pending, có note và adjustments | {"note":"ok","adjustments":{"numberOfStudents":5,"duration":"6 months"}} (Pre: LAB_ADMIN; DP-PEND) | 200; status APPROVED, validated=approved; numberOfStudents=5 và duration được áp dụng | 200 - {"message":"Project approved successfully","data":{"id":10,"status":"RECRUITING","validated":"approved","numberOfStudents":5,"validationNote":null,...}} | FAIL | V-ST1, V-APR1, ST-01 | Status sau approve là RECRUITING thay vì APPROVED (G2); numberOfStudents=5 được áp dụng; duration không có trong entity nên không áp dụng, validationNote=null nên note bị bỏ (G5) |
| 23 | TC-PV-23 | POST /{id}/approve | Approve chỉ có note | {"note":"ok"} (Pre: LAB_ADMIN; DP-PEND) | 200; status APPROVED | 200 | PASS | V-ST1, V-APR2 |  |
| 24 | TC-PV-24 | POST /{id}/approve | Thiếu body | Không gửi body (Pre: LAB_ADMIN; DP-PEND) | 400 | 400 | PASS | X-APR1 |  |
| 25 | TC-PV-25 | POST /{id}/approve | numberOfStudents = 3 (biên dưới SRS) | {"adjustments":{"numberOfStudents":3}} (Pre: LAB_ADMIN; DP-PEND) | 200 | 200 | PASS | V-ST1, B-STU1 |  |
| 26 | TC-PV-26 | POST /{id}/approve | numberOfStudents = 2 | {"adjustments":{"numberOfStudents":2}} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | B-STU2 | numberOfStudents ngoài khoảng 3-10 vẫn approve thành công (G19) |
| 27 | TC-PV-27 | POST /{id}/approve | numberOfStudents = 10 (biên trên SRS) | {"adjustments":{"numberOfStudents":10}} (Pre: LAB_ADMIN; DP-PEND) | 200 | 200 | PASS | V-ST1, B-STU3 |  |
| 28 | TC-PV-28 | POST /{id}/approve | numberOfStudents = 11 | {"adjustments":{"numberOfStudents":11}} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | B-STU4 | numberOfStudents ngoài khoảng 3-10 vẫn approve thành công (G19) |
| 29 | TC-PV-29 | POST /{id}/approve | numberOfStudents = 0 | {"adjustments":{"numberOfStudents":0}} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | B-STU5 | numberOfStudents ngoài khoảng 3-10 vẫn approve thành công (G19) |
| 30 | TC-PV-30 | POST /{id}/approve | numberOfStudents = -1 | {"adjustments":{"numberOfStudents":-1}} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | B-STU6 | numberOfStudents ngoài khoảng 3-10 vẫn approve thành công (G19) |
| 31 | TC-PV-31 | POST /{id}/approve | Approve dự án đã approved | {"note":"ok"} (Pre: LAB_ADMIN; DP-APPR) | 400 hoặc 409; trạng thái không đổi | 200 | FAIL | X-ST1, ST-03 | Approve dự án đã approved/rejected vẫn trả 200, không kiểm tra trạng thái (G3) |
| 32 | TC-PV-32 | POST /{id}/approve | Approve dự án đã rejected | {"note":"ok"} (Pre: LAB_ADMIN; DP-REJ) | 400 hoặc 409; dự án vẫn rejected | 200  | FAIL | X-ST2, ST-04 | Approve dự án đã approved/rejected vẫn trả 200, không kiểm tra trạng thái (G3) |
| 33 | TC-PV-33 | POST /{id}/approve | Dự án không tồn tại | id=99999 (Pre: LAB_ADMIN) | 404 | 400 | FAIL | X-PJ1 | Id không tồn tại trả 400 thay vì 404 (G13) |
| 34 | TC-PV-34 | POST /{id}/approve | Id sai kiểu | id=abc (Pre: LAB_ADMIN) | 400 | 400 | PASS | X-PJ2 |  |
| 35 | TC-PV-35 | POST /{id}/approve | Không gửi token | {"note":"ok"} (Pre: Không có) | 401 | 403 | FAIL | X-AUTH1 | Không gửi token trả 403 thay vì 401 |
| 36 | TC-PV-36 | POST /{id}/approve | Role TALENT | {"note":"ok"} (Pre: TALENT) | 403 | 400 | FAIL | X-AUTH3 | Sai role (TALENT) trả 400 thay vì 403 (G14) |
| 37 | TC-PV-37 | POST /{id}/approve | Token còn hạn nhưng user đã bị xóa mềm | {"note":"ok"} (Pre: User LAB_ADMIN có deleted_at != null; DP-PEND) | 401 | 500 - {"status":500,"error":"Internal Server Error","message":"User not found: deleted.admin@labodc.com"} | FAIL | X-AUTH6 | User LAB_ADMIN test (id 10) bị xóa mềm, token còn hạn: trả 500 thay vì 401 (G23); message lộ email, body theo format mặc định của Spring chứ không theo format chung của app |
| 38 | TC-PV-38 | GET /{id}/approve | Sai HTTP method | GET vào endpoint approve (Pre: LAB_ADMIN) | 405 | 500 - {"success":false,"message":"An error occurred: Request method 'GET' is not supported","data":null} | FAIL | X-MTD1 | Đã chạy lại với token LAB_ADMIN đúng: vẫn 500 thay vì 405 |
| 39 | TC-PV-39 | POST /{id}/reject | Reject dự án pending, đủ reason và details | {"reason":"Không khả thi","details":"Thiếu ngân sách"} (Pre: LAB_ADMIN; DP-PEND) | 200; status REJECTED, validated=rejected; reason và details được lưu | 200 - {"success":true,"message":"Project rejected successfully","data":null} | FAIL | V-ST1, V-RJ1, ST-02, RJ-R1 | Reason và details không được lưu: bảng project_rejections 0 dòng và projects.validation_note trống sau khi reject dự án 13 (G4); status và validated đã chuyển đúng REJECTED |
| 40 | TC-PV-40 | POST /{id}/reject | Thiếu reason | {"details":"x"} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | X-RJ1, RJ-R5 | Reject không validate reason, vẫn 200 (G18) |
| 41 | TC-PV-41 | POST /{id}/reject | reason rỗng | {"reason":"","details":"x"} (Pre: LAB_ADMIN; DP-PEND) | 400 | 200 | FAIL | X-RJ3, RJ-R5 | Reject không validate reason, vẫn 200 (G18) |
| 42 | TC-PV-42 | POST /{id}/reject | Thiếu body | Không gửi body (Pre: LAB_ADMIN; DP-PEND) | 400 | 400 | PASS | X-RJ2 |  |
| 43 | TC-PV-43 | POST /{id}/reject | Chỉ có reason, không có details | {"reason":"Không khả thi"} (Pre: LAB_ADMIN; DP-PEND) | 200 nếu details tùy chọn (chờ SRS) | 200 | PASS | V-RJ2 | details tùy chọn, SRS chưa quy định |
| 44 | TC-PV-44 | POST /{id}/reject | Reject dự án đã approved | {"reason":"x","details":"y"} (Pre: LAB_ADMIN; DP-APPR) | SRS không quy định; ghi nhận kết quả thực tế | 200 | PASS | ST-05, RJ-R4 | SRS không quy định; thực tế cho reject dự án đã approved (G3) |
| 45 | TC-PV-45 | POST /{id}/reject | Reject dự án đã rejected | {"reason":"x","details":"y"} (Pre: LAB_ADMIN; DP-REJ) | 400 hoặc 409 | 200 | FAIL | ST-06, RJ-R4 | Reject dự án đã rejected vẫn trả 200 (G3) |
| 46 | TC-PV-46 | POST /{id}/reject | Dự án không tồn tại | id=99999 (Pre: LAB_ADMIN) | 404 | 400 | FAIL | X-PJ1, RJ-R3 | Id không tồn tại trả 400 thay vì 404 (G13) |
| 47 | TC-PV-47 | POST /{id}/reject | Không gửi token | {"reason":"x","details":"y"} (Pre: Không có) | 401 | 403 | FAIL | X-AUTH1, RJ-R2 | Không gửi token trả 403 thay vì 401 |
| 48 | TC-PV-48 | POST /{id}/reject | Role TALENT | {"reason":"x","details":"y"} (Pre: TALENT) | 403 | 400  | FAIL | X-AUTH3, RJ-R2 | Sai role (TALENT) trả 400 thay vì 403 (G14) |
| 49 | TC-PV-49 | POST /{id}/assign-mentor | Assign mentor hợp lệ | {"mentorId":<id>,"message":"hi"} (Pre: LAB_ADMIN; DP-APPR; MEN-OK) | 200; tạo invitation PENDING, hết hạn sau 72h; response có invitationId, mentorName, mentorEmail, sentAt; message được lưu; invitedBy theo SRS | 200 - {"message":"Mentor assigned successfully","data":{"id":31,"mentorId":4,"status":"RECRUITING","validated":"approved",...}} | FAIL | V-AUTH1, V-ST2, V-MEN1, R1, ST-07, V-MSG1 | Response trả entity dự án, thiếu invitationId, mentorName, mentorEmail, sentAt (G10); mentorId=4 gán ngay (G15). DB mentor_invitations: expires_at = updated_at + 7 ngày thay vì 72h (G9), không có cột message nên message không được lưu (G26), priority luôn medium và skills luôn [] (G27), invited_by=3 trong khi LAB_ADMIN thực hiện có id 2 (G25 cần xác nhận) |
| 50 | TC-PV-50 | POST /{id}/assign-mentor | current_projects tăng sau assign | Như TC trước; đọc current_projects trước và sau (Pre: LAB_ADMIN; DP-APPR; MEN-OK) | current_projects tăng 1 | 200 | FAIL | V-MEN1 | mentors.current_projects_count và updated_at vẫn bằng giá trị lúc seed dù đã assign thành công (TC-PV-49, 50, 59), nên không tăng (G8); nếu SRS quy định chỉ tăng khi mentor chấp nhận thì cần xác nhận lại |
| 51 | TC-PV-51 | POST /{id}/assign-mentor | Không gửi token | {"mentorId":<id>} (Pre: Không có) | 401 | 403 | FAIL | X-AUTH1, R2 | Không gửi token trả 403 thay vì 401 |
| 52 | TC-PV-52 | POST /{id}/assign-mentor | Role TALENT | {"mentorId":<id>} (Pre: TALENT) | 403 | 400 | FAIL | X-AUTH3, R2 | Sai role (TALENT) trả 400 thay vì 403 (G14) |
| 53 | TC-PV-53 | POST /{id}/assign-mentor | Dự án không tồn tại | id=99999 (Pre: LAB_ADMIN; MEN-OK) | 404 | 400 | FAIL | X-PJ1, R3 | Id dự án không tồn tại trả 400 thay vì 404 (G13) |
| 54 | TC-PV-54 | POST /{id}/assign-mentor | Dự án pending chưa approve | {"mentorId":<id>} (Pre: LAB_ADMIN; DP-PEND; MEN-OK) | 400 | 200 | FAIL | X-ST3, R4, ST-08 | Assign mentor vào dự án PENDING vẫn 200, không kiểm tra đã approve (G6); dự án 23 vẫn PENDING_VALIDATION trong danh sách sau đó |
| 55 | TC-PV-55 | POST /{id}/assign-mentor | Dự án rejected | {"mentorId":<id>} (Pre: LAB_ADMIN; DP-REJ; MEN-OK) | 400 | 200 | FAIL | X-ST3, R4, ST-09 | Assign mentor vào dự án REJECTED vẫn 200, không kiểm tra trạng thái (G6) |
| 56 | TC-PV-56 | POST /{id}/assign-mentor | Mentor không tồn tại | mentorId=99999 (Pre: LAB_ADMIN; DP-APPR) | 404 | 400 | FAIL | X-MEN1, R5 | 400 thay vì 404; dự án id 1 đã bị reject/assign ở request ngoài thiết kế nên cần xem body để biết 400 do mentor hay do dự án |
| 57 | TC-PV-57 | POST /{id}/assign-mentor | mentorId là user không phải mentor | mentorId = id của user TALENT (Pre: LAB_ADMIN; DP-APPR; user TALENT) | 400 hoặc 404 | 200 | FAIL | X-MEN4 | User không phải mentor vẫn được gán, 200 (G8: mentor tìm ở bảng User) |
| 58 | TC-PV-58 | POST /{id}/assign-mentor | Mentor đã đủ capacity | current_projects = max (Pre: LAB_ADMIN; DP-APPR; MEN-FULL) | 400 | 200 (chạy lại thủ công: mentor user 8, dự án 32) | FAIL | X-MEN2, B-CAP2, R6 | Chạy lại với Mentor FULL (user 8, 3/3) và dự án 32: vẫn 200, DB tạo invitation id 14 nên capacity không được kiểm tra (G7) |
| 59 | TC-PV-59 | POST /{id}/assign-mentor | Mentor còn đúng 1 chỗ | current_projects = max - 1 (Pre: LAB_ADMIN; DP-APPR; MEN-EDGE) | 200 | 200 | PASS | V-MEN1, B-CAP1 | Mentor còn đúng 1 chỗ gán thành công |
| 60 | TC-PV-60 | POST /{id}/assign-mentor | Expertise không khớp | Mentor không có skill của dự án (Pre: LAB_ADMIN; DP-APPR; MEN-EXP) | 400 | 200 (chạy lại thủ công sau khi thêm yêu cầu skill: mentor user 9, dự án 39) - data: entity dự án, mentorId=9 | FAIL | X-MEN3, R7 | Sau khi thêm yêu cầu skill Kubernetes cho dự án 39 (Mentor EXP không có skill nào trong mentor_expertise), assign vẫn 200 và gán mentorId=9: expertise không được kiểm tra (G7) |
| 61 | TC-PV-61 | POST /{id}/assign-mentor | Thiếu mentorId | {"message":"hi"} (Pre: LAB_ADMIN; DP-APPR) | 400 | 400 | PASS | X-AS1 | Status khớp; message lỗi thô (G20) cần xem body |
| 62 | TC-PV-62 | POST /{id}/assign-mentor | Thiếu body | Không gửi body (Pre: LAB_ADMIN; DP-APPR) | 400 | 400  | PASS | X-AS2 |  |
| 63 | TC-PV-63 | POST /{id}/assign-mentor | Id dự án sai kiểu | id=abc (Pre: LAB_ADMIN; MEN-OK) | 400 | 400 | PASS | X-PJ2 |  |
| 64 | TC-PV-64 | POST /{id}/assign-mentor | Assign lần 2, cùng mentor | Gọi lại cùng mentorId (Pre: LAB_ADMIN; dự án đã assign; MEN-OK) | Không tạo trùng, không reset invitation đã ACCEPTED (chờ SRS) | 200  | FAIL | S-DUP1 | Assign lại cùng mentor khi invitation đã ACCEPTED: invitation bị reset về PENDING và expires_at được gia hạn thêm 7 ngày (G24); không tạo dòng trùng |
| 65 | TC-PV-65 | POST /{id}/assign-mentor | Assign lần 2, mentor khác | mentorId khác (Pre: LAB_ADMIN; dự án đã assign; MEN-OK) | 400 hoặc 409 (chờ SRS) | 200 | FAIL | S-DUP2 | Assign mentor khác cho dự án đã assign vẫn 200: DB có 2 invitation cùng dự án 31 (mentor 4 và mentor 8), không bị chặn (G16) |
| 66 | TC-PV-66 | POST /{id}/assign-mentor | Dự án sau khi assign (chưa chấp nhận) | Assign rồi GET /{id} (Pre: LAB_ADMIN; DP-APPR; MEN-OK) | mentorId chưa gán cho tới khi mentor chấp nhận (chờ SRS) | 200 | FAIL |  | Kết luận suy ra từ body TC-PV-49 (cùng endpoint): response gán mentorId ngay khi invitation còn PENDING (G15); nên GET /projects/6 để xác nhận riêng |
| 67 | TC-PV-67 | POST /{id}/assign-mentor | Mentor thấy invitation ở Mentor Portal | Assign, rồi mentor gọi GET /api/mentor/invitations (Pre: LAB_ADMIN; MENTOR; DP-APPR) | 200; danh sách có invitation vừa tạo | 200 - data: 1 invitation (id 2, projectName Fixture PEND 1, studentCount 4, priority medium, skills []) | FAIL | V-MEN1 | Mentor OK chỉ thấy invitation id 2 (mentor_id=1, dự án 1); 6 invitation được tạo cho mentor này (mentor_id=4, dự án 31, 38, 40, 23, 44, 6) không hiển thị. Assign lưu id User, portal lọc theo id Mentor (G17) |
| 68 | TC-PV-68 | POST /{id}/assign-mentor | Mentor đã bị xóa mềm | mentorId của user đã xóa (Pre: LAB_ADMIN; DP-APPR; mentor có deleted_at) | 404 | 200 (chạy lại thủ công: mentor user 6, dự án 7) | FAIL | X-MEN5 | Chạy lại với mentor đã xóa mềm (user 6, deleted_at có giá trị) và dự án 7: vẫn 200, DB tạo invitation id 16 (G30) |
| 69 | TC-PV-69 | POST /{id}/assign-mentor | message rất dài | message = chuỗi 5000 ký tự (Pre: LAB_ADMIN; DP-APPR; MEN-OK) | SRS không quy định giới hạn độ dài; ghi nhận kết quả thực tế (200 hoặc 400) | 200 (chạy lại thủ công với body JSON hợp lệ, dự án 10, mentorId 4) - data: entity dự án, mentorId=4 | PASS | X-MSG1 | Chạy lại với body JSON hợp lệ: message 5000 ký tự được chấp nhận (200), không có giới hạn độ dài (G21); SRS không quy định nên ghi nhận kết quả thực tế. Lần đầu body lỗi JSON trả message thô của parser (G20) |

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Test bao phủ | Kết quả |
|---|---|---|
| V-AUTH1 | TC-PV-01, TC-PV-09, TC-PV-49 | FAIL |
| V-AUTH2 | TC-PV-07 | PASS |
| V-PJ1 | TC-PV-15 | FAIL |
| V-FLT1 | TC-PV-01, TC-PV-02, TC-PV-03, TC-PV-04, TC-PV-06, TC-PV-08 | FAIL |
| V-ST1 | TC-PV-22, TC-PV-23, TC-PV-25, TC-PV-27, TC-PV-39 | FAIL |
| V-ST2 | TC-PV-49 | FAIL |
| V-APR1 | TC-PV-22 | FAIL |
| V-APR2 | TC-PV-23 | PASS |
| V-RJ1 | TC-PV-39 | FAIL |
| V-RJ2 | TC-PV-43 | PASS |
| V-MEN1 | TC-PV-49, TC-PV-50, TC-PV-59, TC-PV-67 | FAIL |
| V-MSG1 | TC-PV-49 | FAIL |
| X-AUTH1 | TC-PV-10, TC-PV-20, TC-PV-35, TC-PV-47, TC-PV-51 | FAIL |
| X-AUTH2 | TC-PV-11 | FAIL |
| X-AUTH3 | TC-PV-12, TC-PV-21, TC-PV-36, TC-PV-48, TC-PV-52 | FAIL |
| X-AUTH4 | TC-PV-13 | FAIL |
| X-AUTH5 | TC-PV-14 | FAIL |
| X-AUTH6 | TC-PV-37 | FAIL |
| X-PJ1 | TC-PV-16, TC-PV-33, TC-PV-46, TC-PV-53 | FAIL |
| X-PJ2 | TC-PV-17, TC-PV-34, TC-PV-63 | PASS |
| X-FLT1 | TC-PV-05 | FAIL |
| X-ST1 | TC-PV-31 | FAIL |
| X-ST2 | TC-PV-32 | FAIL |
| X-ST3 | TC-PV-54, TC-PV-55 | FAIL |
| X-APR1 | TC-PV-24 | PASS |
| X-RJ1 | TC-PV-40 | FAIL |
| X-RJ2 | TC-PV-42 | PASS |
| X-RJ3 | TC-PV-41 | FAIL |
| X-MEN1 | TC-PV-56 | FAIL |
| X-MEN2 | TC-PV-58 | FAIL |
| X-MEN3 | TC-PV-60 | FAIL |
| X-MEN4 | TC-PV-57 | FAIL |
| X-MEN5 | TC-PV-68 | FAIL |
| X-AS1 | TC-PV-61 | PASS |
| X-AS2 | TC-PV-62 | PASS |
| X-MTD1 | TC-PV-38 | FAIL |
| X-MSG1 | TC-PV-69 | PASS |
| S-DUP1 | TC-PV-64 | FAIL |
| S-DUP2 | TC-PV-65 | FAIL |

### Giá trị biên

| Tag | Test bao phủ | Kết quả |
|---|---|---|
| B-PJ1 | TC-PV-18 | FAIL |
| B-PJ2 | TC-PV-19 | FAIL |
| B-STU1 | TC-PV-25 | PASS |
| B-STU2 | TC-PV-26 | FAIL |
| B-STU3 | TC-PV-27 | PASS |
| B-STU4 | TC-PV-28 | FAIL |
| B-STU5 | TC-PV-29 | FAIL |
| B-STU6 | TC-PV-30 | FAIL |
| B-CAP1 | TC-PV-59 | PASS |
| B-CAP2 | TC-PV-58 | FAIL |

### Chuyển đổi trạng thái

| Tag | Test bao phủ | Kết quả |
|---|---|---|
| ST-01 | TC-PV-22 | FAIL |
| ST-02 | TC-PV-39 | FAIL |
| ST-03 | TC-PV-31 | FAIL |
| ST-04 | TC-PV-32 | FAIL |
| ST-05 | TC-PV-44 | PASS |
| ST-06 | TC-PV-45 | FAIL |
| ST-07 | TC-PV-49 | FAIL |
| ST-08 | TC-PV-54 | FAIL |
| ST-09 | TC-PV-55 | FAIL |

### Bảng quyết định

| Tag | Test bao phủ | Kết quả |
|---|---|---|
| R1 | TC-PV-49 | FAIL |
| R2 | TC-PV-51, TC-PV-52 | FAIL |
| R3 | TC-PV-53 | FAIL |
| R4 | TC-PV-54, TC-PV-55 | FAIL |
| R5 | TC-PV-56 | FAIL |
| R6 | TC-PV-58 | FAIL |
| R7 | TC-PV-60 | FAIL |
| RJ-R1 | TC-PV-39 | FAIL |
| RJ-R2 | TC-PV-47, TC-PV-48 | FAIL |
| RJ-R3 | TC-PV-46 | FAIL |
| RJ-R4 | TC-PV-44, TC-PV-45 | FAIL |
| RJ-R5 | TC-PV-40, TC-PV-41 | FAIL |

Bao phủ thiết kế: 39/39 EP tags, 10/10 BVA tags, 9/9 state transitions, 12/12 decision rules (đủ 100% theo thiết kế). Kết quả theo 70 tag: 13 PASS, 57 FAIL, 0 chưa kết luận.

## 4. Đối chiếu gap SRS vs Code

| Gap | Nội dung | TC liên quan | Xác nhận | Ghi chú |
|---|---|---|---|---|
| G1 | Không có /pending riêng | TC-PV-09 | Đúng | TC-PV-09 trả 400 |
| G2 | Status sau approve là RECRUITING | TC-PV-22 | Đúng | TC-PV-22: status sau approve là RECRUITING, không phải APPROVED |
| G3 | approve/reject không kiểm tra trạng thái | TC-PV-31, TC-PV-32, TC-PV-44, TC-PV-45 | Đúng | TC-PV-31, 32, 45 trả 200; dự án REJ 2 (id 42) hiện nằm trong danh sách APPROVED; TC-PV-44 reject dự án approved cũng trả 200 |
| G4 | reject không lưu reason/details | TC-PV-39 | Đúng | TC-PV-39: project_rejections 0 dòng, projects.validation_note trống sau reject |
| G5 | adjustments.duration không áp dụng, note bị bỏ | TC-PV-22 | Đúng | TC-PV-22: duration không được áp dụng, validationNote=null nên note bị bỏ |
| G6 | assign không kiểm tra project đã approve | TC-PV-54, TC-PV-55 | Đúng | TC-PV-54, 55 trả 200; DB có invitation cho dự án 23 (PENDING) và 44 (REJECTED) |
| G7 | assign không kiểm tra capacity/expertise | TC-PV-58, TC-PV-60 | Đúng | TC-PV-58: Mentor FULL (user 8, 3/3) vẫn được gán; TC-PV-60: Mentor EXP không có skill yêu cầu của dự án 39 vẫn được gán, đều 200 |
| G8 | mentor tìm ở bảng User, không tăng current_projects | TC-PV-50, TC-PV-57 | Đúng | TC-PV-57 trả 200 và mentor được tìm theo id User; mentors.current_projects_count không tăng sau assign (TC-PV-50) |
| G9 | Invitation 7 ngày (SRS 72h) | TC-PV-49 | Đúng | mentor_invitations.expires_at = updated_at + 7 ngày |
| G10 | Response assign thiếu field | TC-PV-49 | Đúng | TC-PV-49: response là entity dự án, thiếu invitationId, mentorName, mentorEmail, sentAt |
| G11 | GET /{id} trả entity thô | TC-PV-15 | Đúng | TC-PV-15: GET /{id} trả entity thô (enterpriseId, slug, validatedBy, deletedAt...) |
| G12 | Filter lạ trả toàn bộ | TC-PV-05 | Đúng | TC-PV-05 trả 200 |
| G13 | Id không tồn tại trả 400 thay vì 404 | TC-PV-16, TC-PV-18, TC-PV-19, TC-PV-33, TC-PV-46, TC-PV-53, TC-PV-56 | Đúng | TC-PV-16, 18, 19, 33, 46, 53 trả 400; TC-PV-56 cũng 400 nhưng cần body |
| G14 | Sai role có thể ra 400 thay vì 403 | TC-PV-12, TC-PV-13, TC-PV-14, TC-PV-21, TC-PV-36, TC-PV-48, TC-PV-52 | Đúng | TC-PV-12, 13, 14, 21, 36, 48, 52 đều trả 400 thay vì 403 (nên xác nhận bằng body) |
| G15 | mentorId gán ngay khi invitation còn PENDING | TC-PV-66 | Đúng | TC-PV-49: response có mentorId=4 ngay sau assign; TC-PV-66 suy ra từ đó |
| G16 | Assign lặp không bị chặn | TC-PV-64, TC-PV-65 | Đúng | TC-PV-65 trả 200; DB có 2 invitation cùng dự án 31 (mentor 4 và 8); assign lại cùng mentor không tạo dòng trùng |
| G17 | Invitation lưu id User, Mentor Portal lọc theo id Mentor | TC-PV-67 | Đúng | mentor_invitations.mentor_id lưu id User (giá trị 6 đến 9 không tồn tại trong mentors.id 1 đến 5); Mentor OK không thấy 6 invitation tạo cho mình, chỉ thấy invitation id 2 (mentor_id=1) |
| G18 | reject không validate reason | TC-PV-40, TC-PV-41 | Đúng | TC-PV-40, 41 trả 200 |
| G19 | approve không validate numberOfStudents | TC-PV-26, TC-PV-28, TC-PV-29, TC-PV-30 | Đúng | TC-PV-26, 28, 29, 30 trả 200 và giá trị 2, 11, 0, -1 đã được lưu vào dự án 5, 7, 8, 9 (xác nhận qua danh sách APPROVED) |
| G20 | Thiếu mentorId ra lỗi thô | TC-PV-61 | Đúng một phần | TC-PV-69 trả message thô của parser JSON (JSON parse error: Unexpected end-of-input in VALUE_STRING); TC-PV-61 cần body để xác nhận |
| G21 | message không giới hạn độ dài | TC-PV-69 | Đúng | TC-PV-69: message 5000 ký tự được chấp nhận, trả 200; SRS chưa quy định giới hạn |
| G22 | ~~HTTP method approve/reject lệch SRS~~ Đã loại: SRS ghi POST cho approve/reject, code cũng POST, không lệch (TC-PV-38 chỉ kiểm tra sai method) | TC-PV-38 | Chưa rõ | Cần body/DB hoặc TC còn blocked |
| G23 | User xóa mềm vẫn qua auth, lỗi 400 | TC-PV-37 | Đúng | TC-PV-37 trả 500 ("User not found"), thiết kế dự đoán 400, SRS yêu cầu 401 |
| G24 | Assign lại reset invitation đã ACCEPTED/DECLINED | TC-PV-64 | Đúng | TC-PV-64: assign lại khi invitation đã ACCEPTED làm status về PENDING và gia hạn expires_at |
| G25 | invitedBy lấy từ enterprise, fallback 1 | TC-PV-49 | Đúng | invited_by = 3 (enterprise1@example.com), không phải LAB_ADMIN thực hiện (id 2) |
| G26 | message chỉ log, không lưu | TC-PV-49 | Đúng | Bảng mentor_invitations không có cột message; description lấy từ mô tả dự án |
| G27 | skills/priority gán cứng | TC-PV-49 | Đúng | priority luôn medium, skills luôn [] ở mọi dòng đã xem |
| G28 | Không filter vẫn trả CANCELLED | TC-PV-06 | Đúng | TC-PV-06: danh sách không filter chứa 3 dự án CANCELLED (id 46, 47, 48) |
| G29 | List luôn trả enterprise/duration/feasibilityScore null | TC-PV-08 | Đúng | Body TC-PV-02 xác nhận: item luôn có enterprise, startDate, endDate, duration, feasibilityScore = null |
| G30 | Mentor xóa mềm vẫn gán được | TC-PV-68 | Đúng | TC-PV-68: gán mentor đã xóa mềm (user 6) trả 200 và tạo invitation id 16 |

## 5. Danh sách bug phát hiện


| # | TC ID | Mô tả bug | Severity | Trạng thái |
|---|---|---|---|---|---|
| 1 | TC-PV-31, 32, 45 (44) | Approve/reject không kiểm tra trạng thái hiện tại: approve dự án đã approved/rejected và reject dự án đã rejected vẫn trả 200 (G3) | High | | Open |
| 2 | TC-PV-37 | Token còn hạn của user đã bị xóa mềm gây 500 thay vì 401, message `User not found: <email>` lộ email; user đã xóa vẫn đi qua tầng auth (G23) | High | | Open |
| 3 | TC-PV-54, 55 | Assign mentor vào dự án PENDING hoặc REJECTED vẫn trả 200, không kiểm tra dự án đã approve (G6) | High | | Open |
| 4 | TC-PV-57, 68 | Gán được user không phải mentor (user TALENT id 5) và mentor đã xóa mềm (user 6), vẫn trả 200 và tạo invitation (G8, G30) | High | | Open |
| 5 | TC-PV-22 | Approve đưa dự án về status RECRUITING thay vì APPROVED; note và adjustments.duration không được lưu (G2, G5) | Medium | | Open |
| 6 | TC-PV-49, 66 | Assign mentor trả entity dự án thay vì thông tin invitation (thiếu invitationId, mentorName, mentorEmail, sentAt), gán mentorId ngay khi invitation còn PENDING, hạn invitation 7 ngày thay vì 72h, message không được lưu, priority và skills gán cứng, invited_by lưu id enterprise (3) thay vì LAB_ADMIN (2) (G9, G10, G15, G25, G26, G27) | Medium | | Open |
| 7 | TC-PV-50 | current_projects_count của mentor không tăng sau assign (G8) | Medium | | Open |
| 8 | TC-PV-39 | Reject không lưu reason và details: project_rejections trống, validation_note trống (G4) | Medium | | Open |
| 9 | TC-PV-49, 67 | mentor_invitations.mentor_id lưu id User thay vì id Mentor (G17): Mentor Portal không hiển thị các invitation được tạo cho mentor, chỉ thấy invitation id 2 | High | | Open |
| 10 | TC-PV-58, 60 | Assign không kiểm tra capacity (mentor đã đủ 3/3 vẫn được gán) và expertise (mentor không có skill yêu cầu vẫn được gán), trả 200 (G7) | Medium | | Open |
| 11 | TC-PV-65 | Assign mentor khác cho dự án đã assign không bị chặn: dự án 31 có 2 invitation (G16) | Medium | | Open |
| 12 | TC-PV-64 | Assign lại cùng mentor làm invitation đã ACCEPTED bị reset về PENDING và gia hạn thêm 7 ngày (G24) | Medium | | Open |
| 13 | TC-PV-12, 13, 14, 21, 36, 48, 52 | Sai role (TALENT, MENTOR, ENTERPRISE) trả 400 thay vì 403 (G14) | Medium | | Open |
| 14 | TC-PV-26, 28, 29, 30 | Approve không validate adjustments.numberOfStudents: 2, 11, 0, -1 trả 200 và được lưu vào DB (G19) | Medium | | Open |
| 15 | TC-PV-40, 41 | Reject không validate reason: thiếu hoặc rỗng vẫn trả 200 (G18) | Medium | | Open |
| 16 | TC-PV-11 | Bearer token sai format (`abc`) trả 500 thay vì 401; message lỗi lộ chi tiết thư viện JWT | Medium | | Open |
| 17 | TC-PV-10, 20, 35, 47, 51 | Không gửi token trả 403 thay vì 401 | Medium | | Open |
| 18 | TC-PV-09 | Thiếu endpoint `GET /projects/pending` theo SRS; `pending` bị hiểu là path variable {id} (G1) | Medium | | Open |
| 19 | TC-PV-08 | List dự án trả enterprise, startDate, endDate, duration, feasibilityScore luôn null, thiếu field theo SRS (G29; xác nhận qua body TC-PV-02) | Medium | | Open |
| 20 | TC-PV-15 | GET chi tiết dự án trả entity thô (enterpriseId, slug, validatedBy, deletedAt...) thay vì DTO theo SRS (G11) | Low | | Open |
| 21 | TC-PV-06 | Danh sách không filter còn trả dự án CANCELLED (G28); chờ SRS xác nhận | Low | | Open |
| 22 | TC-PV-16, 18, 19, 33, 46, 53 | Id dự án không tồn tại trả 400 thay vì 404 (G13) | Low | | Open |
| 23 | TC-PV-05 | Filter `status` không hợp lệ không bị từ chối, trả 200 (G12) | Low | | Open |
| 24 | TC-PV-38 | Gọi GET vào endpoint chỉ nhận POST trả 500 thay vì 405 | Low | | Open |

## 6. Ghi chú & đề xuất

**Việc còn lại**

Không còn TC cần xác minh hay bị Blocked: toàn bộ 69 TC đã được chốt bằng status code, body hoặc DB.

Các việc khác:

1. **Reset DB về fixture** trước mỗi lần chạy lại. Approve/reject làm đổi dữ liệu, và vài request ngoài thiết kế (Reject Project, Assign Mentor To Project) dùng chung dự án id 1 với TC-PV-53 và TC-PV-56.
2. **Xác nhận body của các lỗi 400 do sai role** (TC-PV-12, 13, 14, 21, 36, 48, 52) để chắc đó là lỗi phân quyền (G14) chứ không phải lỗi token.
3. **Sửa biến mentor trong Postman cho khớp DB.** Request TC-PV-58, 60, 68 ban đầu gán user 6, 8, 9, trong khi fixture đúng là FULL = user 8, EXP = user 9, DELETED = user 6. Đã chạy lại thủ công với mentorId đúng; nhớ sửa lại trong collection nếu chạy Runner lần nữa.
4. **Dọn dữ liệu test sau khi xong:** xóa dòng skill `Kubernetes` của dự án 39 trong `project_skill_requirements`, các invitation tạo khi test, và tài khoản `deleted.admin@labodc.com`; hoặc reset DB về fixture.

**Phát hiện đáng chú ý**

- Đã kiểm tra DB: dự án 19 (approved), 21 (rejected) và invitation dự án 40 chỉ bị đổi ở một lần chạy ngày 08/11 với danh tính LAB_ADMIN (validated_by = 2), và không đổi ở lần chạy ngày 09/11, nên request sai role (TALENT) bị từ chối thật, không thực thi hành động.
- Bảng mentor_invitations lưu id User trong cột mentor_id (G17): Mentor OK không thấy invitation được tạo cho mình trong Mentor Portal, chỉ thấy invitation id 2 (mentor_id=1) do trùng id với user 1.
- Lỗi xử lý exception tập trung ở tầng filter/handler chung: token sai format (500), user xóa mềm (500), sai HTTP method (500), không gửi token (403 thay vì 401), sai role (400 thay vì 403). Nên sửa chung một chỗ.
- Thiếu kiểm tra trạng thái và validation đầu vào ở approve/reject (G3, G18, G19): dữ liệu sai vẫn được ghi nhận thành công, kể cả numberOfStudents = -1 đã được lưu vào DB.
- Approve đưa dự án về RECRUITING, không phải APPROVED, và bỏ qua note, duration (G2, G5).
- Assign mentor gần như không có ràng buộc nghiệp vụ: không kiểm tra trạng thái dự án (G6), loại user và trạng thái xóa mềm (G8, G30), capacity và expertise (G7), assign lặp (G16, G24), và trả entity dự án thay vì invitation (G10, G15). Nên review cả luồng này cùng lúc.
- Lần chạy này không còn lỗi phân quyền nghiêm trọng như nghi ngờ ở bản trước: TC-PV-13 và 14 trả 200 là do dùng nhầm token chung, token đúng role thì bị từ chối bằng 400.
