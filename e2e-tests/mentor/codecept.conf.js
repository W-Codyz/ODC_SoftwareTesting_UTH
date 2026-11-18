const path = require('path');
const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

exports.config = {
  tests: './task_breakdown_ui_test.js',
  output: '../../manh_e2e_json_ui',
  reporter: 'json',
  reporterOptions: {
    output: path.resolve(__dirname, '../../manh_e2e_json_ui/result.json'),
  },
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:3000',
      show: true,
      restart: true,
      keepBrowserState: false,
      waitForNavigation: 'networkidle',
      waitForTimeout: 10000,
    },
  },
  include: { I: './steps_file.js' },
  plugins: {
    screenshotOnFail: { enabled: false },
  },
  name: 'manh-e2e-fr-men-002-ui',
};
