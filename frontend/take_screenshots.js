const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.screenshot({ path: '../assets/landing-page.png' });
  
  console.log('Navigating to Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.screenshot({ path: '../assets/new-dashboard.png' });

  console.log('Screenshots saved to assets folder.');
  await browser.close();
})();
