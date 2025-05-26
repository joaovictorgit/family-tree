import { Page } from "playwright";

export const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

export const searchUser = async (
  page: Page,
  givenName: string,
  surName: string,
  startDate: string,
  endDate: string,
  location: string,
) => {
  const moreOptionsButtonSelector = 'button[data-testid="moreOptions-button"]';
  await page.waitForSelector(moreOptionsButtonSelector, { state: 'visible' });
  await page.click(moreOptionsButtonSelector);
  await sleep(500);

  await page.waitForSelector('#givenName', { state: 'visible' });
  await page.fill('#givenName', givenName);
  await page.waitForSelector('#surname', { state: 'visible' });
  await page.fill('#surname', surName);

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
  await page.fill(birthPlaceInput, location);
  
  await page.waitForFunction(() => {
    const el = document.querySelector('input[data-testid="birthLikePlace0-field"]');
    return el?.getAttribute('aria-expanded') === 'true';
  }, { timeout: 5000 });

  await page.keyboard.press('Enter');

  const birthYearInput = 'input[aria-label="Ano de nascimento (de)"]';
  await page.waitForSelector(birthYearInput, { state: 'visible' });
  await page.fill(birthYearInput, startDate);

  const birthYearToInput = 'input[aria-label="Ano de nascimento (até)"]';
  await page.waitForSelector(birthYearToInput, { state: 'visible' });
  await page.fill(birthYearToInput, endDate);

  const exactCheckbox = 'input[data-testid="q_birthLikeDate_exact"]';
  await page.waitForSelector(exactCheckbox, { state: 'visible' });

  const isCheckedDate = await page.isChecked(exactCheckbox);
  if (!isCheckedDate) {
    await page.click(exactCheckbox);
  }

  const exactSearchSwitch = 'div[role="switch"][aria-label="Show Exact Search"]';
  await page.waitForSelector(exactSearchSwitch, { state: 'visible' });

  const isChecked = await page.getAttribute(exactSearchSwitch, 'aria-checked');
  if (isChecked === 'false') {
    await page.click(exactSearchSwitch);
    await sleep(300);
  }

  const searchButton = 'button[data-testid="search-button"]';
  await page.waitForSelector(searchButton, { state: 'visible' });
  await page.click(searchButton);

}

export const getInfoUsers = async (page: Page) => {
  await page.waitForSelector('table');

  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tbody tr');
    const results: any[] = [];

    rows.forEach(row => {
      const nomeEl: any = row.querySelector('td h2 a');
      const eventosEl = row.querySelectorAll('td:nth-child(2) > div');

      const nome = nomeEl ? nomeEl.innerText.trim() : null;
      let batismo = null;
      let nascimento = null;
      let pais = null;

      eventosEl.forEach((evento: any) => {
        const texto = evento.innerText;

        if (texto.includes('Batizado')) {
          batismo = texto.replace('Batizado', '').trim();
        }

        if (texto.includes('Nascimento')) {
          nascimento = texto.replace('Nascimento', '').trim();
        }

        if (texto.includes('Pais')) {
          pais = texto.replace('Pais', '').trim();
        }
      });

      results.push({ nome, batismo, nascimento, pais });
    });

    return results;
  });

  return data;
};
