const enterpriseEmail = 'hello@digitalstartup.vn';
const enterprisePassword =  '123123';

Feature('FR-ENT-002 - Enterprise Submit Project Proposal');

// === Helpers ===

function loginAsEnterprise(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', enterpriseEmail);
  I.fillField('Mật khẩu', enterprisePassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

function openProjectManagement(I) {
  I.amOnPage('/enterprise/projects');
  I.waitForText('Tạo dự án mới', 10);
}

function openCreateModal(I) {
  I.click('Tạo dự án mới');
  I.waitForText('Tên dự án', 5);
}

function fillDate(I, index, dateStr) {
  // Scope vào đúng modal "Tạo dự án mới" (Ant không destroy modal khi đóng).
  // Nhắm trực tiếp <input> bên trong <.ant-picker> (không phụ thuộc placeholder/locale).
  const xpath = `(//div[contains(@class,"ant-modal")][.//div[contains(@class,"ant-modal-title") and normalize-space()="Tạo dự án mới"]]//div[contains(@class,"ant-picker")]//input)[${index}]`;
  I.waitForElement({ xpath }, 5);
  I.click({ xpath });
  I.wait(0.3);
  I.fillField({ xpath }, dateStr);
  I.pressKey('Enter');
  I.wait(0.3);
}

// Tôn trọng thứ tự key trong object literal (quan trọng cho TC-16/TC-24:
// cần fill endDate TRƯỚC startDate để bypass disabledDate rồi để validator catch).
function fillCreateForm(I, data) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === 'name') I.fillField('Tên dự án', value);
    else if (key === 'description') I.fillField('Mô tả', value);
    else if (key === 'startDate') fillDate(I, 1, value);
    else if (key === 'endDate') fillDate(I, 2, value);
    else if (key === 'budget') I.fillField('Ngân sách (VND)', String(value));
    else if (key === 'requiredTalents') I.fillField('Số lượng sinh viên', String(value));
  }
}

function submitCreate(I) {
  // Button "Tạo" trong footer của modal (phân biệt với "Tạo dự án mới" bên ngoài).
  I.click({ xpath: '//div[contains(@class,"ant-modal-footer")]//button//span[normalize-space()="Tạo"]' });
}

// === 5.1 Happy Path ===

Scenario('TC-ENT-01 - Enterprise tạo dự án thành công - happy path', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án AI Chatbot cho UTH',
    description: 'Xây dựng hệ thống chatbot',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // V-RL1, V-NM1, V-DS1, V-SD1, V-ED1, V-BG1, V-RT1, V-TK1, B-BG3, B-DT4, ST-01, R1
  I.waitForText('Tạo dự án thành công', 10);
  I.see('Tạo dự án thành công');
});

// === 5.4 Name không hợp lệ ===

Scenario('TC-ENT-10 - Name rỗng (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    description: 'Mô tả test',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-NM1, ST-03, R5 → FE Ant rule: required name
  I.waitForText('Vui lòng nhập tên dự án', 5);
  I.see('Vui lòng nhập tên dự án');
});

// === 5.5 Description không hợp lệ ===

Scenario('TC-ENT-12 - Description rỗng (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Test',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-DS1, ST-03, R6 → FE Ant rule: required description
  I.waitForText('Vui lòng nhập mô tả', 5);
  I.see('Vui lòng nhập mô tả');
});

// === 5.6 Date không hợp lệ ===

Scenario('TC-ENT-14 - StartDate null (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Test',
    description: 'Mô tả test',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-SD1, ST-03, R7 → FE Ant rule: "Chọn ngày bắt đầu"
  I.waitForText('Chọn ngày bắt đầu', 5);
  I.see('Chọn ngày bắt đầu');
});

Scenario('TC-ENT-15 - EndDate null (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Test',
    description: 'Mô tả test',
    startDate: '2027-01-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-ED1, ST-03, R7 → FE Ant rule: "Chọn ngày kết thúc"
  I.waitForText('Chọn ngày kết thúc', 5);
  I.see('Chọn ngày kết thúc');
});

Scenario('TC-ENT-16 - StartDate sau EndDate (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  // disabledDate chặn chọn endDate <= startDate. Ta nhập ngược (endDate trước, startDate sau)
  // qua .type() để bypass disabledDate, sau đó submit để FE validator (isAfter) catch.
  fillCreateForm(I, {
    name: 'Dự án Test',
    description: 'Mô tả test',
    endDate: '2027-01-15',
    startDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-ED2, B-DT3, ST-03, R8 → FE custom validator
  I.waitForText('Ngày kết thúc phải sau ngày bắt đầu', 5);
  I.see('Ngày kết thúc phải sau ngày bắt đầu');
});

// === 5.7 Budget không hợp lệ ===

Scenario('TC-ENT-18 - Budget null (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Test',
    description: 'Mô tả test',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    requiredTalents: 3,
  });
  submitCreate(I);
  // X-BG1, ST-03, R7 → FE Ant rule: "Nhập ngân sách"
  I.waitForText('Nhập ngân sách', 5);
  I.see('Nhập ngân sách');
});

// === 5.8 RequiredTalents không hợp lệ ===

Scenario('TC-ENT-19 - RequiredTalents null (single fault)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Test',
    description: 'Mô tả test',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
  });
  submitCreate(I);
  // X-RT1, ST-03, R7 → FE Ant rule: "Nhập số lượng sinh viên"
  I.waitForText('Nhập số lượng sinh viên', 5);
  I.see('Nhập số lượng sinh viên');
});

// === 5.9 BVA ===

Scenario('TC-ENT-22 - RequiredTalents = 1 (BVA min boundary)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án BVA Min',
    description: 'Test boundary min',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 1,
  });
  submitCreate(I);
  // V-RL1, V-NM1, V-DS1, B-RT2, ST-01, R1
  I.waitForText('Tạo dự án thành công', 10);
  I.see('Tạo dự án thành công');
});

Scenario('TC-ENT-23 - RequiredTalents = 2 (BVA min+)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án BVA Min Plus',
    description: 'Test boundary min+',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 10000000,
    requiredTalents: 2,
  });
  submitCreate(I);
  // V-RL1, B-RT3, ST-01, R1
  I.waitForText('Tạo dự án thành công', 10);
  I.see('Tạo dự án thành công');
});

// TC-ENT-24: StartDate = EndDate — FE validator yêu cầu isAfter() (strict) nên sẽ reject.
// Khác với API (chấp nhận bằng nhau). Via UI expected là FE error, không tạo được.
Scenario('TC-ENT-24 - StartDate = EndDate (FE strict validator, UI reject)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  // Fill endDate TRƯỚC (chưa có startDate → disabledDate không chặn),
  // rồi startDate sau → FE validator (isAfter, strict) catch khi submit.
  fillCreateForm(I, {
    name: 'Dự án Same Date',
    description: 'Test same date',
    endDate: '2027-03-01',
    startDate: '2027-03-01',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // V-RL1, B-DT1 → FE isAfter strict → "Ngày kết thúc phải sau ngày bắt đầu"
  // (API cho phép bằng nhau nhưng FE chặn)
  I.waitForText('Ngày kết thúc phải sau ngày bắt đầu', 5);
  I.see('Ngày kết thúc phải sau ngày bắt đầu');
});

Scenario('TC-ENT-25 - StartDate = EndDate - 1 ngày (BVA)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Min Duration',
    description: 'Test min duration',
    startDate: '2027-02-28',
    endDate: '2027-03-01',
    budget: 10000000,
    requiredTalents: 3,
  });
  submitCreate(I);
  // V-RL1, B-DT2, ST-01, R1
  I.waitForText('Tạo dự án thành công', 10);
  I.see('Tạo dự án thành công');
});

Scenario('TC-ENT-26 - Budget = 0 (backend @Min(1) reject)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Zero Budget',
    description: 'Test zero budget',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 0,
    requiredTalents: 3,
  });
  submitCreate(I);
  // V-RL1, X-BG3, B-BG1, ST-03 → FE InputNumber cho phép 0, backend trả Validation failed
  // Toast hiển thị message từ API (err?.message).
  I.waitForText('Validation failed', 10);
  I.see('Validation failed');
});

// TC-ENT-27: Budget = -1 — InputNumber min={0} tự clamp về 0, không gửi được -1 qua UI.
xScenario('TC-ENT-27 - Budget = -1 (API-only, InputNumber min=0 clamp về 0)', () => {});

Scenario('TC-ENT-28 - Budget = 1 (BVA min+)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  openCreateModal(I);
  fillCreateForm(I, {
    name: 'Dự án Min Budget',
    description: 'Test min budget',
    startDate: '2027-01-15',
    endDate: '2027-06-15',
    budget: 1,
    requiredTalents: 3,
  });
  submitCreate(I);
  // V-RL1, B-BG2, ST-01, R1
  I.waitForText('Tạo dự án thành công', 10);
  I.see('Tạo dự án thành công');
});

// === 5.10 GET danh sách dự án ===

Scenario('TC-ENT-29 - Lấy danh sách tất cả dự án', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  // V-TK1, V-ST1, ST-05 → trang load thành công, dropdown filter default "Tất cả"
  I.see('Tất cả');
  I.see('Tạo dự án mới');
});

Scenario('TC-ENT-30 - Lấy danh sách theo status Chờ duyệt (PENDING_VALIDATION)', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  // V-TK1, V-ST2, ST-05 → click dropdown filter
  I.click({ css: '.ant-select-selector' });
  I.waitForText('Chờ duyệt', 5);
  I.click('Chờ duyệt');
  I.wait(1);
  // Các card còn lại (nếu có) đều hiển thị tag "Chờ duyệt"
  I.see('Chờ duyệt');
});

// TC-ENT-31: status UNKNOWN - dropdown chỉ có "Tất cả"/"Chờ duyệt", không thể truyền UNKNOWN qua UI.
xScenario('TC-ENT-31 - Status UNKNOWN (API-only, dropdown không expose)', () => {});

// === 5.11 GET chi tiết dự án ===

Scenario('TC-ENT-32 - Lấy chi tiết dự án hợp lệ (click "Chi tiết")', ({ I }) => {
  loginAsEnterprise(I);
  openProjectManagement(I);
  // V-TK1, V-PID1, ST-04 → danh sách load async, chờ card có xuất hiện (NGÂN SÁCH hiển thị trong card)
  I.waitForText('NGÂN SÁCH', 20);
  I.waitForText('Chi tiết', 10);
  // Click đúng button "Chi tiết" (Ant Button type="link")
  I.click({ xpath: '(//button[contains(@class,"ant-btn-link")]//span[normalize-space()="Chi tiết"])[1]' });
  I.waitForText('Chi tiết dự án', 10);
  I.see('Chi tiết dự án');
  I.see('Bắt đầu');
  I.see('Kết thúc');
});