import { chromium } from 'playwright';

const sleep = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

(async () => {
  const userDataDir = './user-data';  

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  await page.goto('https://www.familysearch.org/pt/search/', { waitUntil: 'domcontentloaded' });

  const aceitarSelector = '#truste-consent-button';
  await page.waitForSelector(aceitarSelector, { timeout: 5000 });
  await page.click(aceitarSelector);
  await sleep(500);

  const entrarSelector = '#signInLink';
  await page.waitForSelector(entrarSelector, { state: 'visible' });
  await page.click(entrarSelector);

})();