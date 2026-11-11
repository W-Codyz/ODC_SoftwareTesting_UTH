const assert = require('assert');

const talentEmail = process.env.TALENT_EMAIL || 'hoangvane@student.uth.edu.vn';
const talentPassword = process.env.TALENT_PASSWORD || '123123';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';

Feature('FR-TAL-001 - Quản lý Hồ sơ Cá nhân');

function loginAsTalent(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', talentEmail);
  I.fillField('Mật khẩu', talentPassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
  I.amOnPage('/talent/profile');
  I.waitForText('Hồ sơ của tôi', 10);
}

async function apiRequest(I, method, path, body, file) {
  return I.executeScript(
    async (url, requestMethod, requestBody, requestFile) => {
      const token = window.localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let payload = requestBody;

      if (requestFile) {
        const fileBytes = new Uint8Array(requestFile.size);
        payload = new FormData();
        payload.append(
          'file',
          new File([fileBytes], requestFile.name, { type: requestFile.type })
        );
      } else if (requestBody !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(requestBody);
      }

      const response = await fetch(url, {
        method: requestMethod,
        headers,
        body: payload,
      });

      return {
        status: response.status,
        body: await response.text(),
      };
    },
    `${apiBaseUrl}${path}`,
    method,
    body,
    file
  );
}

function expectStatus(response, expectedStatus, description) {
  assert.strictEqual(response.status, expectedStatus, description);
}

function getProfile(response) {
  return JSON.parse(response.body).data;
}

Scenario('TC-TAL-01 - Lấy thông tin hồ sơ cá nhân', async ({ I }) => {
  loginAsTalent(I);
  const response = await apiRequest(I, 'GET', '/talent/profile');

  expectStatus(response, 200, 'Lấy profile phải trả về 200');
  assert.match(response.body, /fullName/);
  assert.match(response.body, /skills/);
});

Scenario('TC-TAL-02 - Cập nhật thông tin hồ sơ hợp lệ (Nominal)', async ({ I }) => {
  loginAsTalent(I);
  const response = await apiRequest(I, 'PUT', '/talent/profile', {
    phone: '0901234568',
    portfolioUrl: 'https://github.com/hoangvane',
  });

  expectStatus(response, 200, 'Cập nhật profile hợp lệ phải trả về 200');
});

Scenario('TC-TAL-03 - Cập nhật thông tin hồ sơ hợp lệ tại biên Min', async ({ I }) => {
  loginAsTalent(I);
  const response = await apiRequest(I, 'PUT', '/talent/profile', {
    phone: '0901234567',
    portfolioUrl: 'https://github.com/h',
  });

  expectStatus(response, 200, 'Giá trị biên min phải được chấp nhận');
});

Scenario('TC-TAL-04 - Cập nhật thông tin hồ sơ hợp lệ tại biên Max', async ({ I }) => {
  loginAsTalent(I);
  const response = await apiRequest(I, 'PUT', '/talent/profile', {
    phone: '0987654321',
    portfolioUrl: `https://example.com/${'a'.repeat(80)}`,
  });

  expectStatus(response, 200, 'Giá trị biên max phải được chấp nhận');
});

Scenario('TC-TAL-16 - File CV vượt quá 20MB', async ({ I }) => {
  loginAsTalent(I);
  const response = await apiRequest(I, 'POST', '/talent/profile/cv', undefined, {
    name: 'heavy-cv.pdf',
    type: 'application/pdf',
    size: 20 * 1024 * 1024 + 1,
  });

  assert.ok(
    [400, 500].includes(response.status),
    `CV trên 20MB phải bị từ chối (400/500), thực tế nhận ${response.status}: ${response.body}`
  );
});
