Feature('FR-AUTH-001 - Đăng nhập');

Scenario('TC-LOGIN-01 - Login thành công - nominal', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'admin@labodc.com');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 5);
  I.see('Đăng nhập thành công!');
});

Scenario('TC-LOGIN-09 - sai mật khẩu', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'admin@labodc.com');
  I.fillField('Mật khẩu', 'wrongpassword');
  I.click('Đăng nhập');
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});

Scenario('TC-LOGIN-04 - để trống tên đăng nhập', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Mật khẩu', '123123');
  I.click('Đăng nhập');
  I.waitForText('Vui lòng nhập tên đăng nhập!', 5);
  I.see('Vui lòng nhập tên đăng nhập!');
});