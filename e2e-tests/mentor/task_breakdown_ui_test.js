const assert = require('assert');
const path = require('path');

Feature('FR-MEN-002 - UI Task Breakdown with API response checks');

const API = 'http://localhost:8080/api/mentor';
const FIXTURES = path.resolve(__dirname, '../mentor/fixtures');
const MENTOR_EMAIL = process.env.MANH_E2E_MENTOR_EMAIL || 'mentor.nguyenquang@uth.edu.vn';
const MENTOR_PASSWORD = process.env.MANH_E2E_MENTOR_PASSWORD || '123123';

async function login(I) {
  await I.amOnPage('/login');
  await I.fillField('Tên đăng nhập', MENTOR_EMAIL);
  await I.fillField('Mật khẩu', MENTOR_PASSWORD);
  await I.click('Đăng nhập');
  await I.waitInUrl('/mentor/dashboard', 20);
}

async function context(I) {
  await login(I);
  return I.usePlaywrightTo('read this Mentor account project options', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    assert(token, 'Login should provide an access token');
    const response = await page.request.get(`${API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(response.status(), 200, 'GET /api/mentor/projects should return 200');
    const payload = await response.json();
    assert(Array.isArray(payload.data) && payload.data.length > 0, 'Mentor must own at least one project');
    return { token, project: payload.data[0] };
  });
}

async function openTasks(I) {
  await I.amOnPage('/mentor/tasks');
  await I.waitForText('Quản lý công việc', 20);
}

async function chooseProject(page, project) {
  await page.locator('.ant-select').first().click();
  await page.getByText(project.title, { exact: true }).last().click();
}

async function openExcel(I, projectId) {
  await I.amOnPage(`/mentor/projects/${projectId}/task-template`);
  await I.waitForText('Task Breakdown với Excel', 20);
}

async function fillTaskForm(page, project, title, progress = '0') {
  const modal = page.locator('.ant-modal');
  const selects = modal.locator('.ant-select');
  if (await selects.count()) {
    await selects.nth(0).click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: project.title }).click();
  }
  await modal.getByPlaceholder('Nhập tên công việc').fill(title);
  await modal.getByPlaceholder('Mô tả chi tiết công việc').fill('Created by Mentor UI E2E');
  await selects.nth(await selects.count() > 2 ? 1 : 0).click();
  await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: 'Trung bình' }).click();
  const statusIndex = await selects.count() > 2 ? 2 : 1;
  await selects.nth(statusIndex).click();
  await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: 'Chưa bắt đầu' }).click();
  await modal.locator('input[placeholder="0-100"]').fill(progress);
}

async function createViaUi(I, project, title) {
  await openTasks(I);
  await I.click('Tạo công việc');
  await I.waitForText('Tạo công việc mới', 5);
  return I.usePlaywrightTo('create a task in the visible form and inspect its API response', async ({ page }) => {
    await fillTaskForm(page, project, title);
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/mentor/projects/${project.id}/tasks`) && response.request().method() === 'POST'
    );
    await page.locator('.ant-modal').getByRole('button', { name: 'Tạo', exact: true }).click();
    const response = await responsePromise;
    const body = await response.json();
    assert.strictEqual(response.status(), 200, `Create API returned ${response.status()}`);
    assert.strictEqual(body.data.title, title);
    return body.data;
  });
}

async function removeTaskFromUi(I, title, projectId, expectedMethod = 'DELETE') {
  await I.usePlaywrightTo('delete the temporary task through its visible task card', async ({ page }) => {
    const card = page.locator('[class*="taskCard"]').filter({ hasText: title });
    await card.getByRole('button', { name: 'Xóa' }).click();
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/mentor/projects/${projectId}/tasks/`) && response.request().method() === expectedMethod
    );
    await page.locator('.ant-popconfirm').getByRole('button', { name: 'Xóa' }).click();
    const response = await responsePromise;
    assert([200, 204].includes(response.status()), `Delete API returned ${response.status()}`);
    await card.waitFor({ state: 'detached', timeout: 10000 });
  });
}

async function uploadThroughUi(I, projectId, fileName) {
  return I.usePlaywrightTo(`upload ${fileName} from the Excel page and inspect API response`, async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, fileName));
    await page.getByRole('button', { name: 'Tải lên và nhập task' }).click();
    const response = await page.waitForResponse((item) =>
      item.url().includes(`/api/mentor/projects/${projectId}/tasks/upload`) && item.request().method() === 'POST'
    );
    let body = null;
    try { body = await response.json(); } catch (_) { /* Keep a null payload for binary/non-JSON errors. */ }
    return { status: response.status(), body };
  });
}

Scenario('TC-TSK-01 - Xem danh sách task của Mentor trên UI', async ({ I }) => {
  await context(I);
  await I.usePlaywrightTo('open the task screen and verify GET /api/mentor/tasks', async ({ page }) => {
    const responsePromise = page.waitForResponse((r) => r.url().endsWith('/api/mentor/tasks') && r.request().method() === 'GET');
    await page.goto('http://localhost:3000/mentor/tasks');
    await page.getByText('Quản lý công việc').waitFor();
    const response = await responsePromise;
    const body = await response.json();
    assert.strictEqual(response.status(), 200);
    assert(Array.isArray(body.data));
  });
});

Scenario('TC-TSK-02 - Chọn project và lọc danh sách task trên UI', async ({ I }) => {
  const { project } = await context(I);
  await openTasks(I);
  await I.usePlaywrightTo('select project and verify GET project tasks API', async ({ page }) => {
    const responsePromise = page.waitForResponse((r) =>
      r.url().includes(`/api/mentor/projects/${project.id}/tasks`) && r.request().method() === 'GET'
    );
    await chooseProject(page, project);
    const response = await responsePromise;
    const body = await response.json();
    assert.strictEqual(response.status(), 200);
    assert(Array.isArray(body.data));
    assert(body.data.every((task) => String(task.projectId) === String(project.id)));
  });
});

Scenario('TC-TSK-03 - Tạo task hợp lệ qua UI', async ({ I }) => {
  const { project } = await context(I);
  const title = `UIE2E-MEN002-CREATE-${Date.now()}`;
  await createViaUi(I, project, title);
  await I.waitForText(title, 10);
  await removeTaskFromUi(I, title, project.id);
});

Scenario('TC-TSK-04 - Cập nhật task sang completed và progress 100 qua UI', async ({ I }) => {
  const { project } = await context(I);
  const title = `UIE2E-MEN002-UPDATE-${Date.now()}`;
  await createViaUi(I, project, title);
  try {
    await I.usePlaywrightTo('edit the task and verify PUT response', async ({ page }) => {
      const card = page.locator('[class*="taskCard"]').filter({ hasText: title });
      await card.getByRole('button', { name: 'Sửa' }).click();
      const modal = page.locator('.ant-modal');
      await modal.getByPlaceholder('Nhập tên công việc').fill(`${title}-UPDATED`);
      await modal.locator('.ant-select').nth(1).click();
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: 'Hoàn thành' }).click();
      await modal.locator('input[placeholder="0-100"]').fill('100');
      const responsePromise = page.waitForResponse((r) =>
        r.url().includes(`/api/mentor/projects/${project.id}/tasks/`) && r.request().method() === 'PUT'
      );
      await modal.getByRole('button', { name: 'Cập nhật', exact: true }).click();
      const response = await responsePromise;
      const body = await response.json();
      assert.strictEqual(response.status(), 200);
      assert.strictEqual(body.data.status, 'completed');
      assert.strictEqual(body.data.progress, 100);
    });
  } finally {
    const updatedTitle = `${title}-UPDATED`;
    await I.usePlaywrightTo('reload task list if needed before cleanup', async ({ page }) => {
      if (!(await page.locator('[class*="taskCard"]').filter({ hasText: updatedTitle }).count())) await page.reload();
      await page.locator('[class*="taskCard"]').filter({ hasText: updatedTitle }).waitFor({ timeout: 10000 });
    });
    await removeTaskFromUi(I, updatedTitle, project.id);
  }
});

Scenario('TC-TSK-05 - Xóa task qua UI và kiểm tra task biến mất', async ({ I }) => {
  const { project } = await context(I);
  const title = `UIE2E-MEN002-DELETE-${Date.now()}`;
  await createViaUi(I, project, title);
  await I.waitForText(title, 10);
  await removeTaskFromUi(I, title, project.id);
  await I.dontSee(title);
});

Scenario('TC-TSK-06 - Form không gửi API khi tiêu đề để trống', async ({ I }) => {
  const { project } = await context(I);
  await openTasks(I);
  await I.click('Tạo công việc');
  await I.waitForText('Tạo công việc mới', 5);
  await I.usePlaywrightTo('submit blank title and check client validation prevents POST', async ({ page }) => {
    await fillTaskForm(page, project, '');
    let postCount = 0;
    const listener = (r) => { if (r.url().includes(`/api/mentor/projects/${project.id}/tasks`) && r.request().method() === 'POST') postCount += 1; };
    page.on('response', listener);
    await page.locator('.ant-modal').getByRole('button', { name: 'Tạo', exact: true }).click();
    await page.getByText('Vui lòng nhập tên công việc').waitFor();
    await page.waitForTimeout(400);
    page.off('response', listener);
    assert.strictEqual(postCount, 0, 'Invalid empty-title form should not send a create request');
  });
});

Scenario('TC-TSK-07 - Kiểm tra progress vượt 100 trên form UI', async ({ I }) => {
  const { project } = await context(I);
  const title = `UIE2E-MEN002-BOUNDARY-${Date.now()}`;
  await openTasks(I);
  await I.click('Tạo công việc');
  await I.waitForText('Tạo công việc mới', 5);
  const observed = await I.usePlaywrightTo('enter progress 105 and verify the outgoing create API value', async ({ page }) => {
    await fillTaskForm(page, project, title, '105');
    const responsePromise = page.waitForResponse((r) =>
      r.url().includes(`/api/mentor/projects/${project.id}/tasks`) && r.request().method() === 'POST'
    );
    await page.locator('.ant-modal').getByRole('button', { name: 'Tạo', exact: true }).click();
    const response = await responsePromise;
    const body = await response.json();
    return { status: response.status(), progress: body.data?.progress, id: body.data?.id };
  });
  if (observed.status < 400 && observed.id) {
    await I.waitForText(title, 10);
    await removeTaskFromUi(I, title, project.id);
  }
  assert(observed.status >= 400 && observed.status < 500,
    `TC expects progress=105 rejection; UI/API returned ${JSON.stringify(observed)}`);
});

Scenario('TC-TSK-08 - Tải template Excel từ trang UI', async ({ I }) => {
  const { project } = await context(I);
  await openExcel(I, project.id);
  await I.usePlaywrightTo('click template button and verify download API response', async ({ page }) => {
    const responsePromise = page.waitForResponse((r) =>
      r.url().includes(`/api/mentor/projects/${project.id}/task-template`) && r.request().method() === 'GET'
    );
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Tải file Excel mẫu' }).click();
    const response = await responsePromise;
    const download = await downloadPromise;
    const headers = response.headers();
    assert.strictEqual(response.status(), 200);
    assert(headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    assert.strictEqual(download.suggestedFilename(), 'task-template.xlsx');
  });
});

Scenario('TC-TSK-09 - Upload Excel hợp lệ qua UI và kiểm tra API', async ({ I }) => {
  const { project } = await context(I);
  await openTasks(I);
  const staleTaskExists = await I.usePlaywrightTo('check for a previous valid Excel fixture before upload', async ({ page }) =>
    (await page.locator('[class*="taskCard"]').filter({ hasText: 'Codecept Excel upload fixture' }).count()) > 0
  );
  if (staleTaskExists) {
    await removeTaskFromUi(I, 'Codecept Excel upload fixture', project.id);
  }
  await openExcel(I, project.id);
  const result = await uploadThroughUi(I, project.id, 'task_upload_valid.xlsx');
  if (result.status === 200) {
    await I.waitForText('Đã nhập thành công 1 công việc', 10);
    await openTasks(I);
    await I.waitForText('Codecept Excel upload fixture', 10);
    await removeTaskFromUi(I, 'Codecept Excel upload fixture', project.id);
  }
  assert.strictEqual(result.status, 200, `Upload failed: ${JSON.stringify(result.body)}`);
  assert.strictEqual(result.body.data, 1);
});

Scenario('TC-TSK-10 - UI từ chối file sai loại và file lớn hơn 10 MB', async ({ I }) => {
  const { project } = await context(I);
  await openExcel(I, project.id);
  await I.usePlaywrightTo('check file selection validation without making an upload request', async ({ page }) => {
    let uploads = 0;
    const listener = (r) => { if (r.url().includes(`/api/mentor/projects/${project.id}/tasks/upload`)) uploads += 1; };
    page.on('response', listener);
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, 'not_excel.txt'));
    await page.getByTestId('task-excel-error').waitFor();
    assert((await page.getByTestId('task-excel-error').innerText()).includes('.xlsx'));
    await page.locator('input[type="file"]').setInputFiles({
      name: 'too-large.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    });
    await page.getByText('Dung lượng file tối đa là 10 MB.').waitFor();
    assert.strictEqual(uploads, 0, 'UI validation should prevent invalid file uploads');
    page.off('response', listener);
  });
});

Scenario('TC-TSK-11 - Upload Task ID trùng qua UI và kiểm tra API từ chối', async ({ I }) => {
  const { project } = await context(I);
  await openExcel(I, project.id);
  const result = await uploadThroughUi(I, project.id, 'task_upload_duplicate.xlsx');
  assert(result.status >= 400 && result.status < 500,
    `Expected duplicate Task ID rejection, got ${result.status}: ${JSON.stringify(result.body)}`);
  assert(JSON.stringify(result.body).includes('Task ID'), `Unexpected error body: ${JSON.stringify(result.body)}`);
  await I.waitForText('Task ID đã tồn tại trong dự án: 1', 10);
});

Scenario('TC-TSK-12 - Upload ngày sai và progress ngoài giới hạn qua UI', async ({ I }) => {
  const { project } = await context(I);
  await openExcel(I, project.id);
  const dateResult = await uploadThroughUi(I, project.id, 'task_upload_invalid_date.xlsx');
  assert(dateResult.status >= 400 && dateResult.status < 500, `Expected invalid date 4xx: ${JSON.stringify(dateResult)}`);
  await I.waitForText('Due Date phải lớn hơn hoặc bằng Start Date', 10);

  await I.usePlaywrightTo('remove the previous invalid workbook from the upload selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Xóa file đã chọn' }).click();
  });
  const progressResult = await uploadThroughUi(I, project.id, 'task_upload_invalid_progress.xlsx');
  assert(progressResult.status >= 400 && progressResult.status < 500,
    `Expected invalid progress 4xx: ${JSON.stringify(progressResult)}`);
  await I.waitForText('Progress (%) phải nằm trong khoảng 0 đến 100', 10);
});
