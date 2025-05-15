import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { addRowsToOds } from './services/sheetsHelper';
import { sleep, getInfoUsers, searchUser } from './utils';

(async () => {
  const userDataDir = './user-data';  

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.familysearch.org/pt/search/', { waitUntil: 'domcontentloaded' });
  
    const aceitarSelector = '#truste-consent-button';
    await page.waitForSelector(aceitarSelector, { timeout: 5000 });
    await page.click(aceitarSelector);
    await sleep(500);
  
    const entrarSelector = '#signInLink';
    await page.waitForSelector(entrarSelector, { state: 'visible' });
    await page.click(entrarSelector);
    await sleep(1000);
  
    await page.waitForSelector('#userName', { state: 'visible' });
    await page.fill('#userName', 'joaovictorgit');
    await page.waitForSelector('#password', { state: 'visible' });
    await page.fill('#password', '8bjSPkaz@yVUT25');

    const loginButton = '#login';
    await page.waitForSelector(loginButton, { state: 'visible' });
    await page.click(loginButton);
    await sleep(1000);

    await searchUser(page);

    await sleep(5000);

    const result = await getInfoUsers(page);

    await sleep(2000);

    const filePath = '/home/joao/Downloads/teste.ods';

    addRowsToOds(filePath, result, null, true);

  } catch (error) {
    console.error(error);
  } finally {
    await context.close();

    fs.rmSync(path.resolve(userDataDir), { recursive: true, force: true });
    console.log('Removido');
  }

})();