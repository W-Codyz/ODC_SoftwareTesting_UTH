const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

exports.config = {
  tests: './e2e-tests/**/*_test.js',
  output: './e2e-output',
  helpers: {
    CoverageHelper: {
      require: './e2e-tests/coverage_helper.js'
    },
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:3000',
      show: true,
      restart: true,
      keepBrowserState: false,
      waitForNavigation: 'networkidle',
      waitForTimeout: 10000
    }
  },
  include: {
    I: './steps_file.js'
  },
  name: 'odc-e2e-tests'
};