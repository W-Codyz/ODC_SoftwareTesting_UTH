const assert = require('assert');

const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const profilePath = '/enterprise/profile';

Feature('FR-ENT-001 - Quản lý hồ sơ doanh nghiệp');

function requiredCredential(name) {
  const value = process.env[name];
  assert.ok(value, `Hãy đặt biến môi trường ${name} bằng tài khoản test; không hard-code mật khẩu.`);
  return value;
}

async function signInAsEnterprise(I) {
  const email = requiredCredential('ENTERPRISE_EMAIL');
  const password = requiredCredential('ENTERPRISE_PASSWORD');
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', email);
  I.fillField('Mật khẩu', password);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
  I.amOnPage('/enterprise/dashboard');
}

async function loginAsRole(I, emailVariable, passwordVariable) {
  const email = requiredCredential(emailVariable);
  const password = requiredCredential(passwordVariable);
  I.amOnPage('/login');
  const response = await apiRequest(
    I,
    'POST',
    '/auth/login',
    { email, password },
    null
  );
  const result = responseData(response, 200, `Tài khoản ${emailVariable} phải đăng nhập được`);
  assert.ok(result && result.token, 'Login thành công phải trả access token');
  return result.token;
}

async function apiRequest(I, method, path, body, tokenOverride) {
  return I.executeScript(
    async (url, requestMethod, requestBody, overrideToken) => {
      const token =
        overrideToken === null
          ? null
          : overrideToken || window.localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const options = { method: requestMethod, headers };
      if (requestBody !== undefined) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(requestBody);
      }
      const response = await fetch(url, options);
      return { status: response.status, body: await response.text() };
    },
    `${apiBaseUrl}${path}`,
    method,
    body,
    tokenOverride
  );
}

function responseData(response, expectedStatus, description) {
  assert.strictEqual(
    response.status,
    expectedStatus,
    `${description}; HTTP ${response.status}: ${response.body}`
  );
  return response.body ? JSON.parse(response.body).data : undefined;
}

function assertProfileContract(profile) {
  assert.ok(profile && typeof profile === 'object', 'Response phải có object data của hồ sơ');
  for (const field of [
    'id',
    'companyName',
    'taxCode',
    'address',
    'representative',
    'phone',
    'email',
    'industry',
    'logoUrl',
    'verified',
    'status',
    'createdAt',
  ]) {
    assert.ok(Object.prototype.hasOwnProperty.call(profile, field), `Hồ sơ thiếu field ${field}`);
  }
}

Scenario('TC-ENT001-01 - Enterprise đăng nhập và xem hồ sơ của mình', async ({ I }) => {
  await signInAsEnterprise(I);
  const response = await apiRequest(I, 'GET', profilePath);
  const profile = responseData(response, 200, 'Enterprise phải xem được hồ sơ của chính mình');

  assertProfileContract(profile);
});

Scenario('TC-ENT001-02 - Không có token thì không đọc được hồ sơ', async ({ I }) => {
  I.amOnPage('/login');
  const response = await apiRequest(I, 'GET', profilePath, undefined, null);

  responseData(response, 401, 'API hồ sơ doanh nghiệp phải yêu cầu xác thực');
});

Scenario('TC-ENT001-03 - Role Talent không được đọc hồ sơ Enterprise', async ({ I }) => {
  const token = await loginAsRole(I, 'TALENT_EMAIL', 'TALENT_PASSWORD');
  const response = await apiRequest(I, 'GET', profilePath, undefined, token);

  responseData(response, 403, 'Chỉ role ENTERPRISE mới được đọc hồ sơ doanh nghiệp');
});

Scenario('TC-ENT001-04 - Cập nhật, đọc lại và khôi phục tên công ty test', async ({ I }) => {
  await signInAsEnterprise(I);

  const before = responseData(
    await apiRequest(I, 'GET', profilePath),
    200,
    'Phải tải được hồ sơ trước khi cập nhật'
  );
  assertProfileContract(before);
  assert.ok(
    typeof before.companyName === 'string' && before.companyName.length > 0,
    'Hồ sơ phải có tên công ty gốc để khôi phục sau test'
  );

  const originalName = before.companyName;
  const marker = ` E2E-${Date.now()}`;
  const testName = `${originalName.slice(0, Math.max(0, 255 - marker.length))}${marker}`;
  let updateSucceeded = false;

  try {
    const updateResponse = await apiRequest(I, 'PUT', profilePath, { companyName: testName });
    if (updateResponse.status === 200) updateSucceeded = true;
    responseData(updateResponse, 200, 'PUT hồ sơ với dữ liệu hợp lệ phải thành công');

    const after = responseData(
      await apiRequest(I, 'GET', profilePath),
      200,
      'Hồ sơ phải tải lại được sau PUT'
    );
    assert.strictEqual(after.companyName, testName, 'Tên công ty mới phải được lưu bền vững');
  } finally {
    if (updateSucceeded) {
      responseData(
        await apiRequest(I, 'PUT', profilePath, { companyName: originalName }),
        200,
        'Cleanup phải khôi phục tên công ty ban đầu'
      );
      const restored = responseData(
        await apiRequest(I, 'GET', profilePath),
        200,
        'Phải đọc lại được hồ sơ sau cleanup'
      );
      assert.strictEqual(restored.companyName, originalName, 'Cleanup phải khôi phục dữ liệu gốc');
    }
  }
});
