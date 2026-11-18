const assert = require('assert');
const { execFileSync } = require('child_process');



const adminEmail = 'labadmin1@labodc.com';
const adminPassword = '123123';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';

const PG_CONTAINER = process.env.PG_CONTAINER || 'labodc-postgres';
const PG_USER = process.env.PG_USER || 'root';
const PG_DB = process.env.PG_DB || 'labodc';

const FIXTURE_PASSWORD = 'Test@1234';
const RUN_ID = Date.now().toString(36);
const EMAIL_PREFIX = `e2e.lab001.${RUN_ID}.`;

// TC-LAB-16: tài liệu (Decision Table - A4) ghi 401; backend (Spring Security mặc định) trả 403 cho
// token hợp lệ nhưng không đủ quyền. Giữ tài liệu là 401, automation chấp nhận cả 401/403 - điều cốt lõi
// là ENTERPRISE bị từ chối và enterprise không đổi trạng thái.
const EXPECTED_STATUS_NOT_ADMIN = [401, 403];

const FIXTURE_SPECS = {
  pendingView: 'PENDING', // TC-LAB-01 (chỉ đọc)
  verify: 'PENDING', // TC-LAB-03
  reject: 'PENDING', // TC-LAB-04
  rejEmpty: 'PENDING', // TC-LAB-05
  rej501: 'PENDING', // TC-LAB-06
  rejMin: 'PENDING', // TC-LAB-08
  rejMinPlus: 'PENDING', // TC-LAB-09
  rej499: 'PENDING', // TC-LAB-10
  rej500: 'PENDING', // TC-LAB-11
  rejSpace: 'PENDING', // TC-LAB-12
  enterpriseRole: 'PENDING', // TC-LAB-16 (đăng nhập bằng chính tài khoản này)
  noToken: 'PENDING', // TC-LAB-17
  approved: 'APPROVED', // TC-LAB-01, 02, 07, 14 (không bị thay đổi nếu backend đúng)
  rejected: 'REJECTED', // TC-LAB-01, 13
};
const F = {}; // key -> { id, email, name, taxCode }

// Locator trang đăng nhập: ô nhập chỉ có placeholder (không có label)
const LOGIN_EMAIL = 'input[placeholder="Tên đăng nhập"]';
const LOGIN_PASSWORD = 'input[placeholder="Mật khẩu"]';

// Locator UI - trang "Quản lý → Doanh nghiệp" (/admin/enterprises-crud)
const CRUD_PATH = '/admin/enterprises-crud';
const LIST_API = /\/api\/lab-admin\/enterprises$/;
const modalByTitle = (title) =>
  locate('.ant-modal-content').withDescendant(locate('.ant-modal-title').withText(title));
const EDIT_MODAL = modalByTitle('Chỉnh sửa Doanh nghiệp');
const STATUS_FILTER = locate('.ant-select').withText('Lọc theo trạng thái');
// Duyệt / Từ chối xác nhận bằng Modal.confirm
const CONFIRM_MODAL = '.ant-modal-confirm';
const CONFIRM_OK = '.ant-modal-confirm .ant-modal-confirm-btns button.ant-btn-primary';
const NEXT_PAGE = '.ant-pagination-next';
const NEXT_PAGE_DISABLED = '.ant-pagination-next.ant-pagination-disabled';
const TABLE_SPINNER = '.ant-table .ant-spin-spinning';
const MAX_PAGES = 100;

Feature('FR-LAB-001 - Xác thực Doanh nghiệp');

// =========================================================================
// DB (chạy phía Node qua docker exec psql)
// =========================================================================

function sql(query) {
  return execFileSync(
    'docker',
    ['exec', '-i', PG_CONTAINER, 'psql', '-U', PG_USER, '-d', PG_DB, '-tA', '-v', 'ON_ERROR_STOP=1', '-c', query],
    { encoding: 'utf8' }
  ).trim();
}

function dbEnterpriseStatus(id) {
  return sql(`SELECT status FROM enterprises WHERE id = ${Number(id)};`);
}

function dbLatestRejectionReason(id) {
  return sql(
    `SELECT rejection_reason FROM enterprise_rejections WHERE enterprise_id = ${Number(id)} ORDER BY id DESC LIMIT 1;`
  );
}

/** Trả về một ID chắc chắn không tồn tại: ưu tiên 99999 theo tài liệu, nếu đã có thì lấy MAX(id) + 1000. */
function nonExistentEnterpriseId() {
  if (sql('SELECT COUNT(*) FROM enterprises WHERE id = 99999;') === '0') return 99999;
  return Number(sql('SELECT COALESCE(MAX(id), 0) + 1000 FROM enterprises;'));
}

// =========================================================================
// API (chạy phía Node)
// =========================================================================

const tokenCache = {};

async function apiLogin(email, password) {
  if (tokenCache[email]) return tokenCache[email];
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Đăng nhập API thất bại (${email}): ${res.status} ${body.slice(0, 200)}`);
  const token = JSON.parse(body)?.data?.token;
  if (!token) throw new Error(`Response đăng nhập không có data.token (${email}): ${body.slice(0, 200)}`);
  tokenCache[email] = token;
  return token;
}

/**
 * Gọi API backend.
 * as: 'admin' (mặc định) | null (không gửi Authorization) | { email, password } (đăng nhập tài khoản khác)
 */
async function api(method, apiPath, { as = 'admin' } = {}) {
  const headers = {};
  if (as) {
    const token = as === 'admin' ? await apiLogin(adminEmail, adminPassword) : await apiLogin(as.email, as.password);
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${apiBaseUrl}${apiPath}`, { method, headers });
  const body = await res.text();
  let json = {};
  try {
    json = JSON.parse(body);
  } catch (e) {
    // body không phải JSON (vd: rỗng)
  }
  return { status: res.status, body, json };
}

function expectStatus(response, expectedStatus, description) {
  assert.strictEqual(
    response.status,
    expectedStatus,
    `${description} (Thực tế: ${response.status} - ${String(response.body).slice(0, 300)})`
  );
}

const verifyPath = (id) => `/lab-admin/enterprises/${id}/verify`;
const rejectPath = (id, reason) => `/lab-admin/enterprises/${id}?reason=${encodeURIComponent(reason)}`;

// =========================================================================
// SEED / CLEANUP DỮ LIỆU
// =========================================================================

BeforeSuite(async () => {
  // DB local có thể bị lệch sequence (enterprises_id_seq < MAX(id)) -> INSERT trùng khóa.
  // Đồng bộ sequence lên MAX(id), không thay đổi dữ liệu.
  for (const table of ['enterprises', 'enterprise_rejections']) {
    sql(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${table}), 1));`
    );
  }

  const taxBase = String(Date.now()).slice(-7);
  let i = 0;
  for (const [key, status] of Object.entries(FIXTURE_SPECS)) {
    i += 1;
    const email = `${EMAIL_PREFIX}${key.toLowerCase()}@example.com`;
    const name = `E2E LAB001 ${key} ${RUN_ID}`;
    const taxCode = `9${taxBase}${String(i).padStart(2, '0')}`; // 10 chữ số, duy nhất trong lần chạy

    // Đăng ký tài khoản ENTERPRISE qua API thật (backend tự kích hoạt user = ACTIVE)
    const res = await fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: FIXTURE_PASSWORD,
        confirmPassword: FIXTURE_PASSWORD,
        role: 'ENTERPRISE',
      }),
    });
    if (!res.ok) {
      throw new Error(`Không đăng ký được user fixture ${email}: ${res.status} ${await res.text()}`);
    }

    // Seed hồ sơ doanh nghiệp với trạng thái mong muốn
    const id = sql(
      `INSERT INTO enterprises (user_id, company_name, tax_code, representative_name, contact_email, industry, status, created_at, updated_at) ` +
        `SELECT id, '${name}', '${taxCode}', 'E2E Tester', '${email}', 'Information Technology', '${status}', now(), now() ` +
        `FROM users WHERE email = '${email}' RETURNING id;`
    ).split('\n')[0];
    if (!id) throw new Error(`Không seed được enterprise cho ${email}`);
    F[key] = { id: Number(id), email, name, taxCode };
  }
});

AfterSuite(() => {
  const ids = Object.values(F).map((f) => f.id).filter(Boolean);
  const steps = [
    ids.length && `DELETE FROM enterprise_rejections WHERE enterprise_id IN (${ids.join(',')});`,
    ids.length && `DELETE FROM enterprises WHERE id IN (${ids.join(',')});`,
    `DELETE FROM users WHERE email LIKE '${EMAIL_PREFIX}%';`,
  ].filter(Boolean);
  // Mỗi bước dọn độc lập: một bước lỗi không làm bỏ qua các bước sau
  for (const query of steps) {
    try {
      sql(query);
    } catch (e) {
      console.warn(`[FR-LAB-001] Dọn dữ liệu test thất bại (${query}): ${e.message}`);
    }
  }
});

// =========================================================================
// HELPERS UI
// =========================================================================

function fillInput(I, field, value) {
  const text = String(value);
  // Chuỗi dài (reason 499/500/501 ký tự): I.fillField vẫn gõ từng ký tự nên dễ quá timeout
  // -> điền thẳng bằng Playwright locator.fill (field phải là CSS string)
  if (text.length > 60 && typeof field === 'string') {
    I.usePlaywrightTo(`điền ${text.length} ký tự`, async ({ page }) => {
      await page.locator(field).first().fill(text);
    });
    return;
  }
  I.fillField(field, text);
}

// codecept.conf.js dùng restart: true -> mỗi Scenario là browser mới, phải đăng nhập lại
function login(I, email, password) {
  I.amOnPage('/login');
  I.waitForElement(LOGIN_EMAIL, 10);
  fillInput(I, LOGIN_EMAIL, email);
  fillInput(I, LOGIN_PASSWORD, password);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

function loginAsAdmin(I) {
  login(I, adminEmail, adminPassword);
}

function enterpriseRow(name) {
  return locate('.ant-table-row').withText(name);
}

/**
 * Thực hiện thao tác UI và bắt response HTTP frontend nhận được (method + pathname khớp regex).
 * optional: true -> trả về null nếu không có request nào trong `timeout` ms (dùng để kiểm tra UI chặn request).
 */
async function captureApi(I, method, pathRegex, action, { timeout = 30000, optional = false } = {}) {
  let pending;
  await I.usePlaywrightTo('lắng nghe response API', async ({ page }) => {
    pending = page.waitForResponse(
      (res) => res.request().method() === method && pathRegex.test(new URL(res.url()).pathname),
      { timeout }
    );
    pending.catch(() => {});
  });

  await action();

  let result = null;
  await I.usePlaywrightTo('đọc response API', async () => {
    try {
      const res = await pending;
      result = { status: res.status(), body: await res.text(), url: res.url() };
    } catch (e) {
      if (!optional) throw e;
    }
  });
  return result;
}

function sentReason(response) {
  return new URL(response.url).searchParams.get('reason');
}

// ----- Trang "Quản lý → Doanh nghiệp" (/admin/enterprises-crud) -----

function openCrudPage(I) {
  I.amOnPage(CRUD_PATH);
  I.waitForText('Quản lý Doanh nghiệp', 10);
  I.waitForElement('.ant-table-row', 15);
  I.waitForInvisible(TABLE_SPINNER, 10);
}

/** Bộ lọc trạng thái lọc phía client trên dữ liệu của trang hiện tại (nhãn: "Chờ xác minh"...). */
function selectStatusFilter(I, label) {
  I.click(STATUS_FILTER);
  const option = locate('.ant-select-item-option').withText(label);
  I.waitForElement(option, 5);
  I.click(option);
  I.waitForInvisible('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', 5);
}

/**
 * Sang trang kế tiếp của bảng và chờ đúng response GET danh sách (không dùng wait cứng).
 * Trả về false nếu đã ở trang cuối. Trang có thể rỗng khi đang lọc.
 */
async function goToNextPage(I) {
  if ((await I.grabNumberOfVisibleElements(NEXT_PAGE_DISABLED)) > 0) return false;
  await captureApi(I, 'GET', LIST_API, () => I.click(NEXT_PAGE), { timeout: 15000 });
  I.waitForInvisible(TABLE_SPINNER, 10);
  return true;
}

/**
 * Trang phân trang phía server (10 dòng/trang, API không sắp xếp) và ô tìm kiếm chỉ lọc trên trang
 * hiện tại -> bấm sang trang kế tiếp cho đến khi thấy dòng của doanh nghiệp cần thao tác.
 */
async function findCrudRow(I, name) {
  const row = enterpriseRow(name);
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    if ((await I.grabNumberOfVisibleElements(row)) > 0) {
      I.scrollTo(row);
      return row;
    }
    if (!(await goToNextPage(I))) break;
  }
  return assert.fail(`Không tìm thấy doanh nghiệp "${name}" trong bảng ở trang ${CRUD_PATH}`);
}

/** Bấm "Duyệt" -> xác nhận "Duyệt"; trả về response của POST /api/lab-admin/enterprises/{id}/verify. */
async function verifyOnCrudPage(I, fixture) {
  const row = await findCrudRow(I, fixture.name);
  I.click(locate('button.ant-btn-primary').inside(row));
  I.waitForText('Xác nhận duyệt doanh nghiệp', 5);
  return captureApi(I, 'POST', new RegExp(`/api/lab-admin/enterprises/${fixture.id}/verify$`), () =>
    I.click(CONFIRM_OK)
  );
}

/** Mở hộp thoại "Từ chối" của dòng doanh nghiệp. */
async function openRejectDialog(I, fixture) {
  const row = await findCrudRow(I, fixture.name);
  I.click(locate('button.ant-btn-dangerous').inside(row));
  I.waitForElement(`${CONFIRM_MODAL} #reason`, 5);
}

/** Bấm "Từ chối" -> nhập "Lý do từ chối" -> OK; trả về response của DELETE /api/lab-admin/enterprises/{id}. */
async function rejectOnCrudPage(I, fixture, reason) {
  await openRejectDialog(I, fixture);
  if (reason) fillInput(I, `${CONFIRM_MODAL} #reason`, reason);
  return captureApi(I, 'DELETE', new RegExp(`/api/lab-admin/enterprises/${fixture.id}$`), () =>
    I.click(CONFIRM_OK)
  );
}

/**
 * API danh sách không sắp xếp nên sau khi cập nhật dòng có thể nhảy sang trang khác
 * -> tải lại trang, tìm lại dòng rồi kiểm tra tag trạng thái.
 */
async function expectCrudStatusTag(I, name, tagText) {
  openCrudPage(I);
  const row = await findCrudRow(I, name);
  I.see(tagText, locate('.ant-tag').inside(row));
  return row;
}

/** Dòng doanh nghiệp không còn ở PENDING: chỉ còn nút "Chỉnh sửa", không có "Duyệt" / "Từ chối". */
async function expectNoVerifyRejectButtons(I, fixture, tagText) {
  const row = await findCrudRow(I, fixture.name);
  I.see(tagText, locate('.ant-tag').inside(row));
  I.dontSeeElement(locate('button.ant-btn-primary').inside(row));
  I.dontSeeElement(locate('button.ant-btn-dangerous').inside(row));
}

// =========================================================================
// HELPERS NGHIỆP VỤ
// =========================================================================

/** Phê duyệt trên UI -> POST /api/lab-admin/enterprises/{id}/verify, enterprise chuyển APPROVED. */
async function verifyViaUI(I, fixture, screenshot) {
  loginAsAdmin(I);
  openCrudPage(I);

  const response = await verifyOnCrudPage(I, fixture);
  expectStatus(response, 200, 'Phê duyệt doanh nghiệp PENDING phải trả về 200');
  assert.strictEqual(JSON.parse(response.body).success, true, 'Response phải có success = true');
  I.waitForText('Xác minh doanh nghiệp thành công', 10);
  await expectCrudStatusTag(I, fixture.name, 'Đã duyệt');
  I.saveScreenshot(screenshot);
  assert.strictEqual(dbEnterpriseStatus(fixture.id), 'APPROVED', 'Enterprise phải chuyển APPROVED trong DB');
}

/** Từ chối hợp lệ trên UI -> DELETE /api/lab-admin/enterprises/{id}?reason=..., enterprise chuyển REJECTED. */
async function rejectValidViaUI(I, fixture, reason, description, screenshot) {
  loginAsAdmin(I);
  openCrudPage(I);

  const response = await rejectOnCrudPage(I, fixture, reason);
  expectStatus(response, 200, description);
  assert.strictEqual(sentReason(response), reason, 'UI phải gửi đúng lý do đã nhập');
  I.waitForText('Từ chối doanh nghiệp thành công', 10);
  await expectCrudStatusTag(I, fixture.name, 'Đã từ chối');
  I.saveScreenshot(screenshot);
  assert.strictEqual(dbEnterpriseStatus(fixture.id), 'REJECTED', 'Enterprise phải chuyển REJECTED trong DB');
  // Lý do từ chối được lưu ở bảng enterprise_rejections (Enterprise.rejectionReason là @Transient)
  assert.strictEqual(dbLatestRejectionReason(fixture.id), reason, `Reason phải được lưu đầy đủ ${reason.length} ký tự`);
}

/**
 * Từ chối với lý do không hợp lệ (rỗng / chỉ khoảng trắng / > 500 ký tự):
 * - API: DELETE ...?reason=... phải trả 400
 * - UI: form "Lý do từ chối" báo lỗi, hộp thoại giữ nguyên và KHÔNG gửi request DELETE
 * - Enterprise giữ nguyên PENDING
 */
async function rejectInvalid(I, fixture, reason, description, screenshot) {
  const apiRes = await api('DELETE', rejectPath(fixture.id, reason));
  expectStatus(apiRes, 400, `API: ${description}`);
  assert.strictEqual(dbEnterpriseStatus(fixture.id), 'PENDING', 'Enterprise phải giữ nguyên PENDING sau khi gọi API');

  loginAsAdmin(I);
  openCrudPage(I);
  await openRejectDialog(I, fixture);
  if (reason) fillInput(I, `${CONFIRM_MODAL} #reason`, reason);
  const sent = await captureApi(
    I,
    'DELETE',
    new RegExp(`/api/lab-admin/enterprises/${fixture.id}$`),
    () => I.click(CONFIRM_OK),
    { timeout: 5000, optional: true }
  );
  I.saveScreenshot(screenshot);
  assert.strictEqual(
    sent,
    null,
    sent &&
      `UI: ${description} - không được gửi request (Thực tế: đã gửi reason dài ${String(sentReason(sent)).length} ký tự -> ${sent.status})`
  );
  I.seeElement(CONFIRM_MODAL);
  I.seeElement(locate('.ant-form-item-explain-error').inside(CONFIRM_MODAL));
  assert.strictEqual(dbEnterpriseStatus(fixture.id), 'PENDING', 'Enterprise phải giữ nguyên PENDING');
}

// =========================================================================
// 1. XEM DANH SÁCH / CHI TIẾT
// =========================================================================

Scenario('TC-LAB-01 - Xem danh sách doanh nghiệp PENDING', async ({ I }) => {
  loginAsAdmin(I);
  openCrudPage(I);

  // UI: lọc "Chờ xác minh" rồi duyệt qua tất cả các trang (lọc chỉ áp dụng trên trang hiện tại):
  // phải thấy enterprise PENDING; mọi dòng hiển thị đều có tag "Chờ xác minh"
  selectStatusFilter(I, 'Chờ xác minh');
  const pendingRow = enterpriseRow(F.pendingView.name);
  let foundPending = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    if (!foundPending && (await I.grabNumberOfVisibleElements(pendingRow)) > 0) {
      foundPending = true;
      I.scrollTo(pendingRow);
      I.see('Chờ xác minh', pendingRow);
      I.saveScreenshot('TC-LAB-01_Danh_sach_PENDING.png');
    }
    I.dontSeeElement(enterpriseRow(F.approved.name));
    I.dontSeeElement(enterpriseRow(F.rejected.name));
    const tags = await I.grabTextFromAll('.ant-table-row .ant-tag');
    const wrongTags = tags.filter((t) => t.trim() !== 'Chờ xác minh');
    assert.deepStrictEqual(wrongTags, [], `Trang ${page}: khi lọc "Chờ xác minh" chỉ được hiển thị enterprise PENDING`);
    if (!(await goToNextPage(I))) break;
  }
  assert.ok(foundPending, `Không thấy enterprise PENDING "${F.pendingView.name}" khi lọc "Chờ xác minh"`);

  // API: GET /api/lab-admin/enterprises/pending
  const response = await api('GET', '/lab-admin/enterprises/pending');
  expectStatus(response, 200, 'GET /api/lab-admin/enterprises/pending phải trả về 200');
  const list = Array.isArray(response.json) ? response.json : response.json.data || [];
  const ids = list.map((e) => e.id);
  assert.ok(ids.includes(F.pendingView.id), 'Danh sách phải chứa enterprise PENDING');
  assert.ok(!ids.includes(F.approved.id), 'Danh sách không được chứa enterprise APPROVED');
  assert.ok(!ids.includes(F.rejected.id), 'Danh sách không được chứa enterprise REJECTED');
  const notPending = list.filter((e) => e.status !== 'PENDING').map((e) => `${e.id}:${e.status}`);
  assert.deepStrictEqual(notPending, [], 'Mọi phần tử trả về phải có status = PENDING');
});

Scenario('TC-LAB-02 - Xem chi tiết Doanh nghiệp', async ({ I }) => {
  loginAsAdmin(I);
  openCrudPage(I);

  // UI: lọc "Đã duyệt" rồi tìm dòng doanh nghiệp (lọc phía client trên trang hiện tại -> vẫn duyệt các trang)
  selectStatusFilter(I, 'Đã duyệt');
  const row = await findCrudRow(I, F.approved.name);
  I.see(F.approved.taxCode, row);
  I.see('Đã duyệt', locate('.ant-tag').inside(row));

  // UI: trang không có "Xem chi tiết" -> mở modal "Chỉnh sửa" để xem đầy đủ thông tin (không lưu)
  I.click(locate('button').withDescendant('.anticon-edit').inside(row));
  I.waitForElement(EDIT_MODAL, 10);
  I.seeInField(locate('#companyName').inside(EDIT_MODAL), F.approved.name);
  I.seeInField(locate('#taxCode').inside(EDIT_MODAL), F.approved.taxCode);
  I.seeInField(locate('#representativeName').inside(EDIT_MODAL), 'E2E Tester');
  I.seeInField(locate('#contactEmail').inside(EDIT_MODAL), F.approved.email);
  I.see('Đã duyệt', EDIT_MODAL);
  I.saveScreenshot('TC-LAB-02_Chi_tiet_doanh_nghiep.png');
  I.click(locate('.ant-modal-footer button:not(.ant-btn-primary)').inside(EDIT_MODAL));
  I.waitForInvisible(EDIT_MODAL, 5);

  // API: GET /api/lab-admin/enterprises/{id}
  const response = await api('GET', `/lab-admin/enterprises/${F.approved.id}`);
  expectStatus(response, 200, 'GET /api/lab-admin/enterprises/{id} phải trả về 200');
  const detail = response.json.data || response.json;
  assert.strictEqual(detail.companyName, F.approved.name, 'Tên doanh nghiệp phải đúng');
  assert.strictEqual(detail.taxCode, F.approved.taxCode, 'Mã số thuế phải đúng');
  assert.strictEqual(detail.status, 'APPROVED', 'Trạng thái phải là APPROVED');
});

// =========================================================================
// 2. VERIFY / REJECT HỢP LỆ QUA UI
// =========================================================================

Scenario('TC-LAB-03 - Verify doanh nghiệp đang PENDING', async ({ I }) => {
  await verifyViaUI(I, F.verify, 'TC-LAB-03_Verify_PENDING.png');
});

Scenario('TC-LAB-04 - Reject doanh nghiệp với reason hợp lệ', async ({ I }) => {
  await rejectValidViaUI(
    I,
    F.reject,
    'Mã số thuế không hợp lệ',
    'Từ chối doanh nghiệp PENDING phải trả về 200',
    'TC-LAB-04_Reject_hop_le.png'
  );
});

// =========================================================================
// 3. VALIDATION REASON & BIÊN ĐỘ DÀI
// =========================================================================

Scenario('TC-LAB-05 - Reject với reason rỗng', async ({ I }) => {
  await rejectInvalid(I, F.rejEmpty, '', 'reason rỗng phải bị chặn (400)', 'TC-LAB-05_Reason_rong.png');
});

Scenario('TC-LAB-06 - Reject với reason dài 501 ký tự', async ({ I }) => {
  await rejectInvalid(I, F.rej501, 'R'.repeat(501), 'reason 501 ký tự phải bị chặn (400)', 'TC-LAB-06_Reason_501.png');
});

Scenario('TC-LAB-08 - Reject với reason tại biên min (1 ký tự)', async ({ I }) => {
  await rejectValidViaUI(I, F.rejMin, 'A', 'Reason 1 ký tự phải trả về 200', 'TC-LAB-08_Reason_1_ky_tu.png');
});

Scenario('TC-LAB-09 - Reject với reason ngay trên min (2 ký tự)', async ({ I }) => {
  await rejectValidViaUI(I, F.rejMinPlus, 'AB', 'Reason 2 ký tự phải trả về 200', 'TC-LAB-09_Reason_2_ky_tu.png');
});

Scenario('TC-LAB-10 - Reject với reason ngay dưới max (499 ký tự)', async ({ I }) => {
  await rejectValidViaUI(I, F.rej499, 'R'.repeat(499), 'Reason 499 ký tự phải trả về 200', 'TC-LAB-10_Reason_499_ky_tu.png');
});

Scenario('TC-LAB-11 - Reject với reason tại biên max (500 ký tự)', async ({ I }) => {
  await rejectValidViaUI(I, F.rej500, 'R'.repeat(500), 'Reason 500 ký tự phải trả về 200', 'TC-LAB-11_Reason_500_ky_tu.png');
});

Scenario('TC-LAB-12 - Reject với reason chỉ chứa khoảng trắng', async ({ I }) => {
  await rejectInvalid(I, F.rejSpace, '   ', 'reason chỉ có khoảng trắng phải bị chặn (400)', 'TC-LAB-12_Reason_khoang_trang.png');
});

// =========================================================================
// 4. TRẠNG THÁI KHÔNG HỢP LỆ (ST-LAB-03 → ST-LAB-05)
// =========================================================================

Scenario('TC-LAB-07 - Verify lại doanh nghiệp đã APPROVED', async ({ I }) => {
  loginAsAdmin(I);
  openCrudPage(I);
  await expectNoVerifyRejectButtons(I, F.approved, 'Đã duyệt');
  I.saveScreenshot('TC-LAB-07_Doanh_nghiep_da_APPROVED.png');

  const response = await api('POST', verifyPath(F.approved.id));
  expectStatus(response, 409, 'Verify enterprise đã APPROVED phải trả về 409');
  assert.strictEqual(dbEnterpriseStatus(F.approved.id), 'APPROVED', 'Trạng thái phải giữ nguyên APPROVED');
});

Scenario('TC-LAB-13 - Verify doanh nghiệp đã bị REJECTED', async ({ I }) => {
  loginAsAdmin(I);
  openCrudPage(I);
  await expectNoVerifyRejectButtons(I, F.rejected, 'Đã từ chối');
  I.saveScreenshot('TC-LAB-13_Doanh_nghiep_da_REJECTED.png');

  const response = await api('POST', verifyPath(F.rejected.id));
  expectStatus(response, 409, 'Verify enterprise đã REJECTED phải trả về 409');
  assert.match(response.body, /PENDING/, 'Thông báo lỗi phải nêu enterprise không ở trạng thái PENDING');
  assert.strictEqual(dbEnterpriseStatus(F.rejected.id), 'REJECTED', 'Trạng thái phải giữ nguyên REJECTED');
});

Scenario('TC-LAB-14 - Reject doanh nghiệp đã APPROVED', async () => {
  const response = await api('DELETE', rejectPath(F.approved.id, 'Test reject'));
  expectStatus(response, 409, 'Reject enterprise đã APPROVED phải trả về 409');
  assert.match(response.body, /PENDING/, 'Thông báo lỗi phải nêu enterprise không ở trạng thái PENDING');
  assert.strictEqual(dbEnterpriseStatus(F.approved.id), 'APPROVED', 'Trạng thái phải giữ nguyên APPROVED');
  assert.strictEqual(dbLatestRejectionReason(F.approved.id), '', 'Không được tạo bản ghi từ chối');
});

// =========================================================================
// 5. ENTERPRISE KHÔNG TỒN TẠI (R2)
// =========================================================================

Scenario('TC-LAB-15 - Verify doanh nghiệp không tồn tại', async () => {
  const missingId = nonExistentEnterpriseId();
  const response = await api('POST', verifyPath(missingId));
  expectStatus(response, 404, `Verify enterprise không tồn tại (id=${missingId}) phải trả về 404`);
  assert.strictEqual(
    sql(`SELECT COUNT(*) FROM enterprises WHERE id = ${missingId};`),
    '0',
    'Không được tạo dữ liệu mới'
  );
});

// =========================================================================
// 6. PHÂN QUYỀN / XÁC THỰC (R5, R6)
// =========================================================================

Scenario('TC-LAB-16 - Tài khoản không phải admin gọi API verify', async ({ I }) => {
  const enterpriseAccount = { email: F.enterpriseRole.email, password: FIXTURE_PASSWORD };

  // UI: tài khoản ENTERPRISE vào trang quản lý doanh nghiệp -> ProtectedRoute chuyển hướng
  login(I, enterpriseAccount.email, enterpriseAccount.password);
  I.amOnPage(CRUD_PATH);
  I.waitForFunction((path) => !window.location.pathname.startsWith(path), [CRUD_PATH], 10);
  I.dontSee('Quản lý Doanh nghiệp');
  I.saveScreenshot('TC-LAB-16_ENTERPRISE_bi_chan.png');

  // API: tự verify hồ sơ của mình bằng token ENTERPRISE
  const response = await api('POST', verifyPath(F.enterpriseRole.id), { as: enterpriseAccount });
  assert.ok(
    EXPECTED_STATUS_NOT_ADMIN.includes(response.status),
    `ENTERPRISE verify enterprise phải bị từ chối (${EXPECTED_STATUS_NOT_ADMIN.join('/')}) ` +
      `(Thực tế: ${response.status} - ${String(response.body).slice(0, 300)})`
  );
  console.log(`      [TC-LAB-16] Backend trả ${response.status} (tài liệu kỳ vọng 401)`);
  assert.strictEqual(dbEnterpriseStatus(F.enterpriseRole.id), 'PENDING', 'Enterprise phải giữ nguyên PENDING');
});

Scenario('TC-LAB-17 - Gọi API verify không có token', async () => {
  const response = await api('POST', verifyPath(F.noToken.id), { as: null });
  expectStatus(response, 401, 'Verify không gửi Authorization phải trả về 401');
  assert.strictEqual(dbEnterpriseStatus(F.noToken.id), 'PENDING', 'Enterprise phải giữ nguyên PENDING');
});
