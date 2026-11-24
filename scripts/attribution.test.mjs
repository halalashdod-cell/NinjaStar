import test from 'node:test';
import assert from 'node:assert/strict';
import { captureAttribution, normalizeAttribution } from '../src/lib/attribution.ts';

const storage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
test('keeps tagged attribution across navigation and reloads without copying arbitrary queries', () => {
  const session = storage();
  const first = captureAttribution('https://site.test/?utm_source=google&utm_medium=cpc&utm_campaign=birthdays&gclid=test-click&email=private', 'https://google.com/search?q=private', session);
  assert.equal(first.utm_source, 'google');
  assert.equal(first.gclid, 'test-click');
  assert.equal(first.referrer, 'https://google.com');
  assert.equal(first.landing_page, '/');
  assert.equal(JSON.stringify(first).includes('private'), false);
  assert.deepEqual(captureAttribution('https://site.test/birthday/', 'https://site.test/', session), first);
  assert.deepEqual(captureAttribution('https://site.test/birthday/', '', session), first);
  const next = captureAttribution('https://site.test/?utm_source=instagram&utm_campaign=summer', '', session);
  assert.equal(next.utm_source, 'instagram');
  assert.equal(next.gclid, null, 'A new campaign does not inherit old click IDs');
});
test('recognizes Google Ads click IDs while respecting explicit UTM values', () => {
  for (const field of ['gclid', 'gbraid', 'wbraid']) {
    const inferred = captureAttribution(`https://site.test/?${field}=test`, '', storage());
    assert.equal(inferred.utm_source, 'google');
    assert.equal(inferred.utm_medium, 'cpc');
    assert.equal(inferred.utm_campaign, null, 'Campaign names cannot be decoded from a click ID');
  }
  assert.equal(captureAttribution('https://site.test/?gclid=test&utm_source=custom', '').utm_source, 'custom');
  assert.equal(captureAttribution('https://site.test/', '').utm_source, null);
});
test('works without storage access and recovers from malformed stored values', () => {
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.equal(captureAttribution('https://site.test/?utm_source=email', '', blocked).utm_source, 'email');
  assert.equal(captureAttribution('https://site.test/', '', { ...blocked, getItem: () => '{bad' }).landing_page, '/');
});
test('validates only the declared string fields and limits, rejecting unsafe origins and paths', () => {
  for (const input of [[], null, { utm_source: 123 }, { gclid: 'x'.repeat(513) },
    { utm_source: 'x\n' }, { landing_page: '//other.test/' }, { landing_page: '/?email=x' },
    { referrer: 'javascript:alert(1)' }, { referrer: 'https://google.com/?q=private' }]) {
    assert.throws(() => normalizeAttribution(input));
  }
  assert.equal(normalizeAttribution({ utm_source: ' google ', extra: 'ignored' }).utm_source, 'google');
  assert.equal('extra' in normalizeAttribution({ extra: 'ignored' }), false);
});
