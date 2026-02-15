const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // Navigate to the page
  await page.goto('http://localhost:8080/', {
    waitUntil: 'networkidle'
  });

  // Create screenshots directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  const screenshotsDir = '/Users/steve/Downloads/files/hoxy-number/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Take viewport screenshot (1440x900)
  await page.screenshot({
    path: path.join(screenshotsDir, 'pc-check.png')
  });

  // Take full page screenshot
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const fullPagePath = path.join(screenshotsDir, 'pc-check-fullpage.png');
  await page.screenshot({
    path: fullPagePath,
    fullPage: true
  });

  console.log('Screenshots saved:');
  console.log('- Viewport (1440x900): ' + path.join(screenshotsDir, 'pc-check.png'));
  console.log('- Full page: ' + fullPagePath);
  console.log('- Page full height: ' + fullHeight + 'px');

  await browser.close();
})();
