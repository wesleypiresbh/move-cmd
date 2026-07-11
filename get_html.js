const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/MOVECMDSYS/Move-CMD-motorista');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.type('input[type="email"]', 'testdriver2@movecms.com');
  await page.type('input[type="password"]', '123456');
  
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const content = await page.content();
  console.log(content.substring(content.indexOf('<body>'), content.indexOf('</body>') + 7));
  
  await browser.close();
})();
