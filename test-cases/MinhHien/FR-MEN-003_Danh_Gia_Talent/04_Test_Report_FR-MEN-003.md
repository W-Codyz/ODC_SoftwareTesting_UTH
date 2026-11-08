# BÁO CÁO THỰC THI KIỂM THỬ (TEST EXECUTION REPORT)
## MODULE: FR-MEN-003 - ĐÁNH GIÁ TALENT (EVALUATE TALENTS)

> **Người kiểm thử:** Nguyễn Minh Hiển  
> **Môi trường:** Postman API Testing / Localhost (`http://localhost:8080`)  
> **Thời gian thực thi:** 06/11/2026  
> **Tổng số Test Cases:** 16  
> **Kết quả:** Passed: 16 / Failed: 0 (Tỷ lệ đạt: 100%)  

---

### BẢNG BÁO CÁO KẾT QUẢ TEST CHI TIẾT 

| STT | TestCaseID | Tên Test Case | Input Parameters | Expected Result | Actual Result | Status | Tag Được Bao Phủ | Ghi Chú |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 1 | **TC-MEN003-01** | Đánh giá tại min (0.0) | Mentor: Phụ trách, Talent: 456, Period: 2026-02, Score: 0.0 | TRUE (200 OK) | 200 OK | **PASS** | V1,V2,V3,V4,V5,B1,B2,B6,B11 | Điểm sàn 0.0 hợp lệ |
| 2 | **TC-MEN003-02** | Đánh giá tại max (10.0) | Mentor: Phụ trách, Talent: 456, Period: 2026-02, Score: 10.0 | TRUE (200 OK) | 200 OK | **PASS** | V1,V2,V3,V4,V5,B1,B2,B10,B12 | Điểm trần 10.0 hoàn hảo |
| 3 | **TC-MEN003-03** | Đánh giá tại nominal (7.5) | Mentor: Phụ trách, Talent: 456, Period: 2026-02, Score: 7.5 | TRUE (200 OK) | 200 OK | **PASS** | V1,V2,V3,V4,V5,B1,B2,B8 | Điểm khá trung bình |
| 4 | **TC-MEN003-04** | Đánh giá tại min+ (0.1) | Mentor: Phụ trách, Talent: 456, Period: 2026-01, Score: 0.1 | TRUE (200 OK) | 200 OK | **PASS** | V1,V2,V3,V4,V5,B1,B2,B4,B7 | Điểm cận min |
| 5 | **TC-MEN003-05** | Đánh giá tại max- (9.9) | Mentor: Phụ trách, Talent: 457, Period: 2026-12, Score: 9.9 | TRUE (200 OK) | 200 OK | **PASS** | V1,V2,V3,V4,V5,B1,B3,B5,B9 | Điểm cận max |
| 6 | **TC-MEN003-06** | overallScore ngay dưới min (-0.1) | Score: -0.1 | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X8 | Chặn điểm âm |
| 7 | **TC-MEN003-07** | overallScore ngay trên max (10.1) | Score: 10.1 | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X9 | Chặn điểm vượt quá 10 |
| 8 | **TC-MEN003-08** | overallScore không phải số | Score: "tam_diem" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X10 | Lỗi parse số |
| 9 | **TC-MEN003-09** | Tiêu chí codeQuality âm (-1.0) | codeQuality: -1.0 | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X11 | Chặn điểm tiêu chí âm |
| 10 | **TC-MEN003-10** | Talent không tồn tại | Talent: 99999 | FALSE (404 Not Found) | 404 Not Found | **PASS** | X4 | Báo lỗi sinh viên không tồn tại |
| 11 | **TC-MEN003-11** | Talent không thuộc dự án | Talent: 888 (Dự án khác) | FALSE (400/404) | 400 Bad Request | **PASS** | X5 | Chặn đánh giá nhầm dự án |
| 12 | **TC-MEN003-12** | Đánh giá trùng kỳ | Period: "2026-02" (Đã có) | FALSE (409 Conflict) | 409 Conflict | **PASS** | X7 | Bắt buộc dùng PUT để sửa |
| 13 | **TC-MEN003-13** | Sai định dạng kỳ đánh giá | Period: "2026/02" | FALSE (400 Bad Request) | 400 Bad Request | **PASS** | X6 | Chặn định dạng sai |
| 14 | **TC-MEN003-14** | User chưa đăng nhập | Không truyền Token | FALSE (401 Unauthorized) | 401 Unauthorized | **PASS** | X1 | Chặn ẩn danh |
| 15 | **TC-MEN003-15** | User là Talent tự đánh giá | Role: TALENT | FALSE (403 Forbidden) | 403 Forbidden | **PASS** | X2 | Chặn sai phân quyền |
| 16 | **TC-MEN003-16** | Mentor khác không thuộc dự án | Role: MENTOR (Dự án khác) | FALSE (403 Forbidden) | 403 Forbidden | **PASS** | X3 | Chặn can thiệp chéo |