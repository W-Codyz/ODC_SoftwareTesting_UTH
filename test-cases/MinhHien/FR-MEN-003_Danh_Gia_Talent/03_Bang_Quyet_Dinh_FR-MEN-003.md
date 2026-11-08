# BẢNG QUYẾT ĐỊNH (DECISION TABLE)
## MODULE: FR-MEN-003 - ĐÁNH GIÁ TALENT (EVALUATE TALENTS)

> **Người thực hiện:** Nguyễn Minh Hiển  
> **Dự án:** ODC Software Testing (LabODC)  
> **Tài liệu tham chiếu:** Giáo trình Kiểm thử phần mềm - Chương IV (Slide 41 - 46), `docs/SRS_LabOdc.md`  

---

### I. XÁC ĐỊNH CONDITIONS VÀ ACTIONS

#### 1. Conditions (Điều kiện đầu vào):
- **C1:** Người dùng là Mentor được phân công vào dự án? (`Y` / `N`)
- **C2:** Sinh viên (`talentId`) có thuộc danh sách dự án? (`Y` / `N`)
- **C3:** Kỳ đánh giá (`evaluationPeriod`) chưa từng tồn tại đánh giá trước đó? (`Y` / `N`)
- **C4:** Điểm tổng thể và tất cả điểm tiêu chí con đều thuộc đoạn `[0.0, 10.0]`? (`Y` / `N`)

#### 2. Actions (Hành động kết quả):
- **A1:** Tạo đánh giá thành công (HTTP 201/200 OK).
- **A2:** Báo lỗi HTTP 403 Forbidden ("Chỉ Mentor của dự án mới có quyền đánh giá").
- **A3:** Báo lỗi HTTP 404/400 Not Found ("Sinh viên không thuộc dự án").
- **A4:** Báo lỗi HTTP 409 Conflict ("Kỳ đánh giá đã tồn tại, hãy dùng thao tác cập nhật").
- **A5:** Báo lỗi HTTP 400 Bad Request ("Thang điểm bắt buộc từ 0.0 đến 10.0").

---

### II. BẢNG QUYẾT ĐỊNH ĐẦY ĐỦ (FULL DECISION TABLE)

| Mã | Condition / Action | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8..R16 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **C1** | Là Mentor được phân công dự án? | Y | Y | Y | Y | Y | Y | Y | N |
| **C2** | Sinh viên thuộc dự án? | Y | Y | Y | Y | N | N | N | - |
| **C3** | Kỳ đánh giá chưa tồn tại (chưa đánh giá)? | Y | Y | N | N | Y | Y | N | - |
| **C4** | Tất cả điểm số thuộc [0.0..10.0]? | Y | N | Y | N | Y | N | - | - |
| **A1** | Tạo đánh giá thành công (201/200) | **X** | - | - | - | - | - | - | - |
| **A2** | Báo lỗi 403 Forbidden (Không đủ quyền) | - | - | - | - | - | - | - | **X** |
| **A3** | Báo lỗi 404/400 (Talent không thuộc dự án) | - | - | - | - | **X** | **X** | **X** | - |
| **A4** | Báo lỗi 409 Conflict (Trùng lặp kỳ) | - | - | **X** | **X** | - | - | - | - |
| **A5** | Báo lỗi 400 Bad Request (Điểm sai khoảng) | - | **X** | - | - | - | - | - | - |

---

### III. BẢNG QUYẾT ĐỊNH RÚT GỌN (REDUCED DECISION TABLE - SLIDE TRANG 46)

| STT | Condition / Action | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **C1** | Là Mentor được phân công dự án? | **Y** | **Y** | **Y** | **Y** | **N** |
| **C2** | Sinh viên thuộc dự án? | **Y** | **Y** | **Y** | **N** | **-** |
| **C3** | Kỳ đánh giá chưa tồn tại? | **Y** | **Y** | **N** | **-** | **-** |
| **C4** | Tất cả điểm số thuộc [0.0..10.0]? | **Y** | **N** | **-** | **-** | **-** |
| **A1** | Tạo đánh giá thành công (201/200) | **X** | - | - | - | - |
| **A2** | Báo lỗi 403 Forbidden (Không đủ quyền) | - | - | - | - | **X** |
| **A3** | Báo lỗi 404/400 (Talent không thuộc dự án) | - | - | - | **X** | - |
| **A4** | Báo lỗi 409 Conflict (Trùng kỳ đánh giá) | - | - | **X** | - | - |
| **A5** | Báo lỗi 400 Bad Request (Điểm ngoài khoảng) | - | **X** | - | - | - |