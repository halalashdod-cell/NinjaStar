import assert from 'node:assert/strict';

const origin = process.env.VERIFY_ORIGIN || 'http://127.0.0.1:3000';
const routes = ['/', '/סניף-רחובות/', '/על-המתחם/', '/סניף-הוד-השרון/', '/המתקנים-שלנו/', '/ימי-הולדת/', '/מחירון-כניסה/', '/enter/', '/הצהרת-נגישות/', '/ninja-park-נינגה-פארק/', '/מתחם-הטרמפולינות/', '/קיר-טיפוס/', '/וויט-פול/', '/מכוניות-מתנגשות/', '/מגרש-גימבורי-לילדים/', '/בור-הגומי/'];
for (const path of routes) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="he"[^>]*dir="rtl"/, `RTL ${path}`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `One main heading: ${path}`);
  assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'), `Demo noindex: ${path}`);
  assert.ok(html.includes(`https://ninja-star.co.il${path}`) || html.includes(`https://ninja-star.co.il${encodeURI(path)}`), `Canonical: ${path}`);
}
for (const path of ['/shop/', '/not-a-real-page/']) assert.equal((await fetch(origin + path)).status, 404, `Missing page: ${path}`);
const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
assert.equal((sitemap.match(/<url>/g) || []).length, routes.length, 'Complete sitemap');
const body = { name: 'Demo Visitor', phone: '0500000000', branch: 'ashdod', type: 'birthday', website: '' };
const submit = (data, headers = { 'Content-Type': 'application/json' }) => fetch(origin + '/api/leads/', { method: 'POST', headers, body: typeof data === 'string' ? data : JSON.stringify(data) });
const valid = await submit(body);
assert.equal(valid.status, 200);
const result = await valid.json();
assert.equal(result.demo, true);
assert.equal(result.persisted, false);
assert.equal((await submit({ ...body, phone: 'invalid' })).status, 400);
assert.equal((await submit({ ...body, branch: 'missing' })).status, 400);
assert.equal((await submit({ ...body, website: 'spam.example' })).status, 400);
assert.equal((await submit('{malformed')).status, 400);
assert.equal((await submit(body, { 'Content-Type': 'text/plain' })).status, 415);
assert.equal((await submit(null)).status, 400);
console.log(`Verified ${routes.length} pages, RTL, headings, canonical URLs, noindex, sitemap, 404s, demo submission and validation.`);
