const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_REPORT_DIR = 'codecept-report';
const TEST_DIR = 'e2e-tests';
const NYC_OUTPUT = '.nyc_output';

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
const targetFile = fileFlag !== -1 ? args[fileFlag + 1] : null;

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function getScenarios(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const scenarios = [];
  const regex = /Scenario\(['"`](.+?)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    scenarios.push(match[1]);
  }
  return scenarios;
}

function getFeature(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/Feature\(['"`](.+?)['"`]/);
  return match ? match[1] : path.basename(filePath, '_test.js');
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    return true;
  } catch (e) {
    console.error(`Lệnh thất bại: ${cmd}`);
    return false;
  }
}

function processFile(file) {
  const feature = getFeature(file);
  const featureSlug = slugify(feature);
  const scenarios = getScenarios(file);

  console.log(`\nModule: ${feature}`);
  console.log(`Số Scenario: ${scenarios.length}`);

  // Xóa dữ liệu coverage cũ
  cleanDir(NYC_OUTPUT);

  // Chạy tất cả test trong file 1 lần duy nhất
  console.log(`\nĐang chạy tất cả test...\n`);
  const success = run(`npx codeceptjs run --steps ${file}`);

  if (!success || !fs.existsSync(NYC_OUTPUT)) {
    console.log('Không có dữ liệu coverage');
    return;
  }

  // Đọc tất cả file coverage đã tạo
  const coverageFiles = fs.readdirSync(NYC_OUTPUT).filter(f => f.endsWith('.json'));

  // Tạo báo cáo tổng hợp module (dùng tất cả file coverage)
  console.log(`\nTạo báo cáo tổng hợp cho ${feature}...`);
  const moduleReportDir = path.join(BASE_REPORT_DIR, featureSlug, `report_${featureSlug}`);
  run(`npx nyc report --report-dir "${moduleReportDir}" --reporter=html --reporter=text`);
  console.log(`  Báo cáo tổng hợp: ${moduleReportDir}/index.html\n`);

  // Tạo báo cáo riêng cho từng Scenario
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    const scenarioSlug = slugify(scenario);
    const reportDir = path.join(BASE_REPORT_DIR, featureSlug, scenarioSlug);

    // Tìm file coverage tương ứng với Scenario này
    const matchFile = coverageFiles.find(f => f.includes(scenarioSlug));

    if (matchFile) {
      // Tạo thư mục tạm chỉ chứa 1 file coverage
      const tempDir = path.join(process.cwd(), '.nyc_output_temp');
      cleanDir(tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
      fs.copyFileSync(
        path.join(NYC_OUTPUT, matchFile),
        path.join(tempDir, matchFile)
      );

      run(`npx nyc report --temp-dir "${tempDir}" --report-dir "${reportDir}" --reporter=html --reporter=text`);
      cleanDir(tempDir);

      console.log(`  ${scenario}`);
      console.log(`  Báo cáo: ${reportDir}/index.html\n`);
    } else {
      console.log(`  ${scenario} - không tìm thấy dữ liệu coverage\n`);
    }
  }
}

// Chạy theo file cụ thể hoặc tất cả
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