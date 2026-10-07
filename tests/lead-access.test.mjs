import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';

function load(file, mocks = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, Response, URL, Buffer, ...globals,
    require(name) { assert.ok(mocks[name], `unexpected dependency: ${name}`); return mocks[name]; } };
  vm.runInNewContext(source, context);
  return context.exports;
}
function auth(secret = 'test-only-signing-secret') {
  const env = { NODE_ENV: 'production', BUSINESS_SESSION_SIGNING_SECRET: secret };
  return load('src/lib/business-auth.ts', { 'next/headers': {}, 'node:crypto': crypto }, { process: { env } });
}
test('business sessions bind partner and expiry without exposing the signing secret', () => {
  const a = auth();
  const value = a.createBusinessSessionValue('partner-a');
  assert.equal(a.getBusinessPartnerIdFromSession(value), 'partner-a');
  assert.equal(value.includes('test-only-signing-secret'), false);
  const [, signature] = value.split('.');
  const changed = Buffer.from(JSON.stringify({ partnerId: 'partner-b', expiresAt: Date.now() + 50000 })).toString('base64url');
  assert.equal(a.getBusinessPartnerIdFromSession(`${changed}.${signature}`), null);
  assert.equal(a.isValidBusinessSession('partner-b:test-only-signing-secret'), false);
  assert.equal(a.isValidBusinessSession('test-only-signing-secret'), false);
});
test('expired, malformed and unsigned sessions fail closed', () => {
  const a = auth();
  const payload = Buffer.from(JSON.stringify({ partnerId: 'partner-a', expiresAt: Date.now() - 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'test-only-signing-secret').update(payload).digest('base64url');
  for (const value of [undefined, '', 'x', 'x.y.z', 'x.!', `${payload}.${signature}`]) {
    assert.equal(a.isValidBusinessSession(value), false);
  }
  const unconfigured = auth('');
  assert.equal(unconfigured.isValidBusinessSession('partner-a:'), false);
  assert.throws(() => unconfigured.createBusinessSessionValue('partner-a'));
});
const paths = load('src/lib/lead-photo-path.ts');
test('private and legacy photo references use authenticated paths; traversal is rejected', () => {
  for (const reference of ['lead-photos:lead-a/photo.png', 'https://project.supabase.co/storage/v1/object/public/lead-photos/lead-a/photo.png']) {
    assert.equal(paths.getLeadPhotoPath(reference), 'lead-a/photo.png');
    assert.equal(paths.getProtectedLeadPhotoUrl(reference), '/api/lead-photos/lead-a/photo.png');
  }
  for (const reference of ['lead-photos:../photo.png', 'lead-photos:lead-a/..', 'lead-photos:lead-a/another/file', 'https://example.com/photo.png']) {
    assert.equal(paths.getLeadPhotoPath(reference), null);
  }
});
function service({ assigned = false, admin = false, partner = 'partner-a', stored = true, legacy = false } = {}) {
  const calls = []; const updates = []; const downloaded = [];
  const photoRef = legacy ? 'https://project.supabase.co/storage/v1/object/public/lead-photos/lead-a/photo.png' : 'lead-photos:lead-a/photo.png';
  const client = { from(table) {
    calls.push(table);
    const conditions = [];
    const chain = { select() { return chain; },
      eq(key, value) { conditions.push([key, value]); return chain; },
      update(value) { updates.push(value); return chain; },
      async single() {
        if (table === 'lead_deliveries') {
          assert.ok(conditions.some(([key, value]) => key === 'partner_id' && value === partner));
          assert.ok(conditions.some(([key, value]) => key === 'lead_id' && value === 'lead-a'));
          return { data: assigned ? { id: 'delivery-a' } : null, error: null };
        }
        return { data: { id: 'lead-a', photo_urls: stored ? [photoRef] : [], after_photo_urls: [] }, error: null };
      },
    }; return chain;
  }, storage: { from() { return { async download(path) { downloaded.push(path); return { data: new Blob(['image'], { type: 'image/png' }), error: null }; } }; } } };
  const mocks = {
    '@/lib/supabase/server': { createSupabaseAdminClient: () => client, hasSupabaseServerEnv: () => true },
    '@/lib/business-auth': { getCurrentBusinessPartnerId: async () => partner, isBusinessLoggedIn: async () => Boolean(partner) },
    '@/lib/admin-auth': { isAdminLoggedIn: async () => admin },
    '@/lib/lead-photo-path': paths,
    '@/lib/supabase/photos': { leadPhotosBucket: 'lead-photos' },
    '@/lib/supabase/leads': { mapLeadRowToLead: x => x },
  };
  return { mocks, calls, updates, downloaded };
}
const photoArgs = [new Request('http://localhost/api/lead-photos/lead-a/photo.png'), { params: Promise.resolve({ path: ['lead-a', 'photo.png'] }) }];
test('anonymous and unassigned partners cannot read customer photos', async () => {
  for (const partner of [null, 'partner-b']) {
    const s = service({ partner });
    const r = load('src/app/api/lead-photos/[...path]/route.ts', s.mocks);
    assert.equal((await r.GET(...photoArgs)).status, partner ? 404 : 401);
    assert.equal(s.downloaded.length, 0);
    assert.equal(s.calls.includes('leads'), false);
  }
});
test('assigned partners and admins may read registered photos with no shared cache', async () => {
  for (const config of [{ assigned: true }, { admin: true, partner: null, legacy: true }]) {
    const s = service(config);
    const r = load('src/app/api/lead-photos/[...path]/route.ts', s.mocks);
    const response = await r.GET(...photoArgs);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.deepEqual(s.downloaded, ['lead-a/photo.png']);
  }
});
test('knowing a storage path does not grant access to an unregistered object', async () => {
  const s = service({ assigned: true, stored: false });
  const r = load('src/app/api/lead-photos/[...path]/route.ts', s.mocks);
  assert.equal((await r.GET(...photoArgs)).status, 404);
  assert.equal(s.downloaded.length, 0);
});
test('updating an unassigned lead is rejected before a database mutation', async () => {
  const s = service();
  const r = load('src/app/api/leads/[id]/route.ts', s.mocks);
  const response = await r.PATCH(new Request('http://localhost/api/leads/lead-a', { method: 'PATCH', body: JSON.stringify({ progress: '成約' }) }), { params: Promise.resolve({ id: 'lead-a' }) });
  assert.equal(response.status, 404);
  assert.equal(s.updates.length, 0);
});
test('assigned lead updates preserve the allowed fields', async () => {
  const s = service({ assigned: true });
  const r = load('src/app/api/leads/[id]/route.ts', s.mocks);
  const response = await r.PATCH(new Request('http://localhost/api/leads/lead-a', { method: 'PATCH', body: JSON.stringify({ progress: '成約', estimate: '10000', memo: '確認済み', fee: '0 円' }) }), { params: Promise.resolve({ id: 'lead-a' }) });
  assert.equal(response.status, 200);
  assert.equal(s.updates.length, 1);
  assert.equal(s.updates[0].progress, '成約');
  assert.equal('fee' in s.updates[0], false);
});
test('existing public photo bucket must become private before uploads can continue', async () => {
  let changed;
  const p = load('src/lib/supabase/photos.ts', {
    '@/lib/lead-photo-path': paths,
    '@/lib/supabase/server': { createSupabaseAdminClient: () => ({ storage: {
      getBucket: async () => ({ data: { public: true } }),
      updateBucket: async (bucket, options) => { changed = { bucket, options }; return { error: { message: 'Unavailable' } }; },
    } }) },
  });
  await assert.rejects(() => p.ensureLeadPhotosBucket(), /Unavailable/);
  assert.equal(changed.bucket, 'lead-photos');
  assert.equal(changed.options.public, false);
});

test('photo deletion cannot target an object outside the selected lead', async () => {
  for (const file of ['src/app/api/business/leads/[id]/photos/route.ts', 'src/app/api/admin/leads/[id]/photos/route.ts']) {
    let deleted = false; let mutated = false;
    const client = { from(table) {
      const chain = { select() { return chain; }, eq() { return chain; },
        update() { mutated = true; return chain; },
        async single() { return { error: null, data: table === 'lead_deliveries' ? { id: 'assigned' } : {
          photo_names: [], photo_urls: [], after_photo_names: ['owned.png'], after_photo_urls: ['lead-photos:lead-a/owned.png'],
        } }; },
      }; return chain;
    }};
    const r = load(file, {
      'next/server': { NextResponse: { redirect: (url, options) => Response.redirect(url, options.status) } },
      '@/lib/business-auth': { isBusinessLoggedIn: async () => true, getCurrentBusinessPartnerId: async () => 'partner-a' },
      '@/lib/admin-auth': { isAdminLoggedIn: async () => true },
      '@/lib/supabase/server': { hasSupabaseServerEnv: () => true, createSupabaseAdminClient: () => client },
      '@/lib/supabase/photos': { deleteLeadPhotoByUrl: async () => { deleted = true; }, uploadLeadPhotos: async () => { throw new Error('Unexpected upload'); } },
    });
    const form = new FormData(); form.set('intent', 'delete'); form.set('photo_kind', 'after'); form.set('photo_url', 'lead-photos:lead-b/secret.png');
    const response = await r.POST(new Request('http://localhost/test', { method: 'POST', body: form }), { params: Promise.resolve({ id: 'lead-a' }) });
    assert.equal(response.status, 303);
    assert.ok(response.headers.get('location').endsWith('?error=1'));
    assert.equal(deleted, false);
    assert.equal(mutated, false);
  }
});
