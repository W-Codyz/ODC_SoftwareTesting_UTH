# Test Execution Report: FR-TAL-001 - Quản lý Hồ sơ Cá nhân (Talent Profile)

**Module:** Talent Profile  
**Chức năng:** Manage Talent Profile (`GET /api/talent/profile`, `PUT /api/talent/profile`, `POST /api/talent/skills`, `POST /api/talent/profile/avatar`, `POST /api/talent/profile/cv`, `DELETE /api/talent/skills/{id}`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày thực hiện:** 07/11/2026  
**Môi trường test:** Postman (Windows), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Tham chiếu test case:** `test-cases/talent/FR-TAL-001_TestCases.md`  
**Mã Task Jira:** `LABODC-45`  

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 17 |
| Passed | 6 |
| Failed | 11 |
| Blocked / Skipped | 0 |
| **Pass rate** | **6/17 = 35,3%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (SĐT / Skill / Exp / File) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-TAL-01 | Lấy thông tin hồ sơ cá nhân | Header Token của `hoangvane@student.uth.edu.vn` | 200 - Trả về thông tin hồ sơ chi tiết | 200 OK, trả về đúng JSON profile của Hoàng Văn E | PASS | V-TEL-PROFILE, ST-TEL-01, R1 | |
| 2 | TC-TAL-02 | Cập nhật thông tin hồ sơ hợp lệ (Nominal) | `phone: "0901234568"`, `portfolioUrl: "https://github.com/hoangvane"` | 200 - Cập nhật thông tin thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | V-TEL-PHONE1, B-SKILL3, B-EXP4, ST-TEL-02, R1 | |
| 3 | TC-TAL-03 | Cập nhật thông tin hồ sơ hợp lệ tại biên Min | `phone: "0901234567"`, `portfolioUrl: "https://github.com/h"` | 200 - Cập nhật thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | B-SKILL1, B-EXP2, B-AVT2, B-CV2, R1 | |
| 4 | TC-TAL-04 | Cập nhật thông tin hồ sơ hợp lệ tại biên Max | `phone: "0987654321"`, Portfolio URL 100 ký tự hợp lệ | 200 - Cập nhật thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | B-SKILL5, B-EXP6, B-AVT6, B-CV6, R1 | |
| 5 | TC-TAL-05 | SĐT ít hơn 10 chữ số (single fault) | `phone: "090123456"` (9 số) | 400 - Lỗi validation SĐT |  200 OK, `{"success":true,"message":"Profile updated successfully"}` | FAIL | X-TEL-PHONE1, R2 | |
| 6 | TC-TAL-06 | SĐT nhiều hơn 10 chữ số (single fault) | `phone: "09012345678"` (11 số) | 400 - Lỗi validation SĐT | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | FAIL | X-TEL-PHONE2, R2 | |
| 7 | TC-TAL-07 | SĐT chứa ký tự chữ (single fault) | `phone: "090123456a"` | 400 - Lỗi validation SĐT | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | FAIL | X-TEL-PHONE3, R2 | |
| 8 | TC-TAL-08 | SĐT không bắt đầu bằng số 0 | `phone: "1901234567"` | 400 - Lỗi validation SĐT | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | FAIL | X-TEL-PHONE4, R2 | |
| 9 | TC-TAL-09 | Tên kỹ năng để trống | `name: ""` | 400 - Lỗi tên kỹ năng trống | 400 Bad Request, trả về message lỗi SQL NOT NULL constraint | FAIL | X-TEL-SKILL1, R3 | |
| 10 | TC-TAL-10 | Tên kỹ năng quá dài (101 ký tự) | `name: "[101 ký tự A]"` | 400 - Lỗi độ dài kỹ năng | 400 Bad Request, trả về message lỗi SQL NOT NULL constraint | FAIL | X-TEL-SKILL2, R3 | |
| 11 | TC-TAL-11 | Thêm kỹ năng trùng tên đã có | `name: "ReactJS"` (đã có trong profile) | 400 - Lỗi trùng lặp kỹ năng | 400 Bad Request, trả về message lỗi SQL NOT NULL constraint | FAIL | X-TEL-SKILL3, R3 | |
| 12 | TC-TAL-12 | Số năm kinh nghiệm là số âm | `yearsOfExperience: -0.1` | 400 - Lỗi kinh nghiệm âm | 400 Bad Request, trả về message lỗi SQL NOT NULL constraint | FAIL | X-TEL-EXP1, B-EXP1, R3 | |
| 13 | TC-TAL-13 | Số năm kinh nghiệm quá 50 năm | `yearsOfExperience: 50.1` | 400 - Lỗi vượt max kinh nghiệm | 400 Bad Request, trả về message lỗi SQL NOT NULL constraint | FAIL | X-TEL-EXP2, B-EXP7, R3 | |
| 14 | TC-TAL-14 | Avatar vượt quá 5MB | File image 5.1 MB | 400 - Lỗi kích thước Avatar | 200 OK, `{"success":true,"message":"Avatar uploaded successfully"}` | FAIL | X-TEL-AVT1, B-AVT7, R4 | |
| 15 | TC-TAL-15 | Avatar sai định dạng (.txt) | File `avatar.txt` | 400 - Lỗi định dạng file | 200 OK, `{"success":true,"message":"Avatar uploaded successfully"}` | FAIL | X-TEL-AVT2, R4 | |
| 16 | TC-TAL-16 | File CV vượt quá 20MB | File PDF 20.1 MB | 400 - Lỗi kích thước CV | 400 Bad Request, `{"message":"Maximum upload size exceeded"}` | PASS | X-TEL-CV1, B-CV7, R5 | |
| 17 | TC-TAL-17 | Xóa kỹ năng khỏi hồ sơ | `DELETE /api/talent/skills/2` | 200 - Xóa kỹ năng thành công | 200 OK, `{"success":true,"message":"Skill removed successfully"}` | PASS | ST-TEL-05 | |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|---|
| V-TEL-PROFILE | Xem hồ sơ của user hợp lệ (có token) | TC-TAL-01 | PASS |
| V-TEL-PHONE1 | SĐT hợp lệ (10 số, bắt đầu bằng 0) | TC-TAL-02, TC-TAL-03, TC-TAL-04 | PASS |
| V-TEL-SKILL1 | Tên kỹ năng hợp lệ (1-100 ký tự) | TC-TAL-02, TC-TAL-03, TC-TAL-04 | PASS |
| V-TEL-EXP1 | Số năm kinh nghiệm hợp lệ (0.0 - 50.0) | TC-TAL-02, TC-TAL-03, TC-TAL-04 | PASS |
| V-TEL-AVT1 | File Avatar hợp lệ (JPG/PNG $\le 5.0$ MB) | TC-TAL-01, TC-TAL-02 | PASS |
| V-TEL-CV1 | File CV hợp lệ (PDF/DOC $\le 20.0$ MB) | TC-TAL-01, TC-TAL-02 | PASS |
| X-TEL-PHONE1 | SĐT < 10 chữ số | TC-TAL-05 | FAIL |
| X-TEL-PHONE2 | SĐT > 10 chữ số | TC-TAL-06 | FAIL |
| X-TEL-PHONE3 | SĐT chứa chữ / ký tự đặc biệt | TC-TAL-07 | FAIL |
| X-TEL-PHONE4 | SĐT 10 chữ số không bắt đầu bằng 0 | TC-TAL-08 | FAIL |
| X-TEL-SKILL1 | Tên kỹ năng rỗng | TC-TAL-09 | FAIL |
| X-TEL-SKILL2 | Tên kỹ năng > 100 ký tự | TC-TAL-10 | FAIL |
| X-TEL-SKILL3 | Tên kỹ năng trùng lặp | TC-TAL-11 | FAIL |
| X-TEL-EXP1 | Số năm kinh nghiệm âm (< 0.0) | TC-TAL-12 | FAIL |
| X-TEL-EXP2 | Số năm kinh nghiệm > 50.0 | TC-TAL-13 | FAIL |
| X-TEL-AVT1 | Dung lượng Avatar > 5.0 MB | TC-TAL-14 | FAIL |
| X-TEL-AVT2 | Avatar sai extension (.txt) | TC-TAL-15 | FAIL |
| X-TEL-CV1 | Dung lượng CV > 20.0 MB | TC-TAL-16 | PASS |

### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|---|
| B-SKILL1 | min = 1 ký tự | TC-TAL-03 | FAIL |
| B-SKILL3 | nominal = 50 ký tự | TC-TAL-02 | FAIL |
| B-SKILL5 | max = 100 ký tự | TC-TAL-04 | FAIL |
| B-EXP1 | min- = -0.1 năm | TC-TAL-12 | FAIL |
| B-EXP2 | min = 0.0 năm | TC-TAL-03 | FAIL |
| B-EXP4 | nominal = 25.0 năm | TC-TAL-02 | FAIL |
| B-EXP6 | max = 50.0 năm | TC-TAL-04 | FAIL |
| B-EXP7 | max+ = 50.1 năm | TC-TAL-13 | FAIL |

### 3.3 Chuyển đổi trạng thái (State Transition) & Bảng quyết định (Decision Table)

**State Transitions (ST-TEL-01 đến ST-TEL-05):**
 
| ST | Test Case | Kết quả |
|---|---|---|
| ST-TEL-01 | TC-TAL-01 | PASS |
| ST-TEL-02 | TC-TAL-02 | PASS |
| ST-TEL-03 | Chưa có test case | Chưa kiểm thử |
| ST-TEL-04 | Chưa có test case | Chưa kiểm thử |
| ST-TEL-05 | TC-TAL-17 | PASS |
 
**Decision Table Rules:**
 
| Rule | Test Case | Kết quả |
|---|---|---|
| R1 (Happy path) | TC-TAL-01 đến TC-TAL-04 | PASS |
| R2 (Lỗi SĐT) | TC-TAL-05 đến TC-TAL-08 | FAIL |
| R3 (Lỗi kỹ năng/kinh nghiệm) | TC-TAL-09 đến TC-TAL-13 | FAIL |
| R4 (Lỗi Avatar) | TC-TAL-14, TC-TAL-15 | FAIL |
| R5 (Lỗi CV) | TC-TAL-16 | PASS |
| R6 | Chưa có test case | Chưa kiểm thử |

---