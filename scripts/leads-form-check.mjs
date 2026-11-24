import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const requests = [];
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route('**/api/leads/', async (route) => {
    const data = route.request().postDataJSON();
    requests.push(data);
    if (requests.length === 1) return route.fulfill({ status: 503, json: { persisted: false, message: 'Database temporarily unavailable' } });
    if (requests.length === 2) return route.abort();
    await gate;
    return route.fulfill({ json: { persisted: true, id: data.submissionId, message: 'Saved successfully' } });
  });
  await page.goto((process.env.VERIFY_ORIGIN || 'http://127.0.0.1:3000') + '/עבודה-במתחם/', { waitUntil: 'networkidle' });
  const form = page.locator('.lead-form');
  await form.locator('[name=name]').fill('QA Applicant');
  await form.locator('[name=phone]').fill('0500000000');
  await form.locator('[name=branch]').selectOption('rehovot');
  await form.locator('[name=message]').fill('Available evenings');
  const submit = form.locator('[type=submit]');
  await submit.click();
  await form.locator('.form-message.error').waitFor();
  assert.equal(await form.locator('[name=name]').inputValue(), 'QA Applicant');
  await submit.click();
  await page.waitForFunction(() => document.querySelector('.form-message.error')?.textContent.includes('הפרטים נשארו'));
  assert.equal(requests[0].submissionId, requests[1].submissionId, 'Unchanged retries reuse the same ID');
  await form.locator('[name=name]').fill('QA Applicant Updated');
  await form.evaluate((element) => {
    element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await page.waitForFunction(() => document.querySelector('.form-submit')?.disabled);
  assert.equal(await form.locator('[name=name]').isDisabled(), true);
  await page.waitForFunction(() => document.querySelector('.form-submit')?.getAttribute('aria-busy') === 'true');
  assert.equal(requests.length, 3, 'Repeated submit events start only one request');
  assert.notEqual(requests[2].submissionId, requests[1].submissionId, 'Edited details receive a fresh ID');
  release();
  await form.locator('.form-message.success').waitFor();
  assert.equal(await form.locator('[name=name]').inputValue(), '');
  assert.equal(await form.locator('[name=message]').inputValue(), '');
  assert.equal(await submit.isDisabled(), false);
  console.log('Verified form failure recovery, unchanged retry IDs, fresh IDs after edits, pending field locking, duplicate-submit prevention and success reset.');
} finally { await browser.close(); }
