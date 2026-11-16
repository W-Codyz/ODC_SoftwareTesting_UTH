Feature('FR-AUTH-002 - Đăng ký tài khoản');

/* DELETE FROM users
WHERE email IN (
    -- TC-REG-01: Đăng ký Talent thành công
    'newtalent@uth.edu.vn',

    -- TC-REG-02: Đăng ký Enterprise thành công
    'newcompany@example.com',

    -- TC-REG-08 (FAIL - code chưa validate domain): account bị tạo nhầm
    'talent@gmail.com',

    -- TC-REG-09: Password rỗng (400 → không tạo account, nhưng xóa phòng ngừa)
    'newtalent2@uth.edu.vn',

    -- TC-REG-10: Password khoảng trắng
    'newtalent3@uth.edu.vn',

    -- TC-REG-11: Password < 8 ký tự
    'newtalent4@uth.edu.vn',

    -- TC-REG-12 (FAIL - code chưa validate password strength): account bị tạo nhầm
    'newtalent5@uth.edu.vn',

    -- TC-REG-13 (không test - cùng root cause TC-REG-12)
    'newtalent6@uth.edu.vn',

    -- TC-REG-14 (không test - cùng root cause TC-REG-12)
    'newtalent7@uth.edu.vn',

    -- TC-REG-15 (không test - cùng root cause TC-REG-12)
    'newtalent8@uth.edu.vn',

    -- TC-REG-16: ConfirmPassword rỗng
    'newtalent9@uth.edu.vn',

    -- TC-REG-17: ConfirmPassword không khớp
    'newtalent10@uth.edu.vn',

    -- TC-REG-18: Role null
    'newtalent11@uth.edu.vn',

    -- TC-REG-19: Role không hợp lệ ("STUDENT")
    'newtalent12@uth.edu.vn',

    -- TC-REG-20: Password = 8 ký tự (BVA min)
    'newtalent13@uth.edu.vn',

    -- TC-REG-21: Password = 9 ký tự (BVA min+)
    'newtalent14@uth.edu.vn',

    -- TC-REG-23: Kiểm tra status sau đăng ký Talent
    'checkstatus@uth.edu.vn',

    -- TC-REG-24: Kiểm tra status sau đăng ký Enterprise
    'checkstatus@company.com',

    -- TC-REG-25: Happy path Enterprise domain .com.vn
    'newent@company.com.vn'
); */

// === 5.1 Happy Path ===

Scenario('TC-REG-01 - Đăng ký Talent thành công - happy path', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // V-EM1, V-PW1, V-CP1, V-RL1, B-PW4, ST-01, R1
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

Scenario('TC-REG-02 - Đăng ký Enterprise thành công - happy path', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newcompany@example.com');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Doanh nghiệp');
  I.click('Đăng ký');
  // V-EM2, V-PW1, V-CP1, V-RL2, ST-02, R1
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

// === 5.2 Email không hợp lệ ===

Scenario('TC-REG-03 - Email rỗng', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-EM1, R2 → frontend Ant Design bắt lỗi required
  I.waitForText('Vui lòng nhập email!', 5);
  I.see('Vui lòng nhập email!');
});

Scenario('TC-REG-04 - Email chỉ có khoảng trắng', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', '   ');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-EM1, R2 → frontend Ant Design bắt lỗi email format
  I.waitForText('Email không hợp lệ!', 5);
  I.see('Email không hợp lệ!');
});

Scenario('TC-REG-05 - Email thiếu @ (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalentuth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-EM2, R2 → frontend Ant Design bắt lỗi email format
  I.waitForText('Email không hợp lệ!', 5);
  I.see('Email không hợp lệ!');
});

Scenario('TC-REG-06 - Email thiếu domain (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent@');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-EM3, R2 → @Email bắt lỗi
  I.waitForText('Email không hợp lệ!', 5);
  I.see('Email không hợp lệ!');
});

Scenario('TC-REG-07 - Email đã tồn tại (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'sv1@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-EM4, ST-03, R3 → AuthService phát hiện email đã tồn tại
  I.waitForText('Email already registered', 5);
  I.see('Email already registered');
});

// === 5.3 Password không hợp lệ ===

Scenario('TC-REG-09 - Password rỗng (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent2@uth.edu.vn');
  I.fillField('Xác nhận mật khẩu', '');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-PW1, R5 → frontend Ant Design bắt lỗi required
  I.waitForText('Vui lòng nhập mật khẩu!', 5);
  I.see('Vui lòng nhập mật khẩu!');
});

Scenario('TC-REG-10 - Password chỉ có khoảng trắng (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent3@uth.edu.vn');
  I.fillField('Mật khẩu', '   ');
  I.fillField('Xác nhận mật khẩu', '   ');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-PW1, R5 → frontend validator: khoảng trắng < min 6 ký tự
  I.waitForText('Mật khẩu phải có ít nhất 6 ký tự!', 5);
  I.see('Mật khẩu phải có ít nhất 6 ký tự!');
});

Scenario('TC-REG-11 - Password < 8 ký tự (BVA min-)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent4@uth.edu.vn');
  I.fillField('Mật khẩu', 'Ab1!xyz');
  I.fillField('Xác nhận mật khẩu', 'Ab1!xyz');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-PW2, B-PW1, R5 → @Size(min=8) → API trả về toast "Validation failed"
  I.waitForText('Validation failed', 5);
  I.see('Validation failed');
});

// === 5.4 ConfirmPassword không hợp lệ ===

Scenario('TC-REG-16 - ConfirmPassword rỗng (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent9@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-CP1, R7 → frontend Ant Design bắt lỗi required confirmPassword
  I.waitForText('Vui lòng xác nhận mật khẩu!', 5);
  I.see('Vui lòng xác nhận mật khẩu!');
});

Scenario('TC-REG-17 - ConfirmPassword không khớp (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent10@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'DifferentPass1!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // X-CP2, R7 → frontend validator phát hiện passwords không khớp
  I.waitForText('Mật khẩu không khớp!', 5);
  I.see('Mật khẩu không khớp!');
});

// === 5.5 Role không hợp lệ ===

Scenario('TC-REG-18 - Role null / không chọn (single fault)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent11@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  // Không chọn vai trò → role = null
  I.click('Đăng ký');
  // X-RL1, R8 → frontend Ant Design bắt lỗi required role
  I.waitForText('Vui lòng chọn vai trò!', 5);
  I.see('Vui lòng chọn vai trò!');
});

// === 5.6 Boundary Value Analysis - Độ dài password ===

Scenario('TC-REG-20 - Password = 8 ký tự (BVA min)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent13@uth.edu.vn');
  I.fillField('Mật khẩu', 'Abcdef1!');
  I.fillField('Xác nhận mật khẩu', 'Abcdef1!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // B-PW2 → đúng min 8 ký tự → đăng ký thành công
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

Scenario('TC-REG-21 - Password = 9 ký tự (BVA min+)', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newtalent14@uth.edu.vn');
  I.fillField('Mật khẩu', 'Abcdefg1!');
  I.fillField('Xác nhận mật khẩu', 'Abcdefg1!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // B-PW3 → min+1 ký tự → đăng ký thành công
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

// === 5.7 State Transition Testing ===

Scenario('TC-REG-22 - [ST-03] Đăng ký trùng email đang ACTIVE', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'sv1@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // ST-03, X-EM4, R3 → email tồn tại → tài khoản cũ giữ nguyên
  I.waitForText('Email already registered', 5);
  I.see('Email already registered');
});

Scenario('TC-REG-23 - [ST-01] Kiểm tra status sau đăng ký Talent', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'checkstatus@uth.edu.vn');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Người tài năng');
  I.click('Đăng ký');
  // ST-01 → CHƯA ĐĂNG KÝ → ACTIVE (kiểm tra DB ngoài phạm vi E2E)
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

Scenario('TC-REG-24 - [ST-02] Kiểm tra status sau đăng ký Enterprise', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'checkstatus@company.com');
  I.fillField('Mật khẩu', 'SecurePass123!');
  I.fillField('Xác nhận mật khẩu', 'SecurePass123!');
  I.click({css: '#register_role'});
  I.click('Doanh nghiệp');
  I.click('Đăng ký');
  // ST-02 → CHƯA ĐĂNG KÝ → ACTIVE (kiểm tra DB ngoài phạm vi E2E)
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});

// === 5.8 Decision Table - Bổ sung ===

Scenario('TC-REG-25 - [R1] Happy path Enterprise với domain .com.vn', ({ I }) => {
  I.amOnPage('/register');
  I.fillField('Email', 'newent@company.com.vn');
  I.fillField('Mật khẩu', 'StrongPass1!');
  I.fillField('Xác nhận mật khẩu', 'StrongPass1!');
  I.click({css: '#register_role'});
  I.click('Doanh nghiệp');
  I.click('Đăng ký');
  // V-EM2, V-PW1, V-CP1, V-RL2, R1 → Enterprise chấp nhận mọi domain hợp lệ
  I.waitForText('Đăng ký thành công!', 5);
  I.see('Đăng ký thành công! Vui lòng chờ xác thực.');
});
