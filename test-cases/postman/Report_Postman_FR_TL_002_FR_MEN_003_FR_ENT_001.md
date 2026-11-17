# Test Execution Report: FR-TL-002, FR-MEN-003, FR-ENT-001

**Module:** Talent Leader, Mentor Portal, Enterprise Portal
**Người thực hiện:** Nguyễn Minh Hiển
**Ngày chạy:** 17/11/2026
**Thời gian ghi trong nguồn:** 2026-11-17 08:37:38 UTC (15:37:38, UTC+7)
**Môi trường test:** Postman local, `http://localhost:8080`
**Phạm vi test:** FR-TL-002, FR-MEN-003, FR-ENT-001
**Nguồn kết quả:** Postman execution export ngày 17/11/2026 (nguồn đầu vào, không nằm trong commit này)

---

## 1. Tổng kết

| Chỉ số | Kết quả |
|---|---:|
| Test case chức năng trong collection | 15 |
| Postman assertion PASS | 3 |
| Postman assertion FAIL | 12 |
| Pass rate theo assertion của lần chạy | 20.00% |
| Login prerequisite request lỗi | 3 |
| Test chức năng bị chặn do không có token | 12 |

> **Diễn giải:** 12 assertion FAIL đều là hệ quả của lỗi backend JDBC khi đăng nhập, không phải bằng chứng về lỗi logic của testcase. Login không lấy được JWT nên 12 request cần xác thực nhận 401. Vì vậy, 12 ca này chưa kiểm tra được hành vi nghiệp vụ và cần được ghi nhận là **BLOCKED** khi đánh giá mức độ hoàn thành chức năng.

## 2. Kết quả điều kiện tiên quyết: Đăng nhập

| Request | HTTP thực tế | Kết quả | Ghi chú |
|---|---:|---|---|
| Login Enterprise | 400 | FAIL - prerequisite | Backend JDBC báo thiếu cột `users.last_login_ip` |
| Login Mentor | 400 | FAIL - prerequisite | Backend JDBC báo thiếu cột `users.last_login_ip` |
| Login Talent Leader | 400 | FAIL - prerequisite | Backend JDBC báo thiếu cột `users.last_login_ip` |

Do cả ba lần đăng nhập không thành công, các biến token tương ứng không được thiết lập. Lỗi này chặn các testcase chức năng cần xác thực ở cả ba module.

## 3. Kết quả theo module

| Module | Tổng TC | Assertion PASS | Assertion FAIL | QA disposition |
|---|---:|---:|---:|---|
| FR-TL-002 - Submit Team Report | 5 | 1 | 4 | 1 PASS, 4 BLOCKED |
| FR-MEN-003 - Evaluate Talents | 6 | 1 | 5 | 1 PASS, 5 BLOCKED |
| FR-ENT-001 - Manage Enterprise Profile | 4 | 1 | 3 | 1 PASS, 3 BLOCKED |
| **Tổng** | **15** | **3** | **12** | **3 PASS, 12 BLOCKED** |

### 3.1 Chi tiết testcase

| TC ID | Module | Expected HTTP | Actual HTTP | Assertion | QA disposition |
|---|---|---:|---:|---|---|
| TC-TL002-PM-01 | FR-TL-002 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-TL002-PM-02 | FR-TL-002 | 201 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-TL002-PM-03 | FR-TL-002 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-TL002-PM-04 | FR-TL-002 | 400 | 401 | FAIL | BLOCKED - thiếu token; chưa kiểm tra validation |
| TC-TL002-PM-05 | FR-TL-002 | 401 | 401 | PASS | PASS - request không token bị từ chối đúng |
| TC-MEN003-PM-01 | FR-MEN-003 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-MEN003-PM-02 | FR-MEN-003 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-MEN003-PM-03 | FR-MEN-003 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-MEN003-PM-04 | FR-MEN-003 | 200 | 401 | FAIL | BLOCKED - thiếu token; chưa kiểm tra tạo đánh giá |
| TC-MEN003-PM-05 | FR-MEN-003 | 400 | 401 | FAIL | BLOCKED - thiếu token; chưa kiểm tra validation điểm |
| TC-MEN003-PM-06 | FR-MEN-003 | 401 | 401 | PASS | PASS - request không token bị từ chối đúng |
| TC-ENT001-PM-01 | FR-ENT-001 | 200 | 401 | FAIL | BLOCKED - thiếu token do login JDBC lỗi |
| TC-ENT001-PM-02 | FR-ENT-001 | 200 | 401 | FAIL | BLOCKED - thiếu token; chưa kiểm tra cập nhật hồ sơ |
| TC-ENT001-PM-03 | FR-ENT-001 | 200 | 401 | FAIL | BLOCKED - thiếu token; chưa kiểm tra upload logo |
| TC-ENT001-PM-04 | FR-ENT-001 | 401 | 401 | PASS | PASS - request không token bị từ chối đúng |

## 4. Phân tích nguyên nhân và ảnh hưởng

### Nguyên nhân gốc

Backend login thực hiện truy vấn bảng `users` nhưng database đang được backend sử dụng không nhận diện cột `last_login_ip`, dẫn đến lỗi JDBC và HTTP 400 cho các request login.

### Ảnh hưởng dây chuyền

```text
Login trả HTTP 400 do lỗi JDBC
    → Không nhận được JWT
        → 12 request cần xác thực nhận HTTP 401
            → 12 assertion không đạt do điều kiện tiên quyết
```

12 kết quả 401 không chứng minh rằng endpoint hoặc logic kiểm thử sai; các request chưa đi qua bước xác thực để kiểm tra chức năng nghiệp vụ.

## 5. Danh sách lỗi và theo dõi

| # | Lỗi gốc | Ảnh hưởng | Hướng xử lý |
|---:|---|---|---|
| 1 | Backend login lỗi JDBC do thiếu `users.last_login_ip` trong schema đang được sử dụng | Cả ba login thất bại; 12 testcase chức năng bị chặn | Đồng bộ schema của đúng database backend đang kết nối, sau đó chạy lại login và collection |

Đây là **một blocker backend**, không phải 12 lỗi logic testcase riêng biệt. Nếu Jira đã có issue cho lỗi login/schema, liên kết key đó tại đây thay vì tạo issue trùng. Jira key chưa có trong dữ liệu đầu vào của báo cáo.

## 6. Giới hạn và kết luận

- Ba testcase “No token” đạt và xác nhận request không có JWT bị từ chối bằng HTTP 401.
- 12 testcase còn lại chưa cho kết luận về chức năng FR-TL-002, FR-MEN-003 hoặc FR-ENT-001; cần chạy lại với token hợp lệ.
- Pass rate 20% là tỷ lệ assertion của lần chạy hiện tại, **không phải** đánh giá độ đúng của bộ testcase hay tỷ lệ hoàn thành chức năng.
- Kết luận: lần chạy bị chặn bởi lỗi backend JDBC trong prerequisite đăng nhập. Không có bằng chứng từ lần chạy này cho thấy 12 testcase có lỗi logic.
- Sau khi backend/database được xác nhận đồng bộ, chạy lại ba login trước; chỉ chạy các testcase chức năng khi token đã được thiết lập thành công.
