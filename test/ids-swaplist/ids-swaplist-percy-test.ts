import percySnapshot from '@percy/puppeteer';

describe('Ids Swap List Percy Tests', () => {
  const url = 'http://localhost:4444/ids-swaplist/example.html';

  it('should not have visual regressions in new light theme (percy)', async () => {
    await page.goto(url, { waitUntil: ['networkidle2', 'load'] });
    await page.waitForSelector('pierce/ids-swappable-item');
    await percySnapshot(page, 'ids-swaplist-new-light');
  });

  it('should not have visual regressions in new dark theme (percy)', async () => {
    await page.goto(url, { waitUntil: ['networkidle2', 'load'] });
    await page.evaluate(() => {
      document.querySelector('ids-theme-switcher')?.setAttribute('mode', 'dark');
    });
    await page.waitForSelector('pierce/ids-swappable-item');
    await percySnapshot(page, 'ids-swaplist-new-dark');
  });

  it('should not have visual regressions in new contrast theme (percy)', async () => {
    await page.goto(url, { waitUntil: ['networkidle2', 'load'] });
    await page.evaluate(() => {
      document.querySelector('ids-theme-switcher')?.setAttribute('mode', 'contrast');
    });
    await page.waitForSelector('pierce/ids-swappable-item');
    await percySnapshot(page, 'ids-swaplist-new-contrast');
  });
});
