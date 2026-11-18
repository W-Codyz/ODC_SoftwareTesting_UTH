const assert = require('assert');

const mentorEmail = process.env.MENTOR_EMAIL || 'mentor.nguyenquang@uth.edu.vn';
const mentorPassword = process.env.MENTOR_PASSWORD || '123123';
const otherMentorEmail = process.env.OTHER_MENTOR_EMAIL || 'mentor.lehong@uth.edu.vn';
const otherMentorPassword = process.env.OTHER_MENTOR_PASSWORD || '123123';
const talentEmail = process.env.TALENT_EMAIL || 'hoangvane@student.uth.edu.vn';
const talentPassword = process.env.TALENT_PASSWORD || '123123';
const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const testMarker = 'CodeceptJS FR-MEN-003';

const CRITERIA_KEYS = [
  { key: 'technicalSkills', label: 'Kỹ năng kỹ thuật' },
  { key: 'problemSolving', label: 'Giải quyết vấn đề' },
  { key: 'teamwork', label: 'Làm việc nhóm' },
  { key: 'communication', label: 'Giao tiếp' },
  { key: 'codeQuality', label: 'Chất lượng code' },
  { key: 'punctuality', label: 'Đúng hạn / Kỷ luật' },
];

Feature('FR-MEN-003 - Đánh giá Người tài năng');

function signInViaUI(I, email, password) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', email);
  I.fillField('Mật khẩu', password);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

function openEvaluationPage(I) {
  I.amOnPage('/mentor/evaluation');
  I.waitForText('Đánh giá sinh viên', 10);
}

async function apiRequest(I, method, apiPath, body, tokenOverride) {
  return I.executeScript(
    async ({ url, requestMethod, requestBody, overrideToken }) => {
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
    {
      url: `${apiBaseUrl}${apiPath}`,
      requestMethod: method,
      requestBody: body,
      overrideToken: tokenOverride,
    }
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

async function loginForToken(I, email, password, label) {
  I.amOnPage('/login');
  const result = responseData(
    await apiRequest(I, 'POST', '/auth/login', { email, password }, null),
    200,
    `Tài khoản ${label} phải đăng nhập được`
  );
  assert.ok(result && result.token, 'Login thành công phải trả về access token');
  return result.token;
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
      `Không tải được danh sách Talent của dự án ${project.id}`
    );

    if (!Array.isArray(talents) || talents.length === 0) continue;

    const evaluations = responseData(
      await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
      200,
      `Không tải được danh sách đánh giá của dự án ${project.id}`
    );

    return { project, talent: talents[0], evaluations };
  }

  throw new Error('Mentor không có dự án nào chứa Talent để kiểm thử.');
}

function buildEvaluation(talentId, evaluationPeriod, overallScore, criterionOverrides = {}) {
  const defaultScore =
    typeof overallScore === 'number' && overallScore >= 0 && overallScore <= 10
      ? overallScore
      : 8.0;
  const baseCriterion = { score: defaultScore, comment: 'Codecept FR-MEN-003 E2E' };

  return {
    talentId,
    evaluationPeriod,
    overallScore,
    technicalSkills: criterionOverrides.technicalSkills || baseCriterion,
    problemSolving: criterionOverrides.problemSolving || baseCriterion,
    teamwork: criterionOverrides.teamwork || baseCriterion,
    communication: criterionOverrides.communication || baseCriterion,
    codeQuality: criterionOverrides.codeQuality || baseCriterion,
    punctuality: criterionOverrides.punctuality || baseCriterion,
    strengths: [testMarker],
    weaknesses: ['Cần bổ sung thêm unit test'],
    recommendations: ['Tiếp tục phát huy tinh thần chủ động'],
    tasksCompleted: 4,
    tasksTotal: 5,
    hoursWorked: 20,
  };
}

async function selectProjectOnEvaluationUI(I, projectTitle) {
  await I.usePlaywrightTo('chọn dự án trên bộ lọc trang Đánh giá sinh viên', async ({ page }) => {
    const projectSelect = page.locator('.ant-card').filter({ hasText: 'Bộ lọc' }).locator('.ant-select').first();
    await projectSelect.click();
    await page
      .locator('.ant-select-dropdown:visible .ant-select-item-option')
      .filter({ hasText: projectTitle })
      .first()
      .click();
  });
}

async function openEvaluationModalAndSubmitViaUI(I, project, talent, scoreValue) {
  openEvaluationPage(I);
  await selectProjectOnEvaluationUI(I, project.title);
  I.waitForText(talent.fullName, 10);

  return I.usePlaywrightTo('mở modal đánh giá sinh viên, điền điểm và lưu qua UI', async ({ page }) => {
    const row = page.locator('.ant-table-tbody tr').filter({ hasText: talent.fullName }).first();
    await row.getByRole('button', { name: /Đánh giá/ }).click();

    const modal = page.locator('.ant-modal-content:visible').first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    for (const c of CRITERIA_KEYS) {
      const scoreInput = modal.locator(`#${c.key}_score`);
      await scoreInput.click();
      await scoreInput.fill(String(scoreValue));
      const commentInput = modal.locator(`#${c.key}_comment`);
      await commentInput.fill(`${c.label}: ${testMarker}`);
    }

    const tasksCompletedInput = modal.locator('#tasksCompleted');
    if (await tasksCompletedInput.count()) {
      await tasksCompletedInput.fill('4');
    }
    const tasksTotalInput = modal.locator('#tasksTotal');
    if (await tasksTotalInput.count()) {
      await tasksTotalInput.fill('5');
    }
    const hoursWorkedInput = modal.locator('#hoursWorked');
    if (await hoursWorkedInput.count()) {
      await hoursWorkedInput.fill('20');
    }

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/mentor/projects/${project.id}/evaluations`) &&
        res.request().method() === 'POST',
      { timeout: 15000 }
    );

    await modal.locator('.ant-modal-footer button.ant-btn-primary').click();
    const response = await responsePromise;
    return {
      status: response.status(),
      body: await response.text(),
    };
  });
}

// =========================================================================
// 1. GIAO DIỆN & LUỒNG ĐÁNH GIÁ HỢP LỆ (NOMINAL & BVA)
// =========================================================================

Scenario('TC-MEN003-01 - Đánh giá điểm nominal (7.5) trên giao diện và lưu/đọc lại API', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  openEvaluationPage(I);

  I.see('Bộ lọc');
  I.see('Danh sách sinh viên');
  I.see('Kỳ đánh giá');
  I.see('Vui lòng chọn dự án để xem danh sách.');

  const { project, talent } = await getMentorContext(I);
  const uiRes = await openEvaluationModalAndSubmitViaUI(I, project, talent, 7.5);
  const created = responseData(uiRes, 200, 'TC-MEN003-01: Lưu đánh giá nominal 7.5 qua UI phải trả về 200');

  I.waitForText('Đã lưu đánh giá.', 10);
  I.waitForText('Đã đánh giá', 10);
  assert.strictEqual(String(created.talentId), String(talent.talentId));
  assert.strictEqual(created.overallScore, 7.5);
  assert.strictEqual(created.grade, 'C');

  const savedEvaluations = responseData(
    await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
    200,
    'Danh sách đánh giá phải đọc lại được sau khi lưu'
  );
  const saved = savedEvaluations.find(
    (item) =>
      String(item.talentId) === String(talent.talentId) &&
      item.evaluationPeriod === created.evaluationPeriod
  );
  assert.ok(saved, 'Đánh giá vừa lưu phải tồn tại khi đọc lại qua GET API');
  assert.strictEqual(saved.overallScore, 7.5);
  assert.strictEqual(saved.grade, 'C');
  I.saveScreenshot('TC-MEN003-01_Danh_gia_nominal_7_5.png');
});

Scenario('TC-MEN003-02 - Đánh giá tại điểm biên min (0.0) và kỳ đầu năm (2026-01)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);
  await selectProjectOnEvaluationUI(I, project.title);
  I.waitForText(talent.fullName, 10);

  const period = '2026-01';
  const request = buildEvaluation(talent.talentId, period, 0.0);
  const created = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, request),
    200,
    'TC-MEN003-02: Điểm sàn 0.0 tại kỳ 2026-01 phải được chấp nhận (200)'
  );

  assert.strictEqual(created.overallScore, 0.0);
  assert.strictEqual(created.grade, 'F');
  assert.strictEqual(created.evaluationPeriod, period);

  const list = responseData(
    await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
    200,
    'Phải đọc lại được danh sách đánh giá'
  );
  const found = list.find(
    (e) => String(e.talentId) === String(talent.talentId) && e.evaluationPeriod === period
  );
  assert.ok(found, 'Đánh giá biên min 0.0 phải đọc lại được');
  assert.strictEqual(found.overallScore, 0.0);
  I.saveScreenshot('TC-MEN003-02_Danh_gia_bien_min_0_0.png');
});

Scenario('TC-MEN003-03 - Đánh giá tại điểm biên max (10.0) và kỳ cuối năm (2026-12)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);
  await selectProjectOnEvaluationUI(I, project.title);
  I.waitForText(talent.fullName, 10);

  const period = '2026-12';
  const request = buildEvaluation(talent.talentId, period, 10.0);
  const created = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, request),
    200,
    'TC-MEN003-03: Điểm trần 10.0 tại kỳ 2026-12 phải được chấp nhận (200)'
  );

  assert.strictEqual(created.overallScore, 10.0);
  assert.strictEqual(created.grade, 'A');
  assert.strictEqual(created.evaluationPeriod, period);
  I.saveScreenshot('TC-MEN003-03_Danh_gia_bien_max_10_0.png');
});

Scenario('TC-MEN003-04 - Đánh giá tại điểm cận biên min+ (0.1)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const period = '2026-02';
  const request = buildEvaluation(talent.talentId, period, 0.1);
  const created = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, request),
    200,
    'TC-MEN003-04: Điểm cận min 0.1 phải được chấp nhận (200)'
  );

  assert.strictEqual(created.overallScore, 0.1);
  assert.strictEqual(created.grade, 'F');
  I.saveScreenshot('TC-MEN003-04_Danh_gia_can_min_0_1.png');
});

Scenario('TC-MEN003-05 - Đánh giá tại điểm cận biên max- (9.9)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const period = '2026-03';
  const request = buildEvaluation(talent.talentId, period, 9.9);
  const created = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, request),
    200,
    'TC-MEN003-05: Điểm cận max 9.9 phải được chấp nhận (200)'
  );

  assert.strictEqual(created.overallScore, 9.9);
  assert.strictEqual(created.grade, 'A');
  I.saveScreenshot('TC-MEN003-05_Danh_gia_can_max_9_9.png');
});

// =========================================================================
// 2. KIỂM TRA GIỚI HẠN ĐIỂM & VALIDATION DỮ LIỆU (SINGLE FAULT)
// =========================================================================

Scenario('TC-MEN003-06 - Từ chối điểm tổng thể âm (-0.1) (single fault)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const request = buildEvaluation(talent.talentId, '2026-04', -0.1);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  I.saveScreenshot('TC-MEN003-06_OverallScore_am.png');
  responseData(response, 400, 'TC-MEN003-06: Điểm overallScore âm (-0.1) phải bị từ chối với HTTP 400');
});

Scenario('TC-MEN003-07 - Từ chối điểm tổng thể vượt trần (10.1) (single fault)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const request = buildEvaluation(talent.talentId, '2026-05', 10.1);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  I.saveScreenshot('TC-MEN003-07_OverallScore_vuot_10.png');
  responseData(response, 400, 'TC-MEN003-07: Điểm overallScore > 10 (10.1) phải bị từ chối với HTTP 400');
});

Scenario('TC-MEN003-08 - Từ chối điểm tổng thể sai kiểu dữ liệu (chuỗi ký tự)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const request = buildEvaluation(talent.talentId, '2026-06', 'tam_diem');
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  I.saveScreenshot('TC-MEN003-08_OverallScore_kieu_chu.png');
  assert.ok(
    response.status >= 400 && response.status < 500,
    `TC-MEN003-08: overallScore kiểu chuỗi phải bị từ chối (4xx), thực tế HTTP ${response.status}: ${response.body}`
  );
});

Scenario('TC-MEN003-09 - Kiểm tra giới hạn điểm tiêu chí thành phần trên UI (codeQuality âm -1.0)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);
  await selectProjectOnEvaluationUI(I, project.title);
  I.waitForText(talent.fullName, 10);

  const clampedValue = await I.usePlaywrightTo(
    'nhập điểm tiêu chí codeQuality = -1.0 trên modal UI và kiểm tra InputNumber min=0 chặn điểm âm',
    async ({ page }) => {
      const row = page.locator('.ant-table-tbody tr').filter({ hasText: talent.fullName }).first();
      await row.getByRole('button', { name: /Đánh giá/ }).click();

      const modal = page.locator('.ant-modal-content:visible').first();
      await modal.waitFor({ state: 'visible', timeout: 10000 });

      const codeQualityInput = modal.locator('#codeQuality_score');
      await codeQualityInput.click();
      await codeQualityInput.fill('-1');
      await codeQualityInput.press('Tab');
      await page.waitForTimeout(300);

      return codeQualityInput.inputValue();
    }
  );

  assert.notStrictEqual(
    Number(clampedValue),
    -1,
    `UI InputNumber (min=0, max=10) phải chặn hoặc chuẩn hóa giá trị âm -1.0 (giá trị sau blur: ${clampedValue})`
  );
  assert.ok(
    Number(clampedValue) >= 0 && Number(clampedValue) <= 10,
    `Điểm tiêu chí trên UI phải nằm trong [0, 10], thực tế: ${clampedValue}`
  );
  I.saveScreenshot('TC-MEN003-09_Criteria_codeQuality_am.png');
});

// =========================================================================
// 3. RÀNG BUỘC NGHIỆP VỤ SINH VIÊN & KỲ ĐÁNH GIÁ
// =========================================================================

Scenario('TC-MEN003-10 - Từ chối đánh giá khi Talent không tồn tại (99999)', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project } = await getMentorContext(I);
  openEvaluationPage(I);

  const request = buildEvaluation(99999, '2026-07', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  responseData(response, 404, 'TC-MEN003-10: Talent không tồn tại phải trả về 404 Not Found');
  assert.match(response.body, /Talent not found/i);
  I.saveScreenshot('TC-MEN003-10_Talent_khong_ton_tai.png');
});

Scenario('TC-MEN003-11 - Từ chối đánh giá khi Talent thuộc dự án khác', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project } = await getMentorContext(I);
  openEvaluationPage(I);

  // Talent ID = 4 (Pham Thi D) thuộc dự án khác, không nằm trong project 1
  const request = buildEvaluation(4, '2026-07', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request
  );

  responseData(response, 404, 'TC-MEN003-11: Talent không thuộc dự án đang chấm phải trả về 404 Not Found');
  assert.match(response.body, /Talent not found/i);
  I.saveScreenshot('TC-MEN003-11_Talent_thuoc_du_an_khac.png');
});

Scenario('TC-MEN003-12 - Cập nhật lại đánh giá cùng kỳ (SUBMITTED -> SUBMITTED) và đọc lại điểm mới', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);

  const period = '2026-08';
  const firstReq = buildEvaluation(talent.talentId, period, 7.5);
  const firstCreated = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, firstReq),
    200,
    'Lần nộp đầu tiên cho kỳ 2026-08 phải thành công (200)'
  );
  assert.strictEqual(firstCreated.overallScore, 7.5);

  const secondReq = buildEvaluation(talent.talentId, period, 8.5);
  const updated = responseData(
    await apiRequest(I, 'POST', `/mentor/projects/${project.id}/evaluations`, secondReq),
    200,
    'TC-MEN003-12: Gửi lại đánh giá cùng kỳ phải cập nhật thành công (200)'
  );
  assert.strictEqual(updated.id, firstCreated.id, 'Cập nhật cùng kỳ phải ghi đè lên bản ghi cũ (cùng id)');
  assert.strictEqual(updated.overallScore, 8.5);
  assert.strictEqual(updated.grade, 'B');

  const evaluations = responseData(
    await apiRequest(I, 'GET', `/mentor/projects/${project.id}/evaluations`),
    200,
    'Phải đọc lại được danh sách đánh giá sau khi cập nhật cùng kỳ'
  );
  const matching = evaluations.filter(
    (e) => String(e.talentId) === String(talent.talentId) && e.evaluationPeriod === period
  );
  assert.strictEqual(matching.length, 1, 'Không được tạo bản ghi trùng lặp cho cùng (projectId, talentId, period)');
  assert.strictEqual(matching[0].overallScore, 8.5);
  I.saveScreenshot('TC-MEN003-12_Cap_nhat_cung_ky.png');
});

Scenario('TC-MEN003-13 - Kiểm tra ràng buộc kỳ đánh giá trên UI và khi để trống kỳ đánh giá', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);
  openEvaluationPage(I);
  await selectProjectOnEvaluationUI(I, project.title);
  I.waitForText(talent.fullName, 10);

  // DatePicker month trên UI chỉ cho phép định dạng YYYY-MM; kiểm tra backend trả 400 khi kỳ đánh giá rỗng/không hợp lệ
  const invalidReq = buildEvaluation(talent.talentId, '', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    invalidReq
  );

  responseData(response, 400, 'TC-MEN003-13: Kỳ đánh giá không hợp lệ / rỗng phải trả về 400 Bad Request');
  I.saveScreenshot('TC-MEN003-13_Sai_format_ky_danh_gia.png');
});

// =========================================================================
// 4. PHÂN QUYỀN TRUY CẬP (AUTHENTICATION & AUTHORIZATION)
// =========================================================================

Scenario('TC-MEN003-14 - Chặn truy cập khi chưa đăng nhập (UI redirect về /login và API trả 401)', async ({ I }) => {
  I.amOnPage('/mentor/evaluation');
  I.waitInUrl('/login', 10);
  I.see('Đăng nhập');

  const request = buildEvaluation(1, '2026-09', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    '/mentor/projects/1/evaluations',
    request,
    null
  );

  responseData(response, 401, 'TC-MEN003-14: Gọi API đánh giá không có token phải trả về 401 Unauthorized');
  I.saveScreenshot('TC-MEN003-14_Chua_dang_nhap_401.png');
});

Scenario('TC-MEN003-15 - User có role TALENT không được truy cập trang hoặc gọi API đánh giá (403)', async ({ I }) => {
  const talentToken = await loginForToken(I, talentEmail, talentPassword, 'TALENT');

  const request = buildEvaluation(1, '2026-09', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    '/mentor/projects/1/evaluations',
    request,
    talentToken
  );

  responseData(response, 403, 'TC-MEN003-15: Role TALENT gọi API đánh giá phải bị chặn với 403 Forbidden');
  I.saveScreenshot('TC-MEN003-15_Talent_tu_cham_diem_403.png');
});

Scenario('TC-MEN003-16 - Mentor khác không phụ trách dự án không được quyền đánh giá dự án này', async ({ I }) => {
  signInViaUI(I, mentorEmail, mentorPassword);
  const { project, talent } = await getMentorContext(I);

  // Đăng nhập bằng tài khoản Mentor khác (mentor.lehong@uth.edu.vn) không phụ trách project của mentor.nguyenquang
  const otherMentorToken = await loginForToken(I, otherMentorEmail, otherMentorPassword, 'OTHER_MENTOR');
  const request = buildEvaluation(talent.talentId, '2026-09', 8.5);
  const response = await apiRequest(
    I,
    'POST',
    `/mentor/projects/${project.id}/evaluations`,
    request,
    otherMentorToken
  );

  assert.ok(
    [403, 404].includes(response.status),
    `TC-MEN003-16: Mentor không phụ trách dự án phải bị từ chối (403/404), thực tế HTTP ${response.status}: ${response.body}`
  );
  I.saveScreenshot('TC-MEN003-16_Mentor_du_an_khac.png');
});
