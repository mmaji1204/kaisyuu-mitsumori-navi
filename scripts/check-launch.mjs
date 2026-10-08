import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());

// Read-only: never sends emails, uploads photos, creates leads or bills partners.
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_LOGIN_EMAIL', 'ADMIN_LOGIN_PASSWORD', 'ADMIN_SESSION_SIGNING_SECRET',
  'BUSINESS_SESSION_SIGNING_SECRET', 'RESEND_API_KEY', 'NOTIFICATION_FROM_EMAIL',
  'ADMIN_NOTIFY_EMAIL', 'OPERATOR_LEGAL_NAME', 'OPERATOR_ADDRESS', 'OPERATOR_CONTACT_EMAIL'];
let failed = false;
function check(label, ok) {
  console.log(`${ok ? 'OK' : '未確認'}: ${label}`);
  if (!ok) failed = true;
}
for (const key of required) check(key, Boolean(process.env[key]?.trim()));
console.log(`受付設定: ${process.env.QUOTE_INTAKE_ENABLED === 'true' ? '開始を指定' : '停止中'}`);
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8000) }) },
    });
    const checks = await Promise.allSettled([
      client.from('leads').select('id,consent_version,consented_at').limit(0),
      client.storage.getBucket('lead-photos'),
      client.from('partners').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('auto_assign_enabled', true),
    ]);
    const [leads, bucket, partners] = checks;
    check('保存先への接続・同意記録の列', leads.status === 'fulfilled' && !leads.value.error);
    check('写真保管先が非公開', bucket.status === 'fulfilled' && !bucket.value.error && bucket.value.data?.public === false);
    check('配信可能な業者が登録済み', partners.status === 'fulfilled' && !partners.value.error && partners.value.count > 0);
  } catch {
    check('保存先の接続確認', false);
  }
}
console.log('別途必要: 運営情報・個人情報の最終確認、業者の許可と対応範囲、管理者への通知受信、権限を分けた実機確認。設定の存在だけでは受付開始を判定できません。');
process.exitCode = failed ? 1 : 0;
