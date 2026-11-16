const mentorEmail = process.env.MENTOR_EMAIL || 'mentor.nguyenquang@uth.edu.vn';
const mentorPassword = process.env.MENTOR_PASSWORD || '123123';

Feature('FR-MEN-004 - Nop Bao cao Mentor');

function loginAsMentor(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', mentorEmail);
  I.fillField('Mật khẩu', mentorPassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

Scenario('TC-MR-01 - Dang nhap Mentor va truy cap trang Danh sach Bao cao', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports');
  I.waitForText('Báo cáo mentor', 10);
  I.see('Báo cáo mentor');
  I.see('Danh sách báo cáo đã/đang nộp');
  I.see('Nộp báo cáo');
  I.see('Làm mới');
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-MR-01_Đăng nhập Mentor và truy cập trang Danh sách Báo cáo.png');
});

Scenario('TC-MR-02 - Chuyen sang trang Nop Bao cao moi tu trang Danh sach', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports');
  I.waitForText('Báo cáo mentor', 10);
  I.click('Nộp báo cáo');
  I.waitInUrl('/mentor/reports/new', 10);
  I.waitForText('Nộp báo cáo sinh viên', 10);
  I.see('Thông tin báo cáo');
  I.see('Nội dung báo cáo');
  I.seeElement('#projectId');
  I.seeElement('#studentId');
  I.seeElement('#student');
  I.seeElement('#reportName');
  I.saveScreenshot('TC-MR-02_Chuyển sang trang Nộp Báo cáo mới từ trang Danh sách.png');
});

Scenario('TC-MR-03 - Nop bao cao thanh cong day du thong tin (Nominal)', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports/new');
  I.waitForText('Nộp báo cáo sinh viên', 10);

  I.fillField('#projectId', '4');
  I.fillField('#studentId', 'SV001');
  I.fillField('#student', 'Nguyen Van A');
  I.fillField('#reportName', 'Báo cáo tiến độ tuần 1');

  // Chọn hạn nộp dueDate
  I.click('#dueDate');
  I.fillField('#dueDate', '31/12/2026');
  I.pressKey('Enter');

  I.fillField('#summary', 'Sinh viên hoàn thành tốt công việc tuần 1, đúng tiến độ.');
  
  I.click('Gửi báo cáo');
  I.waitForText('Đã gửi báo cáo thành công!', 10);
  I.see('Đã gửi báo cáo thành công!');
  I.saveScreenshot('TC-MR-03_Nộp báo cáo thành công đầy đủ thông tin (Nominal).png');
});

Scenario('TC-MR-04 - Validate bat buoc khi de trong cac truong', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports/new');
  I.waitForText('Nộp báo cáo sinh viên', 10);

  // Click gửi ngay khi chưa điền
  I.click('Gửi báo cáo');
  I.wait(1);

  // Kiểm tra thông báo lỗi validation của Form Ant Design
  I.see('Vui lòng nhập mã dự án');
  I.see('Vui lòng nhập MSSV');
  I.see('Vui lòng nhập tên sinh viên');
  I.see('Vui lòng nhập tên báo cáo');
  I.see('Vui lòng chọn hạn nộp');
  I.saveScreenshot('TC-MR-04_Validate bắt buộc khi để trống các trường.png');
});

Scenario('TC-MR-05 - Chon trang thai bao cao tu dropdown', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports/new');
  I.waitForText('Nộp báo cáo sinh viên', 10);

  I.click('.ant-select');
  I.wait(1);
  I.click('Nộp trễ');
  I.wait(1);
  I.see('Nộp trễ');
  I.saveScreenshot('TC-MR-05_Chọn trạng thái báo cáo từ dropdown.png');
});

Scenario('TC-MR-06 - Xem bang bao cao da nop va lam moi du lieu', ({ I }) => {
  loginAsMentor(I);
  I.amOnPage('/mentor/reports/new');
  I.waitForText('Nộp báo cáo sinh viên', 10);

  I.see('Báo cáo đã nộp (đồng bộ database)');
  I.seeElement('.ant-table');
  I.click('Làm mới');
  I.wait(1);
  I.seeElement('.ant-table');
  I.saveScreenshot('TC-MR-06_Xem bảng báo cáo đã nộp và làm mới dữ liệu.png');
});

Scenario('TC-MR-07 - Chan truy cap trai phep khi chua dang nhap', ({ I }) => {
  I.amOnPage('/mentor/reports');
  I.waitInUrl('/login', 10);
  I.see('Đăng nhập');
  I.seeElement('input[placeholder="Tên đăng nhập"]');
  I.saveScreenshot('TC-MR-07_Chặn truy cập trái phép khi chưa đăng nhập.png');
});