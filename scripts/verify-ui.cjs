
const { chromium } = require('/home/akihira17/.dsh/dsh-kanban-agent/node_modules/playwright-core');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3100';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/akihira17/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
    headless: true,
  });
  const paths = ['/', '/learn', '/learn/les-kana-hiragana-basic', '/dictionary', '/dictionary/collections', '/pronunciation', '/kana', '/vocabulary', '/kanji', '/grammar', '/grammar/g-desu', '/reading', '/reading/r-n5-1', '/listening', '/listening/l-n5-1', '/listening/practice', '/practice', '/games', '/exams', '/exams/session', '/exams/result', '/culture', '/culture/c-tradisi-1', '/audio', '/writing', '/writing/writing-kanji-%E6%97%A5', '/stories', '/stories/story-eki-hajimete', '/typing', '/conversation', '/conversation/conv-salam', '/plan', '/progress', '/settings'];
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', locale: 'id-ID' });
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console ' + msg.text()); });
  page.on('pageerror', (err) => errors.push('pageerror ' + err.message));
  for (const path of paths) {
    const response = await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const status = response ? response.status() : 0;
    const heading = await page.locator('h1').first().textContent().catch(() => null);
    console.log(path, status, JSON.stringify((heading || '').trim().slice(0, 60)));
    if (['/', '/learn', '/dictionary', '/pronunciation', '/kana', '/vocabulary', '/grammar/g-desu', '/exams', '/culture/c-tradisi-1', '/progress', '/settings'].includes(path)) {
      await page.screenshot({ path: '.screenshots/kotoba' + path.replace(/\//g, '_') + '.png', fullPage: true });
    }
  }
  // Dark theme dashboard.
  const dark = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', locale: 'id-ID' });
  const darkPage = await dark.newPage();
  await darkPage.goto(BASE + '/', { waitUntil: 'networkidle' });
  await darkPage.screenshot({ path: '.screenshots/kotoba_dark_dashboard.png', fullPage: true });
  // Mobile dashboard and kana chart.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light', locale: 'id-ID', isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(BASE + '/', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: '.screenshots/kotoba_mobile_dashboard.png', fullPage: true });
  await mobilePage.goto(BASE + '/learn', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: '.screenshots/kotoba_mobile_learn.png', fullPage: true });
  await mobilePage.goto(BASE + '/dictionary', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: '.screenshots/kotoba_mobile_dictionary.png', fullPage: true });
  await mobilePage.goto(BASE + '/kana', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: '.screenshots/kotoba_mobile_kana.png', fullPage: true });
  console.log('ERRORS ' + errors.length);
  for (const error of errors.slice(0, 10)) console.log('ERR', error.slice(0, 300));
  await browser.close();
})();
