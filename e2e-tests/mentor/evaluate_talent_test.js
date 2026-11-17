const assert = require('assert');

const mentorEmail = process.env.MENTOR_EMAIL;
const mentorPassword = process.env.MENTOR_PASSWORD;
const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const testMarker = 'CodeceptJS FR-MEN-003';

Feature('FR-MEN-003 - Đánh giá sinh viên');

function requiredCredential(value, name) {
  assert.ok(value, `Hãy đặt biến môi trường ${name} bằng tài khoản test; không hard-code mật khẩu.`);
  return value;
}

async function signIn(I, email, password) {
  requiredCredential(email, 'MENTOR_EMAIL hoặc TALENT_EMAIL');
  requiredCredential(password, 'MENTOR_PASSWORD hoặc TALENT_PASSWORD');
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', email);
  I.fillField('Mật khẩu', password);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
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

      if (requestBody !== undefined && requestBody !== null) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(requestBody);
      }

      const response = await fetch(url, options);
      return {
        status: response.status,
        body: await response.text(),
      };
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
    `${description}; received HTTP ${response.status}: ${response.body}`
  );
  return response.body ? JSON.parse(response.body).data : undefined;
}

async function getMentorContext(I) {
  const projects = responseData(
    await apiRequest(I, 'GET', '/mentor/projects'),
    200,
    'Mentor phải tải được danh sách dự án'
  );

  for (const project of projects) {
    const talents = responseData(
      await apiRequest(I, 'GET', `/mentor/projects/${project.id}/talents`),
      200,
      `Không tải được Talent của dự án ${project.id}`
    );

    if (talents.length === 0) continue;

    const evaluations = responseData(
      await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
      200,
      `Không tải được đánh giá của dự án ${project.id}`
    );

    return { project, talent: talents[0], evaluations };
  }

  throw new Error('Mentor không có dự án nào chứa Talent để kiểm thử.');
}

function getTestPeriod(evaluations, talentId) {
  const sameTalent = evaluations.filter(
    (evaluation) => String(evaluation.talentId) === String(talentId)
  );
  const previousTest = sameTalent.find((evaluation) =>
    (evaluation.strengths || []).includes(testMarker)
  );

  if (previousTest) return previousTest.evaluationPeriod;

  const usedPeriods = new Set(sameTalent.map((evaluation) => evaluation.evaluationPeriod));
  for (let year = 2090; year <= 2099; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const period = `${year}-${String(month).padStart(2, '0')}`;
      if (!usedPeriods.has(period)) return period;
    }
  }

  throw new Error('Không còn kỳ đánh giá dành riêng cho dữ liệu Codecept trong dự án.');
}

function buildEvaluation(talentId, evaluationPeriod, overallScore) {
  const criterion = { score: 8, comment: 'Codecept FR-MEN-003 E2E' };
  return {
    talentId,
    evaluationPeriod,
    overallScore,
    technicalSkills: criterion,
    problemSolving: criterion,
    teamwork: criterion,
    communication: criterion,
    codeQuality: criterion,
    punctuality: criterion,
    strengths: [testMarker],
    weaknesses: [],
    recommendations: [],
    tasksCompleted: 4,
    tasksTotal: 5,
    hoursWorked: 20,
  };
}

Scenario('TC-MEN003-01 - Mentor xem trang đánh giá và danh sách sinh viên', async ({ I }) => {
  await signIn(I, mentorEmail, mentorPassword);
  I.amOnPage('/mentor/evaluation');
  I.waitForText('Đánh giá sinh viên', 10);
  I.see('Bộ lọc');
  I.see('Danh sách sinh viên');
  I.see('Kỳ đánh giá');
  I.see('Vui lòng chọn dự án để xem danh sách.');
});

Scenario('TC-MEN003-02 - Lưu đánh giá và đọc lại theo dự án', async ({ I }) => {
  await signIn(I, mentorEmail, mentorPassword);
  const { project, talent, evaluations } = await getMentorContext(I);
  const period = getTestPeriod(evaluations, talent.talentId);
  const request = buildEvaluation(talent.talentId, period, 7.5);

  const created = responseData(
    await apiRequest(
      I,
      'POST',
      `/mentor/projects/${project.id}/evaluations`,
      request
    ),
    200,
    'Mentor phụ trách dự án phải lưu được đánh giá hợp lệ'
  );

  assert.strictEqual(String(created.talentId), String(talent.talentId));
  assert.strictEqual(created.evaluationPeriod, period);
  assert.strictEqual(created.overallScore, 7.5);

  const savedEvaluations = responseData(
    await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
    200,
    'Danh sách đánh giá phải tải lại được sau khi lưu'
  );
  const saved = savedEvaluations.find(
    (evaluation) =>
      String(evaluation.talentId) === String(talent.talentId) &&
      evaluation.evaluationPeriod === period
  );

  assert.ok(saved, 'Đánh giá vừa lưu phải xuất hiện trong danh sách');
  assert.strictEqual(saved.overallScore, 7.5);
  assert.strictEqual(saved.grade, 'C');
  assert.ok(saved.strengths.includes(testMarker));
});

Scenario('TC-MEN003-06 - Từ chối điểm tổng thể nhỏ hơn 0', async ({ I }) => {
  await signIn(I, mentorEmail, mentorPassword);
  const { project, talent, evaluations } = await getMentorContext(I);
  const request = buildEvaluation(
    talent.talentId,
    getTestPeriod(evaluations, talent.talentId),
    -0.1
  );

  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  responseData(response, 400, 'Điểm âm phải bị từ chối');
});

Scenario('TC-MEN003-07 - Từ chối điểm tổng thể lớn hơn 10', async ({ I }) => {
  await signIn(I, mentorEmail, mentorPassword);
  const { project, talent, evaluations } = await getMentorContext(I);
  const request = buildEvaluation(
    talent.talentId,
    getTestPeriod(evaluations, talent.talentId),
    10.1
  );

  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  responseData(response, 400, 'Điểm lớn hơn 10 phải bị từ chối');
});

