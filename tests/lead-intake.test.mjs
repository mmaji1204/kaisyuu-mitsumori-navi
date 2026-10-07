import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real route with service boundaries replaced; no customer data,
// database writes, emails or billable deliveries leave the test process.
function route({ configured = true, loggedIn = true, partnerError = false } = {}) {
  const calls = [];
  const inserts = [];
  const client = { from(table) {
    calls.push(table);
    const chain = {
      select() { return chain; }, eq() { return chain; }, in() { return chain; },
      gte() { return chain; }, neq() { return chain; }, order() { return chain; },
      insert(data) { inserts.push({ table, data }); return chain; },
      single() { return Promise.resolve(table === 'partners'
        ? { data: partnerError ? null : { id: 'partner-a' }, error: partnerError ? new Error('routing unavailable') : null }
        : { data: inserts.at(-1)?.data, error: null }); },
      then(resolve) { return Promise.resolve({ data: [], count: 0, error: null }).then(resolve); },
    };
    return chain;
  }};
  const mocks = {
    '@/lib/supabase/server': { hasSupabaseServerEnv: () => configured, createSupabaseAdminClient: () => client },
    '@/lib/supabase/leads': { mapLeadToInsert: x => x, mapLeadRowToLead: x => x },
    '@/lib/notifications': { sendEmailNotification: async () => ({ sent: false, skipped: true }) },
    '@/lib/supabase/photos': { uploadLeadPhotos: async () => ({ photoNames: [], photoUrls: [] }) },
    '@/lib/business-auth': { isBusinessLoggedIn: async () => loggedIn, getCurrentBusinessPartnerId: async () => 'partner-a' },
  };
  const source = ts.transpileModule(fs.readFileSync('src/app/api/leads/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sandbox = { exports: {}, Response, File, crypto, console: { error() {}, warn() {} }, process: { env: {} },
    require(name) { assert.ok(mocks[name], `unexpected dependency: ${name}`); return mocks[name]; } };
  vm.runInNewContext(source, sandbox);
  return { ...sandbox.exports, calls, inserts };
}
const valid = { name: '動作確認用', phone: '000-0000-0000', address: 'テスト市', request: 'テスト品目' };
const request = (body) => new Request('http://localhost/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('unauthenticated requests never access lead storage', async () => {
  const r = route({ loggedIn: false });
  assert.equal((await r.GET()).status, 401);
  assert.equal(r.calls.length, 0);
});
test('routing failure never falls back to all customers', async () => {
  const r = route({ partnerError: true });
  const response = await r.GET();
  assert.equal(response.status, 500);
  assert.equal(r.calls.includes('leads'), false);
  assert.equal((await response.text()).includes('routing unavailable'), false);
});
test('partner without assigned leads sees an empty result', async () => {
  const r = route();
  const response = await r.GET();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).leads, []);
  assert.equal(r.calls.includes('leads'), false);
});
test('missing database configuration cannot report successful receipt', async () => {
  const r = route({ configured: false });
  assert.equal((await r.POST(request(valid))).status, 503);
  assert.equal(r.inserts.length, 0);
});
test('malformed JSON and invalid required fields fail without side effects', async () => {
  const r = route();
  const broken = new Request('http://localhost/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal((await r.POST(broken)).status, 400);
  for (const payload of [null, {}, { ...valid, name: '  ' }, { ...valid, phone: 123 }, { ...valid, request: 'x'.repeat(1001) }]) {
    assert.equal((await r.POST(request(payload))).status, 400);
  }
  assert.equal(r.inserts.length, 0);
});
test('public input cannot change internal fees, identity, status or image URLs', async () => {
  const r = route();
  const response = await r.POST(request({ ...valid, id: 'chosen-id', fee: '0 円', status: '除外', progress: '成約', memo: 'injected', photoUrls: ['https://example.com/image'], afterPhotoUrls: ['https://example.com/after'] }));
  assert.equal(response.status, 201);
  const saved = r.inserts.find(x => x.table === 'leads').data;
  assert.notEqual(saved.id, 'chosen-id');
  assert.equal(saved.fee, '900 円');
  assert.equal(saved.status, '課金');
  assert.equal(saved.progress, '未対応');
  assert.equal(saved.memo, '');
  assert.equal(saved.photoUrls.length, 0);
  assert.equal(saved.afterPhotoUrls.length, 0);
});
test('more than five photos or unsupported file types are rejected', async () => {
  const r = route();
  for (const [count, type] of [[6, 'image/png'], [1, 'text/html']]) {
    const form = new FormData();
    form.append('lead', JSON.stringify(valid));
    for (let i = 0; i < count; i++) form.append('photos', new File(['test'], `test-${i}`, { type }));
    const response = await r.POST(new Request('http://localhost/api/leads', { method: 'POST', body: form }));
    assert.equal(response.status, 400);
  }
  assert.equal(r.inserts.length, 0);
});
