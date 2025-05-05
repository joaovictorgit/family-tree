import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

const sleep = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

const searchUser = async (page: Page) => {
  await page.waitForSelector('#givenName', { state: 'visible' });
  await page.fill('#givenName', 'Salvador');
  await page.waitForSelector('#surname', { state: 'visible' });
  await page.fill('#surname', 'Baena');
  await page.waitForSelector('#anyDate_from', { state: 'visible' });
  await page.fill('#anyDate_from', '1882');

  await page.waitForSelector('#anyPlace', { state: 'visible' });
  await page.fill('#anyPlace', 'Espanha');
  await sleep(1000);
  
  await page.keyboard.press('Enter');
}

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

    searchUser(page);

  } catch (error) {
    console.error(error);
  } finally {
    //await context.close();

    fs.rmSync(path.resolve(userDataDir), { recursive: true, force: true });
    console.log('Removido');
  }

})();