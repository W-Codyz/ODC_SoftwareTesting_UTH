# Test Cases - Mentor Invitations

**Người thực hiện:** Lê Duy Mạnh
**Module:** Mentor Portal  
**Chức năng:** Danh sách lời mời Mentor (`GET /api/mentor/invitations`)  
**Ngày tạo:** 03/11/2026

---

## 1. Căn cứ và phạm vi

- Controller xác nhận endpoint `GET /api/mentor/invitations`, chỉ role `MENTOR` được gọi.
- Service lấy lời mời `PENDING` theo mentor đang đăng nhập, sắp xếp `receivedDate` giảm dần.
- Mỗi item có các field `id`, `projectName`, `groupName`, `studentCount`, `description`, `deadline`, `skills`, `receivedDate`, `priority`.
- API không nhận query parameter/body; vì vậy BVA đầu vào không áp dụng. Bộ này gồm 5 ca positive và 11 ca negative về dữ liệu, xác thực và phân quyền.

## 2. Phân hoạch tương đương

| Điều kiện                                            | Loại              | Tag    | Giá trị đại diện                                                      |
| ---------------------------------------------------- | ----------------- | ------ | --------------------------------------------------------------------- |
| Bearer hợp lệ, role MENTOR và có hồ sơ               | Valid             | V1     | Mentor đã đăng nhập                                                   |
| Có một invitation PENDING của mentor                 | Valid             | V2     | Một bản ghi phù hợp                                                   |
| Có nhiều invitation PENDING                          | Valid             | V3     | Nhiều bản ghi; kiểm tra thứ tự mới nhất trước                         |
| Không có invitation PENDING                          | Valid             | V4     | Không có bản ghi phù hợp                                              |
| Có invitation của mentor khác                        | Valid / isolation | V5     | mentor_id khác                                                        |
| DTO và fallback/chuẩn hóa field                      | Valid             | V6     | Project thiếu, description/skills/priority có giá trị biên null/blank |
| Không có token, Bearer rỗng, header sai hoặc JWT lỗi | Invalid           | X1-X6  | Credential thiếu/không xác minh được                                  |
| Token role không phải MENTOR                         | Invalid           | X7-X10 | TALENT, ENTERPRISE, LAB_ADMIN, SYSTEM_ADMIN                           |
| Role MENTOR nhưng không có hồ sơ                     | Invalid state     | X11    | Không tìm thấy hồ sơ Mentor                                           |

> Không lập BVA số học vì endpoint không nhận input có miền min/max. Giá trị null/blank trong response thuộc kiểm tra mapping/EP theo logic hiện có, không phải BVA request.

## 3. Test cases

| TC ID    | Mô tả                                     | Token               | Tham số / Dữ liệu                                                     | Expected Result                                                                                                                                                                                                              | Tags   |
| -------- | ----------------------------------------- | ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| TC-MI-01 | Mentor có một lời mời đang chờ            | MENTOR hợp lệ       | Một invitation status=PENDING của mentor                              | 200; data có đúng lời mời                                                                                                                                                                                                    | V1, V2 |
| TC-MI-02 | Mentor có nhiều lời mời đang chờ          | MENTOR hợp lệ       | Nhiều invitation PENDING                                              | 200; trả đủ lời mời theo `receivedDate` giảm dần                                                                                                                                                                             | V1, V3 |
| TC-MI-03 | Mentor không có lời mời đang chờ          | MENTOR hợp lệ       | Không có invitation PENDING                                           | 200; `data=[]`                                                                                                                                                                                                               | V1, V4 |
| TC-MI-04 | Chỉ lấy lời mời của mentor đang đăng nhập | MENTOR A hợp lệ     | PENDING của A và B; gọi bằng token A                                  | 200; chỉ có invitation thuộc A                                                                                                                                                                                               | V1, V5 |
| TC-MI-05 | Kiểm tra mapping và giá trị mặc định      | MENTOR hợp lệ       | PENDING có đủ field; thêm case thiếu project để kiểm tra fallback tên | 200; item có `id`, `projectName`, `groupName`, `studentCount`, `description`, `deadline`, `skills`, `receivedDate`, `priority`; projectName fallback `Project #<id>`, description/skills/priority được chuẩn hóa theo source | V1, V6 |
| TC-MI-06 | Không gửi token                           | Không có            | Không có Authorization                                                | 401 Unauthorized                                                                                                                                                                                                             | X1     |
| TC-MI-07 | Bearer rỗng                               | Token rỗng          | `Authorization: Bearer`                                               | 401 Unauthorized                                                                                                                                                                                                             | X2     |
| TC-MI-08 | Thiếu scheme Bearer                       | Header sai format   | Gửi JWT trực tiếp trong Authorization                                 | 401 Unauthorized                                                                                                                                                                                                             | X3     |
| TC-MI-09 | JWT sai định dạng                         | Token lỗi           | Bearer chuỗi không phải JWT                                           | Kỳ vọng 401; cần ghi nhận status thực tế                                                                                                                                                                                     | X4     |
| TC-MI-10 | JWT hết hạn                               | Token hết hạn       | Bearer JWT đã hết hạn                                                 | Kỳ vọng 401; cần ghi nhận status thực tế                                                                                                                                                                                     | X5     |
| TC-MI-11 | JWT sai chữ ký                            | Token sai chữ ký    | JWT ký bằng secret khác                                               | Kỳ vọng 401; cần ghi nhận status thực tế                                                                                                                                                                                     | X6     |
| TC-MI-12 | Role TALENT                               | TALENT hợp lệ       | Token TALENT còn hạn                                                  | 403 Forbidden                                                                                                                                                                                                                | X7     |
| TC-MI-13 | Role ENTERPRISE                           | ENTERPRISE hợp lệ   | Token ENTERPRISE còn hạn                                              | 403 Forbidden                                                                                                                                                                                                                | X8     |
| TC-MI-14 | Role LAB_ADMIN                            | LAB_ADMIN hợp lệ    | Token LAB_ADMIN còn hạn                                               | 403 Forbidden                                                                                                                                                                                                                | X9     |
| TC-MI-15 | Role SYSTEM_ADMIN                         | SYSTEM_ADMIN hợp lệ | Token SYSTEM_ADMIN còn hạn                                            | 403 Forbidden                                                                                                                                                                                                                | X10    |
| TC-MI-16 | User MENTOR không có hồ sơ Mentor         | MENTOR hợp lệ       | User không có bản ghi Mentor liên kết                                 | 404 Not Found theo exception handler hiện tại                                                                                                                                                                                | X11    |

## 4. Bảng kiểm tra độ phủ

| Điều kiện                                     | Test case   | Trạng thái thiết kế                 |
| --------------------------------------------- | ----------- | ----------------------------------- |
| V1-V4: mentor, invitation pending, nhiều/rỗng | TC-MI-01–03 | Đã có case                          |
| V5: cách ly mentor                            | TC-MI-04    | Đã có case                          |
| V6: DTO/fallback                              | TC-MI-05    | Đã có case                          |
| X1-X6: credential                             | TC-MI-06–11 | JWT lỗi cần xác nhận status thực tế |
| X7-X10: role không phù hợp                    | TC-MI-12–15 | Đã có case                          |
| X11: thiếu hồ sơ                              | TC-MI-16    | Đã có case                          |
| Tổng                                          | TC-MI-01–16 | 16 (5 positive, 11 negative)        |

## 5. Chuẩn bị và chạy bằng Postman

1. Chạy `labodc-backend`; base URL hiện cấu hình là `http://localhost:8080`.
2. Đăng nhập trong cùng backend, lấy Bearer token MENTOR có hồ sơ; gọi `GET http://localhost:8080/api/mentor/invitations`.
3. Chuẩn bị dữ liệu `mentor_invitations` cho mentor đó: PENDING, trạng thái khác PENDING, ngày nhận khác nhau và bản ghi thuộc mentor khác.
4. So sánh status, body, thứ tự và quyền nhìn thấy dữ liệu với expected result. Ghi response thực tế trước khi đánh dấu pass/fail.
5. Test credential lỗi và role khác bằng token tương ứng; không dùng token từ service khác nếu khác secret/cấu hình.

## 6. Ghi chú thực thi

- Script chỉ kiểm tra contract trong source rồi sinh Markdown; không gọi API hoặc tạo fixture.
- Service chỉ lấy trạng thái PENDING. Các invitation trạng thái khác không nên xuất hiện.
- Khi project không tồn tại, service dùng tên `Project #<id>`; `description` null thành chuỗi rỗng, `skills` được parse JSON list, priority được chuẩn hóa.
- Với JWT lỗi, hãy ghi nhận status thực tế từ filter; không suy đoán test đã pass.

### Sinh lại file

```powershell
python scripts\generate_mentor_invitations_test_cases.py
```
