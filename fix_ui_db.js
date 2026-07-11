const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/MOVECMDSYS/Move-CMD-Admin');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.type('input[type="email"]', 'masteradmin@movecms.com');
  await page.type('input[type="password"]', 'casabranca');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const success = await page.evaluate(async () => {
    return new Promise((resolve) => {
      // Find the toggleUserStatus or manually do it
      const firestore = window.__FIREBASE_FIRESTORE__ || window._db; // we don't have global DB export
      resolve('We need to export db to window first');
    });
  });
  console.log(success);
  
  await browser.close();
})();
