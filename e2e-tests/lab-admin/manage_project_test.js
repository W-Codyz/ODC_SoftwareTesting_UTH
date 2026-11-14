const adminEmail = process.env.ADMIN_EMAIL || 'admin@labodc.com';
const adminPassword = process.env.ADMIN_PASSWORD || '123123';

Feature('FR-LAB-002 - Quản lý Dự án');

function loginAsAdmin(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', adminEmail);
  I.fillField('Mật khẩu', adminPassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

Scenario('TC-LP-01 - Đăng nhập Lab Admin và truy cập trang Quản lý Dự án', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects');
  I.waitForText('Quản lý Dự án', 10);
  I.see('Quản lý Dự án');
  I.seeElement('input[placeholder="Tìm kiếm theo tên dự án..."]');
  I.see('Dự án');
  I.see('Doanh nghiệp');
  I.see('Trạng thái');
  I.see('Xác thực');
  I.saveScreenshot('TC-LP-01_Đăng nhập Lab Admin và truy cập trang Quản lý Dự án.png');
});

Scenario('TC-LP-02 - Tìm kiếm dự án theo tên dự án', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects');
  I.waitForText('Quản lý Dự án', 10);
  I.fillField('input[placeholder="Tìm kiếm theo tên dự án..."]', 'Website');
  I.pressKey('Enter');
  I.wait(1);
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-LP-02_Tìm kiếm dự án theo tên dự án.png');
});

Scenario('TC-LP-03 - Lọc dự án theo trạng thái xác thực (Chờ duyệt)', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects');
  I.waitForText('Quản lý Dự án', 10);

  I.click('.ant-select:nth-of-type(2)');
  I.wait(1);
  I.click('Chờ duyệt');
  I.wait(1);
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-LP-03_Lọc dự án theo trạng thái xác thực (Chờ duyệt).png');
});

Scenario('TC-LP-04 - Lọc dự án theo trạng thái xác thực (Đã duyệt)', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects');
  I.waitForText('Quản lý Dự án', 10);

  I.click('.ant-select:nth-of-type(2)');
  I.wait(1);
  I.click('Đã duyệt');
  I.wait(1);
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-LP-04_Lọc dự án theo trạng thái xác thực (Đã duyệt).png');
});

Scenario('TC-LP-05 - Mở modal chỉnh sửa dự án', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects');
  I.waitForText('Quản lý Dự án', 10);
  
  I.waitForElement('.ant-table-row', 10);
  I.click('.ant-table-tbody .ant-btn');
  I.waitForText('Chỉnh sửa Dự án', 5);
  I.see('Tên dự án');
  I.see('Mô tả');
  I.see('Ngân sách');
  
  I.click('Hủy');
  I.wait(1);
  I.dontSee('Chỉnh sửa Dự án');
  I.saveScreenshot('TC-LP-05_Mở modal chỉnh sửa dự án.png');
});

Scenario('TC-LP-06 - Truy cập trang Xác thực Dự án và duyệt qua các Tab', ({ I }) => {
  loginAsAdmin(I);
  I.amOnPage('/admin/projects/validate');
  I.waitForText('Xác thực Dự án', 10);
  I.see('Xác thực Dự án');
  
  I.see('Chờ xác thực');
  I.see('Đã phê duyệt');
  I.see('Đã từ chối');
  I.see('Đang tuyển');
  
  I.click('Đã phê duyệt');
  I.wait(1);
  I.seeElement('.ant-table');
  
  I.click('Đã từ chối');
  I.wait(1);
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-LP-06_Truy cập trang Xác thực Dự án và duyệt qua các Tab.png');
});

Scenario('TC-LP-07 - Chặn truy cập trái phép khi chưa đăng nhập', ({ I }) => {
  I.amOnPage('/admin/projects');
  I.waitInUrl('/login', 10);
  I.see('Đăng nhập');
  I.seeElement('input[placeholder="Tên đăng nhập"]');
  I.saveScreenshot('TC-LP-07_Chặn truy cập trái phép khi chưa đăng nhập.png');
});