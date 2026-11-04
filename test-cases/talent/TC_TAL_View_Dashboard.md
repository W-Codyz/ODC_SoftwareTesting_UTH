# Test Cases: FR-TAL-002 - Xem Dashboard Talent

**Người thực hiện:** Hiền

**Module:** Talent Dashboard

**Chức năng:** View Talent Dashboard

**Ngày tạo:** 28/10/2026

---

# 1. Phân tích điều kiện đầu vào

## 1.1 Trạng thái đăng nhập

| Điều kiện | Loại | Tag | Giá trị đại diện |
|------------|---------|---------|---------|
| Talent đã đăng nhập | Valid | V1 | Logged In |
| Chưa đăng nhập | Invalid | X1 | Guest |

## 1.2 Dữ liệu Dashboard

| Điều kiện | Loại | Tag | Giá trị đại diện |
|------------|---------|---------|---------|
| Có dữ liệu dashboard | Valid | V2 | Dashboard contains statistics |
| Không có dữ liệu | Valid | V3 | Empty dashboard |
| Lỗi tải dữ liệu từ server | Invalid | X2 | API Error |

---

# 2. Decision Table

| Rule | Login Status | Dashboard Data | Expected Result |
|--------|------------|------------|------------|
| R1 | V1 | V2 | Hiển thị dashboard thành công |
| R2 | V1 | V3 | Hiển thị trạng thái dữ liệu trống |
| R3 | V1 | X2 | Hiển thị thông báo lỗi |
| R4 | X1 | - | Chuyển hướng đến Login |

---

# 3. Black-box Test Cases

## TC-TAL-002-01: Xem Dashboard thành công

### Steps

1. Đăng nhập bằng tài khoản Talent hợp lệ.
2. Truy cập Dashboard.

### Expected Result

- Dashboard hiển thị thành công.
- Các widget thống kê xuất hiện đầy đủ.

---

## TC-TAL-002-02: Dashboard không có dữ liệu

### Steps

1. Đăng nhập tài khoản chưa có dữ liệu.
2. Truy cập Dashboard.

### Expected Result

- Hiển thị trạng thái dữ liệu trống.
- Không phát sinh lỗi.

---

## TC-TAL-002-03: Lỗi tải dữ liệu Dashboard

### Steps

1. Truy cập Dashboard khi API lỗi.

### Expected Result

- Hệ thống hiển thị thông báo lỗi.
- Không crash trang.

---

## TC-TAL-002-04: Truy cập Dashboard khi chưa đăng nhập

### Steps

1. Truy cập URL Dashboard trực tiếp.

### Expected Result

- Chuyển hướng về trang Login.