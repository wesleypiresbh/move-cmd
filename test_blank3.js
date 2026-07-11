const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080/MOVECMDSYS/Move-CMD-motorista');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.type('input[type="email"]', 'testdriver2@movecms.com');
  await page.type('input[type="password"]', '123456');
  
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 8000));
  
  await browser.close();
})();
