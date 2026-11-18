
Feature('FR-LAB-003 - Fund Allocation 70/20/10');

const ADMIN_EMAIL = 'labadmin1@labodc.com';
const ADMIN_PASSWORD = '123123';

Scenario('TC-FA-UI-01 - Lab Admin truy cập trang Fund Allocation', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.wait(3);
  I.amOnPage('/admin/funds');

  I.waitForText('Phân bổ Quỹ', 10);
  I.see('Tổng doanh thu');
  I.see('Đã giải ngân Team');
  I.see('Đã giải ngân Mentor');
  I.see('Quỹ Lab');
});


Scenario('TC-FA-UI-02 - Chuyển đổi giữa sáu tab phân bổ quỹ', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.waitForFunction(
    () => window.location.pathname !== '/login',
    null,
    15
  );

  I.amOnPage('/admin/funds');
  I.waitForText('Phân bổ Quỹ', 15);

  // Tab 1: Tất cả
  I.click('Tất cả');
  I.waitForText('Tổng quỹ', 10);
  I.see('Team (70%)');
  I.see('Mentor (20%)');
  I.see('Lab (10%)');

  // Tab 2: Đã phân phối
  I.click('Đã phân phối');
  I.waitForText('Tổng quỹ', 10);

  // Tab 3: Hoàn tất
  I.click('Hoàn tất');
  I.waitForText('Tổng quỹ', 10);

  // Tab 4: Đã phân bổ
  I.click('Đã phân bổ');
  I.waitForText('Tổng quỹ', 10);

  // Tab 5: Thanh toán chậm
  I.click('Thanh toán chậm');
  I.waitForText('Quá hạn', 10);
  I.see('Mức độ');

  // Tab 6: Hybrid Fund
  I.click('Hybrid Fund');
  I.waitForText('Số tiền tạm ứng', 10);
  I.see('Công nợ DN');

  // Quay lại tab Tất cả
  I.click('Tất cả');
  I.waitForText('Tổng quỹ', 10);
});




Scenario('TC-FA-UI-03 - Tìm kiếm tên dự án không tồn tại', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.waitForFunction(
    () => window.location.pathname !== '/login',
    null,
    15
  );

  I.amOnPage('/admin/funds');
  I.waitForText('Phân bổ Quỹ', 15);

  // Nhập tên dự án không tồn tại
  I.fillField(
    'Tìm kiếm theo tên dự án, doanh nghiệp...',
    'DuAnKhongTonTai123'
  );

  // Chờ bảng cập nhật kết quả tìm kiếm
  I.wait(2);

  // Kiểm tra không có dòng dữ liệu phù hợp
  const rowCount = await I.grabNumberOfVisibleElements(
    '.ant-table-tbody > tr.ant-table-row'
  );

  if (rowCount !== 0) {
    throw new Error(
      `Tìm kiếm dự án không tồn tại nhưng bảng vẫn hiển thị ${rowCount} dòng dữ liệu`
    );
  }

  // Xác nhận từ khóa tìm kiếm có thể được xóa
  I.clearField('Tìm kiếm theo tên dự án, doanh nghiệp...');
});

Scenario('TC-FA-UI-04 - Kiểm tra lỗi khi truy cập tab Đã phân phối', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.waitForFunction(
    () => window.location.pathname !== '/login',
    null,
    15
  );

  I.amOnPage('/admin/funds');
  I.waitForText('Phân bổ Quỹ', 15);

  // Truy cập tab Đã phân phối
  I.click('Đã phân phối');

  // Chờ API và giao diện xử lý
  I.wait(3);

   // Kiểm tra giao diện không hiển thị lỗi
  I.dontSee('operator does not exist');
  I.dontSee('Không thể tải dữ liệu');

  // Kiểm tra dự án được hiển thị trong tab Đã phân phối
  I.waitForText('TEST_OVER_DISBURSEMENT_2026', 10);
  I.see('TEST_OVER_DISBURSEMENT_2026');
});

Scenario('TC-FA-UI-05 - Tìm kiếm dự án đã tồn tại', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.waitForFunction(
    () => window.location.pathname !== '/login',
    null,
    15
  );

  I.amOnPage('/admin/funds');
  I.waitForText('Phân bổ Quỹ', 15);

  // Chờ dự án xuất hiện trong danh sách ban đầu
  I.waitForText('TEST_OVER_DISBURSEMENT_2026', 10);

  // Tìm kiếm dự án
  I.fillField(
    'Tìm kiếm theo tên dự án, doanh nghiệp...',
    'TEST_OVER_DISBURSEMENT_2026'
  );

  I.wait(2);

  // Xác nhận dự án được tìm thấy
  I.see('TEST_OVER_DISBURSEMENT_2026');

  // Kiểm tra bảng chỉ có một dòng dữ liệu phù hợp
  I.seeNumberOfVisibleElements(
    '.ant-table-tbody > tr.ant-table-row',
    1
  );
});


Scenario('TC-FA-UI-06 - Kiểm tra tỷ lệ phân bổ quỹ 70/20/10', async ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Tên đăng nhập', ADMIN_EMAIL);
  I.fillField('Mật khẩu', ADMIN_PASSWORD);
  I.click('Đăng nhập');

  I.waitForFunction(
    () => window.location.pathname !== '/login',
    null,
    15
  );

  I.amOnPage('/admin/funds');
  I.waitForText('Phân bổ Quỹ', 15);

  // Tìm dự án cần kiểm tra
  I.waitForText('TEST_OVER_DISBURSEMENT_2026', 10);

  I.fillField(
    'Tìm kiếm theo tên dự án, doanh nghiệp...',
    'TEST_OVER_DISBURSEMENT_2026'
  );

  I.wait(2);

  // Lấy nội dung dòng dữ liệu của dự án
  const rowText = await I.grabTextFrom(
    '.ant-table-tbody > tr.ant-table-row'
  );
 console.log('NOI DUNG DONG DU LIEU:', rowText);

  // Kiểm tra tổng quỹ
  if (!rowText.includes('70.000.000')) {
    throw new Error('Sai tổng quỹ: kỳ vọng 70.000.000 VND');
  }

  // Kiểm tra Team 70%
  if (!rowText.includes('49.000.000')) {
    throw new Error('Sai phân bổ Team: kỳ vọng 49.000.000 VND');
  }

  // Kiểm tra Mentor 20%
  if (!rowText.includes('14.000.000')) {
    throw new Error('Sai phân bổ Mentor: kỳ vọng 14.000.000 VND');
  }

  // Kiểm tra Lab 10%
  if (!rowText.includes('7.000.000')) {
    throw new Error('Sai phân bổ Lab: kỳ vọng 7.000.000 VND');
  }
});
