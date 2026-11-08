# LabODC - Lab Kết Nối Doanh Nghiệp

Hệ thống kết nối sinh viên, mentor và doanh nghiệp trong môi trường thực tập/dự án thực tế.

---

## Kiến trúc hệ thống

```
ODC_SoftwareTesting_UTH/
├── labodc-backend/      # API Server (Spring Boot)
├── labodc-web-portal/   # Web App (React + Vite)
├── docs/                # Tài liệu dự án
├── Postman/             # Collection và env Postman
├── codecept-report/     # Báo cáo test CodeceptJS
└── test-cases/          # Design testcase và report testcase
```

---

## Yêu cầu cài đặt

| Công cụ | Phiên bản tối thiểu | Tải về |
|---------|---------------------|--------|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org |
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |


---

## 1. Khởi động Database (PostgreSQL)

Database chạy qua Docker. Mở terminal tại thư mục `labodc-backend/`:

```bash
cd labodc-backend
docker-compose up -d
```

Docker sẽ tự động:
- Khởi động PostgreSQL 16 tại cổng **5432**
- Chạy các file SQL trong `src/database/` để tạo schema và seed data
- Khởi động pgAdmin tại **http://localhost:5050**

Kiểm tra database đã sẵn sàng:

```bash
docker-compose ps
# STATUS của postgres phải là: healthy
```

> **Thông tin kết nối:**
> - Host: `localhost:5432` | Database: `labodc`
> - Username: `root` | Password: `123123`
>
> **pgAdmin:** http://localhost:5050 - Email: `admin@labodc.com` / Password: `admin123`

### Execute / Khởi tạo lại Database

**Cách 1 - Chạy lệnh một dòng không cần vào psql:**

```bash
docker exec -i labodc-postgres psql -U root -d labodc < src/database/schema.sql
```

**Cách 2 - Dùng pgAdmin (giao diện web):**

1. Mở http://localhost:5050
2. Đăng nhập: `admin@labodc.com` / `admin123`
3. Kết nối server: **Add New Server** → tab *Connection* → Host: `postgres`, Port: `5432`, Username: `root`, Password: `123123`
4. Chọn database `labodc` → menu **Tools → Query Tool**
5. Mở file SQL bằng nút **Open File** (biểu tượng thư mục) → chọn `schema.sql`
6. Nhấn **F5** hoặc nút **Execute** để chạy

> **Lưu ý:** Các file SQL chỉ tự động chạy lần đầu khi container được tạo mới. Nếu container đã tồn tại (chỉ bị stop), cần dùng một trong ba cách trên để chạy lại.


## 2. Khởi động Backend (Spring Boot)

Mở terminal tại thư mục `labodc-backend/`:

```bash
cd labodc-backend
mvn spring-boot:run
```

Server khởi động tại: **http://localhost:8080**

### Tài khoản mặc định

| Role | Email | Password |
|------|-------|----------|
| System Admin | `admin@labodc.com` | `123123` |
| Lab Admin | `labadmin1@labodc.com` | `123123` |
| Enterprise | `contact@techcorp.vn` | `123123` |
| Mentor | `mentor.nguyenquang@uth.edu.vn` | `123123` |
| Talent | `nguyenvana@student.uth.edu.vn` | `123123` |

---

## 3. Khởi động Web App (React)

Mở terminal tại thư mục `labodc-web-portal/`:

```bash
cd labodc-web-portal
```

**Lần đầu - cài dependencies:**

```bash
npm install
```

**Chạy development server:**

```bash
npm run dev
```

Web app khởi động tại: **http://localhost:3000**

Mở trình duyệt và truy cập http://localhost:3000, đăng nhập bằng một trong các tài khoản ở bảng trên.


## Thứ tự khởi động đúng

```
1. Chạy PostgreSQL trong Docker
2. Chạy mvn spring-boot:run tại labodc-backend/
3. Chạy npm run dev tại labodc-web-portal/
```
## Hướng dẫn E2E Testing với CodeceptJS

### Cài đặt

Từ thư mục gốc repo, chạy lần lượt:

```powershell
npm install
cd labodc-web-portal
npm install
```

Nếu chưa có trình duyệt Chromium cho Playwright:

```powershell
npx playwright install chromium
```

## Khởi động hệ thống trước khi test
Cần khởi động cả 3 thành phần: Database, Backend, Frontend trước khi chạy test. Hướng dẫn ở trên (phần [Thứ tự khởi động đúng](#thứ-tự-khởi-động-đúng)).

## Các lệnh chạy test

### Chạy một file test cụ thể

```powershell
npx codeceptjs run --steps e2e-tests/auth/login_test.js #thay "auth/login_test.js" thành đường dẫn và tên file cần chạy
```

### Chạy một Scenario cụ thể (theo tên)

```powershell
npx codeceptjs run --steps --grep "Đăng nhập thành công" #thay "Đăng nhập thành công" tên Scenario cần chạy
```

### Tạo báo cáo coverage cho một file test (quan trọng, bắt buộc chạy)

```powershell
npm run test:e2e:report:file -- e2e-tests/auth/login_test.js #thay "auth/login_test.js" thành đường dẫn và tên file cần chạy
```

Lệnh này sẽ tự động:
1. Chạy tất cả Scenario trong file test đó một lần
2. Tạo báo cáo coverage riêng cho từng Scenario
3. Tạo báo cáo tổng hợp cho cả module

Kết quả nằm trong `codecept-report/`.

## Cách viết test

### Cấu trúc file test

Mỗi file test phải có:
- `Feature('Mã module - Tên module')` - tên Feature lấy từ bảng phân công
- `Scenario('ID testcase - Mô tả test case', ...)` - mỗi Scenario là một test case

Ví dụ:

```javascript
Feature('FR-AUTH-001 - Đăng nhập');

Scenario('TC-LOGIN-01 - Login thành công với tất cả hợp lệ', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'admin@labodc.com');
  I.fillField('Mật khẩu', 'admin123');
  I.click('Đăng nhập');
  I.waitInUrl('/admin/dashboard', 30);
  I.see('Dashboard');
});

Scenario('TC-LOGIN-09 - sai mật khẩu', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'admin@labodc.com');
  I.fillField('Mật khẩu', 'wrongpassword');
  I.click('Đăng nhập');
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});
```

### Các lệnh CodeceptJS thường dùng
Xem chi tiết ở : https://codecept.io/quickstart/

## Quy trình làm việc với E2E
1. Viết test case trong thư mục `e2e-tests/`.
2. Chạy test và tạo báo cáo coverage:

```powershell
npm run test:e2e:report:file -- e2e-tests/ten-module/ten_file_test.js
```
3. Kiểm tra báo cáo trong `codecept-report/`, mở file `index.html` để xem.

## Xem báo cáo coverage

Mở file `index.html` trong các thư mục con của `codecept-report/`:

- **Báo cáo tổng hợp module:** `codecept-report/TenFeature/report_TenFeature/index.html`
- **Báo cáo từng Scenario:** `codecept-report/TenFeature/TenScenario/index.html`

Trong báo cáo:
- **Statements** - Phần trăm câu lệnh đã được thực thi (đây là chỉ số chính)
- **Branches** - Phần trăm nhánh if/else đã được đi qua
- **Functions** - Phần trăm hàm đã được gọi
- **Lines** - Phần trăm dòng code đã được chạy

Click vào từng file/thư mục để xem chi tiết: dòng màu xanh là đã chạy qua, dòng màu đỏ là chưa chạy.