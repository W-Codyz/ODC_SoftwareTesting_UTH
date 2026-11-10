# Test Execution Report – FR-MEN-002: Task Breakdown with Excel

**Môi trường:** http://localhost:8089, Environment LabODC Unified Environment.  
**Căn cứ:** TC_Mentor_Task_Breakdown.md và SRS FR-MEN-002.

## 1. Tổng kết

| Kết quả             | Số ca |
| ------------------- | ----: |
| Tổng số ca thiết kế |    12 |
| PASS                |     6 |
| FAIL                |     6 |
| Tỷ lệ PASS          |   50% |

Ba ca liên quan constraints DB không thực thi được vì schema hiện tại không có bảng/cột task theo SRS; được tính FAIL theo yêu cầu của người dùng và ghi rõ chưa chạy SQL.

## 2. Execution log

| ID        | Kết quả mong đợi                                             | Kết quả thực tế                                                                                                                                | Trạng thái               |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| TC-TSK-01 | GET /api/mentor/tasks trả 200 và task của Mentor             | Postman trả HTTP 200, có task hiện hữu của Mentor                                                                                              | PASS                     |
| TC-TSK-02 | GET /api/mentor/projects/2/tasks trả 200, task thuộc project | Postman trả HTTP 200 và task của project 2                                                                                                     | PASS                     |
| TC-TSK-03 | Tạo task trả 200, ID mới                                     | Postman tạo task tạm TEMP-CODEX-API-TEST-2026-11-10, ID 11, HTTP 200                                                                           | PASS                     |
| TC-TSK-04 | PUT cập nhật progress=100/status=completed                   | Postman PUT /api/mentor/projects/2/tasks/11 trả HTTP 200; response progress 100, status completed                                              | PASS                     |
| TC-TSK-05 | DELETE trả 200 và task biến mất                              | Postman DELETE ID 11 trả HTTP 200, message Deleted; GET list sau đó chỉ còn task có sẵn, ID 11 đã vắng mặt                                     | PASS                     |
| TC-TSK-06 | Template XLSX tải được, HTTP 200                             | Postman GET /api/mentor/projects/2/task-template trả HTTP 500, No static resource                                                              | FAIL                     |
| TC-TSK-07 | Upload Excel route nhận multipart file                       | Postman POST /api/mentor/projects/2/tasks/upload trả HTTP 500, Request method POST is not supported. Không có file XLSX đầu vào để test parser | FAIL                     |
| TC-TSK-08 | Title rỗng trả 400                                           | Kiểm tra API bổ sung trả HTTP 400, Missing field: title                                                                                        | PASS                     |
| TC-TSK-09 | progress=105 bị từ chối, không ghi dữ liệu                   | Kiểm tra API bổ sung trả HTTP 200 và response progress=100; service kẹp giá trị vào biên thay vì từ chối                                       | FAIL                     |
| TC-TSK-10 | UNIQUE(project_id, task_id) được DB kiểm tra                 | Không chạy SQL: schema hiện có mentor_tasks, không có bảng tasks/task_id; không thể xác nhận constraint runtime                                | FAIL – schema không khớp |
| TC-TSK-11 | CHECK due_date >= start_date trên task                       | Không chạy SQL: mentor_tasks không có start_date và schema check_dates thuộc projects.end_date/start_date                                      | FAIL – schema không khớp |
| TC-TSK-12 | CHECK progress task trong [0,100]                            | Không chạy SQL: mentor_tasks không có progress_percentage/check_progress; API hiện kẹp progress=105 thành 100                                  | FAIL – schema không khớp |

## 3. Ghi nhận kỹ thuật

- Controller hỗ trợ GET all tasks, GET project tasks, POST create và PUT/DELETE nested routes.
- Không có endpoint template hoặc upload trong controller.
- Model/schema thực tế dùng mentor_tasks với title, progress, due_date; không phải bảng tasks như SRS.
- CRUD task thử nghiệm đã được dọn: ID 11 xóa thành công và GET xác nhận không còn.
- Kết quả SQL không được trình bày như đã thực thi. PostgreSQL/Docker không được truy cập trong lượt kiểm thử này.
