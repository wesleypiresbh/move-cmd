const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:8080/MOVECMDSYS/Move-CMD-motorista');
  await page.waitForSelector('button', { timeout: 10000 });
  
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Criar conta')) {
      await b.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('input[placeholder="Seu nome"]', 'Novo Motorista');
  await page.type('input[placeholder="seu@email.com"]', 'novo@motorista.com');
  await page.type('input[placeholder="(31) 99999-9999"]', '31999999999');
  await page.type('input[placeholder="Número da CNH"]', '12345678901');
  await page.type('input[placeholder="Sua senha secreta"]', '123456');
  
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 5000));
  
  const content = await page.content();
  if (content.includes('Cadastro realizado com sucesso')) {
    console.log('SUCCESS');
  } else {
    console.log('FAILED');
  }
  
  await browser.close();
})();
