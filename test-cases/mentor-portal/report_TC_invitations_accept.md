# BÁO CÁO KẾT QUẢ KIỂM THỬ

## MENTOR PORTAL -- DANH SÁCH LỜI MỜI MENTOR

---

Thông tin Chi tiết

---

Người thực hiện Lê Duy Mạnh

Chức năng kiểm thử Danh sách lời mời Mentor --
`GET /api/mentor/invitations`

Ngày tạo bộ test case 18/11/2026

Phạm vi TC-MI-01 đến TC-MI-16

---

---

## 1. Tổng quan kết quả

Phạm vi kiểm thử gồm **16 test case** thuộc chức năng lấy danh sách lời
mời Mentor đang chờ.

Kết quả thực thi do người kiểm thử xác nhận:

- **15 test case PASS**
- **01 test case FAIL / Chưa đạt**

  Tổng số PASS FAIL / Chưa đạt

---

         16                      15

Tỷ lệ đạt: **93,75%**.\
Tỷ lệ chưa đạt: **6,25%**.

## 2. Danh sách kết quả kiểm thử

---

TC ID Mô tả kiểm thử Kết quả mong đợi Kết quả
theo thiết kế

---

TC-MI-01 Mentor có một lời HTTP 200; trả về **PASS**
mời đang chờ đúng lời mời

TC-MI-02 Mentor có nhiều HTTP 200; trả đủ **PASS**
lời mời đang chờ lời mời, sắp xếp  
 `receivedDate`  
 giảm dần

TC-MI-03 Mentor không có HTTP 200; **PASS**
lời mời đang chờ `data=[]`

TC-MI-04 Chỉ lấy lời mời HTTP 200; chỉ trả **PASS**
của mentor đang invitation thuộc  
 đăng nhập mentor đang đăng  
 nhập

TC-MI-05 Kiểm tra mapping HTTP 200; đủ **PASS**
và giá trị mặc field,  
 định `projectName`  
 fallback và các  
 field được chuẩn  
 hóa

TC-MI-06 Không gửi token HTTP 401 **PASS**
Unauthorized

TC-MI-07 Bearer rỗng HTTP 401 **PASS**
Unauthorized

TC-MI-08 Thiếu scheme HTTP 401 **PASS**
Bearer Unauthorized

TC-MI-09 JWT sai định dạng Kỳ vọng HTTP 401 **PASS**
Unauthorized

TC-MI-10 JWT hết hạn Kỳ vọng HTTP 401 **PASS**
Unauthorized

TC-MI-11 JWT sai chữ ký Kỳ vọng HTTP 401 **PASS**
Unauthorized

TC-MI-12 Role TALENT HTTP 403 **PASS**
Forbidden

TC-MI-13 Role ENTERPRISE HTTP 403 **PASS**
Forbidden

TC-MI-14 Role LAB_ADMIN HTTP 403 **PASS**
Forbidden

TC-MI-15 Role SYSTEM_ADMIN HTTP 403 **PASS**
Forbidden

TC-MI-16 User MENTOR không Kỳ vọng HTTP 404 **FAIL / Chưa
có hồ sơ Mentor Not Found theo đạt**
exception handler
hiện tại

---

## 3. Ghi nhận test case chưa đạt

### TC-MI-16 -- User MENTOR không có hồ sơ Mentor

Test case này được ghi nhận **FAIL / Chưa đạt** theo kết quả kiểm thử do
người thực hiện cung cấp.

Theo thiết kế trong tài liệu test case, trường hợp tài khoản có role
`MENTOR` nhưng không có bản ghi Mentor liên kết được kỳ vọng trả về
**HTTP 404 Not Found** khi không tìm thấy hồ sơ Mentor.

**Lưu ý:** Tài liệu đầu vào không cung cấp response thực tế, HTTP status
thực tế hoặc nội dung lỗi của lần chạy TC-MI-16. Vì vậy, báo cáo chỉ ghi
nhận trạng thái FAIL/chưa đạt, không tự suy diễn nguyên nhân hay kết quả
phản hồi cụ thể.

## 4. Kết luận

Theo kết quả thực thi được người kiểm thử xác nhận, chức năng **Danh
sách lời mời Mentor** có:

- **15/16 test case đạt yêu cầu (PASS)**, chiếm **93,75%**.
- **01/16 test case chưa đạt (FAIL)**, chiếm **6,25%**.

Test case cần được theo dõi và xử lý là **TC-MI-16** -- trường hợp tài
khoản có role `MENTOR` nhưng không có hồ sơ Mentor liên kết.

## 5. Căn cứ lập báo cáo

Báo cáo được lập từ tài liệu **"Test Cases - Mentor Invitations"
(TC_design)**, bao gồm phạm vi, phân hoạch tương đương, mô tả test case
và kết quả mong đợi.

Trạng thái PASS/FAIL được ghi theo xác nhận của người dùng rằng đã thực
hiện kiểm thử.
