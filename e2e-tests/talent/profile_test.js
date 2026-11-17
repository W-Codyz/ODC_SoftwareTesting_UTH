const assert = require('assert');
const fs = require('fs');
const path = require('path');

const talentEmail = process.env.TALENT_EMAIL || 'hoangvane@student.uth.edu.vn';
const talentPassword = process.env.TALENT_PASSWORD || '123123';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';

const MB = 1024 * 1024;

// =========================================================================
// FIXTURES - file mẫu cho upload Avatar / CV qua UI
// (I.attachFile cần file thật trên đĩa, đường dẫn tương đối codecept_dir)
// =========================================================================

const FIXTURE_DIR = 'e2e-output/fixtures/talent-profile';
const JPG_MAGIC = [0xff, 0xd8, 0xff, 0xe0];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]; // "%PDF-1.4"

const FIXTURES = {
  avatarValidPng: { name: 'avatar_valid.png', size: Math.floor(2.5 * MB), magic: PNG_MAGIC },
  avatar5MbJpg: { name: 'avatar_5mb.jpg', size: 5 * MB, magic: JPG_MAGIC },
  avatarLargeJpg: { name: 'avatar_large.jpg', size: Math.floor(5.1 * MB), magic: JPG_MAGIC },
  avatarTxt: { name: 'avatar.txt', content: 'invalid avatar file content' },
  cvValidPdf: { name: 'cv_valid.pdf', size: 10 * MB, magic: PDF_MAGIC },
  cv20MbPdf: { name: 'cv_20mb.pdf', size: 20 * MB, magic: PDF_MAGIC },
  cvLargePdf: { name: 'cv_large.pdf', size: Math.floor(20.1 * MB), magic: PDF_MAGIC },
  cvTxt: { name: 'cv.txt', content: 'invalid cv text content' },
};

BeforeSuite(() => {
  const dir = path.join(global.codecept_dir || process.cwd(), FIXTURE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of Object.values(FIXTURES)) {
    const file = path.join(dir, f.name);
    const expectedSize = f.content !== undefined ? Buffer.byteLength(f.content, 'utf8') : f.size;
    // Bỏ qua nếu file đã có sẵn đúng dung lượng -> không phải ghi lại hàng chục MB mỗi lần chạy
    if (fs.existsSync(file) && fs.statSync(file).size === expectedSize) continue;

    let data;
    if (f.content !== undefined) {
      data = Buffer.from(f.content, 'utf8');
    } else {
      data = Buffer.alloc(f.size);
      Buffer.from(f.magic).copy(data, 0);
    }
    fs.writeFileSync(file, data);
  }
});

function fixturePath(fixture) {
  return `${FIXTURE_DIR}/${fixture.name}`;
}

// =========================================================================
// LOCATORS (antd Form: id của input = name của Form.Item)
// =========================================================================

// Trang có 2 component Upload -> phân biệt bằng thuộc tính accept
const AVATAR_INPUT = 'input[type="file"][accept=".jpg,.jpeg,.png"]';
const CV_INPUT = 'input[type="file"][accept=".pdf,.doc,.docx"]';
const PROFILE_SUBMIT = locate('button[type="submit"]').withText('Lưu thay đổi');
const SKILL_FORM = locate('form').withDescendant('#skillName');
const SKILL_SUBMIT = locate('button[type="submit"]').inside(SKILL_FORM);
const PROFICIENCY_SELECT = locate('.ant-select').withDescendant('#proficiencyLevel');

// Endpoint backend mà frontend gọi (so khớp theo pathname)
const PROFILE_API = /\/api\/talent\/profile$/;
const AVATAR_API = /\/api\/talent\/profile\/avatar$/;
const CV_API = /\/api\/talent\/profile\/cv$/;
const SKILLS_API = /\/api\/talent\/skills$/;

const PHONE_ERROR = 'Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0';

Feature('FR-TAL-001 - Quản lý Hồ sơ Cá nhân');

// =========================================================================
// HELPERS - điều hướng
// =========================================================================

// codecept.conf.js dùng `restart: true` + `keepBrowserState: false` nên mỗi Scenario
// chạy trên browser mới (localStorage trống) -> phải đăng nhập lại ở mọi test.
function login(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', talentEmail);
  I.fillField('Mật khẩu', talentPassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

function openProfilePage(I) {
  I.amOnPage('/talent/profile');
  I.waitForText('Hồ sơ của tôi', 10);
  I.waitForElement('#fullName', 10); // chờ form load xong dữ liệu hồ sơ
}

function loginAsTalent(I) {
  login(I);
  openProfilePage(I);
}

function openSkillsTab(I) {
  I.click(locate('.ant-tabs-tab').withText('Kỹ năng'));
  I.waitForText('Thêm kỹ năng mới', 10);
}

// Tag kỹ năng hiển thị dạng "<skillName> (<LEVEL>) - <n> năm"
function skillTag(skillName) {
  return `//span[contains(@class,"ant-tag")][starts-with(normalize-space(.), "${skillName} (")]`;
}

function selectProficiency(I, level) {
  I.click(PROFICIENCY_SELECT);
  I.waitForElement(locate('.ant-select-item-option').withText(level), 5);
  I.click(locate('.ant-select-item-option').withText(level));
}

// =========================================================================
// HELPERS - theo dõi request/response giữa frontend và backend
// =========================================================================

/**
 * Thực hiện thao tác UI `action` và bắt response HTTP mà frontend gửi tới backend
 * (method + pathname khớp `pathRegex`). Trả về { status, body } để assert chặt.
 */
async function captureApi(I, method, pathRegex, action) {
  let pending;
  await I.usePlaywrightTo('lắng nghe response API', async ({ page }) => {
    pending = page.waitForResponse(
      (res) => res.request().method() === method && pathRegex.test(new URL(res.url()).pathname),
      { timeout: 30000 }
    );
    pending.catch(() => {});
  });

  await action();

  let result;
  await I.usePlaywrightTo('đọc response API', async () => {
    const res = await pending;
    result = { status: res.status(), body: await res.text() };
  });
  return result;
}

/**
 * Thực hiện thao tác UI `action` rồi kiểm tra frontend KHÔNG gửi request nào khớp method + `pathRegex`
 * (dùng cho các case bị validation phía client chặn trước khi gọi backend).
 */
async function expectNoApiCall(I, method, pathRegex, action, description) {
  const sent = [];
  let listener;
  await I.usePlaywrightTo('theo dõi request API', async ({ page }) => {
    listener = (req) => {
      if (req.method() === method && pathRegex.test(new URL(req.url()).pathname)) sent.push(req.url());
    };
    page.on('request', listener);
  });

  await action();
  I.wait(1); // chờ thêm để chắc chắn không có request nào được gửi muộn

  await I.usePlaywrightTo('ngừng theo dõi request API', async ({ page }) => {
    page.off('request', listener);
  });
  assert.strictEqual(sent.length, 0, `${description} (frontend vẫn gửi request: ${sent.join(', ')})`);
}

/**
 * Gọi API trực tiếp từ browser (dùng token đã đăng nhập) - dùng cho setup/cleanup dữ liệu
 * và để kiểm tra backend tự chặn khi bỏ qua validation phía client.
 * Lưu ý: I.executeScript của helper Playwright chỉ truyền được 1 tham số -> gói tất cả vào 1 object.
 */
async function apiRequest(I, method, apiPath, body, file) {
  return I.executeScript(
    async ({ url, requestMethod, requestBody, requestFile }) => {
      const token = window.localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let payload = requestBody;

      if (requestFile) {
        let blobContent;
        if (requestFile.content !== undefined) {
          blobContent = [requestFile.content];
        } else {
          const bytes = new Uint8Array(requestFile.size || 0);
          if (requestFile.magic && bytes.length >= requestFile.magic.length) {
            bytes.set(requestFile.magic, 0);
          }
          blobContent = [bytes];
        }
        payload = new FormData();
        payload.append('file', new File(blobContent, requestFile.name, { type: requestFile.type }));
      } else if (requestBody !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(requestBody);
      }

      const response = await fetch(url, { method: requestMethod, headers, body: payload });
      return { status: response.status, body: await response.text() };
    },
    {
      url: `${apiBaseUrl}${apiPath}`,
      requestMethod: method,
      requestBody: body,
      requestFile: file,
    }
  );
}

// =========================================================================
// HELPERS - assert
// =========================================================================

function expectStatus(response, expectedStatus, description) {
  assert.strictEqual(
    response.status,
    expectedStatus,
    `${description} (Thực tế: ${response.status} - ${response.body})`
  );
}

function parseJson(response) {
  return JSON.parse(response.body);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

/** Response lỗi chuẩn: status 400, success=false, thông báo (field error hoặc message) chứa `expectedMessage`. */
function expectBadRequest(response, expectedMessage, description, field) {
  expectStatus(response, 400, description);
  const parsed = parseJson(response);
  assert.strictEqual(parsed.success, false);
  const actual = (field && parsed.data?.[field]) || parsed.message || '';
  assert.match(actual, new RegExp(escapeRegExp(expectedMessage)));
  return parsed;
}

/** Response thành công chuẩn: status 200, success=true, message khớp `messageRegex`. */
function expectOk(response, messageRegex, description) {
  expectStatus(response, 200, description);
  const parsed = parseJson(response);
  assert.strictEqual(parsed.success, true);
  assert.match(parsed.message || '', messageRegex);
  return parsed;
}

// =========================================================================
// HELPERS - Thông tin cá nhân (SĐT + Portfolio)
// =========================================================================

/** Cập nhật SĐT + Portfolio qua form UI, kiểm tra response + toast + dữ liệu sau khi reload. */
async function updateProfileViaUI(I, { phone, portfolioUrl }, description) {
  I.fillField('#phone', phone);
  I.fillField('#portfolioUrl', portfolioUrl);
  const response = await captureApi(I, 'PUT', PROFILE_API, () => I.click(PROFILE_SUBMIT));

  const parsed = expectOk(response, /Profile updated successfully/, description);
  assert.strictEqual(parsed.data?.phone, phone);
  assert.strictEqual(parsed.data?.portfolioUrl, portfolioUrl);
  I.waitForText('Cập nhật hồ sơ thành công', 10);

  // Reload để chắc chắn dữ liệu đã lưu xuống DB
  openProfilePage(I);
  I.seeInField('#phone', phone);
  I.seeInField('#portfolioUrl', portfolioUrl);
}

/**
 * TC-TAL-05..08: nhập SĐT sai trên form UI -> validator antd (^0\d{9}$) hiện lỗi dưới ô nhập
 * và KHÔNG gửi request. Sau đó kiểm tra backend cũng tự chặn (400) khi gọi thẳng API.
 */
async function expectInvalidPhone(I, phone, description, screenshot) {
  loginAsTalent(I);

  I.fillField('#phone', phone);
  await expectNoApiCall(I, 'PUT', PROFILE_API, () => I.click(PROFILE_SUBMIT), `UI phải chặn SĐT ${phone}`);
  I.waitForText(PHONE_ERROR, 10);
  I.saveScreenshot(screenshot);

  const response = await apiRequest(I, 'PUT', '/talent/profile', { phone });
  expectBadRequest(response, PHONE_ERROR, `Backend: ${description}`, 'phone');
}

// =========================================================================
// HELPERS - Kỹ năng
// =========================================================================

async function cleanupSkillByName(I, skillName) {
  const profileRes = await apiRequest(I, 'GET', '/talent/profile');
  if (profileRes.status !== 200) return;
  const skills = parseJson(profileRes).data?.skills || [];
  for (const s of skills) {
    if ((s.skillName || s.name) === skillName && s.id) {
      await apiRequest(I, 'DELETE', `/talent/skills/${s.id}`);
    }
  }
}

/** Điền form "Thêm kỹ năng mới" trên UI (chưa bấm "Thêm"). */
function fillSkillForm(I, { skillName, level = 'Trung bình', years }) {
  if (skillName) I.fillField('#skillName', skillName);
  selectProficiency(I, level);
  if (years !== undefined) I.fillField('#yearsOfExperience', String(years));
}

/** Điền form "Thêm kỹ năng mới", bấm "Thêm" và trả về response của POST /api/talent/skills. */
async function addSkillViaUI(I, skill) {
  fillSkillForm(I, skill);
  return captureApi(I, 'POST', SKILLS_API, () => I.click(SKILL_SUBMIT));
}

/**
 * TC-TAL-12/13: ô "Số năm kinh nghiệm" (antd InputNumber) có validator 0.0..50.0 ở client
 * -> UI hiển thị lỗi dưới ô nhập, KHÔNG gửi request. Sau đó kiểm tra backend cũng tự chặn (400).
 */
async function expectInvalidYearsRejected(I, years, expectedMessage, screenshot) {
  loginAsTalent(I);
  await cleanupSkillByName(I, 'Python');
  openSkillsTab(I);

  fillSkillForm(I, { skillName: 'Python', years });
  await expectNoApiCall(
    I,
    'POST',
    SKILLS_API,
    () => I.click(SKILL_SUBMIT),
    `UI phải chặn số năm kinh nghiệm ${years}`
  );
  I.waitForText(expectedMessage, 10);
  I.dontSeeElement(skillTag('Python'));
  I.saveScreenshot(screenshot);

  const response = await apiRequest(I, 'POST', '/talent/skills', {
    skillName: 'Python',
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: years,
  });
  expectBadRequest(
    response,
    expectedMessage,
    `Backend: số năm kinh nghiệm ${years} phải trả về 400`,
    'yearsOfExperience'
  );

  await cleanupSkillByName(I, 'Python');
}

/** Thêm kỹ năng hợp lệ qua UI, kiểm tra response + tag hiển thị, sau đó dọn dữ liệu. */
async function addValidSkillViaUIAndCleanup(I, skill, description, screenshot) {
  await cleanupSkillByName(I, skill.skillName);
  openSkillsTab(I);

  const response = await addSkillViaUI(I, skill);
  const parsed = expectOk(response, /Skill added successfully/, description);

  I.waitForText('Đã thêm kỹ năng', 10);
  I.waitForElement(skillTag(skill.skillName), 10);
  I.saveScreenshot(screenshot);

  if (parsed.data?.id) {
    await apiRequest(I, 'DELETE', `/talent/skills/${parsed.data.id}`);
  } else {
    await cleanupSkillByName(I, skill.skillName);
  }
  return parsed;
}

// =========================================================================
// HELPERS - Upload Avatar / CV
// =========================================================================

/** Upload avatar qua component Upload trên UI, trả về response của POST /api/talent/profile/avatar. */
async function uploadAvatarViaUI(I, fixture) {
  return captureApi(I, 'POST', AVATAR_API, () => I.attachFile(AVATAR_INPUT, fixturePath(fixture)));
}

/**
 * TC-TAL-14/15: beforeUpload của antd Upload chặn file sai định dạng / quá 5MB ngay ở client
 * -> UI hiện toast lỗi, KHÔNG gửi request. Sau đó kiểm tra backend cũng tự chặn (400).
 */
async function expectInvalidAvatarRejected(I, fixture, apiFileType, expectedMessage, screenshot) {
  loginAsTalent(I);
  await expectNoApiCall(
    I,
    'POST',
    AVATAR_API,
    () => I.attachFile(AVATAR_INPUT, fixturePath(fixture)),
    `UI phải chặn upload avatar ${fixture.name}`
  );
  I.waitForText(expectedMessage, 10);
  I.saveScreenshot(screenshot);

  // multipart max-file-size = 25MB nên request gọi thẳng API vẫn tới được TalentService
  const response = await apiRequest(I, 'POST', '/talent/profile/avatar', undefined, {
    ...fixture,
    type: apiFileType,
  });
  expectBadRequest(response, expectedMessage, `Backend: avatar ${fixture.name} phải trả về 400`);
}

/**
 * Upload CV qua nút "Tải lên CV" trên UI, trả về response của POST /api/talent/profile/cv.
 * Component Upload CV không validate ở client -> mọi file đều được gửi tới backend.
 */
async function uploadCvViaUI(I, fixture) {
  return captureApi(I, 'POST', CV_API, () => I.attachFile(CV_INPUT, fixturePath(fixture)));
}

/** Upload CV hợp lệ qua UI: 200 + toast thành công + hiển thị link "CV hiện tại". */
async function expectCvUploaded(I, fixture, description, screenshot) {
  loginAsTalent(I);
  const response = await uploadCvViaUI(I, fixture);

  const parsed = expectOk(response, /CV uploaded successfully/, description);
  assert.ok(parsed.data, 'Backend phải trả về URL của CV vừa upload');
  I.waitForText('Tải lên CV thành công', 10);
  I.waitForText('CV hiện tại', 10);
  I.saveScreenshot(screenshot);
}

/** Upload CV không hợp lệ qua UI: backend trả 400 + toast hiển thị đúng thông báo lỗi của backend. */
async function expectCvRejected(I, fixture, expectedMessage, description, screenshot) {
  loginAsTalent(I);
  const response = await uploadCvViaUI(I, fixture);

  expectBadRequest(response, expectedMessage, description);
  I.waitForText(expectedMessage, 10);
  I.saveScreenshot(screenshot);
}

// =========================================================================
// 1. LẤY & CẬP NHẬT THÔNG TIN HỒ SƠ (tab "Thông tin cá nhân" -> GET & PUT /api/talent/profile)
// =========================================================================

Scenario('TC-TAL-01 - Lấy thông tin hồ sơ cá nhân', async ({ I }) => {
  login(I);
  const response = await captureApi(I, 'GET', PROFILE_API, () => I.amOnPage('/talent/profile'));

  expectStatus(response, 200, 'Lấy profile phải trả về 200');
  const data = parseJson(response).data;
  assert.ok(data.id !== undefined, 'Thiếu trường id');
  assert.ok(data.fullName !== undefined, 'Thiếu trường fullName');
  assert.ok(Array.isArray(data.skills), 'Thiếu danh sách skills');
  assert.ok(Array.isArray(data.certifications), 'Thiếu danh sách certifications');

  // UI hiển thị đúng dữ liệu backend trả về
  I.waitForText('Hồ sơ của tôi', 10);
  I.waitForElement('#fullName', 10);
  I.see('Thông tin cá nhân');
  I.see('Kỹ năng');
  I.see('Chứng chỉ');
  if (data.fullName) I.seeInField('#fullName', data.fullName);
  if (data.studentId) I.seeInField('#studentId', data.studentId);
  if (data.phone) I.seeInField('#phone', data.phone);
  I.saveScreenshot('TC-TAL-01_Lay_thong_tin_ho_so.png');
});

Scenario('TC-TAL-02 - Cập nhật thông tin hồ sơ hợp lệ (Nominal)', async ({ I }) => {
  loginAsTalent(I);
  await updateProfileViaUI(
    I,
    { phone: '0901234568', portfolioUrl: 'https://github.com/hoangvane' },
    'Cập nhật SĐT + portfolio hợp lệ phải trả về 200'
  );
  I.saveScreenshot('TC-TAL-02_Cap_nhat_ho_so_nominal.png');
});

Scenario('TC-TAL-03 - Cập nhật thông tin hồ sơ hợp lệ tại biên Min', async ({ I }) => {
  loginAsTalent(I);
  await updateProfileViaUI(
    I,
    { phone: '0901234567', portfolioUrl: 'https://github.com/h' },
    'SĐT + portfolio biên min phải được chấp nhận'
  );
  I.saveScreenshot('TC-TAL-03_Cap_nhat_ho_so_bien_min.png');
});

Scenario('TC-TAL-04 - Cập nhật thông tin hồ sơ hợp lệ tại biên Max', async ({ I }) => {
  loginAsTalent(I);
  await updateProfileViaUI(
    I,
    {
      phone: '0987654321',
      portfolioUrl: 'https://github.com/hoangvane/my-awesome-talent-portfolio-project-labodc-uth-testing-2026-v2',
    },
    'SĐT + portfolio biên max phải được chấp nhận'
  );
  I.saveScreenshot('TC-TAL-04_Cap_nhat_ho_so_bien_max.png');
});

Scenario('TC-TAL-05 - SĐT ít hơn 10 chữ số (single fault)', async ({ I }) => {
  await expectInvalidPhone(I, '090123456', 'SĐT 9 chữ số phải trả về 400', 'TC-TAL-05_SDT_9_so.png');
});

Scenario('TC-TAL-06 - SĐT nhiều hơn 10 chữ số (single fault)', async ({ I }) => {
  await expectInvalidPhone(I, '09012345678', 'SĐT 11 chữ số phải trả về 400', 'TC-TAL-06_SDT_11_so.png');
});

Scenario('TC-TAL-07 - SĐT chứa ký tự chữ (single fault)', async ({ I }) => {
  await expectInvalidPhone(I, '090123456a', 'SĐT chứa ký tự chữ phải trả về 400', 'TC-TAL-07_SDT_chua_chu.png');
});

Scenario('TC-TAL-08 - SĐT không bắt đầu bằng số 0', async ({ I }) => {
  await expectInvalidPhone(
    I,
    '1901234567',
    'SĐT không bắt đầu bằng 0 phải trả về 400',
    'TC-TAL-08_SDT_khong_bat_dau_0.png'
  );
});

// =========================================================================
// 2. QUẢN LÝ KỸ NĂNG - VALIDATION (tab "Kỹ năng" -> POST /api/talent/skills)
// =========================================================================

Scenario('TC-TAL-09 - Tên kỹ năng để trống', async ({ I }) => {
  loginAsTalent(I);
  openSkillsTab(I);

  // UI: antd Form chặn submit ngay ở client
  fillSkillForm(I, { years: 2 });
  await expectNoApiCall(I, 'POST', SKILLS_API, () => I.click(SKILL_SUBMIT), 'UI phải chặn tên kỹ năng rỗng');
  I.waitForText('Tên kỹ năng không được để trống', 10);
  I.saveScreenshot('TC-TAL-09_Ten_ky_nang_trong.png');

  // Backend cũng phải chặn nếu bỏ qua validation phía client
  const response = await apiRequest(I, 'POST', '/talent/skills', {
    skillName: '',
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: 2.0,
  });
  expectBadRequest(response, 'Tên kỹ năng không được để trống', 'Backend: tên kỹ năng rỗng phải trả về 400', 'skillName');
});

Scenario('TC-TAL-10 - Tên kỹ năng quá dài (101 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  openSkillsTab(I);

  const response = await addSkillViaUI(I, { skillName: 'A'.repeat(101), years: 2 });

  expectBadRequest(response, 'Tên kỹ năng tối đa 100 ký tự', 'Tên kỹ năng 101 ký tự phải trả về 400', 'skillName');
  // Toast hiển thị lỗi chi tiết từ backend (axios.config chuẩn hoá lỗi field đầu tiên)
  I.waitForText('Tên kỹ năng tối đa 100 ký tự', 10);
  I.dontSeeElement(skillTag('A'.repeat(101)));
  I.saveScreenshot('TC-TAL-10_Ten_ky_nang_101_ky_tu.png');
});

Scenario('TC-TAL-11 - Thêm kỹ năng trùng tên đã có', async ({ I }) => {
  loginAsTalent(I);
  const skillName = 'Sketch';
  await cleanupSkillByName(I, skillName);

  // Pre-condition: hồ sơ đã có kỹ năng Sketch
  const setupRes = await apiRequest(I, 'POST', '/talent/skills', {
    skillName,
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: 1.5,
  });
  expectStatus(setupRes, 200, 'Setup skill Sketch thất bại');

  openProfilePage(I);
  openSkillsTab(I);
  I.waitForElement(skillTag(skillName), 10);

  const dupRes = await addSkillViaUI(I, { skillName, years: 1.5 });
  expectBadRequest(dupRes, 'Skill already exists: Sketch', 'Thêm kỹ năng trùng tên phải trả về 400');
  I.waitForText('Skill already exists: Sketch', 10);
  I.saveScreenshot('TC-TAL-11_Ky_nang_trung_ten.png');

  await cleanupSkillByName(I, skillName);
});

Scenario('TC-TAL-12 - Số năm kinh nghiệm là số âm (-0.1)', async ({ I }) => {
  await expectInvalidYearsRejected(
    I,
    -0.1,
    'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.0',
    'TC-TAL-12_Kinh_nghiem_am.png'
  );
});

Scenario('TC-TAL-13 - Số năm kinh nghiệm quá 50 năm (50.1)', async ({ I }) => {
  await expectInvalidYearsRejected(I, 50.1, 'Số năm kinh nghiệm tối đa là 50.0', 'TC-TAL-13_Kinh_nghiem_qua_50.png');
});

// =========================================================================
// 3. UPLOAD AVATAR & CV - VALIDATION & BVA (qua UI)
// =========================================================================

Scenario('TC-TAL-14 - Avatar vượt quá 5MB (5.1 MB)', async ({ I }) => {
  await expectInvalidAvatarRejected(
    I,
    FIXTURES.avatarLargeJpg,
    'image/jpeg',
    'Dung lượng ảnh đại diện vượt quá 5MB',
    'TC-TAL-14_Avatar_vuot_5MB.png'
  );
});

Scenario('TC-TAL-15 - Avatar sai định dạng (.txt)', async ({ I }) => {
  await expectInvalidAvatarRejected(
    I,
    FIXTURES.avatarTxt,
    'text/plain',
    'Định dạng ảnh không hỗ trợ, chỉ chấp nhận JPG/PNG',
    'TC-TAL-15_Avatar_sai_dinh_dang.png'
  );
});

Scenario('TC-TAL-16 - File CV vượt quá 20MB (20.1 MB)', async ({ I }) => {
  // multipart max-file-size = 25MB nên request tới được TalentService và bị chặn bằng 400
  await expectCvRejected(
    I,
    FIXTURES.cvLargePdf,
    'Dung lượng file CV vượt quá 20MB',
    'CV 20.1MB phải trả về 400',
    'TC-TAL-16_CV_vuot_20MB.png'
  );
});

// =========================================================================
// 4. THÊM / XÓA KỸ NĂNG HỢP LỆ & BVA KỸ NĂNG / KINH NGHIỆM (qua UI)
// =========================================================================

Scenario('TC-TAL-17 - Xóa kỹ năng khỏi hồ sơ', async ({ I }) => {
  loginAsTalent(I);
  const skillName = 'NodeJS_Temp_Delete';
  await cleanupSkillByName(I, skillName);

  // Pre-condition: tạo kỹ năng để có dữ liệu xóa (không hardcode ID)
  const createRes = await apiRequest(I, 'POST', '/talent/skills', {
    skillName,
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: 2.0,
  });
  expectStatus(createRes, 200, 'Tạo skill trước khi xóa thất bại');
  const skillId = parseJson(createRes).data?.id;
  assert.ok(skillId, 'Không lấy được ID của kỹ năng vừa tạo');

  openProfilePage(I);
  openSkillsTab(I);
  I.waitForElement(skillTag(skillName), 10);

  const deleteRes = await captureApi(I, 'DELETE', new RegExp(`/api/talent/skills/${skillId}$`), () =>
    I.click(`${skillTag(skillName)}//*[contains(@class,"ant-tag-close-icon")]`)
  );

  expectOk(deleteRes, /Skill removed successfully/, 'Xóa kỹ năng phải trả về 200');
  I.waitForText('Đã xóa kỹ năng', 10);
  I.waitForInvisible(skillTag(skillName), 10);
  I.saveScreenshot('TC-TAL-17_Xoa_ky_nang.png');
});

Scenario('TC-TAL-18 - Thêm kỹ năng mới với ID database không bị trùng', async ({ I }) => {
  loginAsTalent(I);
  const parsed = await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Q', years: 1 },
    'Thêm kỹ năng mới phải thành công và cấp ID mới',
    'TC-TAL-18_Them_ky_nang_moi.png'
  );
  assert.ok(parsed.data?.id > 0, 'ID sinh ra trong DB phải hợp lệ');
});

Scenario('TC-TAL-19 - Tên kỹ năng tại biên min (1 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'A', years: 2 },
    'Tên kỹ năng 1 ký tự (min) phải trả về 200',
    'TC-TAL-19_Ten_ky_nang_min.png'
  );
});

Scenario('TC-TAL-20 - Tên kỹ năng ngay trên min (2 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'AB', years: 2 },
    'Tên kỹ năng 2 ký tự (min+) phải trả về 200',
    'TC-TAL-20_Ten_ky_nang_min_plus.png'
  );
});

Scenario('TC-TAL-21 - Tên kỹ năng tại giá trị nominal (50 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'N'.repeat(50), years: 2 },
    'Tên kỹ năng 50 ký tự (nominal) phải trả về 200',
    'TC-TAL-21_Ten_ky_nang_nominal.png'
  );
});

Scenario('TC-TAL-22 - Tên kỹ năng ngay dưới max (99 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'M'.repeat(99), years: 2 },
    'Tên kỹ năng 99 ký tự (max-) phải trả về 200',
    'TC-TAL-22_Ten_ky_nang_max_minus.png'
  );
});

Scenario('TC-TAL-23 - Tên kỹ năng tại biên max (100 ký tự)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'X'.repeat(100), years: 2 },
    'Tên kỹ năng 100 ký tự (max) phải trả về 200',
    'TC-TAL-23_Ten_ky_nang_max.png'
  );
});

Scenario('TC-TAL-24 - Kinh nghiệm tại biên min (0.0)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Skill Exp 0', years: 0 },
    'Kinh nghiệm 0.0 năm (min) phải trả về 200',
    'TC-TAL-24_Kinh_nghiem_min.png'
  );
});

Scenario('TC-TAL-25 - Kinh nghiệm ngay trên min (0.1)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Skill Exp 01', years: 0.1 },
    'Kinh nghiệm 0.1 năm (min+) phải trả về 200',
    'TC-TAL-25_Kinh_nghiem_min_plus.png'
  );
});

Scenario('TC-TAL-26 - Kinh nghiệm tại giá trị nominal (25.0)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Skill Exp 25', years: 25 },
    'Kinh nghiệm 25.0 năm (nominal) phải trả về 200',
    'TC-TAL-26_Kinh_nghiem_nominal.png'
  );
});

Scenario('TC-TAL-27 - Kinh nghiệm ngay dưới max (49.9)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Skill Exp 499', years: 49.9 },
    'Kinh nghiệm 49.9 năm (max-) phải trả về 200',
    'TC-TAL-27_Kinh_nghiem_max_minus.png'
  );
});

Scenario('TC-TAL-28 - Kinh nghiệm tại biên max (50.0)', async ({ I }) => {
  loginAsTalent(I);
  await addValidSkillViaUIAndCleanup(
    I,
    { skillName: 'Skill Exp 50', years: 50 },
    'Kinh nghiệm 50.0 năm (max) phải trả về 200',
    'TC-TAL-28_Kinh_nghiem_max.png'
  );
});

// =========================================================================
// 5. UPLOAD AVATAR & CV HỢP LỆ + BIÊN MAX + SAI ĐỊNH DẠNG CV (qua UI)
// =========================================================================

Scenario('TC-TAL-29 - Upload Avatar hợp lệ (PNG 2.5 MB)', async ({ I }) => {
  loginAsTalent(I);
  const response = await uploadAvatarViaUI(I, FIXTURES.avatarValidPng);

  expectOk(response, /Avatar uploaded successfully/, 'Upload Avatar PNG 2.5MB phải trả về 200');
  I.waitForText('Tải lên ảnh đại diện thành công', 10);
  I.saveScreenshot('TC-TAL-29_Upload_avatar_hop_le.png');
});

Scenario('TC-TAL-30 - Upload CV hợp lệ (PDF 10.0 MB)', async ({ I }) => {
  await expectCvUploaded(
    I,
    FIXTURES.cvValidPdf,
    'Upload CV PDF 10MB phải trả về 200',
    'TC-TAL-30_Upload_CV_hop_le.png'
  );
});

Scenario('TC-TAL-31 - Avatar tại đúng giới hạn 5.0 MB', async ({ I }) => {
  loginAsTalent(I);
  const response = await uploadAvatarViaUI(I, FIXTURES.avatar5MbJpg);

  expectOk(response, /Avatar uploaded successfully/, 'Upload Avatar JPG đúng 5.0MB phải trả về 200');
  I.waitForText('Tải lên ảnh đại diện thành công', 10);
  I.saveScreenshot('TC-TAL-31_Avatar_dung_5MB.png');
});

Scenario('TC-TAL-32 - CV tại đúng giới hạn 20.0 MB', async ({ I }) => {
  await expectCvUploaded(
    I,
    FIXTURES.cv20MbPdf,
    'Upload CV PDF đúng 20.0MB phải trả về 200',
    'TC-TAL-32_CV_dung_20MB.png'
  );
});

Scenario('TC-TAL-33 - CV sai định dạng (.txt)', async ({ I }) => {
  await expectCvRejected(
    I,
    FIXTURES.cvTxt,
    'Định dạng file CV không hợp lệ, chỉ chấp nhận PDF, DOC, DOCX',
    'Upload CV sai định dạng .txt phải trả về 400',
    'TC-TAL-33_CV_sai_dinh_dang.png'
  );
});
