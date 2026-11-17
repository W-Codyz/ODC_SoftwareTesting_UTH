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


Scenario('TC-LOGIN-18 - [ST-02] Login sai lần đầu - tăng counter', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlogin@labodc.com');
  I.fillField('Mật khẩu', 'WrongFirst!');
  I.click('Đăng nhập');
  // ST-02, X-PW2 → counter DB tăng lên 1 (verify ở DB, ngoài UI scope).
  // UI chỉ thấy 401 toast "Invalid email or password".
  I.waitForText('Invalid email or password', 5);
  I.see('Invalid email or password');
});

Scenario('TC-LOGIN-15 - [ST-05] Login khi account đã bị khóa (password đúng)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlocked1@labodc.com');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // ST-05, X-ACC1, R6 → account LOCKED → 403 bất kể password đúng/sai
  I.waitForText('Tài khoản đã bị khóa', 5);
  I.see('Tài khoản đã bị khóa');
});

Scenario('TC-LOGIN-16 - [ST-07] Login khi account chưa kích hoạt (PENDING)', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testinactive@labodc.com');
  I.fillField('Mật khẩu', 'Secure@123');
  I.click('Đăng nhập');
  // ST-07, X-ACC2, R6 → account PENDING/INACTIVE → 403
  I.waitForText('Tài khoản chưa kích hoạt', 5);
  I.see('Tài khoản chưa kích hoạt');
});

Scenario('TC-LOGIN-20 - [R6] Login account LOCKED + password sai', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlocked2@labodc.com');
  I.fillField('Mật khẩu', 'WrongPass!');
  I.click('Đăng nhập');
  // ST-05, X-ACC1, R6 → LOCKED check đứng trước password check → 403 "Tài khoản đã bị khóa"
  I.waitForText('Tài khoản đã bị khóa', 5);
  I.see('Tài khoản đã bị khóa');
});

Scenario('TC-LOGIN-14 - [ST-03] Login sai lần thứ 5 - khóa tài khoản', ({ I }) => {
  for (let i = 1; i <= 6; i++) {
    I.amOnPage('/login');
    I.fillField('Tên đăng nhập', 'testlockme@labodc.com');
    I.fillField('Mật khẩu', `WrongPass${i}!`);
    I.click('Đăng nhập');
    I.wait(1.5);
  }
  // Attempt cuối cùng trên page sạch → account chắc chắn đã LOCKED → toast ổn định
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', 'testlockme@labodc.com');
  I.fillField('Mật khẩu', 'FinalWrong!');
  I.click('Đăng nhập');
  // ST-03, X-PW2 → sau tối đa 5 lần sai, account phải LOCKED
  I.waitForText('Tài khoản đã bị khóa', 5);
  I.see('Tài khoản đã bị khóa');
});