# BẢNG QUYẾT ĐỊNH (DECISION TABLE)
## MODULE: FR-TL-002 - NỘP BÁO CÁO NHÓM (SUBMIT TEAM REPORT)

> **Người thực hiện:** Nguyễn Minh Hiển  
> **Dự án:** ODC Software Testing (LabODC)  
> **Tài liệu tham chiếu:** Giáo trình Kiểm thử phần mềm - Chương IV (Slide 41 - 46), `docs/SRS_LabOdc.md`  

---

### I. XÁC ĐỊNH CONDITIONS VÀ ACTIONS

#### 1. Conditions (Điều kiện đầu vào):
- **C1:** Người dùng là Team Leader của dự án? (`Y` / `N`)
- **C2:** Loại báo cáo (`reportType`) thuộc danh mục quy định (`WEEKLY`, `MONTHLY`, `FINAL`)? (`Y` / `N`)
- **C3:** Kỳ báo cáo (`reportingPeriod`) đúng định dạng `YYYY-MM`? (`Y` / `N`)
- **C4:** Tiến độ tổng thể (`overallProgress`) nằm trong khoảng `[0..100]`? (`Y` / `N`)
- **C5:** Hành động người dùng chọn là nộp chính thức "SUBMIT" (`Y`) hay lưu nháp "DRAFT" (`N`)?

#### 2. Actions (Hành động kết quả):
- **A1:** Tạo báo cáo thành công với trạng thái `SUBMITTED` (HTTP 201/200).
- **A2:** Tạo báo cáo thành công với trạng thái `DRAFT` (HTTP 201/200).
- **A3:** Báo lỗi HTTP 403 Forbidden ("Chỉ Trưởng nhóm mới có quyền nộp báo cáo").
- **A4:** Báo lỗi HTTP 400 Bad Request ("Loại báo cáo không hợp lệ").
- **A5:** Báo lỗi HTTP 400 Bad Request ("Kỳ báo cáo sai định dạng YYYY-MM").
- **A6:** Báo lỗi HTTP 400 Bad Request ("Tiến độ phải nằm trong khoảng 0 đến 100").

---

### II. BẢNG QUYẾT ĐỊNH ĐẦY ĐỦ (FULL DECISION TABLE)

| Mã | Condition / Action | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9..R16 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **C1** | Là Team Leader của dự án? | Y | Y | Y | Y | Y | Y | Y | Y | N |
| **C2** | reportType hợp lệ? | Y | Y | Y | Y | N | N | Y | Y | - |
| **C3** | reportingPeriod hợp lệ (YYYY-MM)? | Y | Y | Y | Y | - | - | N | N | - |
| **C4** | overallProgress thuộc [0..100]? | Y | Y | N | N | - | - | - | - | - |
| **C5** | Hành động là nộp chính thức (SUBMIT)? | Y | N | Y | N | Y | N | Y | N | - |
| **A1** | Nộp thành công trạng thái SUBMITTED | **X** | - | - | - | - | - | - | - | - |
| **A2** | Lưu thành công trạng thái DRAFT | - | **X** | - | - | - | - | - | - | - |
| **A3** | Báo lỗi 403 Forbidden (Không đủ quyền) | - | - | - | - | - | - | - | - | **X** |
| **A4** | Báo lỗi 400 Bad Request (Sai reportType) | - | - | - | - | **X** | **X** | - | - | - |
| **A5** | Báo lỗi 400 Bad Request (Sai kỳ báo cáo) | - | - | - | - | - | - | **X** | **X** | - |
| **A6** | Báo lỗi 400 Bad Request (Sai progress) | - | - | **X** | **X** | - | - | - | - | - |

---

### III. BẢNG QUYẾT ĐỊNH RÚT GỌN (REDUCED DECISION TABLE - SLIDE TRANG 46)
*(Áp dụng quy tắc gộp các cột có cùng hành động và sử dụng dấu `-` (Don't care) khi giá trị không ảnh hưởng đến kết quả)*

| STT | Condition / Action | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 | Rule 6 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **C1** | Là Team Leader của dự án? | **Y** | **Y** | **Y** | **Y** | **Y** | **N** |
| **C2** | reportType hợp lệ? | **Y** | **Y** | **Y** | **N** | **-** | **-** |
| **C3** | reportingPeriod hợp lệ (YYYY-MM)? | **Y** | **Y** | **Y** | **-** | **N** | **-** |
| **C4** | overallProgress thuộc [0..100]? | **Y** | **Y** | **N** | **-** | **-** | **-** |
| **C5** | Chọn hành động SUBMIT (Y) / DRAFT (N)? | **Y** | **N** | **-** | **-** | **-** | **-** |
| **A1** | Tạo thành công trạng thái SUBMITTED | **X** | - | - | - | - | - |
| **A2** | Tạo thành công trạng thái DRAFT | - | **X** | - | - | - | - |
| **A3** | Báo lỗi 403 Forbidden (Không có quyền) | - | - | - | - | - | **X** |
| **A4** | Báo lỗi 400 Bad Request (Sai reportType) | - | - | - | **X** | - | - |
| **A5** | Báo lỗi 400 Bad Request (Sai kỳ báo cáo) | - | - | - | - | **X** | - |
| **A6** | Báo lỗi 400 Bad Request (Sai tiến độ) | - | - | **X** | - | - | - |