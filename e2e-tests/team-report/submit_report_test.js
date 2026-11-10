Feature('FR-TL-002 - Nộp Báo cáo Nhóm');

Scenario('TC-TL002-01 - Nộp báo cáo nominal (50%)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 1');
  I.fillField('Tiến độ (%)', '50');
  I.fillField('Thành tựu', 'Hoàn thành thiết kế hệ thống và cấu hình database');
  I.fillField('Challenges', 'Tài liệu tích hợp bên thứ ba còn thiếu');
  I.fillField('Next Steps', 'Tiến hành viết test case và tích hợp API');
  I.fillField('Additional Notes', 'Nhóm hoàn thành đúng tiến độ tuần 1');
  I.click('button[type="submit"]');
  I.waitForText('Nộp báo cáo nhóm thành công!', 5);
  I.see('Nộp báo cáo nhóm thành công!');
});

Scenario('TC-TL002-02 - Nộp báo cáo tại biên min (0%)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 0');
  I.fillField('Tiến độ (%)', '0');
  I.fillField('Thành tựu', 'Khởi tạo dự án và phân chia công việc cho thành viên');
  I.click('button[type="submit"]');
  I.waitForText('Nộp báo cáo nhóm thành công!', 5);
  I.see('Nộp báo cáo nhóm thành công!');
});

Scenario('TC-TL002-03 - Nộp báo cáo tại biên max (100%)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 12');
  I.fillField('Tiến độ (%)', '100');
  I.fillField('Thành tựu', 'Hoàn tất nghiệm thu dự án và bàn giao sản phẩm');
  I.click('button[type="submit"]');
  I.waitForText('Nộp báo cáo nhóm thành công!', 5);
  I.see('Nộp báo cáo nhóm thành công!');
});

Scenario('TC-TL002-04 - Nộp báo cáo tại biên min+ (1%)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 1');
  I.fillField('Tiến độ (%)', '1');
  I.fillField('Thành tựu', 'Bắt đầu nghiên cứu tài liệu và tạo kho mã nguồn');
  I.click('button[type="submit"]');
  I.waitForText('Nộp báo cáo nhóm thành công!', 5);
  I.see('Nộp báo cáo nhóm thành công!');
});

Scenario('TC-TL002-05 - Nộp báo cáo tại biên max- (99%)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 11');
  I.fillField('Tiến độ (%)', '99');
  I.fillField('Thành tựu', 'Kiểm thử hoàn tất, chuẩn bị tài liệu bàn giao');
  I.click('button[type="submit"]');
  I.waitForText('Nộp báo cáo nhóm thành công!', 5);
  I.see('Nộp báo cáo nhóm thành công!');
});

Scenario('TC-TL002-06 - Để trống kỳ báo cáo', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Tiến độ (%)', '50');
  I.fillField('Thành tựu', 'Đã hoàn thành các nhiệm vụ tuần');
  I.click('button[type="submit"]');
  I.waitForText('Vui lòng nhập kỳ báo cáo!', 5);
  I.see('Vui lòng nhập kỳ báo cáo!');
});

Scenario('TC-TL002-07 - Để trống tiến độ', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 2');
  I.fillField('Thành tựu', 'Đã hoàn thành các nhiệm vụ tuần');
  I.click('button[type="submit"]');
  I.waitForText('Vui lòng nhập tiến độ!', 5);
  I.see('Vui lòng nhập tiến độ!');
});

Scenario('TC-TL002-08 - Để trống thành tựu', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.fillField('Kỳ báo cáo', 'Week 2');
  I.fillField('Tiến độ (%)', '50');
  I.click('button[type="submit"]');
  I.waitForText('Vui lòng nhập thành tựu!', 5);
  I.see('Vui lòng nhập thành tựu!');
});

Scenario('TC-TL002-09 - Hủy bỏ form nộp báo cáo', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'nguyenvana@student.uth.edu.vn');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.amOnPage('/talent/leader/1');
  I.waitForText('Project Leadership Dashboard', 5);
  I.click('Submit Report');
  I.waitForText('Submit Team Report', 5);
  I.click('Cancel');
  I.dontSee('Submit Team Report');
});

Scenario('TC-TL002-10 - Chưa đăng nhập truy cập trang nộp báo cáo', ({ I }) => {
  I.amOnPage('/talent/leader/1');
  I.seeInCurrentUrl('/login');
  I.see('Đăng nhập');
});
