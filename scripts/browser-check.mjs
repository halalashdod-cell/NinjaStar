import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const origin = process.env.VERIFY_ORIGIN || "http://127.0.0.1:3000";
const executablePath =
  process.env.BROWSER_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
const savedIds = [];
const persisted = process.env.VERIFY_PERSISTED === "1";
async function recordSaved(id) {
  savedIds.push(id);
  await writeFile("test-results/lead-browser-results.json", JSON.stringify({ origin, ids: savedIds }));
}
if (!persisted) {
  await page.route("**/api/leads/", async (route) => {
    const data = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, persisted: true, id: data.submissionId,
      message: data.type === "recruitment" ? "המועמדות נקלטה בהצלחה." : "הפרטים נקלטו בהצלחה." } });
  });
}
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const branchesButton = page
    .locator(".desktop-nav")
    .getByRole("button", { name: "הסניפים שלנו" });
  await branchesButton.click();
  await page.locator("#branch-navigation").waitFor();
  await page.locator("h1").click();
  await page.locator("#branch-navigation").waitFor({ state: "hidden" });
  assert.equal(await branchesButton.getAttribute("aria-expanded"), "false");
  await branchesButton.click();
  await page.locator(".header-cta").focus();
  await page.locator("#branch-navigation").waitFor({ state: "hidden" });
  await branchesButton.click();
  await branchesButton.press("Escape");
  await page.locator("#branch-navigation").waitFor({ state: "hidden" });
  assert.equal(await branchesButton.evaluate((el) => el === document.activeElement), true);
  assert.equal(await page.locator(".branch-picker").count(), 0);
  assert.equal(await page.locator(".attraction-card a, a.attraction-card").count(), 0);
  assert.equal(
    await page.getByRole("link", { name: "פתיחת שיחה בוואטסאפ" }).getAttribute("href"),
    "https://wa.me/972533221496?text=%D7%94%D7%99%D7%99",
  );
  const carousel = page.locator(".reviews-section");
  const waitForReview = (number) =>
    page.waitForSelector(
      `.review-dots button[aria-label="לביקורת מספר ${number}"][aria-current="true"]`,
      { timeout: 5000 },
    );
  await carousel.getByRole("button", { name: "הביקורת הבאה" }).click();
  await waitForReview(2);
  await carousel.getByRole("button", { name: "הביקורת הקודמת" }).click();
  await waitForReview(1);
  await carousel.getByRole("button", { name: "הביקורת הקודמת" }).click();
  await waitForReview(3);
  await carousel.getByRole("button", { name: "לביקורת מספר 2" }).click();
  await waitForReview(2);
  await carousel.locator(".reviews-track").focus();
  await carousel.locator(".reviews-track").press("ArrowRight");
  await waitForReview(1);
  await page.locator("h1").click();
  for (const width of [1440, 1024, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    // Allow responsive layout and font metrics to settle after a viewport change.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `No horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "פתיחת תפריט" }).click();
  await page.locator("#mobile-navigation").waitFor();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "המתקנים שלנו" })
    .click();
  await page.waitForURL(`${origin}/#facilities`);
  await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
  assert.equal(
    await page.locator("#facilities .attraction-card").count(),
    4,
  );
  await page.getByRole("button", { name: "פתיחת תפריט" }).click();
  await page.locator("#mobile-navigation").getByRole("link", { name: "אשדוד", exact: true }).click();
  await page.waitForURL((url) => decodeURI(url.pathname) === "/סניף-אשדוד/");
  assert.equal(
    await page.locator("#facilities .attraction-card").count(),
    7,
  );
  assert.equal(await page.locator("#facilities a.attraction-card").count(), 0);
  await page.goto(origin + "/מחירון-כניסה/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "אשדוד", exact: true }).click();
  assert.match(await page.locator(".pricing-note").innerText(), /אשדוד/);
  assert.ok(
    (
      await page.locator(".price-card .button").first().getAttribute("href")
    ).includes("סניף-אשדוד"),
  );
  assert.equal(
    await page.locator(".entry-link-panel a").getAttribute("href"),
    "/enter/",
  );
  await page.screenshot({
    path: "test-results/pricing-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/pricing-desktop.png",
    fullPage: true,
  });
  await page.goto(origin + "/סניף-אשדוד/", { waitUntil: "networkidle" });
  assert.equal(
    await page.locator("select[name=branch]").inputValue(),
    "ashdod",
  );
  await page.getByLabel("שם מלא", { exact: true }).fill("Demo Visitor");
  await page.getByLabel("מספר טלפון", { exact: true }).fill("0500000000");
  const enquiryResponse = page.waitForResponse((response) => response.url().endsWith("/api/leads/") && response.request().method() === "POST");
  await page.getByRole("button", { name: "שליחת פרטים" }).click();
  const enquiryResult = await (await enquiryResponse).json();
  assert.equal(enquiryResult.persisted, true);
  if (persisted) await recordSaved(enquiryResult.id);
  await page
    .getByRole("status")
    .filter({ hasText: "הפרטים נקלטו בהצלחה" })
    .waitFor();
  assert.equal(
    await page.getByLabel("שם מלא", { exact: true }).inputValue(),
    "",
  );
  await page.screenshot({
    path: "test-results/branch-desktop.png",
    fullPage: true,
  });
  await page
    .locator("footer")
    .getByRole("link", { name: "עבודה במתחם" })
    .click();
  await page.waitForURL(/עבודה-במתחם|%D7%A2%D7%91%D7%95%D7%93%D7%94/i);
  const recruitmentForm = page.getByRole("form", {
    name: "טופס מועמדות לעבודה",
  });
  await recruitmentForm.waitFor();
  assert.equal(await recruitmentForm.locator('select[name="type"]').count(), 0);
  await page.screenshot({
    path: "test-results/recruitment-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `Recruitment page has no horizontal overflow at ${width}px`,
    );
  }
  await page.screenshot({
    path: "test-results/recruitment-mobile.png",
    fullPage: true,
  });
  await recruitmentForm
    .getByLabel("שם מלא", { exact: true })
    .fill("Demo Applicant");
  await recruitmentForm
    .getByLabel("מספר טלפון", { exact: true })
    .fill("0500000000");
  await recruitmentForm
    .getByLabel("באיזה סניף תרצו לעבוד?")
    .selectOption("rehovot");
  await recruitmentForm
    .getByLabel("כמה מילים עליכם (לא חובה)")
    .fill("Available evenings");
  const applicationResponse = page.waitForResponse((response) => response.url().endsWith("/api/leads/") && response.request().method() === "POST");
  const [applicationRequest] = await Promise.all([
    page.waitForRequest(
      (request) =>
        request.url().endsWith("/api/leads/") && request.method() === "POST",
    ),
    recruitmentForm
      .getByRole("button", { name: "שליחת מועמדות" })
      .click(),
  ]);
  const payload = applicationRequest.postDataJSON();
  assert.match(payload.submissionId, /^[0-9a-f-]{36}$/);
  assert.equal(decodeURI(payload.sourcePath), "/עבודה-במתחם/");
  assert.equal(typeof payload.attribution, "object");
  const { submissionId, sourcePath, attribution, ...fields } = payload;
  assert.deepEqual(fields, {
    name: "Demo Applicant",
    phone: "0500000000",
    branch: "rehovot",
    type: "recruitment",
    message: "Available evenings",
    website: "",
  });
  const applicationResult = await (await applicationResponse).json();
  assert.equal(applicationResult.persisted, true);
  if (persisted) await recordSaved(applicationResult.id);
  await recruitmentForm
    .getByRole("status")
    .filter({ hasText: "המועמדות נקלטה בהצלחה" })
    .waitFor();
  assert.equal(
    await recruitmentForm.getByLabel("שם מלא", { exact: true }).inputValue(),
    "",
  );
  assert.equal(
    await recruitmentForm.getByLabel("כמה מילים עליכם (לא חובה)").inputValue(),
    "",
  );
  if (persisted) await writeFile("test-results/lead-browser-results.json", JSON.stringify({ origin, ids: savedIds }));
  await page.goto(origin + "/enter/", { waitUntil: "networkidle" });
  const entryButton = page.getByRole("button", { name: "הצגת אישור הדגמה" });
  assert.equal(await entryButton.isDisabled(), true);
  await page.getByRole("checkbox").check();
  await entryButton.click();
  assert.match(
    await page.getByRole("status").innerText(),
    /לא נוצר אישור השתתפות/,
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "Verified responsive layouts at 320–1440px, dropdown dismissal, branch facilities, WhatsApp destination, review carousel controls and keyboard navigation, pricing, recruitment and enquiry forms, entry demo and browser errors.",
  );
} finally {
  await browser.close();
}
