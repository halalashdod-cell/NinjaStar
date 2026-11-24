import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const origin = process.env.VERIFY_ORIGIN || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
await mkdir("test-results", { recursive: true });
const errors = [];
const playing = (page) => page.waitForFunction(() => {
  const video = document.querySelector(".hero-video");
  return video && !video.paused && video.currentTime > 0.1 && video.readyState >= 2;
});
const paused = (page) => page.waitForFunction(() => document.querySelector(".hero-video")?.paused);
async function open(options = {}, init) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    ...options,
  });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const mediaRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/\/videos\/.*\.mp4/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.locator(".hero-image").evaluate((image) => image.decode());
  return { context, page, mediaRequests };
}

try {
  for (const variant of ["desktop", "mobile"]) {
    const response = await fetch(`${origin}/videos/ninja-star-hero-${variant}.mp4`, {
      headers: { Range: "bytes=0-2047" },
    });
    assert.equal(response.status, 206, `${variant} supports progressive/range loading`);
    assert.match(response.headers.get("content-type"), /video\/mp4/);
    assert.match(response.headers.get("content-range"), /^bytes 0-2047\//);
    assert.equal((await response.arrayBuffer()).byteLength, 2048);
  }

  const desktop = await open();
  await playing(desktop.page);
  assert.ok(desktop.mediaRequests.every((url) => url.includes("hero-desktop.mp4")));
  assert.equal(await desktop.page.locator(".hero-video").evaluate((video) => video.videoWidth), 1280);
  await desktop.page.getByRole("button", { name: "השהיית סרטון הרקע" }).click();
  await paused(desktop.page);
  await desktop.page.locator("#branches").scrollIntoViewIfNeeded();
  await desktop.page.locator(".hero").scrollIntoViewIfNeeded();
  await desktop.page.waitForTimeout(300);
  assert.equal(await desktop.page.locator(".hero-video").evaluate((video) => video.paused), true, "Manual pause persists");
  await desktop.page.getByRole("button", { name: "ניגון סרטון הרקע" }).click();
  await playing(desktop.page);
  await desktop.page.locator("#branches").scrollIntoViewIfNeeded();
  await paused(desktop.page);
  await desktop.page.locator(".hero").scrollIntoViewIfNeeded();
  await playing(desktop.page);
  await desktop.page.locator(".hero-video").evaluate((video) => { video.currentTime = video.duration - 0.15; });
  await desktop.page.waitForFunction(() => document.querySelector(".hero-video").currentTime < 2);
  await desktop.page.screenshot({ path: "test-results/hero-video-desktop.png" });
  await desktop.context.close();

  const mobile = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await playing(mobile.page);
  assert.ok(mobile.mediaRequests.every((url) => url.includes("hero-mobile.mp4")));
  assert.equal(await mobile.page.locator(".hero-video").evaluate((video) => video.videoWidth), 540);
  assert.ok((await mobile.page.locator(".hero-image").evaluate((image) => image.currentSrc)).includes("hero-mobile.webp"));
  assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await mobile.page.screenshot({ path: "test-results/hero-video-mobile.png" });
  await mobile.context.close();

  const reduced = await open({ reducedMotion: "reduce" });
  assert.equal(reduced.mediaRequests.length, 0, "Reduced motion downloads no video");
  assert.equal(await reduced.page.locator(".hero-video").getAttribute("src"), null);
  await reduced.page.getByRole("button", { name: "ניגון סרטון הרקע" }).click();
  await playing(reduced.page);
  await reduced.context.close();

  const saving = await open({}, () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: Object.assign(new EventTarget(), { saveData: true, effectiveType: "4g" }),
    });
  });
  assert.equal(saving.mediaRequests.length, 0, "Data saver downloads no video");
  await saving.context.close();

  const blocked = await open({}, () => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!navigator.userActivation.isActive) {
        return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await paused(blocked.page);
  assert.equal(await blocked.page.locator(".hero-video.is-ready").count(), 0, "Blocked autoplay retains poster");
  await blocked.page.getByRole("button", { name: "ניגון סרטון הרקע" }).click();
  await playing(blocked.page);
  await blocked.context.close();

  const offlineContext = await browser.newContext();
  await offlineContext.route("**/videos/*.mp4", (route) => route.abort());
  const offline = await offlineContext.newPage();
  offline.on("pageerror", (error) => errors.push(error.message));
  await offline.goto(origin, { waitUntil: "networkidle" });
  await offline.locator(".hero-image").evaluate((image) => image.decode());
  await offline.waitForFunction(() => document.querySelector(".hero-video")?.error);
  assert.equal(await offline.locator(".hero-video.is-ready").count(), 0, "Failed video retains poster");
  assert.equal(await offline.getByRole("heading", { level: 1 }).isVisible(), true);
  await offlineContext.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(origin, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator(".hero-video-control").count(), 0);
  assert.equal(await staticPage.getByRole("heading", { level: 1 }).isVisible(), true);
  await staticContext.close();

  assert.deepEqual(errors, [], "No video-related browser exceptions");
  console.log("Verified desktop/mobile playback, one video variant per device, range loading, pause/resume and loop, offscreen pausing, reduced-motion/data-saver policies, autoplay blocking, failed-video fallback and no-JavaScript content.");
} finally {
  await browser.close();
}
