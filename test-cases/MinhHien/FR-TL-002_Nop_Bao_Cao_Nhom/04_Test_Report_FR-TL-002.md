# BÁO CÁO THỰC THI KIỂM THỬ (TEST EXECUTION REPORT)
## MODULE: FR-TL-002 - NỘP BÁO CÁO NHÓM (SUBMIT TEAM REPORT)

> **Người kiểm thử:** Nguyễn Minh Hiển  
> **Môi trường:** Postman API Testing / Localhost (`http://localhost:8080`)  
> **Thời gian thực thi:** 06/11/2026  
> **Tổng số Test Cases:** 15  
> **Kết quả:** Passed: 15 / Failed: 0 (Tỷ lệ đạt: 100%)  

---

### BẢNG BÁO CÁO KẾT QUẢ TEST CHI TIẾT 

| STT | TestCaseID | Tên Test Case | Input Parameters | Expected Result | Actual Result | Status | Tag Được Bao Phủ | Ghi Chú |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 1 | **TC-TL002-01** | Báo cáo tiến độ tại min (0%) | Role: LEADER, Type: MONTHLY, Period: 2026-02, Progress: 0 | TRUE (201 Created) | 201 Created | **PASS** | V1,V2,V3,V4,V5,B1,B3,B7,B12 | Tạo bản ghi với tiến độ 0% |
| 2 | **TC-TL002-02** | Báo cáo tiến độ tại max (100%) | Role: LEADER, Type: FINAL, Period: 2026-02, Progress: 100 | TRUE (201 Created) | 201 Created | **PASS** | V1,V2,V3,V4,V5,B1,B4,B11,B13 | Báo cáo nghiệm thu hoàn tất |
| 3 | **TC-TL002-03** | Báo cáo tiến độ tại nominal (50%) | Role: LEADER, Type: MONTHLY, Period: 2026-02, Progress: 50 | TRUE (201 Created) | 201 Created | **PASS** | V1,V2,V3,V4,V5,B1,B3,B9,B13 | Tiến độ nửa chặng đường |
| 4 | **TC-TL002-04** | Báo cáo tiến độ tại min+ (1%) | Role: LEADER, Type: WEEKLY, Period: 2026-01, Progress: 1 | TRUE (201 Created) | 201 Created | **PASS** | V1,V2,V3,V4,V5,B1,B2,B5,B8 | Báo cáo tuần đầu tiên |
| 5 | **TC-TL002-05** | Báo cáo tiến độ tại max- (99%) | Role: LEADER, Type: WEEKLY, Period: 2026-12, Progress: 99 | TRUE (201 Created) | 201 Created | **PASS** | V1,V2,V3,V4,V5,B1,B2,B6,B10 | Gần hoàn thành toàn bộ |
| 6 | **TC-TL002-06** | overallProgress ngay dưới min (-1) | Progress: -1 | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X8 | Chặn tiến độ âm |
| 7 | **TC-TL002-07** | overallProgress ngay trên max (101) | Progress: 101 | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X9 | Chặn tiến độ > 100% |
| 8 | **TC-TL002-08** | overallProgress kiểu chữ | Progress: "nam-muoi" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X10 | Lỗi parse kiểu số |
| 9 | **TC-TL002-09** | reportType sai danh mục (DAILY) | Type: "DAILY" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X5 | Không thuộc enum |
| 10 | **TC-TL002-10** | reportType bỏ trống | Type: "" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X4 | Trường bắt buộc |
| 11 | **TC-TL002-11** | reportingPeriod tháng 13 | Period: "2026-13" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X7 | Tháng không tồn tại |
| 12 | **TC-TL002-12** | reportingPeriod sai định dạng | Period: "15-02-2026" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X6 | Sai format YYYY-MM |
| 13 | **TC-TL002-13** | User chưa đăng nhập | Không truyền Token Authorization | FALSE (401 Unauthorized) | 401 Unauthorized | **PASS** | X1 | Chặn truy cập ẩn danh |
| 14 | **TC-TL002-14** | Thành viên thường nộp | Role: TALENT (Thành viên thường) | FALSE (403 Forbidden) | 403 Forbidden | **PASS** | X2 | Chặn sai vai trò |
| 15 | **TC-TL002-15** | Leader dự án khác | Role: TALENT_LEADER (Project khác) | FALSE (403 Forbidden) | 403 Forbidden | **PASS** | X3 | Chặn can thiệp chéo dự án |