import percySnapshot from '@percy/puppeteer';

describe('Ids Radio e2e Tests', () => {
  const url = 'http://localhost:4444/ids-radio';

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
  });

  it('should not have errors', async () => {
    await expect(page.title()).resolves.toMatch('IDS Radio Component');
  });

  it('should pass Axe accessibility tests', async () => {
    page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto(url, { waitUntil: 'load' });
    await expect(page).toPassAxeTests({ disabledRules: ['color-contrast', 'aria-allowed-attr'] });
  });

  it('should not have visual regressions (percy)', async () => {
    page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto(url, { waitUntil: 'load' });
    await percySnapshot(page, 'ids-radio');
  });
});
