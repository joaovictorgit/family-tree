import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

const sleep = (ms: number) => new Promise((res: any) => setTimeout(res, ms));

const searchUser = async (page: Page) => {
  const moreOptionsButtonSelector = 'button[data-testid="moreOptions-button"]';
  await page.waitForSelector(moreOptionsButtonSelector, { state: 'visible' });
  await page.click(moreOptionsButtonSelector);
  await sleep(500);

  await page.waitForSelector('#givenName', { state: 'visible' });
  await page.fill('#givenName', 'Salvador');
  await page.waitForSelector('#surname', { state: 'visible' });
  await page.fill('#surname', 'Baena');

  const removeEventButtonSelector = 'button[aria-label="Remove Event"]';
  await page.waitForSelector(removeEventButtonSelector, { state: 'visible' });
  await page.click(removeEventButtonSelector);
  await sleep(500); 

  const birthButtonSelector = 'button[data-testid="birthLike-fieldGroupButton"]';
  await page.waitForSelector(birthButtonSelector, { state: 'visible' });
  await page.click(birthButtonSelector);
  await sleep(500);

  const birthPlaceInput = 'input[data-testid="birthLikePlace0-field"]';
  await page.waitForSelector(birthPlaceInput, { state: 'visible' });
  await page.fill(birthPlaceInput, 'Espanha');
  
  await page.waitForFunction(() => {
    const el = document.querySelector('input[data-testid="birthLikePlace0-field"]');
    return el?.getAttribute('aria-expanded') === 'true';
  }, { timeout: 5000 });

  await page.keyboard.press('Enter');

  const birthYearInput = 'input[aria-label="Ano de nascimento (de)"]';
  await page.waitForSelector(birthYearInput, { state: 'visible' });
  await page.fill(birthYearInput, '1882');

  const birthYearToInput = 'input[aria-label="Ano de nascimento (até)"]';
  await page.waitForSelector(birthYearToInput, { state: 'visible' });
  await page.fill(birthYearToInput, '1884');

  // Marcar checkbox "Exata"
  const exactCheckbox = 'input[data-testid="q_birthLikeDate_exact"]';
  await page.waitForSelector(exactCheckbox, { state: 'visible' });

  // Clicar apenas se ainda não estiver marcado
  const isCheckedDate = await page.isChecked(exactCheckbox);
  if (!isCheckedDate) {
    await page.click(exactCheckbox);
  }

  
  const exactSearchSwitch = 'div[role="switch"][aria-label="Show Exact Search"]';
  await page.waitForSelector(exactSearchSwitch, { state: 'visible' });

  // Verificar se já está ativado, se não, clicar
  const isChecked = await page.getAttribute(exactSearchSwitch, 'aria-checked');
  if (isChecked === 'false') {
    await page.click(exactSearchSwitch);
    await sleep(300); // espera curta para o estado atualizar
  }

  // Clicar no botão "Pesquisar"
  const searchButton = 'button[data-testid="search-button"]';
  await page.waitForSelector(searchButton, { state: 'visible' });
  await page.click(searchButton);

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