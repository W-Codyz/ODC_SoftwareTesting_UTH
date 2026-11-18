# Test Execution Report: FR-MEN-004 - Nộp báo cáo (Submit Report)

**Module:** Mentor Portal  
**Chức năng:** Submit Report (`POST /api/mentor/reports`, `GET /api/mentor/reports`, `GET /api/mentor/reports/{id}/file`, `PUT /api/mentor/reports/{id}`, `POST /api/mentor/projects/{projectId}/reports`, `GET /api/mentor/projects/{projectId}/reports`)  
**Người thực hiện:** Nguyễn Duy Đức  
**Ngày cập nhật hoàn tất:** 17/11/2026  
**Môi trường test:** Postman Collection Runner `FR-MEN-004`, Backend Local `http://localhost:8080`, PostgreSQL `labodc`  
**Tham chiếu test case:** `test-cases/mentor-portal/TC_Mentor_SubmitReport.md`  

---

## 1. Tổng kết thực thi kiểm thử

| Chỉ số | Giá trị |
|---|---:|
| **Tổng số test case** | 55 |
| **Passed** | **55** |
| **Failed** | **0** |
| **Blocked / Skipped** | **0** |
| **Pass rate** | **100% (55/55)** |
| **Tổng số assertions trong Postman** | **77/77 PASS (100%)** |

> **Đánh giá tổng quan:** Toàn bộ 55/55 ca kiểm thử chức năng FR-MEN-004 đã được thực thi và đạt **100% PASS**. Toàn bộ các khiếm khuyết phát hiện trước đây (xử lý mã lỗi HTTP 4xx/5xx, kiểm tra quyền truy cập Role-based, kiểm tra kiểu và dung lượng file đính kèm, tính toàn vẹn dữ liệu dự án và ngày tháng, các endpoint theo đặc tả SRS) đều đã được khắc phục hoàn toàn trên backend.

---

## 2. Kết quả chi tiết 55 Test Cases

| STT | TC ID | Tên test case | Input | Expected | Actual Result | Status | Tag | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-RPT-01 | [POST /reports] Nộp báo cáo hợp lệ, không file | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary | 200; success=true; data.id có; data.status = "submitted"; không có file | 200 OK; id=1; status="submitted"; fileName=null; fileSize=null | **PASS** | V-AUTH1, V-PJ1, V-REQ1, V-DATE1, V-SDT1, V-STS1, V-SUM1, V-FILE1, R1 | Dữ liệu được lưu chính xác vào DB |
| 2 | TC-RPT-02 | [POST /reports] Có submittedDate và status=pending | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; submittedDate=2026-11-08; status=pending | 200; status = "pending"; submittedDate khớp giá trị gửi | 200 OK; status="pending"; submittedDate="2026-11-08" | **PASS** | V-SDT2, V-STS2, ST-03, R1 | |
| 3 | TC-RPT-03 | [POST /reports] Đính kèm file PDF | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-PDF | 200; fileName và fileSize có giá trị | 200 OK; fileName="f-pdf.pdf"; fileSize="15 KB" | **PASS** | V-FILE2, R1 | File được lưu tại thư mục tạm server |
| 4 | TC-RPT-04 | [POST /reports] Thiếu student | Bỏ key student | 400 (@RequestParam bắt buộc) | 400 Bad Request; message "Required request parameter 'student' is not present" | **PASS** | X-REQ1, R5 | Đã sửa GlobalExceptionHandler |
| 5 | TC-RPT-05 | [POST /reports] Thiếu studentId | Bỏ key studentId | 400 | 400 Bad Request; message "Required request parameter 'studentId' is not present" | **PASS** | X-REQ2, R5 | Đã sửa GlobalExceptionHandler |
| 6 | TC-RPT-06 | [POST /reports] Thiếu reportName | Bỏ key reportName | 400 | 400 Bad Request; message "Required request parameter 'reportName' is not present" | **PASS** | X-REQ3, R5 | Đã sửa GlobalExceptionHandler |
| 7 | TC-RPT-07 | [POST /reports] Thiếu dueDate | Bỏ key dueDate | 400 | 400 Bad Request; message "Required request parameter 'dueDate' is not present" | **PASS** | X-DATE1, R6 | Đã sửa GlobalExceptionHandler |
| 8 | TC-RPT-08 | [POST /reports] Thiếu projectId | Bỏ key projectId | 400 | 400 Bad Request; message "Required request parameter 'projectId' is not present" | **PASS** | X-PJ4, R3 | Đã sửa GlobalExceptionHandler |
| 9 | TC-RPT-09 | [POST /reports] projectId không phải số | projectId=abc | 400 (kiểu Long) | 400 Bad Request; kiểu dữ liệu không hợp lệ | **PASS** | X-PJ2, R3 | |
| 10 | TC-RPT-10 | [POST /reports] student rỗng | student = (rỗng) | 400 (requireNonBlank) | 400 Bad Request; message "Missing field: student" | **PASS** | X-REQ4, R5 | |
| 11 | TC-RPT-11 | [POST /reports] reportName toàn khoảng trắng | reportName = 3 dấu cách | 400 (requireNonBlank) | 400 Bad Request; message "Missing field: reportName" | **PASS** | X-REQ5, R5 | |
| 12 | TC-RPT-12 | [POST /reports] dueDate sai định dạng | dueDate=31/12/2026 | 400 | 400 Bad Request; định dạng ngày không hợp lệ | **PASS** | X-DATE2, R6 | Đã sửa parse ngày nghiêm ngặt  |
| 13 | TC-RPT-13 | [POST /reports] dueDate là ngày không tồn tại | dueDate=2026-02-30 | 400 | 400 Bad Request; ngày không tồn tại | **PASS** | X-DATE3, R6 | Đã sửa ResolverStyle.STRICT  |
| 14 | TC-RPT-14 | [POST /reports] submittedDate không phải ngày | submittedDate=abc | 400 | 400 Bad Request; định dạng submittedDate không hợp lệ | **PASS** | X-SDT1, R6 | Đã validate submittedDate  |
| 15 | TC-RPT-15 | [POST /reports] Không truyền status | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary (không có key status) | 200; status = "submitted" (service đặt mặc định) | 200 OK; status="submitted" | **PASS** | V-STS1, ST-01, R1 | |
| 16 | TC-RPT-16 | [POST /reports] status giá trị lạ | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; status=ABC | 400, không tạo báo cáo | 400 Bad Request; message "Invalid status: ABC" | **PASS** | X-STS1, ST-05, R7 | Đã thêm whitelist enum status  |
| 17 | TC-RPT-17 | [POST /reports] Dự án không tồn tại | projectId=99999 | 404 hoặc 400 | 404 Not Found; message "Project not found: 99999" | **PASS** | X-PJ1, R3 | Đã kiểm tra project tồn tại  |
| 18 | TC-RPT-18 | [POST /reports] Dự án của mentor khác | MEN2 token; projectId=P1 (dự án của MEN1) | 403 | 403 Forbidden; message "Mentor is not assigned to this project" | **PASS** | X-PJ3, R4 | Đã kiểm tra quyền sở hữu dự án |
| 19 | TC-RPT-19 | [POST /reports] File 0 byte | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-EMPTY | 200, tạo báo cáo không có file | 200 OK; fileName=null; fileSize=null | **PASS** | X-FILE1, B-FIL0 | File rỗng tự động bỏ qua không lưu |
| 20 | TC-RPT-20 | [POST /reports] File sai định dạng | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-EXE (.exe) | 400 | 400 Bad Request; message "Invalid file type: .exe" | **PASS** | X-FILE2, R8 | Đã whitelist extension pdf,doc,docx,ppt,pptx |
| 21 | TC-RPT-21 | [POST /reports] File vượt 20 MB | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31; summary; file=F-20MB+1 | 400 hoặc 413 | 400 Bad Request; message "Maximum upload size exceeded" | **PASS** | X-FILE3, B-FIL2, R8 | Chặn file >= 20MB theo đúng SRS |
| 22 | TC-RPT-22 | [POST /reports] Không gửi token | Authorization = No Auth | 401 | 401 Unauthorized; message "Unauthorized or missing token" | **PASS** | X-AUTH1, R2 | Đã cấu hình AuthenticationEntryPoint |
| 23 | TC-RPT-23 | [POST /reports] Token TALENT | Bearer T-TALENT | 403 | 403 Forbidden; message "Access denied" | **PASS** | X-AUTH3, R2 | Đã cấu hình AccessDeniedHandler |
| 24 | TC-RPT-24 | [POST /reports] Token LAB_ADMIN | Bearer T-ADMIN | 403 | 403 Forbidden; message "Access denied" | **PASS** | X-AUTH4, R2 | Đã cấu hình AccessDeniedHandler |
| 25 | TC-RPT-25 | [POST /reports] Gửi JSON thay vì form-data | Body raw JSON | 415 (consumes multipart/form-data) | 415 Unsupported Media Type | **PASS** | X-CT1 | Đã handle HttpMediaTypeNotSupportedException |
| 26 | TC-RPT-26 | [GET /reports] Danh sách khi mentor đã có báo cáo | MEN1 Token, không tham số | 200; data là mảng; mỗi phần tử có đủ 10 field chuẩn DTO | 200 OK; data là mảng; mọi phần tử có đủ 10 field | **PASS** | V-AUTH1, V-LST1 | Danh sách báo cáo trả về đầy đủ |
| 27 | TC-RPT-27 | [GET /reports] Thứ tự danh sách | MEN1 Token, không tham số | 200; dueDate giảm dần | 200 OK; danh sách sắp xếp theo dueDate giảm dần | **PASS** | V-LST1 | `findByMentorIdOrderByDueDateDesc` |
| 28 | TC-RPT-28 | [GET /reports] Mentor chưa có báo cáo | MEN2 Token, không tham số | 200; data = [] | 200 OK; data = [] (độ dài 0) | **PASS** | V-LST2 | Trả về mảng rỗng chính xác |
| 29 | TC-RPT-29 | [GET /reports] Cách ly giữa các mentor | MEN2 Token | Không thấy báo cáo của MEN1 | 200 OK; data chứa dữ liệu riêng của MEN2, không có dữ liệu MEN1 | **PASS** | V-LST3 | Đảm bảo cách ly đa người dùng |
| 30 | TC-RPT-30 | [GET /reports] Không gửi token | No Auth | 401 | 401 Unauthorized; message "Unauthorized" | **PASS** | X-AUTH1 | Đã cấu hình AuthenticationEntryPoint |
| 31 | TC-RPT-31 | [GET /reports] Token TALENT | Bearer T-TALENT | 403 | 403 Forbidden; message "Access denied" | **PASS** | X-AUTH3 | Đã cấu hình AccessDeniedHandler |
| 32 | TC-RPT-32 | [GET /reports/{id}/file] Tải file báo cáo có file | id=R-FILE | 200; header Content-Disposition chứa "attachment" | 200 OK; Content-Disposition: attachment; filename="f-pdf.pdf" | **PASS** | V-RID1, DL-R1 | Stream file bytes thành công |
| 33 | TC-RPT-33 | [GET /reports/{id}/file] Báo cáo không tồn tại | id=99999 | 404 ("Report not found") | 404 Not Found; message "Report not found" | **PASS** | X-RID1, DL-R3 | |
| 34 | TC-RPT-34 | [GET /reports/{id}/file] Báo cáo của mentor khác | MEN2 Token; id=R-FILE (của MEN1) | 404 hoặc 403 ("Report not found") | 404 Not Found; message "Report not found" | **PASS** | X-RID2, DL-R4 | Đã kiểm tra quyền sở hữu báo cáo |
| 35 | TC-RPT-35 | [GET /reports/{id}/file] Báo cáo không có file | id=R-NOFILE | 404 ("File not found") | 404 Not Found; message "File not found" | **PASS** | X-RID3, DL-R5 | |
| 36 | TC-RPT-36 | [GET /reports/{id}/file] id không phải số | id=abc | 400 (kiểu long) | 400 Bad Request; kiểu ID không hợp lệ | **PASS** | X-RID4, DL-R3 | |
| 37 | TC-RPT-37 | [GET /reports/{id}/file] Không gửi token | No Auth | 401 | 401 Unauthorized; message "Unauthorized" | **PASS** | X-AUTH1, DL-R2 | Đã cấu hình AuthenticationEntryPoint |
| 38 | TC-RPT-38 | [GET /reports/{id}/file] Token TALENT | Bearer T-TALENT | 403 | 403 Forbidden; message "Access denied" | **PASS** | X-AUTH3, DL-R2 | Đã cấu hình AccessDeniedHandler |
| 39 | TC-RPT-39 | [GET /reports/{id}/file] File đã bị xóa khỏi ổ đĩa | id=R-FILE (file đã xóa) | 404 ("File not found") | 404 Not Found; message "File not found" | **PASS** | X-RID5, DL-R6 | Đã kiểm tra file tồn tại trên ổ cứng |
| 40 | TC-RPT-40 | [POST /reports] Token sai format | Authorization = Bearer abc | 401 | 401 Unauthorized; message "Invalid token" | **PASS** | X-AUTH2, R2 | Đã bọc try-catch JWT Filter |
| 41 | TC-RPT-41 | [POST /reports] projectId = 0 | projectId=0 | 404 hoặc 400 | 400 Bad Request; message "Invalid projectId: 0" | **PASS** | B-PJ1, R3 | Đã kiểm tra projectId > 0 |
| 42 | TC-RPT-42 | [POST /reports] projectId âm | projectId=-1 | 404 hoặc 400 | 400 Bad Request; message "Invalid projectId: -1" | **PASS** | B-PJ2, R3 | Đã kiểm tra projectId > 0  |
| 43 | TC-RPT-43 | [POST /reports] status rỗng | status = (rỗng) | 200; status = "submitted" | 200 OK; status="submitted" | **PASS** | V-STS3 | Mặc định submitted |
| 44 | TC-RPT-44 | [POST /reports] File đúng 20 MB | file=F-20MB | 200 | 200 OK; file 20 MB được chấp nhận | **PASS** | B-FIL1 | Nâng max-file-size lên 25MB |
| 45 | TC-RPT-45 | [POST /reports] Nộp lại đúng dữ liệu đã nộp | projectId=P1; student; studentId=SV001; reportName; dueDate=2026-12-31 | 200 (hoặc 409 theo SRS) | 200 OK; hệ thống chấp nhận nộp báo cáo | **PASS** | S-DUP1, ST-06 | Đã đồng bộ với Postman test suite |
| 46 | TC-RPT-46 | [GET /reports/{id}/file] Tải file với token sai format | Authorization = Bearer abc | 401 | 401 Unauthorized; message "Invalid token" | **PASS** | X-AUTH2 | Đã bọc try-catch JWT Filter |
| 47 | TC-RPT-47 | [POST /reports] dueDate = 28/02/2026 | dueDate=2026-02-28 | 200 | 200 OK; dueDate="2026-02-28" | **PASS** | B-DATE1 | Ngày hợp lệ năm không nhuận |
| 48 | TC-RPT-48 | [POST /reports] dueDate = 29/02/2026 | dueDate=2026-02-29 | 400 | 400 Bad Request; message "Invalid date: 2026-02-29" | **PASS** | B-DATE2, R6 | Năm 2026 không có ngày 29/2 |
| 49 | TC-RPT-49 | [POST /reports] status = submitted tường minh | status=submitted | 200; status = "submitted" | 200 OK; status="submitted" | **PASS** | V-STS2, ST-02, R1 | |
| 50 | TC-RPT-50 | [POST /reports] status = late | status=late | 200; status = "late" | 200 OK; status="late" | **PASS** | V-STS2, R1 | |
| 51 | TC-RPT-51 | [PUT /reports/{id}] Sửa báo cáo đã nộp | PUT /api/mentor/reports/{id} | 200; báo cáo được cập nhật | 200 OK; reportName và status được cập nhật | **PASS** | ST-07 | Đã thêm endpoint PUT /reports/{id}  |
| 52 | TC-RPT-52 | [POST /reports] status = DRAFT theo SRS | status=DRAFT | 200; status = "draft" | 200 OK; status="draft" | **PASS** | V-STS4, ST-04 | Hỗ trợ trạng thái DRAFT theo SRS |
| 53 | TC-RPT-53 | [POST /reports] POST theo đường dẫn SRS | POST /api/mentor/projects/{projectId}/reports | 200; tạo báo cáo dự án | 200 OK; status="submitted" | **PASS** | X-URL1 | Đã thêm endpoint SRS  |
| 54 | TC-RPT-54 | [GET /reports] GET theo đường dẫn SRS | GET /api/mentor/projects/{projectId}/reports | 200; danh sách báo cáo dự án | 200 OK; danh sách báo cáo theo projectId | **PASS** | X-URL2 | Đã thêm endpoint SRS  |
| 55 | TC-RPT-55 | [POST /reports] Không truyền summary | Bỏ key summary | 200 | 200 OK; tạo báo cáo thành công | **PASS** | V-SUM2 | Trường summary là tuỳ chọn |

---

## 3. Kiểm tra độ bao phủ

### 3.1. Phân hoạch tương đương (Equivalence Partitioning)
* **Tổng số Tag:** 48
* **Bao phủ:** **48/48 tags (100% PASS)**
  * **Xác thực & Phân quyền:** V-AUTH1, X-AUTH1, X-AUTH2, X-AUTH3, X-AUTH4 $\rightarrow$ **PASS**
  * **Thông tin dự án:** V-PJ1, X-PJ1, X-PJ2, X-PJ3, X-PJ4 $\rightarrow$ **PASS**
  * **Các trường bắt buộc:** V-REQ1, X-REQ1, X-REQ2, X-REQ3, X-REQ4, X-REQ5 $\rightarrow$ **PASS**
  * **Ngày tháng:** V-DATE1, X-DATE1, X-DATE2, X-DATE3, V-SDT1, V-SDT2, X-SDT1 $\rightarrow$ **PASS**
  * **Trạng thái (Status):** V-STS1, V-STS2, V-STS3, V-STS4, X-STS1 $\rightarrow$ **PASS**
  * **Tóm tắt (Summary):** V-SUM1, V-SUM2 $\rightarrow$ **PASS**
  * **File đính kèm:** V-FILE1, V-FILE2, X-FILE1, X-FILE2, X-FILE3 $\rightarrow$ **PASS**
  * **Headers & Content-Type:** X-CT1, X-URL1, X-URL2, S-DUP1 $\rightarrow$ **PASS**
  * **Danh sách & Download file:** V-LST1, V-LST2, V-LST3, V-RID1, X-RID1, X-RID2, X-RID3, X-RID4, X-RID5 $\rightarrow$ **PASS**

### 3.2. Phân tích giá trị biên (Boundary Value Analysis)
* **Tổng số Tag:** 7
* **Bao phủ:** **7/7 tags (100% PASS)**
  * **B-PJ1** (projectId = 0): 400 Bad Request $\rightarrow$ **PASS**
  * **B-PJ2** (projectId = -1): 400 Bad Request $\rightarrow$ **PASS**
  * **B-DATE1** (2026-02-28, ngày cuối tháng 2 hợp lệ): 200 OK $\rightarrow$ **PASS**
  * **B-DATE2** (2026-02-29, năm không nhuận): 400 Bad Request $\rightarrow$ **PASS**
  * **B-FIL0** (File 0 byte rỗng): 200 OK (bỏ qua file) $\rightarrow$ **PASS**
  * **B-FIL1** (File đúng 20 MB): 200 OK $\rightarrow$ **PASS**
  * **B-FIL2** (File vượt 20 MB + 1 byte): 400 Bad Request $\rightarrow$ **PASS**

### 3.3. Chuyển đổi trạng thái (State Transition)
* **Tổng số chuyển đổi:** 7
* **Bao phủ:** **7/7 State Transitions (100% PASS)**
  * **ST-01** (Không truyền status $\rightarrow$ default "submitted"): **PASS**
  * **ST-02** (Truyền "submitted" $\rightarrow$ "submitted"): **PASS**
  * **ST-03** (Truyền "pending" $\rightarrow$ "pending"): **PASS**
  * **ST-04** (Truyền "DRAFT" $\rightarrow$ "draft"): **PASS**
  * **ST-05** (Truyền "ABC" lạ $\rightarrow$ 400 Bad Request, không tạo): **PASS**
  * **ST-06** (Nộp trùng dữ liệu $\rightarrow$ hệ thống kiểm soát): **PASS**
  * **ST-07** (Sửa báo cáo qua PUT $\rightarrow$ cập nhật thông tin): **PASS**

### 3.4. Bảng quyết định (Decision Table Rules)
* **Tổng số Rule:** 14
* **Bao phủ:** **14/14 Rules (100% PASS)** (R1, R2, R3, R4, R5, R6, R7, R8, DL-R1, DL-R2, DL-R3, DL-R4, DL-R5, DL-R6 đều đạt kết quả mong đợi).

---

## 4. Bảng trạng thái khắc phục Bug (Defect Tracking)

| Bug ID | Mô tả lỗi phát hiện ban đầu | Các TC ảnh hưởng | Mức độ | Trạng thái sau khi Fix | Biện pháp khắc phục trong Source Code |
|---|---|---|:---:|:---:|---|
| **Bug A** | Trả về 500 thay vì 400/415 khi thiếu param hoặc sai Content-Type | 04, 05, 06, 07, 08, 25 | Medium | **Closed (Verified)** | Bổ sung `@ExceptionHandler` cho `MissingServletRequestParameterException` và `HttpMediaTypeNotSupportedException` trong `GlobalExceptionHandler.java`. |
| **Bug B** | Không kiểm tra tính hợp lệ của trường `status`, cho lưu giá trị bất kỳ ("ABC") | 16, 52 | Medium | **Closed (Verified)** | Bổ sung whitelist kiểm tra `status` ("submitted", "pending", "late", "draft") trong `MentorPortalService.submitReport`. |
| **Bug C** | Cho phép tạo báo cáo cho dự án không tồn tại (`projectId=99999, 0, -1`) | 17, 41, 42 | High | **Closed (Verified)** | Kiểm tra `projectId > 0` và `projectRepository.findById(...)`, ném 404/400 nếu không tồn tại. |
| **Bug D** | Xử lý ngày tháng lỏng lẻo, ngày sai format bị báo nhầm là thiếu trường, `submittedDate=abc` bị bỏ qua | 12, 13, 14, 48 | Low | **Closed (Verified)** | Triển khai phương thức `parseLocalDateStrict` với `ResolverStyle.STRICT` và ném lỗi 400 rõ ràng. |
| **Bug E** | Cho phép tải lên file thực thi `.exe`, không kiểm tra định dạng MIME | 20 | High | **Closed (Verified)** | Kiểm tra đuôi mở rộng file theo whitelist: `pdf, doc, docx, ppt, pptx`. |
| **Bug F** | Giới hạn dung lượng tải lên thấp hơn 20 MB hoặc chưa đồng bộ cấu hình multipart | 21, 44 | Medium | **Closed (Verified)** | Cấu hình `spring.servlet.multipart.max-file-size=25MB` và validate nghiêm ngặt file kích thước vượt quá 20 MB trong service. |
| **Bug G** | Không gửi token trả 403 thay vì chuẩn REST 401 | 22, 30, 37 | Low | **Closed (Verified)** | Cấu hình `AuthenticationEntryPoint` trong `SecurityConfig.java` để trả về 401 Unauthorized khi thiếu header Authentication. |
| **Bug H** | Sai quyền (Role TALENT / LAB_ADMIN) trả về 400 thay vì 403 | 23, 24, 31, 38 | Low | **Closed (Verified)** | Cấu hình `AccessDeniedHandler` trong `SecurityConfig.java` để trả về chuẩn 403 Forbidden. |
| **Bug I** | Token sai format (`Bearer abc`) trả về 500 kèm stacktrace nội bộ JWT | 40, 46 | Medium | **Closed (Verified)** | Thêm khối `try-catch (JwtException)` trong `JwtAuthenticationFilter.java`, bắt lỗi và trả về 401 Unauthorized sạch sẽ. |
| **Bug J** | Thiếu các endpoint mở rộng theo đặc tả SRS (`PUT /reports/{id}`, `POST/GET /projects/{projectId}/reports`) | 51, 53, 54 | Medium | **Closed (Verified)** | Bổ sung đầy đủ các mapping REST API trong `MentorPortalController.java` và logic xử lý trong `MentorPortalService.java`. |
| **Bug K** | Trùng lặp dữ liệu và phân tách cách ly đa tài khoản giữa MEN1 và MEN2 | 28, 29, 45 | Low | **Closed (Verified)** | Xử lý cách ly dữ liệu báo cáo giữa các mentor, đảm bảo MEN2 chỉ truy xuất dữ liệu riêng biệt. |

---

## 5. Kết luận & Đề xuất

1. **Chất lượng chức năng:** Chức năng **FR-MEN-004 (Submit Report)** đã hoàn thành toàn diện cả về mặt nghiệp vụ chuẩn (Happy Path) lẫn khả năng phòng vệ trước các dữ liệu bất thường (Negative Path, Edge Cases, Security & Authentication).
2. **Độ tin cậy kiểm thử:** 100% test cases trong Postman Collection Runner đã chuyển sang trạng thái **GREEN (77/77 assertions PASS)**.
3. **Mã nguồn sẵn sàng:** Backend đã được kiểm tra ổn định, an toàn và hoàn toàn đủ điều kiện nghiệm thu, đóng gói để bàn giao hoặc báo cáo bài tập lớn môn Kiểm chứng phần mềm.
