# Test Cases: Talent Controller – Đăng ký tham gia dự án (Join Project)

**Người thực hiện:** Huỳnh Cao Đức  
**Chức năng:** `POST /api/talent/projects/{id}/join`  
**Kỹ thuật:** Phân hoạch lớp tương đương (EP) + Phân tích giá trị biên chuẩn (Standard BVA)  
**Cơ sở test:** source code `TalentController`, `TalentService.joinProject`, `JoinProjectRequest`  
**Ngày tạo:** 28/10/2026  

---

## 1. Mô tả chức năng

Talent gửi đơn tham gia một dự án đang tuyển, kèm lời nhắn (`message`).

- `message`: bắt buộc (`@NotBlank`), dài 10–1000 ký tự (`@Size(min=10, max=1000)`).
- Dự án phải tồn tại và đang ở trạng thái `RECRUITING`.
- Mỗi talent chỉ được apply một dự án một lần.
- Thành công: tạo bản ghi `project_members` với `status = PENDING`.

---

## 2. Xác định điều kiện test (Test Conditions)

| Conditions | Valid Partitions | Tag | Invalid Partitions | Tag | Boundaries (Standard) | Tag |
|---|---|---|---|---|---|---|
| **Message** | 10–1000 ký tự | V1 | < 10 ký tự (1–9) | X1 | 10 ký tự | B1 |
| | Có ký tự khác khoảng trắng | V2 | > 1000 ký tự | X2 | 11 ký tự | B2 |
| | | | Chuỗi rỗng `""` | X3 | 999 ký tự | B3 |
| | | | Toàn khoảng trắng (≥ 10 dấu cách) | X4 | 1000 ký tự | B4 |
| | | | Thiếu field / null | X5 | 505 ký tự (nom) | B5 |
| **Dự án** | Tồn tại | V3 | Không tồn tại | X6 | | |
| | Trạng thái RECRUITING | V4 | Không ở trạng thái RECRUITING | X7 | | |
| | Talent chưa apply | V5 | Talent đã apply rồi | X8 | | |
| | | | `id` không phải số | X9 | | |
| **Tài khoản** | TALENT đã đăng nhập, có hồ sơ | V6 | Không có token | X10 | | |
| | | | User đăng nhập nhưng không có hồ sơ talent | X11 | | |

> Các giá trị ngoài biên (9 và 1001 ký tự) đã được đại diện bởi X1 và X2.

---

## 3. Dữ liệu chuẩn bị (Seed data)

| Ký hiệu | Mô tả |
|---|---|
| T1 | Talent có hồ sơ, đã đăng nhập, có Bearer token |
| U2 | User đăng nhập hợp lệ nhưng **không** có bản ghi trong bảng `talents` (vd tài khoản MENTOR) |
| P1 – P5 | Dự án `RECRUITING`, public, allowApplications = true; T1 chưa apply |
| P6 | Dự án `RECRUITING`, T1 chưa apply (dùng cho các case lỗi, vì case lỗi không tạo bản ghi) |
| P7 | Dự án `COMPLETED` |

Mỗi case thành công tạo bản ghi `PENDING` nên dùng một dự án khác nhau (P1 → P5) để các case không ảnh hưởng nhau.

---

## 4. Các bước thực hiện chung (Test Steps)

1. Chuẩn bị Pre-condition của test case.
2. Gọi `POST /api/talent/projects/{id}/join`, header `Authorization: Bearer <token>`, `Content-Type: application/json`.
3. Truyền `id` và body `{ "message": ... }` theo cột Input.
4. Kiểm tra HTTP status và body phản hồi.
5. Với case thành công: kiểm tra bảng `project_members` có bản ghi mới; với case lỗi: kiểm tra **không** có bản ghi mới.

---

## 5. Thiết kế Test Cases

Quy ước: `'A'×n` là chuỗi gồm n ký tự `A`. Case hợp lệ gộp nhiều tag; mỗi case không hợp lệ chỉ chứa **một** giá trị sai, các giá trị còn lại giữ hợp lệ.

| Test Case | Mô tả | Pre-condition | Input | Expected Outcome | New Tags Covered | Pass/Fail |
|---|---|---|---|---|---|---|
| **TC1** | Đăng ký thành công, message độ dài nominal | Đăng nhập T1; P1 chưa apply | id = P1<br>message = `'A'×505` | HTTP 200; `success=true`; `data="Successfully applied to project. Waiting for mentor approval."`; DB có bản ghi `status=PENDING`, `joinMessage` = message đã gửi | V1, V2, V3, V4, V5, V6, B5 | |
| **TC2** | Message đúng 10 ký tự (biên min) | Đăng nhập T1; P2 chưa apply | id = P2<br>message = `1234567890` | HTTP 200; apply thành công; bản ghi `PENDING` | B1 | |
| **TC3** | Message 11 ký tự (min+) | Đăng nhập T1; P3 chưa apply | id = P3<br>message = `'A'×11` | HTTP 200; apply thành công; bản ghi `PENDING` | B2 | |
| **TC4** | Message 999 ký tự (max-) | Đăng nhập T1; P4 chưa apply | id = P4<br>message = `'A'×999` | HTTP 200; apply thành công; bản ghi `PENDING` | B3 | |
| **TC5** | Message đúng 1000 ký tự (biên max) | Đăng nhập T1; P5 chưa apply | id = P5<br>message = `'A'×1000` | HTTP 200; apply thành công; bản ghi `PENDING` | B4 | |
| **TC6** | Message ngắn hơn 10 ký tự | Đăng nhập T1; P6 chưa apply | id = P6<br>message = `Xin chào` (8 ký tự) | HTTP 400; `message="Validation failed"`; `data.message="Message must be between 10 and 1000 characters"`; không có bản ghi mới | X1 | |
| **TC7** | Message dài hơn 1000 ký tự | Đăng nhập T1; P6 chưa apply | id = P6<br>message = `'A'×1500` | HTTP 400; `Validation failed`; `data.message="Message must be between 10 and 1000 characters"`; không có bản ghi mới | X2 | |
| **TC8** | Message rỗng | Đăng nhập T1; P6 chưa apply | id = P6<br>message = `""` | HTTP 400; `Validation failed`; `data.message` là "Message is required" hoặc thông báo độ dài (vi phạm cả 2 rule); không có bản ghi mới | X3 | |
| **TC9** | Message toàn khoảng trắng | Đăng nhập T1; P6 chưa apply | id = P6<br>message = 10 dấu cách | HTTP 400; `Validation failed`; `data.message="Message is required"`; không có bản ghi mới | X4 | |
| **TC10** | Thiếu field message | Đăng nhập T1; P6 chưa apply | id = P6<br>body = `{}` | HTTP 400; `Validation failed`; `data.message="Message is required"`; không có bản ghi mới | X5 | |
| **TC11** | Dự án không tồn tại | Đăng nhập T1 | id = `999999`<br>message = `'A'×30` | HTTP 400; `success=false`; `message="Project not found"` | X6 | |
| **TC12** | Dự án không đang tuyển | Đăng nhập T1; P7 là `COMPLETED` | id = P7<br>message = `'A'×30` | HTTP 400; `message="Project is not currently recruiting"`; không có bản ghi mới | X7 | |
| **TC13** | Apply lần 2 vào cùng dự án | Đăng nhập T1; **đã chạy TC1** (T1 đã apply P1) | id = P1<br>message = `'A'×30` | HTTP 400; `message="You have already applied to this project"`; không thêm bản ghi | X8 | |
| **TC14** | `id` không phải số | Đăng nhập T1 | id = `abc`<br>message = `'A'×30` | HTTP 400 (lỗi kiểu dữ liệu path variable); không có bản ghi mới | X9 | |
| **TC15** | Không gửi token | Không có header Authorization | id = P6<br>message = `'A'×30` | HTTP 401 hoặc 403; không có bản ghi mới | X10 | |
| **TC16** | User không có hồ sơ talent | Đăng nhập U2 | id = P6<br>message = `'A'×30` | HTTP 400; `message` bắt đầu bằng `Talent profile not found for user:`; không có bản ghi mới | X11 | |

---

## 6. Kiểm tra độ phủ

| Nhóm tag | Test case phủ |
|---|---|
| V1–V6 | TC1 |
| B1, B2, B3, B4, B5 | TC2, TC3, TC4, TC5, TC1 |
| X1 – X5 (message) | TC6 – TC10 |
| X6 – X9 (dự án) | TC11 – TC14 |
| X10, X11 (tài khoản) | TC15, TC16 |

- Tổng: 16 test case (5 positive, 11 negative); phủ 100% tag đã xác định.
- Mỗi test condition có ít nhất một positive test và một negative test.

---

## 7. Ghi chú

- TC8: message rỗng vi phạm cả `@NotBlank` lẫn `@Size`, `data.message` chỉ giữ một thông báo nên không cố định; chỉ cần kiểm tra HTTP 400.
- TC14, TC15: status thực tế phụ thuộc cấu hình Spring; ghi lại kết quả quan sát được vào cột Pass/Fail.
- TC13 phụ thuộc TC1; nếu chạy riêng thì tạo sẵn bản ghi `project_members` của T1 với P1.
