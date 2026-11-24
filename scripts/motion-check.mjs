import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const origin = process.env.VERIFY_ORIGIN || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => {
  window.revealCounts = new Map();
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    if (this.matches("[data-reveal]")) {
      window.revealCounts.set(this, (window.revealCounts.get(this) || 0) + 1);
    }
    return animate.apply(this, args);
  };
});
const settle = (locator) => locator.evaluate(async (element) => {
  // React commits and the browser starts CSS transitions on the following frame.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await Promise.race([
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {}))),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Animation did not settle: ${element.id || element.tagName}`)), 3000)),
  ]);
});

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  const branches = page.locator(".desktop-nav button");
  const branchPanel = page.locator("#branch-navigation");
  await branches.click();
  await settle(branchPanel);
  assert.equal(await branchPanel.isVisible(), true);
  await branches.click();
  assert.equal(await branchPanel.evaluate((element) => element.inert), true);
  // Reverse an exit before it finishes, then ensure links remain usable.
  await branches.click();
  await settle(branchPanel);
  assert.equal(await branchPanel.isVisible(), true);
  assert.equal(await branchPanel.evaluate((element) => element.inert), false);
  await branchPanel.locator("a").first().focus();
  await page.keyboard.press("Escape");
  await branchPanel.waitFor({ state: "hidden" });
  assert.equal(await branches.evaluate((element) => element === document.activeElement), true);
  console.log("Animated desktop dropdown passed.");

  const faq = page.locator(".faq-list details").first();
  const summary = faq.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await settle(faq);
  assert.equal(await faq.evaluate((element) => element.open), true);
  const openHeight = await faq.evaluate((element) => element.getBoundingClientRect().height);
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await settle(faq);
  assert.equal(await faq.evaluate((element) => element.open), true);
  assert.ok(Math.abs(await faq.evaluate((el) => el.getBoundingClientRect().height) - openHeight) < 1);
  await summary.click();
  await settle(faq);
  assert.equal(await faq.evaluate((element) => element.open), false);
  assert.equal(await faq.evaluate((element) => element.style.height), "");
  console.log("Animated keyboard FAQ passed.");

  // Entrances should run once, while all content remains visible without them.
  await page.locator(".birthday-banner").scrollIntoViewIfNeeded();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("h1").scrollIntoViewIfNeeded();
  await page.locator(".birthday-banner").scrollIntoViewIfNeeded();
  const revealCounts = await page.evaluate(() => [...window.revealCounts.values()]);
  assert.ok(revealCounts.length > 0, "Below-fold content received an entrance");
  assert.ok(revealCounts.every((count) => count === 1), "Entrances do not replay while scrolling");
  console.log("Once-only section entrances passed.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("h1").scrollIntoViewIfNeeded();
  const toggle = page.locator(".mobile-toggle");
  const mobilePanel = page.locator("#mobile-navigation");
  await toggle.click();
  await toggle.click();
  await toggle.click();
  await settle(mobilePanel);
  assert.equal(await mobilePanel.isVisible(), true);
  await mobilePanel.locator("a").first().focus();
  await page.keyboard.press("Escape");
  await mobilePanel.waitFor({ state: "hidden" });
  assert.equal(await toggle.evaluate((el) => el === document.activeElement), true);
  await toggle.click();
  await settle(mobilePanel);
  // Tap below the open panel; the hero heading sits behind the menu on phones.
  await page.mouse.click(20, 820);
  await mobilePanel.waitFor({ state: "hidden" });
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelector(".mobile-toggle").getAttribute("aria-expanded") === "false");
  console.log("Mobile menu rapid taps, Escape and outside dismissal passed.");

  await page.goto(origin + "/מחירון-כניסה/", { waitUntil: "networkidle" });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const tabs = page.locator(".pricing-tabs");
    for (const index of [0, 2, 1]) {
      const button = tabs.locator("button").nth(index);
      await button.click();
      await settle(tabs);
      const aligned = await button.evaluate((element) => {
        const parent = element.parentElement;
        const indicator = getComputedStyle(parent, "::before");
        const offset = new DOMMatrixReadOnly(indicator.transform).m41;
        const parentRect = parent.getBoundingClientRect();
        const right = parentRect.right - parseFloat(getComputedStyle(parent).borderRightWidth)
          - parseFloat(indicator.right) + offset;
        return Math.abs(right - element.getBoundingClientRect().right) < 2;
      });
      assert.ok(aligned, `Pricing indicator follows branch ${index} at ${width}px`);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  console.log("Responsive pricing indicator passed.");

  // A preference change must also settle an in-flight menu animation.
  await toggle.click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settle(mobilePanel);
  assert.equal(await mobilePanel.isVisible(), true);
  await toggle.click();
  await mobilePanel.waitFor({ state: "hidden" });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator("footer").scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(() => window.revealCounts.size), 0);
  await page.locator(".faq-list summary").first().click();
  assert.equal(await page.locator(".faq-list details").first().evaluate((el) => el.open), true);

  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(origin);
  assert.equal(await noJs.locator(".attraction-card").first().isVisible(), true);
  await noJs.locator(".faq-list summary").first().click();
  assert.equal(await noJs.locator(".faq-list details").first().evaluate((el) => el.open), true);
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log("Verified animated menus and rapid reversals, keyboard FAQs, once-only entrances, RTL pricing alignment at 320–1440px, live reduced-motion changes and no-JavaScript content.");
} finally {
  await browser.close();
}
