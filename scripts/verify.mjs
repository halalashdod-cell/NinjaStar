import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.VERIFY_ORIGIN || "http://127.0.0.1:3000";
const persisted = process.env.VERIFY_PERSISTED === "1";
const savedIds = [];
async function recordSaved(id) {
  savedIds.push(id);
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/lead-api-results.json", JSON.stringify({ origin, ids: savedIds }));
}
const routes = [
  "/",
  "/סניף-רחובות/",
  "/על-המתחם/",
  "/סניף-הוד-השרון/",
  "/ימי-הולדת/",
  "/מחירון-כניסה/",
  "/עבודה-במתחם/",
  "/enter/",
  "/הצהרת-נגישות/",
];
for (const path of routes) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="he"[^>]*dir="rtl"/, `RTL ${path}`);
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `One main heading: ${path}`,
  );
  assert.ok(
    response.headers.get("x-robots-tag")?.includes("noindex"),
    `Demo noindex: ${path}`,
  );
  assert.ok(
    html.includes(`https://ninja-star.co.il${path}`) ||
      html.includes(`https://ninja-star.co.il${encodeURI(path)}`),
    `Canonical: ${path}`,
  );
}
const retiredFacilities = [
  ["המתקנים-שלנו", "/"],
  ["ninja-park-נינגה-פארק", "/"],
  ["מתחם-הטרמפולינות", "/"],
  ["קיר-טיפוס", "/"],
  ["וויט-פול", "/"],
  ["מכוניות-מתנגשות", "/על-המתחם/"],
  ["מגרש-גימבורי-לילדים", "/על-המתחם/"],
  ["בור-הגומי", "/על-המתחם/"],
];
for (const [slug, destination] of retiredFacilities) {
  const encoded = encodeURI(`/${slug}/`);
  for (const path of [encoded, encoded.toLowerCase()]) {
    const response = await fetch(origin + path, { redirect: "manual" });
    assert.equal(response.status, 308, `Permanent redirect: ${path}`);
    const location = new URL(response.headers.get("location"), origin);
    assert.equal(decodeURI(location.pathname), destination, slug);
    assert.equal(location.hash, "#facilities", slug);
  }
}
for (const path of ["/shop/", "/not-a-real-page/"])
  assert.equal(
    (await fetch(origin + path)).status,
    404,
    `Missing page: ${path}`,
  );
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.equal(
  (sitemap.match(/<url>/g) || []).length,
  routes.length,
  "Complete sitemap",
);
const body = {
  name: "Demo Visitor",
  phone: "0500000000",
  branch: "ashdod",
  type: "birthday",
  website: "",
  submissionId: randomUUID(),
  sourcePath: "/",
};
const submit = (data, headers = { "Content-Type": "application/json" }) =>
  fetch(origin + "/api/leads/", {
    method: "POST",
    headers,
    body: typeof data === "string" ? data : JSON.stringify(data),
  });
const valid = await submit(body);
assert.equal(valid.status, persisted ? 200 : 503);
const result = await valid.json();
assert.equal(result.persisted, persisted);
if (persisted) {
  await recordSaved(result.id);
  const repeated = await (await submit(body)).json();
  assert.equal(repeated.id, result.id, "A retry preserves the original lead ID");
  assert.equal((await submit({ ...body, name: "Changed payload" })).status, 409);
}
const recruitment = { ...body, submissionId: randomUUID(), type: "recruitment", message: "Available evenings" };
const application = await submit(recruitment);
assert.equal(application.status, persisted ? 200 : 503);
const applicationResult = await application.json();
assert.equal(applicationResult.persisted, persisted);
if (persisted) await recordSaved(applicationResult.id);
assert.equal(
  (await submit({ ...recruitment, message: "a".repeat(1001) })).status,
  400,
);
assert.equal((await submit({ ...recruitment, message: {} })).status, 400);
assert.equal((await submit({ ...body, type: "unknown" })).status, 400);
assert.equal((await submit({ ...body, phone: "invalid" })).status, 400);
assert.equal((await submit({ ...body, branch: "missing" })).status, 400);
assert.equal((await submit({ ...body, website: "spam.example" })).status, 400);
assert.equal((await submit("{malformed")).status, 400);
assert.equal(
  (await submit(body, { "Content-Type": "text/plain" })).status,
  415,
);
assert.equal((await submit(null)).status, 400);
console.log(
  `Verified ${routes.length} pages, 8 retired facility redirects, RTL, headings, canonical URLs, noindex, sitemap, 404s, ${persisted ? "saved submissions and retries" : "unconfigured storage fails honestly"}, and validation.`,
);
if (persisted) {
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/lead-api-results.json", JSON.stringify({ origin, ids: savedIds }));
}
