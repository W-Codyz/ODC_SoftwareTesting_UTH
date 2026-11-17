
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_REPORT_DIR = 'codecept-report';
const TEST_DIR = 'e2e-tests';
const NYC_OUTPUT = '.nyc_output';

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
const targetFile = fileFlag !== -1 ? args[fileFlag + 1] : null;

// Xóa thư mục nếu đã tồn tại
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Lấy tên các Scenario trong file test
function getScenarios(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const scenarios = [];

  const regex = /Scenario\s*\(\s*(['"`])([^'"`\r\n]+)\1/g;

  let match;

  while ((match = regex.exec(content)) !== null) {
    scenarios.push(match[2]);
  }

  return scenarios;
}

// Lấy tên Feature trong file test
function getFeature(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const match = content.match(
    /Feature\s*\(\s*(['"`])([^'"`\r\n]+)\1/
  );

  return match
    ? match[2]
    : path.basename(filePath, '_test.js');
}

// Chuyển tên thành dạng phù hợp để đặt tên thư mục
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Tìm tất cả file test trong thư mục
function findTestFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (item.name.endsWith('_test.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Chạy lệnh và trả về trạng thái thành công/thất bại
function run(cmd) {
  try {
    execSync(cmd, {
      stdio: 'inherit',
      shell: true
    });

    return true;
  } catch (e) {
    console.error(`Lệnh thất bại: ${cmd}`);
    return false;
  }
}

// Xử lý một file test và tạo báo cáo coverage
function processFile(file) {
  const feature = getFeature(file);
  const featureSlug = slugify(feature);
  const scenarios = getScenarios(file);

  console.log(`\nModule: ${feature}`);
  console.log(`Số Scenario: ${scenarios.length}`);

  if (scenarios.length === 0) {
    console.log('Không tìm thấy Scenario trong file test.');
    return;
  }

  // Xóa dữ liệu coverage cũ
  cleanDir(NYC_OUTPUT);

  // Chạy tất cả test trong file một lần
  console.log('\nĐang chạy tất cả test...\n');

  const success = run(`npx codeceptjs run --steps "${file}"`);

  // Kiểm tra thư mục coverage
  if (!fs.existsSync(NYC_OUTPUT)) {
    console.log('Không có thư mục dữ liệu coverage');
    return;
  }

  // Lấy danh sách file coverage
  const coverageFiles = fs
    .readdirSync(NYC_OUTPUT)
    .filter(file => file.endsWith('.json'));

  if (coverageFiles.length === 0) {
    console.log('Không có dữ liệu coverage');
    return;
  }

  // Không bỏ qua báo cáo chỉ vì có Scenario thất bại
  if (!success) {
    console.log(
      'Có Scenario thất bại. Tiếp tục tạo báo cáo từ dữ liệu coverage đã thu thập.'
    );
  }

  // Tạo báo cáo tổng hợp cho toàn bộ module
  console.log(`\nTạo báo cáo tổng hợp cho ${feature}...`);

  const moduleReportDir = path.join(
    BASE_REPORT_DIR,
    featureSlug,
    `report_${featureSlug}`
  );

  run(
    `npx nyc report --report-dir "${moduleReportDir}" --reporter=html --reporter=text`
  );

  console.log(`Báo cáo tổng hợp: ${moduleReportDir}/index.html\n`);

  // Tạo báo cáo riêng cho từng Scenario
  for (const scenario of scenarios) {
    const scenarioSlug = slugify(scenario);
    const reportDir = path.join(
      BASE_REPORT_DIR,
      featureSlug,
      scenarioSlug
    );

    // Tìm file coverage tương ứng với Scenario
    const matchFile = coverageFiles.find(file =>
      file.includes(scenarioSlug)
    );

    if (matchFile) {
      // Tạo thư mục tạm chứa riêng dữ liệu coverage của Scenario
      const tempDir = path.join(
        process.cwd(),
        '.nyc_output_temp'
      );

      cleanDir(tempDir);
      fs.mkdirSync(tempDir, { recursive: true });

      fs.copyFileSync(
        path.join(NYC_OUTPUT, matchFile),
        path.join(tempDir, matchFile)
      );

      // Tạo báo cáo riêng
      run(
        `npx nyc report --temp-dir "${tempDir}" --report-dir "${reportDir}" --reporter=html --reporter=text`
      );

      cleanDir(tempDir);

      console.log(`  ${scenario}`);
      console.log(`  Báo cáo: ${reportDir}/index.html\n`);
    } else {
      console.log(
        `  ${scenario} - không tìm thấy dữ liệu coverage\n`
      );
    }
  }
}

// Chạy theo file cụ thể hoặc tất cả file test
if (targetFile) {
  if (!fs.existsSync(targetFile)) {
    console.log(`Không tìm thấy file: ${targetFile}`);
    process.exit(1);
  }

  processFile(targetFile);
} else {
  const testFiles = findTestFiles(TEST_DIR);

  if (testFiles.length === 0) {
    console.log('Không tìm thấy file test nào trong ' + TEST_DIR);
    process.exit(1);
  }

  console.log(`\nTìm thấy ${testFiles.length} file test\n`);
  console.log('='.repeat(60));

  for (const file of testFiles) {
    processFile(file);
  }
}

console.log('\n' + '='.repeat(60));
console.log('Hoàn tất!');
