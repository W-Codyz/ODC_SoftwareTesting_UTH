# Test Cases - Available Mentors

**Người thực hiện:** [Nguyễn Duy Đức]  
**Module:** Lab Administrator  
**Chức năng:** Available Mentors (`GET /api/lab-admin/mentors/available`)  
**Ngày tạo:** 28/10/2026

---

## 1. Phân tích điều kiện đầu vào

### 1.1 Tham số `technologies`

| Điều kiện | Loại | Tag | Giá trị đại diện |
|---|---|---|---|
| Không truyền tham số | Valid | V1 | `(không có)` |
| Lọc 1 công nghệ có mentor | Valid | V2 | `technologies=ReactJS` |
| Lọc nhiều công nghệ | Valid | V3 | `technologies=ReactJS,NodeJS` |
| Công nghệ không có mentor nào | Invalid | X1 | `technologies=abcxyz` |
| Tham số rỗng / khoảng trắng | Invalid | X2 | `technologies=%20%20` |

### 1.2 Capacity của mentor (giả sử `maxProjects = 3`)

| Điều kiện | Loại | Tag | Giá trị đại diện |
|---|---|---|---|
| currentProjects = 0 (biên dưới nhất) | Boundary | B1 | `0/3` |
| currentProjects = max - 1 (ngay dưới biên) | Boundary | B2 | `2/3` |
| currentProjects = max (đúng biên) | Boundary | B3 | `3/3` |
| currentProjects = max + 1 (trên biên, dữ liệu bất thường) | Boundary | B4 | `4/3` |

### 1.3 Tham số `maxProjects`

| Điều kiện | Loại | Tag | Giá trị đại diện |
|---|---|---|---|
| Giá trị true | Valid | V4 | `maxProjects=true` |
| Giá trị false | Valid | V5 | `maxProjects=false` |
| Giá trị không phải boolean | Invalid | X3 | `maxProjects=abc` |

### 1.4 Quyền truy cập

| Điều kiện | Loại | Tag | Giá trị đại diện |
|---|---|---|---|
| Token LAB_ADMIN hợp lệ | Valid | V6 | `Bearer <token LAB_ADMIN>` |
| Không có token | Invalid | X4 | `(không có Authorization)` |
| Token role khác (TALENT / ENTERPRISE / MENTOR) | Invalid | X5 | `Bearer <token TALENT>` |

---

## 2. Bảng Test Cases

| TC ID | Mô tả | Token | Tham số / Dữ liệu | Expected Result | Tags |
|---|---|---|---|---|---|
| TC-MENTOR-01 | Lấy danh sách khi không lọc | LAB_ADMIN (hợp lệ) | `(không có technologies)` | Trả về 200, danh sách mentor còn capacity | V1, V6 |
| TC-MENTOR-02 | Lọc theo 1 công nghệ | LAB_ADMIN (hợp lệ) | `technologies=ReactJS` | Trả về 200, chỉ gồm mentor có `ReactJS` trong `expertise` | V2, V6 |
| TC-MENTOR-03 | Lọc theo nhiều công nghệ | LAB_ADMIN (hợp lệ) | `technologies=ReactJS,NodeJS` | Trả về 200, gồm mentor khớp expertise | V3, V6 |
| TC-MENTOR-04 | Lọc công nghệ không tồn tại | LAB_ADMIN (hợp lệ) | `technologies=abcxyz` | Trả về 200, `mentors` là danh sách rỗng | X1, V6 |
| TC-MENTOR-05 | Tham số `technologies` là khoảng trắng | LAB_ADMIN (hợp lệ) | `technologies=%20%20` | Cần xác nhận (SRS chưa quy định) | X2, V6 |
| TC-MENTOR-06 | Mentor có 0/3 dự án | LAB_ADMIN (hợp lệ) | Mentor có `currentProjects=0` | Có trong kết quả, `available: true` | B1, V6 |
| TC-MENTOR-07 | Mentor có 2/3 dự án (dưới biên) | LAB_ADMIN (hợp lệ) | Mentor có `currentProjects=2` | Có trong kết quả, `available: true` | B2, V6 |
| TC-MENTOR-08 | Mentor có 3/3 dự án (đúng biên) | LAB_ADMIN (hợp lệ) | Mentor có `currentProjects=3` | KHÔNG có trong kết quả | B3, V6 |
| TC-MENTOR-09 | Mentor có 4/3 dự án (trên biên) | LAB_ADMIN (hợp lệ) | Mentor có `currentProjects=4` | KHÔNG có trong kết quả | B4, V6 |
| TC-MENTOR-10 | Lọc `maxProjects=true` | LAB_ADMIN (hợp lệ) | `maxProjects=true` | Trả về 200, chỉ gồm mentor còn capacity | V4, V6 |
| TC-MENTOR-11 | Lọc `maxProjects=false` | LAB_ADMIN (hợp lệ) | `maxProjects=false` | Cần xác nhận (SRS chưa quy định) | V5, V6 |
| TC-MENTOR-12 | `maxProjects` sai kiểu dữ liệu | LAB_ADMIN (hợp lệ) | `maxProjects=abc` | Trả về lỗi 400 | X3, V6 |
| TC-MENTOR-13 | Gọi API khi không có token | `(không có)` | `(không có)` | Trả về lỗi 401 | X4 |
| TC-MENTOR-14 | Gọi API bằng token TALENT | TALENT | `(không có)` | Trả về lỗi 403 | X5 |
| TC-MENTOR-15 | Gọi API bằng token ENTERPRISE | ENTERPRISE | `(không có)` | Trả về lỗi 403 | X5 |
| TC-MENTOR-16 | Gọi API bằng token MENTOR | MENTOR | `(không có)` | Trả về lỗi 403 | X5 |
| TC-MENTOR-17 | Kiểm tra các field trả về | LAB_ADMIN (hợp lệ) | `(không có technologies)` | Mỗi mentor có `id`, `fullName`, `expertise`, `currentProjects`, `maxProjects`, `available` | V1, V6 |
