Feature('FR-AUTH-001 - Đăng nhập');

Scenario('TC-LOGIN-01 - Login thành công - nominal', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'admin@labodc.com');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.see('Đăng nhập thành công!');
});
 
Scenario('TC-LOGIN-02 - Login thành công - password tại biên min (8 ký tự)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testmin@labodc.com');
  I.fillField('Mật khẩu', 'Abcdef1!');
  I.click('Đăng nhập');

  I.waitForText('Đăng nhập thành công!', 5);
  I.see('Đăng nhập thành công!');
});
 
Scenario('TC-LOGIN-03 - Login thành công - password tại biên min+ (9 ký tự)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testminplus@labodc.com');
  I.fillField('Mật khẩu', 'Abcdefg1!');
  I.click('Đăng nhập');
  // BVA: password đúng 9 ký tự (min+1) → login thành công
  I.waitForText('Đăng nhập thành công!', 5);
  I.see('Đăng nhập thành công!');
});

Scenario('TC-LOGIN-04 - để trống tên đăng nhập', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Vui lòng nhập tên đăng nhập!', 5);
  I.see('Vui lòng nhập tên đăng nhập!');
});

Scenario('TC-LOGIN-05 - Email sai format - thiếu @ (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testloginlabodc.com');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // Frontend không validate email format → gửi đến API
  // API @Email bắt lỗi → trả về 400 "Validation failed"
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});
 
Scenario('TC-LOGIN-06 - Email sai format - thiếu domain (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlogin@');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // API @Email bắt lỗi → trả về 400 "Validation failed"
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});
 
Scenario('TC-LOGIN-07 - Email không tồn tại trong DB (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'ghost@labodc.com');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // API authenticate fail → 401 message chung để bảo mật
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});

Scenario('TC-LOGIN-08 - Password rỗng (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlogin@labodc.com');
  I.click('Đăng nhập');
  // Frontend Ant Design bắt required → hiển thị inline validation
  I.waitForText('Vui lòng nhập mật khẩu!', 5);
  I.see('Vui lòng nhập mật khẩu!');
});
 
Scenario('TC-LOGIN-09 - Password sai - không khớp (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlogin@labodc.com');
  I.fillField('Mật khẩu', 'WrongPass999!');
  I.click('Đăng nhập');
  // API authenticate fail → 401
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});

Scenario('TC-LOGIN-10 - Email chỉ có khoảng trắng', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', '   ');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // Ant Design required rule không bắt whitespace-only
  // → form submit → API @NotBlank bắt → 400 "Validation failed"
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});
 
Scenario('TC-LOGIN-11 - Password chỉ có khoảng trắng', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlogin@labodc.com');
  I.fillField('Mật khẩu', '   ');
  I.click('Đăng nhập');
  // Ant Design required rule không bắt whitespace-only
  // → form submit → API @NotBlank bắt → 400 "Validation failed"
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});
 
Scenario('TC-LOGIN-12 - Email có khoảng trắng đầu cuối (edge case)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', ' testlogin@labodc.com ');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // Email có khoảng trắng đầu/cuối → API @Email reject hoặc không trim
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});
 
Scenario('TC-LOGIN-13 - Email viết hoa - case sensitivity (single fault)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'TESTLOGIN@LABODC.COM');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // Hệ thống phân biệt hoa/thường → không tìm thấy user → 401
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});