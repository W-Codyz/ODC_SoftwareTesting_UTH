# Test Execution Report: FR-MEN-004 - Nộp báo cáo (Submit Report)

**Module:** Mentor Portal  
**Chức năng:** Submit Report (`POST /api/mentor/reports`, `GET /api/mentor/reports`, `GET /api/mentor/reports/{id}/file`)  
**Người thực hiện:** Nguyễn Duy Đức  
**Ngày thực hiện lần đầu:** 10/11/2026
**Ngày cập nhật bổ sung:** 11/11/2026
**Môi trường test:** Postman, collection `FR-MEN-004 Test`, backend local `http://localhost:8080`  
**Tham chiếu test case:** `test-cases/mentor-portal/TC_Mentor_SubmitReport.md`

---

## 1. Tổng kết

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 55 |
| Passed | 25 |
| Failed | 26 |
| Blocked / Skipped | 4 |
| **Pass rate** | **25/55 = 45.5%** |

Pass rate trên số test case đã chạy: 25/51 = 49.0%. 4 test case Blocked (TC-RPT-18, 28, 29, 34) do chưa có tài khoản mentor thứ hai (MEN2).

---

## 2. Kết quả chi tiết

| STT | TC ID | Tên test case | Input | Expected | Actual | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|---|---|---|
| 1 | TC-RPT-01 | [POST /reports] Nộp báo cáo hợp lệ, không file | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary | 200; success=true; data.id có; data.status = "submitted"; không có file | 200; id=4; status="submitted"; submittedDate=null; fileName=null | PASS | V-AUTH1, V-PJ1, V-REQ1, V-DATE1, V-SDT1, V-STS1, V-SUM1, V-FILE1, R1 |  |
| 2 | TC-RPT-02 | [POST /reports] Có submittedDate và status=pending | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; submittedDate=2026-11-08; status=pending | 200; status = "pending"; submittedDate khớp giá trị gửi | 200; id=13; status="pending"; submittedDate="2026-11-08" | PASS | V-SDT2, V-STS2, ST-03, R1 |  |
| 3 | TC-RPT-03 | [POST /reports] Đính kèm file PDF | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-PDF | 200; fileName và fileSize có giá trị | 200; id=22; fileName="f_pdf.pdf"; fileSize="15.0 KB" | PASS | V-FILE2, R1 |  |
| 4 | TC-RPT-04 | [POST /reports] Thiếu student | Bỏ key student | 400 (@RequestParam bắt buộc) | 500; message "An error occurred: Required request parameter 'student' for method parameter type String is not present"; data=null | FAIL | X-REQ1, R5 | Bug A: thiếu tham số bắt buộc trả 500 thay vì 400 |
| 5 | TC-RPT-05 | [POST /reports] Thiếu studentId | Bỏ key studentId | 400 | 500; message tương tự, tham số 'studentId' | FAIL | X-REQ2, R5 | Bug A: trả 500 thay vì 400 |
| 6 | TC-RPT-06 | [POST /reports] Thiếu reportName | Bỏ key reportName | 400 | 500; message tương tự, tham số 'reportName' | FAIL | X-REQ3, R5 | Bug A: trả 500 thay vì 400 |
| 7 | TC-RPT-07 | [POST /reports] Thiếu dueDate | Bỏ key dueDate | 400 | 500; message tương tự, tham số 'dueDate' | FAIL | X-DATE1, R6 | Bug A: trả 500 thay vì 400 |
| 8 | TC-RPT-08 | [POST /reports] Thiếu projectId | Bỏ key projectId | 400 | 500; message tương tự, tham số 'projectId' (type Long) | FAIL | X-PJ4, R3 | Bug A: trả 500 thay vì 400 |
| 9 | TC-RPT-09 | [POST /reports] projectId không phải số | projectId=abc | 400 (kiểu Long) | 400; message "Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'; For input string: \"abc\"" | PASS | X-PJ2, R3 |  |
| 10 | TC-RPT-10 | [POST /reports] student rỗng | student = (rỗng) | 400 (requireNonBlank) | 400; message "Missing field: student" | PASS | X-REQ4, R5 |  |
| 11 | TC-RPT-11 | [POST /reports] reportName toàn khoảng trắng | reportName = 3 dấu cách | 400 (requireNonBlank) | 400; message "Missing field: reportName" | PASS | X-REQ5, R5 |  |
| 12 | TC-RPT-12 | [POST /reports] dueDate sai định dạng | dueDate=31/12/2026 | 400 | 400; message "Missing field: dueDate" (dueDate có giá trị nhưng sai định dạng, message nói là thiếu) | PASS | X-DATE2, R6 | Đúng mã 400 nhưng message "Missing field: dueDate" gây hiểu nhầm (Bug D) |
| 13 | TC-RPT-13 | [POST /reports] dueDate là ngày không tồn tại | dueDate=2026-02-30 | 400 | 400; message "Missing field: dueDate" (ngày không tồn tại bị báo là thiếu) | PASS | X-DATE3, R6 | Đúng mã 400 nhưng message "Missing field: dueDate" gây hiểu nhầm (Bug D) |
| 14 | TC-RPT-14 | [POST /reports] submittedDate không phải ngày | submittedDate=abc | 400 | 200; id=5; tạo báo cáo, submittedDate=null (giá trị "abc" bị bỏ qua) | FAIL | X-SDT1, R6 | submittedDate sai bị bỏ qua, vẫn tạo báo cáo (Bug D) |
| 15 | TC-RPT-15 | [POST /reports] Không truyền status | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary (không có key status) | 200; status = "submitted" (service đặt mặc định) | 200; id=14; status="submitted" | PASS | V-STS1, ST-01, R1 |  |
| 16 | TC-RPT-16 | [POST /reports] status giá trị lạ | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status=ABC | 400, không tạo báo cáo | 200; id=6; status="ABC" được lưu nguyên | FAIL | X-STS1, ST-05, R7 | status không được validate (Bug B) |
| 17 | TC-RPT-17 | [POST /reports] Dự án không tồn tại | projectId=99999 | 404 hoặc 400 | 200; id=10; tạo báo cáo cho projectId=99999 | FAIL | X-PJ1, R3 | Tạo báo cáo cho dự án không tồn tại (Bug C) |
| 18 | TC-RPT-18 | [POST /reports] Dự án của mentor khác | projectId=P-OTHER | 403 | Chưa chạy | BLOCKED | X-PJ3, R4 | Chưa chạy: thiếu tài khoản mentor thứ hai (MEN2) |
| 19 | TC-RPT-19 | [POST /reports] File 0 byte | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-EMPTY | 200, báo cáo tạo không có file (code chỉ lưu file có dữ liệu); SRS không quy định | 200; id=26; fileName=null; fileSize=null (file 0 byte bị bỏ qua) | PASS | X-FILE1, B-FIL0 | PASS theo code (file 0 byte bị bỏ qua); SRS không quy định |
| 20 | TC-RPT-20 | [POST /reports] File sai định dạng | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-EXE | 400 | 200; id=24; fileName="f_exe.exe"; fileSize="1.5 KB" (file .exe được lưu) | FAIL | X-FILE2, R8 | Bug E: file .exe được lưu, SRS chỉ cho pdf, doc, docx, ppt, pptx |
| 21 | TC-RPT-21 | [POST /reports] File vượt 20 MB | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-20MB+1 | 400 hoặc 413 | 400; message "Maximum upload size exceeded"; data=null | PASS | X-FILE3, B-FIL2, R8 | Chạy lại lần 2 với đúng file 20 MB + 1 byte. PASS nhưng giới hạn upload thấp hơn 20 MB (Bug F) |
| 22 | TC-RPT-22 | [POST /reports] Không gửi token | Authorization = No Auth | 401 | 403; body mặc định của Spring (timestamp, status 403, error "Forbidden", message "Access Denied") | FAIL | X-AUTH1, R2 | Bug G: trả 403 thay vì 401 |
| 23 | TC-RPT-23 | [POST /reports] Token TALENT | Bearer T-TALENT | 403 | 400; message "Access Denied"; data=null | FAIL | X-AUTH3, R2 | Bug H: trả 400 thay vì 403 |
| 24 | TC-RPT-24 | [POST /reports] Token LAB_ADMIN | Bearer T-ADMIN | 403 | 400; message "Access Denied"; data=null | FAIL | X-AUTH4, R2 | Bug H: trả 400 thay vì 403 |
| 25 | TC-RPT-25 | [POST /reports] Gửi JSON thay vì form-data | Body raw JSON | 415 (consumes multipart/form-data) | 500; message "An error occurred: Content-Type 'application/json' is not supported"; data=null | FAIL | X-CT1 | Bug A: trả 500 thay vì 415 |
| 26 | TC-RPT-26 | [GET /reports] Danh sách khi mentor đã có báo cáo | Không có tham số | 200; data là mảng; mỗi phần tử có id, student, studentId, reportName, status, submittedDate, dueDate, score, fileSize, fileName | 200; data là mảng; mọi phần tử có đủ 10 field id, student, studentId, reportName, status, submittedDate, dueDate, score, fileSize, fileName | PASS | V-AUTH1, V-LST1 |  |
| 27 | TC-RPT-27 | [GET /reports] Thứ tự danh sách | Không có tham số | dueDate giảm dần | 200; các dueDate 2026-12-31 đứng trước, hai bản ghi dueDate 2026-02-28 (id 16, 21) đứng cuối, giảm dần | PASS | V-LST1 | Thứ tự phụ trong cùng dueDate không theo id; SRS không quy định |
| 28 | TC-RPT-28 | [GET /reports] Mentor chưa có báo cáo | Không có tham số | 200; data = [] | Chưa chạy | BLOCKED | V-LST2 | Chưa chạy: thiếu tài khoản mentor thứ hai (MEN2) |
| 29 | TC-RPT-29 | [GET /reports] Cách ly giữa các mentor | Không có tham số | Không thấy báo cáo của MEN1 | Chưa chạy | BLOCKED | V-LST3 | Chưa chạy: thiếu tài khoản mentor thứ hai (MEN2) |
| 30 | TC-RPT-30 | [GET /reports] Không gửi token | No Auth | 401 | 403; body mặc định của Spring, "Access Denied" | FAIL | X-AUTH1 | Bug G: trả 403 thay vì 401 |
| 31 | TC-RPT-31 | [GET /reports] Token TALENT | Bearer T-TALENT | 403 | 400; message "Access Denied"; data=null | FAIL | X-AUTH3 | Bug H: trả 400 thay vì 403 |
| 32 | TC-RPT-32 | [GET /reports/{id}/file] Tải file báo cáo có file | id=R-FILE | 200; header Content-Disposition chứa "attachment" | 200; Content-Disposition: attachment; filename="f_pdf.pdf" | PASS | V-RID1, DL-R1 |  |
| 33 | TC-RPT-33 | [GET /reports/{id}/file] Báo cáo không tồn tại | id=99999 | 404 ("Report not found") | 404; message "Report not found"; data=null | PASS | X-RID1, DL-R3 |  |
| 34 | TC-RPT-34 | [GET /reports/{id}/file] Báo cáo của mentor khác | id=R-OTHER | 404 hoặc 403 (code trả "Report not found"); SRS không quy định | Chưa chạy | BLOCKED | X-RID2, DL-R4 | Chưa chạy: thiếu tài khoản mentor thứ hai (MEN2) |
| 35 | TC-RPT-35 | [GET /reports/{id}/file] Báo cáo không có file | id=R-NOFILE | 404 ("File not found") | 404; message "File not found"; data=null | PASS | X-RID3, DL-R5 |  |
| 36 | TC-RPT-36 | [GET /reports/{id}/file] id không phải số | id=abc | 400 (kiểu long) | 400; message "Failed to convert value of type 'java.lang.String' to required type 'long'; For input string: \"abc\"" | PASS | X-RID4, DL-R3 |  |
| 37 | TC-RPT-37 | [GET /reports/{id}/file] Không gửi token | No Auth | 401 | 403; body mặc định của Spring, "Access Denied", path /api/mentor/reports/22/file | FAIL | X-AUTH1, DL-R2 | Bug G: trả 403 thay vì 401 |
| 38 | TC-RPT-38 | [GET /reports/{id}/file] Token TALENT | Bearer T-TALENT | 403 | 400; message "Access Denied"; data=null | FAIL | X-AUTH3, DL-R2 | Bug H: trả 400 thay vì 403 |
| 39 | TC-RPT-39 | [GET /reports/{id}/file] File đã bị xóa khỏi ổ đĩa | id=R-FILE | 404 ("File not found") | 404; message "File not found"; data=null (sau khi xóa file f_pdf.pdf trong thư mục tạm) | PASS | X-RID5, DL-R6 |  |
| 40 | TC-RPT-40 | [POST /reports] Token sai format | Authorization = Bearer abc | 401 | 500; "Invalid compact JWT string: Compact JWSs must contain exactly 2 period characters, and compact JWEs must contain exactly 4.  Found: 0" | FAIL | X-AUTH2, R2 | Bug I: trả 500, lộ message nội bộ của thư viện JWT |
| 41 | TC-RPT-41 | [POST /reports] projectId = 0 | projectId=0 | 404 hoặc 400 | 200; id=11; tạo báo cáo với projectId=0 | FAIL | B-PJ1, R3 | Tạo báo cáo với projectId = 0 (Bug C) |
| 42 | TC-RPT-42 | [POST /reports] projectId âm | projectId=-1 | 404 hoặc 400 | 200; id=12; tạo báo cáo với projectId=-1 | FAIL | B-PJ2, R3 | Tạo báo cáo với projectId âm (Bug C) |
| 43 | TC-RPT-43 | [POST /reports] status rỗng | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status = (rỗng) | 200; status = "submitted" (code coi rỗng như không truyền) | 200; id=20; status="submitted" | PASS | V-STS3 | status rỗng được coi như không truyền |
| 44 | TC-RPT-44 | [POST /reports] File đúng 20 MB | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-20MB | 200 | 400; message "Maximum upload size exceeded"; file 20 MB bị từ chối | FAIL | B-FIL1 | Bug F: file đúng 20 MB bị từ chối (SRS tối đa 20 MB) |
| 45 | TC-RPT-45 | [POST /reports] Nộp lại đúng dữ liệu đã nộp | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary | SRS: không cho nộp trùng (UNIQUE project_id + reporting_period), mã lỗi 409 hoặc 400; code không có reportingPeriod, ghi nhận thực tế | 200; id=27; tạo thêm báo cáo trùng dữ liệu, không báo lỗi | FAIL | S-DUP1, ST-06 | Bug K: SRS yêu cầu chống nộp trùng, code cho nộp trùng |
| 46 | TC-RPT-46 | [GET /reports/{id}/file] Tải file với token sai format | Authorization = Bearer abc | 401 | 500; "Invalid compact JWT string..." (path /api/mentor/reports/22/file) | FAIL | X-AUTH2 | Bug I: trả 500, lộ message nội bộ của thư viện JWT |
| 47 | TC-RPT-47 | [POST /reports] dueDate = 28/02/2026 | dueDate=2026-02-28 | 200 | 200; id=21; dueDate="2026-02-28" | PASS | B-DATE1 |  |
| 48 | TC-RPT-48 | [POST /reports] dueDate = 29/02/2026 | dueDate=2026-02-29 | 400 | 400; message "Missing field: dueDate" (ngày 29/02/2026 bị báo là thiếu) | PASS | B-DATE2, R6 | Đúng mã 400 nhưng message "Missing field: dueDate" gây hiểu nhầm (Bug D) |
| 49 | TC-RPT-49 | [POST /reports] status = submitted tường minh | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status=submitted | 200; status = "submitted" | 200; id=17; status="submitted" | PASS | V-STS2, ST-02, R1 |  |
| 50 | TC-RPT-50 | [POST /reports] status = late | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status=late | 200; status = "late" | 200; id=18; status="late" | PASS | V-STS2, R1 |  |
| 51 | TC-RPT-51 | [PUT /reports/{id}] Sửa báo cáo đã nộp | PUT /api/mentor/reports/{id} | SRS: 200, báo cáo được cập nhật; code không có endpoint sửa báo cáo (dự kiến 404 hoặc 405) | 500; message "An error occurred: No static resource api/mentor/reports/22." | FAIL | ST-07 | Bug A, J: endpoint theo SRS không tồn tại, trả 500 thay vì 404 |
| 52 | TC-RPT-52 | [POST /reports] status = DRAFT theo SRS | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status=DRAFT | SRS: 200, status = DRAFT; code dùng giá trị chữ thường, ghi nhận thực tế | 200; id=28; status="DRAFT" được lưu nguyên | PASS | V-STS4, ST-04 | status "DRAFT" được lưu nguyên, code không validate (Bug B) |
| 53 | TC-RPT-53 | [POST /reports] POST theo đường dẫn SRS | POST /api/mentor/projects/{projectId}/reports, body JSON theo SRS (reportType, reportingPeriod...) | SRS: 200, status SUBMITTED; code không có đường dẫn này (dự kiến 404 hoặc 405) | 500; message "An error occurred: No static resource api/mentor/projects/1/reports." | FAIL | X-URL1 | Bug A, J: endpoint theo SRS không tồn tại, trả 500 thay vì 404 |
| 54 | TC-RPT-54 | [GET /reports] GET theo đường dẫn SRS | GET /api/mentor/projects/{projectId}/reports | SRS: 200, danh sách báo cáo của dự án; code không có đường dẫn này (dự kiến 404 hoặc 405) | 500; message "An error occurred: No static resource api/mentor/projects/1/reports." | FAIL | X-URL2 | Bug A, J: endpoint theo SRS không tồn tại, trả 500 thay vì 404 |
| 55 | TC-RPT-55 | [POST /reports] Không truyền summary | Bỏ key summary | 200 | 200; id=19; tạo báo cáo khi không có summary | PASS | V-SUM2 |  |

---

## 3. Kiểm tra bao phủ tag

### Lớp tương đương

| Tag | Mô tả | Giá trị đại diện | Test bao phủ | Kết quả |
|---|---|---|---|---|
| V-AUTH1 | Token hợp lệ, role MENTOR | Bearer token MEN1 | TC-RPT-01, 26 | PASS |
| X-AUTH1 | Không gửi token | Không có header Authorization | TC-RPT-22, 30, 37 | FAIL |
| X-AUTH2 | Token sai format | `Bearer abc` | TC-RPT-40, 46 | FAIL |
| X-AUTH3 | Role TALENT | Token T-TALENT | TC-RPT-23, 31, 38 | FAIL |
| X-AUTH4 | Role LAB_ADMIN | Token T-ADMIN | TC-RPT-24 | FAIL |
| V-PJ1 | Dự án được gán cho mentor | P1 | TC-RPT-01 | PASS |
| X-PJ1 | Dự án không tồn tại | `99999` | TC-RPT-17 | FAIL |
| X-PJ2 | Không phải số | `abc` | TC-RPT-09 | PASS |
| X-PJ3 | Dự án của mentor khác | P-OTHER | TC-RPT-18 | BLOCKED |
| X-PJ4 | Thiếu field | Bỏ key projectId | TC-RPT-08 | FAIL |
| V-REQ1 | Cả ba có nội dung | SV001, TEST Nguyen Van A, TEST Bao cao tuan 1 | TC-RPT-01 | PASS |
| X-REQ1 | Thiếu student | Bỏ key student | TC-RPT-04 | FAIL |
| X-REQ2 | Thiếu studentId | Bỏ key studentId | TC-RPT-05 | FAIL |
| X-REQ3 | Thiếu reportName | Bỏ key reportName | TC-RPT-06 | FAIL |
| X-REQ4 | student rỗng | student = (rỗng) | TC-RPT-10 | PASS |
| X-REQ5 | reportName toàn khoảng trắng | reportName = 3 dấu cách | TC-RPT-11 | PASS |
| V-DATE1 | Định dạng yyyy-MM-dd | `2026-12-31` | TC-RPT-01 | PASS |
| X-DATE1 | Thiếu | Bỏ key dueDate | TC-RPT-07 | FAIL |
| X-DATE2 | Sai định dạng | `31/12/2026` | TC-RPT-12 | PASS |
| X-DATE3 | Ngày không tồn tại | `2026-02-30` | TC-RPT-13 | PASS |
| V-SDT1 | Không truyền | Bỏ key submittedDate | TC-RPT-01 | PASS |
| V-SDT2 | Có giá trị hợp lệ | `2026-11-08` | TC-RPT-02 | PASS |
| X-SDT1 | Giá trị không phải ngày | `abc` | TC-RPT-14 | FAIL |
| V-STS1 | Không truyền | Bỏ key status | TC-RPT-01, 15 | PASS |
| V-STS2 | Giá trị trong danh sách của DTO (submitted, pending, late) | `pending`, `submitted`, `late` | TC-RPT-02, 49, 50 | PASS |
| V-STS3 | Rỗng | status = (rỗng) | TC-RPT-43 | PASS |
| V-STS4 | Giá trị DRAFT theo SRS | `DRAFT` | TC-RPT-52 | PASS |
| X-STS1 | Giá trị lạ | `ABC` | TC-RPT-16 | FAIL |
| V-SUM1 | Có nội dung | `Tom tat` | TC-RPT-01 | PASS |
| V-SUM2 | Không truyền | Bỏ key summary | TC-RPT-55 | PASS |
| V-FILE1 | Không đính file | Không có key file | TC-RPT-01 | PASS |
| V-FILE2 | PDF nhỏ hợp lệ | F-PDF | TC-RPT-03 | PASS |
| X-FILE1 | File 0 byte (code bỏ qua file rỗng) | F-EMPTY | TC-RPT-19 | PASS |
| X-FILE2 | Sai định dạng (SRS: pdf, doc, docx, ppt, pptx) | F-EXE (`.exe`) | TC-RPT-20 | FAIL |
| X-FILE3 | Quá dung lượng (SRS: tối đa 20 MB) | F-20MB+1 | TC-RPT-21 | PASS |
| X-CT1 | Gửi JSON thay vì multipart | raw JSON vào POST /reports | TC-RPT-25 | FAIL |
| X-URL1 | POST theo đường dẫn SRS | `/api/mentor/projects/{projectId}/reports` | TC-RPT-53 | FAIL |
| X-URL2 | GET theo đường dẫn SRS | `/api/mentor/projects/{projectId}/reports` | TC-RPT-54 | FAIL |
| S-DUP1 | Gửi lại đúng dữ liệu đã nộp | POST 2 lần cùng body | TC-RPT-45 | FAIL |
| V-LST1 | Mentor có báo cáo | MEN1 sau khi đã nộp | TC-RPT-26, 27 | PASS |
| V-LST2 | Mentor chưa có báo cáo nào | Mentor mới | TC-RPT-28 | BLOCKED |
| V-LST3 | Cách ly dữ liệu giữa các mentor | Đăng nhập MEN2 | TC-RPT-29 | BLOCKED |
| V-RID1 | Báo cáo của mentor, có file | R-FILE | TC-RPT-32 | PASS |
| X-RID1 | Không tồn tại | `99999` | TC-RPT-33 | PASS |
| X-RID2 | Báo cáo của mentor khác | R-OTHER | TC-RPT-34 | BLOCKED |
| X-RID3 | Báo cáo không có file | R-NOFILE | TC-RPT-35 | PASS |
| X-RID4 | Không phải số | `abc` | TC-RPT-36 | PASS |
| X-RID5 | File đã bị xóa khỏi ổ đĩa | R-FILE sau khi xóa file | TC-RPT-39 | PASS |

### Giá trị biên

| Tag | Mô tả | Giá trị | Test bao phủ | Kết quả |
|---|---|---|---|---|
| B-PJ1 | 0 | Biên dưới | TC-RPT-41 | FAIL |
| B-PJ2 | -1 | Giá trị âm | TC-RPT-42 | FAIL |
| B-DATE1 | 2026-02-28 | Ngày cuối hợp lệ | TC-RPT-47 | PASS |
| B-DATE2 | 2026-02-29 | Ngay sau ngày cuối | TC-RPT-48 | PASS |
| B-FIL0 | 0 byte | Rỗng | TC-RPT-19 | PASS |
| B-FIL1 | 20 MB | Đúng mức tối đa | TC-RPT-44 | FAIL |
| B-FIL2 | 20 MB + 1 byte | Ngay trên max | TC-RPT-21 | PASS |

### Chuyển đổi trạng thái

| ST | Transition | Test bao phủ | Kết quả |
|---|---|---|---|
| ST-01 | (chưa có) + POST không truyền status → SUBMITTED | TC-RPT-15 | PASS |
| ST-02 | (chưa có) + POST status=submitted → SUBMITTED | TC-RPT-49 | PASS |
| ST-03 | (chưa có) + POST status=pending → SRS không quy định (code lưu pending) | TC-RPT-02 | PASS |
| ST-04 | (chưa có) + POST status=DRAFT → DRAFT (theo SRS) | TC-RPT-52 | PASS |
| ST-05 | (chưa có) + POST status=ABC → Không tạo | TC-RPT-16 | FAIL |
| ST-06 | SUBMITTED + POST lại đúng dữ liệu đã nộp → Không đổi | TC-RPT-45 | FAIL |
| ST-07 | SUBMITTED + PUT sửa báo cáo → SUBMITTED (đã cập nhật) | TC-RPT-51 | FAIL |

### Bảng quyết định

| Rule | Mô tả | Test bao phủ | Kết quả |
|---|---|---|---|
| R1 | Tất cả hợp lệ → 200 tạo báo cáo | TC-RPT-01, 02, 03, 15, 49, 50 | PASS |
| R2 | Không có token hợp lệ hoặc sai role → 401/403 | TC-RPT-22, 23, 24, 40 | FAIL |
| R3 | projectId không hợp lệ hoặc không tồn tại → 404/400 | TC-RPT-08, 09, 17, 41, 42 | FAIL (08, 17, 41, 42), PASS (09) |
| R4 | Mentor không thuộc dự án → 403 | TC-RPT-18 | BLOCKED |
| R5 | Thiếu hoặc rỗng field bắt buộc → 400 | TC-RPT-04, 05, 06, 10, 11 | FAIL (04, 05, 06), PASS (10, 11) |
| R6 | Ngày không hợp lệ → 400 | TC-RPT-07, 12, 13, 14, 48 | FAIL (07, 14), PASS (12, 13, 48) |
| R7 | status không hợp lệ → 400 | TC-RPT-16 | FAIL |
| R8 | File không hợp lệ → 400 | TC-RPT-20, 21 | FAIL (20), PASS (21) |
| DL-R1 | Tất cả hợp lệ → 200 tải file | TC-RPT-32 | PASS |
| DL-R2 | Không có token hợp lệ hoặc sai role → 401/403 | TC-RPT-37, 38 | FAIL |
| DL-R3 | reportId không tồn tại hoặc sai kiểu → 404/400 | TC-RPT-33, 36 | PASS |
| DL-R4 | Báo cáo của mentor khác → 404/403 | TC-RPT-34 | BLOCKED |
| DL-R5 | Báo cáo không có file → 404 | TC-RPT-35 | PASS |
| DL-R6 | File không còn trên ổ đĩa → 404 | TC-RPT-39 | PASS |

> **Bao phủ (trên tổng TC):** 48/48 EP tags, 7/7 BVA tags, 7/7 state transitions, 14/14 decision rules - **100%**.  
> **Đã thực thi:** 51/55 test case. Kết quả: 27/48 EP tags PASS (17 FAIL, 4 chưa chạy), 4/7 BVA tags PASS (3 FAIL, 0 chưa chạy), 4/7 state transitions PASS (3 FAIL, 0 chưa chạy), 5/14 decision rules PASS (7 FAIL, 2 chưa chạy).

---

## 4. Danh sách bug phát hiện

Mã Jira điền sau khi tạo ticket (loại Bug, để Unassigned). Bug A, G, H, I nằm ở lớp xác thực và xử lý lỗi chung, cần kiểm tra Jira trùng với ticket của module khác.

| Bug | Tiêu đề | TC | Mức | Mã Jira |
|---|---|---|---|---|
| A | API trả 500 thay vì 4xx cho lỗi request (thiếu tham số bắt buộc, sai Content-Type, endpoint không tồn tại) | 04 đến 08, 25, 51, 53, 54 | Medium | LABODC-__ |
| B | POST /reports không validate `status`, chấp nhận giá trị bất kỳ ("ABC", "DRAFT") | 16, 52 | Medium | LABODC-__ |
| C | POST /reports tạo báo cáo cho `projectId` không tồn tại (99999, 0, -1) | 17, 41, 42 | High | LABODC-__ |
| D | Xử lý ngày sai: `dueDate` sai định dạng bị báo "Missing field: dueDate", `submittedDate` sai bị bỏ qua | 12, 13, 48, 14 | Low | LABODC-__ |
| E | POST /reports nhận và lưu file `.exe`, không kiểm tra loại file | 20 | High | LABODC-__ |
| F | File 20 MB bị từ chối "Maximum upload size exceeded", file 1.2 MB lên được, giới hạn thấp hơn SRS | 44, 21 | Medium | LABODC-__ |
| G | Không có token trả 403 thay vì 401 | 22, 30, 37 | Low | LABODC-__ |
| H | Sai role trả 400 thay vì 403 | 23, 24, 31, 38 | Low | LABODC-__ |
| I | Token sai format trả 500 và lộ message nội bộ của thư viện JWT | 40, 46 | Medium | LABODC-__ |
| J | API báo cáo không theo SRS FR-MEN-004 (đường dẫn `/projects/{projectId}/reports`, body JSON, `PUT`) | 51, 53, 54 | Medium | LABODC-__ |
| K | Cho nộp báo cáo trùng dữ liệu, không có ràng buộc chống trùng | 45 | Low | LABODC-__ |
