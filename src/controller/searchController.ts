import { Request, Response } from 'express';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { getInfoUsers, searchUser, sleep } from '../utils';
import { addRowsToOds } from '../services/sheetsHelper';

dotenv.config();

const username = process.env.FAMILYSEARCH_USER;
const password = process.env.FAMILYSEARCH_PASS;
const cookiesPath = 'cookies.json';

class SearchController {
  searchUsers = async (req: Request, res: Response): Promise<any> => {
    const { 
      givenName,
      surName,
      startDate,
      endDate,
      location,
      pathSheet
    } = req.body as {
      givenName: string;
      surName: string;
      startDate: string;
      endDate: string;
      location: string;
      pathSheet: string;
    };

    if (
      !givenName?.trim() ||
      !surName?.trim() ||
      !startDate?.trim() ||
      !endDate?.trim() ||
      !location?.trim() ||
      !pathSheet?.trim()
    ) {
      return res.status(400).json('Preencha os campos obrigatórios');
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    try {
      await page.goto('https://www.familysearch.org/pt/search/', { waitUntil: 'domcontentloaded' });

      await sleep(2000);

      const aceitarSelector = '#truste-consent-button';
      await page.waitForSelector(aceitarSelector, { timeout: 10000 });
      await page.click(aceitarSelector);
      await sleep(500);

      const cookies = await context.cookies();
      fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('Cookies salvos em cookies.json');

      const entrarSelector = '#signInLink';
      await page.waitForSelector(entrarSelector, { state: 'visible' });
      await page.click(entrarSelector);
      await sleep(1000);

      await page.waitForSelector('#userName', { state: 'visible' });
      await page.fill('#userName', username as string);
      await page.waitForSelector('#password', { state: 'visible' });
      await page.fill('#password', password as string);

      const loginButton = '#login';
      await page.waitForSelector(loginButton, { state: 'visible' });
      await page.click(loginButton);
      await sleep(1000);

      await searchUser(page, givenName, surName, startDate, endDate, location);
      await sleep(5000);

      const result = await getInfoUsers(page);
      await sleep(2000);

      await addRowsToOds(pathSheet, result, null, true);

      return res.status(201).json('Dados inseridos na planilha!');
    } catch (error) {
      console.error(error);
      return res.status(500).json('Erro ao processar a requisição');
    } finally {
      await context.close();
      if (fs.existsSync(cookiesPath)) {
        fs.unlinkSync(cookiesPath);
        console.log('Arquivo cookies.json removido');
      }
    }
  };
}

export default SearchController;
