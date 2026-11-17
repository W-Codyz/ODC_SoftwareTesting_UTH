const assert = require('assert');

const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

Feature('FR-MEN-003 - Phân quyền đánh giá Talent');

function requiredCredential(name) {
  const value = process.env[name];
  assert.ok(value, `Hãy đặt biến môi trường ${name} bằng tài khoản test; không hard-code mật khẩu.`);
  return value;
}

async function apiRequest(I, method, path, body, token) {
  return I.executeScript(
    async (url, requestMethod, requestBody, accessToken) => {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
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
    token
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

async function loginForToken(I, emailVariable, passwordVariable) {
  const email = requiredCredential(emailVariable);
  const password = requiredCredential(passwordVariable);
  I.amOnPage('/login');
  const result = responseData(
    await apiRequest(I, 'POST', '/auth/login', { email, password }),
    200,
    `Tài khoản test ${emailVariable} phải đăng nhập được`
  );
  assert.ok(result && result.token, 'Login thành công phải trả access token');
  return result.token;
}

const criterion = { score: 8, comment: 'Codecept FR-MEN-003 authorization' };
const evaluation = {
  talentId: 1,
  evaluationPeriod: '2099-12',
  overallScore: 7.5,
  technicalSkills: criterion,
  problemSolving: criterion,
  teamwork: criterion,
  communication: criterion,
  codeQuality: criterion,
  punctuality: criterion,
  strengths: ['Codecept FR-MEN-003 authorization'],
  weaknesses: [],
  recommendations: [],
  tasksCompleted: 4,
  tasksTotal: 5,
  hoursWorked: 20,
};

Scenario('TC-MEN003-14 - Request không token bị từ chối', async ({ I }) => {
  I.amOnPage('/login');
  const response = await apiRequest(
    I,
    'POST',
    '/mentor/projects/1/evaluations',
    evaluation,
    null
  );

  responseData(response, 401, 'API đánh giá phải yêu cầu xác thực');
});

Scenario('TC-MEN003-15 - Talent không được gọi API đánh giá của Mentor', async ({ I }) => {
  const token = await loginForToken(I, 'TALENT_EMAIL', 'TALENT_PASSWORD');
  const response = await apiRequest(
    I,
    'POST',
    '/mentor/projects/1/evaluations',
    evaluation,
    token
  );

  responseData(response, 403, 'Chỉ role MENTOR mới được gửi đánh giá');
});
