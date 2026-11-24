import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LeadError, validateLead, readLeadRequest, saveLead } from '../src/lib/leads.server.ts';

const body = { name: '  QA Visitor  ', phone: '050-0000000', branch: 'ashdod', type: 'birthday', website: '', sourcePath: '/' };
const env = { SUPABASE_URL: 'https://database.example.test', SUPABASE_SECRET_KEY: 'test-server-key' };
const isStatus = (status) => (error) => error instanceof LeadError && error.status === status;
test('validates enquiries and normalizes phone/name without changing Hebrew text', () => {
  const lead = validateLead({ ...body, name: '\u05d1\u05d3\u05d9\u05e7\u05d4', submissionId: randomUUID() });
  assert.equal(lead.phone, '0500000000');
  assert.equal(lead.name, '\u05d1\u05d3\u05d9\u05e7\u05d4');
  assert.equal(lead.message, null);
  assert.equal(validateLead({ ...body, type: 'recruitment', message: ' Evenings ' }).message, 'Evenings');
});
test('rejects invalid values, honeypots, malformed IDs and source URLs with query strings', () => {
  for (const input of [null, [], { ...body, phone: '123' }, { ...body, branch: 'bad' },
    { ...body, type: 'bad' }, { ...body, name: 'x\nname' }, { ...body, website: 'spam' },
    { ...body, submissionId: 'bad' }, { ...body, message: 'x'.repeat(1001) },
    { ...body, message: {} }, { ...body, sourcePath: '//other.example/' }, { ...body, sourcePath: '/?private=1' }]) {
    assert.throws(() => validateLead(input), isStatus(400));
  }
});
const request = (data, headers = {}) => new Request('https://site.example/api/leads/', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: data,
});
test('accepts JSON while rejecting oversized, malformed and cross-origin requests', async () => {
  assert.deepEqual(await readLeadRequest(request(JSON.stringify(body))), body);
  await assert.rejects(readLeadRequest(request('{bad')), isStatus(400));
  await assert.rejects(readLeadRequest(request('x'.repeat(8193))), isStatus(413));
  await assert.rejects(readLeadRequest(request('{}', { origin: 'https://other.example' })), isStatus(403));
  await assert.rejects(readLeadRequest(request('{}', { 'content-type': 'text/plain' })), isStatus(415));
});
test('sends credentials only as apikey and a keyed IP hash, then requires a saved ID', async () => {
  const lead = validateLead(body);
  let payload;
  const id = await saveLead(lead, '203.0.113.42', { env, fetcher: async (url, options) => {
    assert.equal(url.pathname, '/rest/v1/rpc/submit_website_lead');
    assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
    assert.equal(options.headers.Authorization, undefined);
    payload = JSON.parse(options.body);
    assert.match(payload.p_client_hash, /^[a-f0-9]{64}$/);
    assert.equal(options.body.includes('203.0.113.42'), false);
    return Response.json(lead.id);
  } });
  assert.equal(id, lead.id);
  assert.equal(payload.p_id, lead.id);
  assert.equal(payload.p_type, 'birthday');
});
test('never reports success when credentials, database acknowledgements or networking fail', async () => {
  const lead = validateLead(body);
  await assert.rejects(saveLead(lead, 'test', { env: {} }), isStatus(503));
  for (const response of [Response.json({ message: 'secret database details' }, { status: 401 }),
    Response.json({ code: 'error' }, { status: 500 }), Response.json(randomUUID()), new Response('bad')]) {
    await assert.rejects(saveLead(lead, 'test', { env, fetcher: async () => response }), (error) => {
      assert.equal(error.status, 503);
      assert.equal(error.message.includes('secret database details'), false);
      return true;
    });
  }
  await assert.rejects(saveLead(lead, 'test', { env, fetcher: async () => { throw new Error('network'); } }), isStatus(503));
});
test('maps rate limits and changed retry payloads to actionable response codes', async () => {
  const lead = validateLead(body);
  for (const [message, status] of [['lead_rate_limit', 429], ['lead_id_conflict', 409]]) {
    await assert.rejects(saveLead(lead, 'test', { env, fetcher: async () => Response.json({ code: 'P0001', message }, { status: 400 }) }), isStatus(status));
  }
});
