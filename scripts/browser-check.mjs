import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.env.VERIFY_ORIGIN || 'http://127.0.0.1:3000';
const executablePath = process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 1024, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `No horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'פתיחת תפריט' }).click();
  await page.locator('#mobile-navigation').waitFor();
  await page.locator('#mobile-navigation').getByRole('link', { name: 'המתקנים שלנו' }).click();
  await page.waitForURL(/המתקנים|%D7%94%D7%9E%D7%AA/i);
  await page.getByRole('button', { name: 'רחובות', exact: true }).click();
  assert.equal(await page.locator('.explorer-grid .attraction-card').count(), 4);
  await page.getByRole('button', { name: 'אשדוד', exact: true }).click();
  assert.equal(await page.locator('.explorer-grid .attraction-card').count(), 7);
  await page.goto(origin + '/מחירון-כניסה/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'אשדוד', exact: true }).click();
  assert.match(await page.locator('.pricing-note').innerText(), /אשדוד/);
  assert.ok((await page.locator('.price-card .button').first().getAttribute('href')).includes('על-המתחם'));
  assert.equal(await page.locator('.entry-link-panel a').getAttribute('href'), '/enter/');
  await page.screenshot({ path: 'test-results/pricing-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/pricing-desktop.png', fullPage: true });
  await page.goto(origin + '/על-המתחם/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('select[name=branch]').inputValue(), 'ashdod');
  await page.getByLabel('שם מלא', { exact: true }).fill('Demo Visitor');
  await page.getByLabel('מספר טלפון', { exact: true }).fill('0500000000');
  await page.getByRole('button', { name: 'נסו את טופס ההדגמה' }).click();
  await page.getByRole('status').filter({ hasText: 'ההדגמה הושלמה בהצלחה' }).waitFor();
  assert.equal(await page.getByLabel('שם מלא', { exact: true }).inputValue(), '');
  await page.screenshot({ path: 'test-results/branch-desktop.png', fullPage: true });
  await page.goto(origin + '/enter/', { waitUntil: 'networkidle' });
  const entryButton = page.getByRole('button', { name: 'הצגת אישור הדגמה' });
  assert.equal(await entryButton.isDisabled(), true);
  await page.getByRole('checkbox').check();
  await entryButton.click();
  assert.match(await page.getByRole('status').innerText(), /לא נוצר אישור השתתפות/);
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('Verified responsive layouts at 320–1440px, mobile navigation, attraction filters, pricing selection, branch form defaults, submission feedback, entry demo and browser errors.');
} finally { await browser.close(); }
