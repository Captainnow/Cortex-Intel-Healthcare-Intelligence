const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
  
  console.log('Taking screenshot of dashboard...');
  await page.screenshot({ path: '../assets/new-dashboard.png' });

  // Let's also take one for FDA alerts if we can click the tab.
  // We can just rely on the main dashboard for now since it was redesigned.
  
  console.log('Screenshots saved.');
  await browser.close();
})();
