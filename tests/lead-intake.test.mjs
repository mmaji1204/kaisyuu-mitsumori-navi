import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import nodeCrypto from 'node:crypto';

// Execute the real route with service boundaries replaced; no customer data,
// database writes, emails or billable deliveries leave the test process.
function route({ configured = true, loggedIn = true, partnerError = false, intakeOpen = true, partners = [], photoFailure = false, notificationFailure = false, duplicateCount = 0 } = {}) {
  const calls = [];
  const inserts = [];
  const stored = new Map();
  let uploads = 0;
  const client = { from(table) {
    calls.push(table);
    let inserted;
    let conflict = false;
    const chain = {
      select() { return chain; }, eq() { return chain; }, in() { return chain; },
      gte() { return chain; }, neq() { return chain; }, order() { return chain; },
      insert(data) {
        inserted = data;
        if (table === 'leads' && stored.has(data.id)) conflict = true;
        else { inserts.push({ table, data }); if (table === 'leads') stored.set(data.id, data); }
        return chain;
      },
      upsert(data) { inserts.push({ table, data }); return chain; },
      update() { return chain; },
      single() { return Promise.resolve(table === 'partners'
        ? { data: partnerError ? null : { id: 'partner-a' }, error: partnerError ? new Error('routing unavailable') : null }
        : conflict ? { data: null, error: { code: "23505" } } : { data: inserted ? { ...inserted, id: inserted.id || "delivery-a" } : null, error: null }); },
      then(resolve) { return Promise.resolve({ data: table === 'partners' ? partners : [], count: table === 'leads' ? duplicateCount : 0, error: null }).then(resolve); },
    };
    return chain;
  }};
  const mocks = {
    "node:crypto": nodeCrypto,
    "@/lib/intake-status": { isQuoteIntakeOpen: () => intakeOpen },
    "@/lib/consent": { PRIVACY_VERSION: "2026-10-08" },
    '@/lib/supabase/server': { hasSupabaseServerEnv: () => configured, createSupabaseAdminClient: () => client },
    '@/lib/supabase/leads': { mapLeadToInsert: x => x, mapLeadRowToLead: x => x },
    '@/lib/notifications': { sendEmailNotification: async () => { if (notificationFailure) throw new Error("unavailable"); return { sent: true }; } },
    '@/lib/supabase/photos': { uploadLeadPhotos: async () => { uploads++; if (photoFailure) throw new Error("upload failed"); return { photoNames: [], photoUrls: [] }; } },
    '@/lib/business-auth': { isBusinessLoggedIn: async () => loggedIn, getCurrentBusinessPartnerId: async () => 'partner-a' },
  };
  const source = ts.transpileModule(fs.readFileSync('src/app/api/leads/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sandbox = { exports: {}, Response, File, crypto, console: { error() {}, warn() {} }, process: { env: {} },
    require(name) { assert.ok(mocks[name], `unexpected dependency: ${name}`); return mocks[name]; } };
  vm.runInNewContext(source, sandbox);
  return { ...sandbox.exports, calls, inserts, get uploads() { return uploads; } };
}
const valid = { requestKey: '12345678-1234-4123-a123-123456789012', name: '動作確認用', phone: '000-0000-0000', address: 'テスト市', request: 'テスト品目', privacyAgreed: true, privacyVersion: '2026-10-08' };
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
  assert.match(saved.memo, /配信要確認/);
  assert.equal(saved.memo.includes('injected'), false);
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

test('closed intake rejects before reading personal information or using storage', async () => {
  const r = route({ intakeOpen: false });
  const unreadable = { headers: { get() { throw new Error('body must not be read'); } } };
  assert.equal((await r.POST(unreadable)).status, 503);
  assert.equal(r.calls.length, 0);
});
test('missing or stale consent never creates a lead', async () => {
  for (const consent of [{ privacyAgreed: false }, { privacyAgreed: 'true' }, { privacyVersion: 'old' }]) {
    const r = route();
    assert.equal((await r.POST(request({ ...valid, ...consent }))).status, 400);
    assert.equal(r.inserts.length, 0);
  }
});
test('consent evidence uses server time and the current wording version', async () => {
  const r = route();
  await r.POST(request({ ...valid, consented_at: '1900-01-01', consent_version: 'fake' }));
  const saved = r.inserts.find(x => x.table === 'leads').data;
  assert.equal(saved.consent_version, '2026-10-08');
  assert.ok(Date.now() - Date.parse(saved.consented_at) < 5000);
});

const partner = { id: 'partner-a', service_area: 'テスト市', email: 'fake@example.invalid' };
test('concurrent retries reserve one receipt before uploads, delivery and billing', async () => {
  const r = route({ partners: [partner] });
  const responses = await Promise.all([r.POST(request(valid)), r.POST(request(valid))]);
  const receipts = await Promise.all(responses.map(response => response.json()));
  assert.equal(receipts[0].receiptId, receipts[1].receiptId);
  assert.equal(r.inserts.filter(x => x.table === 'leads').length, 1);
  assert.equal(r.inserts.filter(x => x.table === 'lead_deliveries').length, 1);
  assert.equal(r.inserts.filter(x => x.table === 'billing_items').length, 1);
  assert.equal(r.uploads, 1);
  assert.equal(receipts[0].lead, undefined);
});
test('blank regions never distribute customer information', async () => {
  const r = route({ partners: [{ ...partner, service_area: '  ' }] });
  assert.equal((await r.POST(request(valid))).status, 201);
  assert.equal(r.inserts.filter(x => x.table === 'lead_deliveries').length, 0);
});
test('a recent same-phone submission is retained for review without auto billing', async () => {
  const r = route({ partners: [partner], duplicateCount: 1 });
  await r.POST(request(valid));
  assert.equal(r.inserts.filter(x => x.table === 'lead_deliveries').length, 0);
  assert.match(r.inserts.find(x => x.table === 'leads').data.memo, /重複注意/);
});
test('post-reservation failures acknowledge receipt and remain visible for review', async () => {
  for (const failure of [{ photoFailure: true }, { notificationFailure: true }]) {
    const r = route({ partners: [partner], ...failure });
    const response = await r.POST(request(valid));
    assert.equal(response.status, 201);
    assert.equal((await response.json()).status, 'received');
    assert.match(r.inserts.find(x => x.table === 'leads').data.memo, /配信要確認/);
    await r.POST(request(valid));
    assert.equal(r.inserts.filter(x => x.table === 'leads').length, 1);
  }
});
test('malformed retry keys fail before storage', async () => {
  const r = route();
  assert.equal((await r.POST(request({ ...valid, requestKey: 'bad' }))).status, 400);
  assert.equal(r.inserts.length, 0);
});
