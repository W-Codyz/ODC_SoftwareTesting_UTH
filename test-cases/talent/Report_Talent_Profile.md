# Test Execution Report: FR-TAL-001 - Quản lý Hồ sơ Cá nhân (Talent Profile)

**Module:** Talent Profile  
**Chức năng:** Manage Talent Profile (`GET /api/talent/profile`, `PUT /api/talent/profile`, `POST /api/talent/skills`, `POST /api/talent/profile/avatar`, `POST /api/talent/profile/cv`, `DELETE /api/talent/skills/{id}`)  
**Người thực hiện:** Nguyễn Thành Nhân  
**Ngày thực hiện:** 07/11/2026  
**Ngày cập nhật:** 17/11/2026
**Môi trường test:** Postman (Windows), Backend Localhost (:8080), PostgreSQL 16 (Docker)  
**Tham chiếu test case:** `test-cases/talent/TC_Talent_Profile.md`  

---

## 1. Tổng kết thực thi

| Chỉ số | Giá trị |
|---|---:|
| Tổng số test case | 33 |
| Passed | 33 |
| Failed | 0 |
| Not executed | 0 |
| Blocked / Skipped | 0 |
| **Pass rate** | **33/33 = 100%** |

---

## 2. Kết quả chi tiết thực thi (Detail Execution Log)

| STT | TC ID | Tên test case | Input (SĐT / Skill / Exp / File) | Expected HTTP & Result | Actual HTTP & Result | Status | Tag / ST / Rule | Ghi chú |
|---:|---|---|---|---|---|:---:|---|---|
| 1 | TC-TAL-01 | Lấy thông tin hồ sơ cá nhân | Header Token của `hoangvane@student.uth.edu.vn` | 200 - Trả về thông tin hồ sơ chi tiết | 200 OK, trả về đúng JSON profile của Hoàng Văn E | PASS | V-TEL-PROFILE, ST-TEL-01, R1 | |
| 2 | TC-TAL-02 | Cập nhật thông tin hồ sơ hợp lệ (Nominal) | `phone: "0901234568"`, `portfolioUrl: "https://github.com/hoangvane"` | 200 - Cập nhật thông tin thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | V-TEL-PHONE1, B-SKILL3, B-EXP4, ST-TEL-02, R1 | |
| 3 | TC-TAL-03 | Cập nhật thông tin hồ sơ hợp lệ tại biên Min | `phone: "0901234567"`, `portfolioUrl: "https://github.com/h"` | 200 - Cập nhật thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | B-SKILL1, B-EXP2, B-AVT2, B-CV2, R1 | |
| 4 | TC-TAL-04 | Cập nhật thông tin hồ sơ hợp lệ tại biên Max | `phone: "0987654321"`, Portfolio URL 100 ký tự hợp lệ | 200 - Cập nhật thành công | 200 OK, `{"success":true,"message":"Profile updated successfully"}` | PASS | B-SKILL5, B-EXP6, B-AVT6, B-CV6, R1 | |
| 5 | TC-TAL-05 | SĐT ít hơn 10 chữ số (single fault) | `phone: "090123456"` (9 số) | 400 - Lỗi validation SĐT | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"phone":"Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0"}}` | PASS | X-TEL-PHONE1, R2 | |
| 6 | TC-TAL-06 | SĐT nhiều hơn 10 chữ số (single fault) | `phone: "09012345678"` (11 số) | 400 - Lỗi validation SĐT | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"phone":"Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0"}}` | PASS | X-TEL-PHONE2, R2 | |
| 7 | TC-TAL-07 | SĐT chứa ký tự chữ (single fault) | `phone: "090123456a"` | 400 - Lỗi validation SĐT | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"phone":"Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0"}}` | PASS | X-TEL-PHONE3, R2 | |
| 8 | TC-TAL-08 | SĐT không bắt đầu bằng số 0 | `phone: "1901234567"` | 400 - Lỗi validation SĐT | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"phone":"Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0"}}` | PASS | X-TEL-PHONE4, R2 | |
| 9 | TC-TAL-09 | Tên kỹ năng để trống | `name: ""`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 400 - Lỗi tên kỹ năng trống | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"skillName":"Tên kỹ năng không được để trống"}}` | PASS | X-TEL-SKILL1, R3 | |
| 10 | TC-TAL-10 | Tên kỹ năng quá dài (101 ký tự) | `name: "[101 ký tự A]"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 400 - Lỗi độ dài kỹ năng | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"skillName":"Tên kỹ năng tối đa 100 ký tự"}}` | PASS | X-TEL-SKILL2, R3 | |
| 11 | TC-TAL-11 | Thêm kỹ năng trùng tên đã có | `name: "Sketch"` (đã có trong profile), `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 1.5` | 400 - Lỗi trùng lặp kỹ năng | 400 Bad Request, `{"success":false,"message":"Skill already exists: Sketch","data":null}` | PASS | X-TEL-SKILL3, R3 | |
| 12 | TC-TAL-12 | Số năm kinh nghiệm là số âm | `name: "Python"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: -0.1` | 400 - Lỗi kinh nghiệm âm | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"yearsOfExperience":"Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.0"}}` | PASS | X-TEL-EXP1, B-EXP1, R3 | |
| 13 | TC-TAL-13 | Số năm kinh nghiệm quá 50 năm | `name: "Python"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 50.1` | 400 - Lỗi vượt max kinh nghiệm | 400 Bad Request, `{"success":false,"message":"Validation failed","data":{"yearsOfExperience":"Số năm kinh nghiệm tối đa là 50.0"}}` | PASS | X-TEL-EXP2, B-EXP7, R3 | |
| 14 | TC-TAL-14 | Avatar vượt quá 5MB | File image 5.1 MB | 400 - Lỗi kích thước Avatar | 400 Bad Request, `{"success":false,"message":"Dung lượng ảnh đại diện vượt quá 5MB","data":null}` | PASS | X-TEL-AVT1, B-AVT7, R4 | |
| 15 | TC-TAL-15 | Avatar sai định dạng (.txt) | File `avatar.txt` | 400 - Lỗi định dạng file | 400 Bad Request, `{"success":false,"message":"Định dạng ảnh không hỗ trợ, chỉ chấp nhận JPG/PNG","data":null}` | PASS | X-TEL-AVT2, R4 | |
| 16 | TC-TAL-16 | File CV vượt quá 20MB | File PDF 20.1 MB | 400 - Lỗi kích thước CV | 400 Bad Request, `{"message":"Maximum upload size exceeded"}` | PASS | X-TEL-CV1, B-CV7, R5 | |
| 17 | TC-TAL-17 | Xóa kỹ năng khỏi hồ sơ | `DELETE /api/talent/skills/2` | 200 - Xóa kỹ năng thành công | 200 OK, `{"success":true,"message":"Skill removed successfully"}` | PASS | ST-TEL-04, R1 | |
| 18 | TC-TAL-18 | Thêm kỹ năng mới với ID database không bị trùng | `name: "Q"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 1.0` | 200 - Thêm kỹ năng thành công | 200 OK, `{"success":true,"message":"Skill added successfully"}` | PASS | ST-TEL-03, R1 | Thêm skill thành công, ID được cấp là `50` |
| 19 | TC-TAL-19 | Tên kỹ năng tại biên min (1 ký tự) | `name: "A"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-SKILL1, R1 | |
| 20 | TC-TAL-20 | Tên kỹ năng ngay trên min (2 ký tự) | `name: "AB"`, `proficiencyLevel: "INTERMEDIATE"`, `yearsOfExperience: 2.0` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-SKILL2, R1 | |
| 21 | TC-TAL-21 | Tên kỹ năng tại giá trị nominal (50 ký tự) | Tên kỹ năng dài 50 ký tự | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-SKILL3, R1 | |
| 22 | TC-TAL-22 | Tên kỹ năng ngay dưới max (99 ký tự) | Tên kỹ năng dài 99 ký tự | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-SKILL4, R1 | |
| 23 | TC-TAL-23 | Tên kỹ năng tại biên max (100 ký tự) | Tên kỹ năng dài 100 ký tự | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-SKILL5, R1 | |
| 24 | TC-TAL-24 | Kinh nghiệm tại biên min (0.0) | `yearsOfExperience: 0.0` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-EXP2, R1 | |
| 25 | TC-TAL-25 | Kinh nghiệm ngay trên min (0.1) | `yearsOfExperience: 0.1` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-EXP3, R1 | |
| 26 | TC-TAL-26 | Kinh nghiệm tại giá trị nominal (25.0) | `yearsOfExperience: 25.0` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-EXP4, R1 | |
| 27 | TC-TAL-27 | Kinh nghiệm ngay dưới max (49.9) | `yearsOfExperience: 49.9` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-EXP5, R1 | |
| 28 | TC-TAL-28 | Kinh nghiệm tại biên max (50.0) | `yearsOfExperience: 50.0` | 200 - Thêm kỹ năng thành công | 200 OK, `Skill added successfully` | PASS | B-EXP6, R1 | |
| 29 | TC-TAL-29 | Upload Avatar hợp lệ | File PNG 2.5 MB | 200 - Upload Avatar thành công | 200 OK, `Avatar uploaded successfully` | PASS | V-TEL-AVT1, R1 | |
| 30 | TC-TAL-30 | Upload CV hợp lệ | File PDF 10.0 MB | 200 - Upload CV thành công | 200 OK, `CV uploaded successfully` | PASS | V-TEL-CV1, R1 | |
| 31 | TC-TAL-31 | Avatar tại đúng giới hạn 5.0 MB | File JPG đúng 5.0 MB | 200 - Upload Avatar thành công | 200 OK, `Avatar uploaded successfully` | PASS | B-AVT6, R1 | |
| 32 | TC-TAL-32 | CV tại đúng giới hạn 20.0 MB | File PDF đúng 20.0 MB | 200 - Upload CV thành công | 200 OK, `CV uploaded successfully` | PASS | B-CV6, R1 | |
| 33 | TC-TAL-33 | CV sai định dạng | File `test.txt` | 400 - Lỗi định dạng CV | 400 Bad Request, `Định dạng file CV không hợp lệ, chỉ chấp nhận PDF, DOC, DOCX` | PASS | X-TEL-CV2, R4 | |

---

## 3. Kiểm tra độ bao phủ Tag (Coverage Verification)

### 3.1 Phân hoạch lớp tương đương (EP)

| Tag | Mô tả | Test Case bao phủ | Kết quả thực tế |
|---|---|---|---|
| V-TEL-PROFILE | Xem hồ sơ của user hợp lệ (có token) | TC-TAL-01 | PASS |
| V-TEL-PHONE1 | SĐT hợp lệ (10 số, bắt đầu bằng 0) | TC-TAL-02, TC-TAL-03, TC-TAL-04 | PASS |
| V-TEL-SKILL1 | Tên kỹ năng hợp lệ (1-100 ký tự) | TC-TAL-18–TC-TAL-23 | PASS |
| V-TEL-EXP1 | Số năm kinh nghiệm hợp lệ (0.0 - 50.0) | TC-TAL-18, TC-TAL-24–TC-TAL-28 | PASS |
| V-TEL-AVT1 | File Avatar hợp lệ (JPG/PNG $\le 5.0$ MB) | TC-TAL-29, TC-TAL-31 | PASS |
| V-TEL-CV1 | File CV hợp lệ (PDF/DOC $\le 20.0$ MB) | TC-TAL-30, TC-TAL-32 | PASS |
| X-TEL-PHONE1 | SĐT < 10 chữ số | TC-TAL-05 | PASS |
| X-TEL-PHONE2 | SĐT > 10 chữ số | TC-TAL-06 | PASS |
| X-TEL-PHONE3 | SĐT chứa chữ / ký tự đặc biệt | TC-TAL-07 | PASS |
| X-TEL-PHONE4 | SĐT 10 chữ số không bắt đầu bằng 0 | TC-TAL-08 | PASS |
| X-TEL-SKILL1 | Tên kỹ năng rỗng | TC-TAL-09 | PASS |
| X-TEL-SKILL2 | Tên kỹ năng > 100 ký tự | TC-TAL-10 | PASS |
| X-TEL-SKILL3 | Tên kỹ năng trùng lặp | TC-TAL-11 | PASS |
| X-TEL-EXP1 | Số năm kinh nghiệm âm (< 0.0) | TC-TAL-12 | PASS |
| X-TEL-EXP2 | Số năm kinh nghiệm > 50.0 | TC-TAL-13 | PASS |
| X-TEL-AVT1 | Dung lượng Avatar > 5.0 MB | TC-TAL-14 | PASS |
| X-TEL-AVT2 | Avatar sai extension (.txt) | TC-TAL-15 | PASS |
| X-TEL-CV1 | Dung lượng CV > 20.0 MB | TC-TAL-16 | PASS |
| X-TEL-CV2 | CV sai định dạng | TC-TAL-33 | PASS |

### 3.2 Giá trị biên (BVA)

| Tag | Điểm biên | Test Case bao phủ | Kết quả |
|---|---|---|---|
| B-SKILL1 | min = 1 ký tự | TC-TAL-19 | PASS |
| B-SKILL2 | min+ = 2 ký tự | TC-TAL-20 | PASS |
| B-SKILL3 | nominal = 50 ký tự | TC-TAL-21 | PASS |
| B-SKILL4 | max- = 99 ký tự | TC-TAL-22 | PASS |
| B-SKILL5 | max = 100 ký tự | TC-TAL-23 | PASS |
| B-EXP1 | min- = -0.1 năm | TC-TAL-12 | PASS |
| B-EXP2 | min = 0.0 năm | TC-TAL-24 | PASS |
| B-EXP3 | min+ = 0.1 năm | TC-TAL-25 | PASS |
| B-EXP4 | nominal = 25.0 năm | TC-TAL-26 | PASS |
| B-EXP5 | max- = 49.9 năm | TC-TAL-27 | PASS |
| B-EXP6 | max = 50.0 năm | TC-TAL-28 | PASS |
| B-EXP7 | max+ = 50.1 năm | TC-TAL-13 | PASS |
| B-AVT6 | max = 5.0 MB | TC-TAL-31 | PASS |
| B-AVT7 | max+ = 5.1 MB | TC-TAL-14 | PASS |
| B-CV6 | max = 20.0 MB | TC-TAL-32 | PASS |
| B-CV7 | max+ = 20.1 MB | TC-TAL-16 | PASS |

### 3.3 Chuyển đổi trạng thái (State Transition) & Bảng quyết định (Decision Table)

**State Transitions (ST-TEL-01 đến ST-TEL-04):**
 
| ST | Test Case | Kết quả |
|---|---|---|
| ST-TEL-01 | TC-TAL-01 | PASS |
| ST-TEL-02 | TC-TAL-02 | PASS |
| ST-TEL-03 | TC-TAL-18 | PASS |
| ST-TEL-04 | TC-TAL-17 | PASS |
 
**Decision Table Rules:**
 
| Rule | Test Case | Kết quả |
|---|---|---|
| R1 (Happy path) | TC-TAL-01 đến TC-TAL-04, TC-TAL-17 đến TC-TAL-32 | PASS |
| R2 (Lỗi SĐT) | TC-TAL-05 đến TC-TAL-08 | PASS |
| R3 (Lỗi kỹ năng/kinh nghiệm) | TC-TAL-09 đến TC-TAL-13 | PASS |
| R4 (Lỗi Avatar/CV format) | TC-TAL-14, TC-TAL-15, TC-TAL-33 | PASS |
| R5 (Lỗi CV) | TC-TAL-16 | PASS |

---