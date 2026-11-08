const Helper = require('@codeceptjs/helper');
const fs = require('fs');
const path = require('path');

class CoverageHelper extends Helper {

  _before() {
    this.currentTest = null;
  }

  _test(test) {
    this.currentTest = test.title;
  }

  async _after() {
    const page = this.helpers['Playwright'].page;
    if (!page) return;

    try {
      const coverage = await page.evaluate(() => {
        return window.__coverage__ || null;
      });

      if (coverage) {
        const outputDir = path.join(process.cwd(), '.nyc_output');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const testName = this.currentTest
          ? this.currentTest.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
          : 'unknown';

        const fileName = `coverage-${testName}.json`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(coverage));
        console.log(`Coverage data saved: ${fileName}`);
      }
    } catch (error) {
      console.log('Could not collect coverage:', error.message);
    }
  }
}

module.exports = CoverageHelper;