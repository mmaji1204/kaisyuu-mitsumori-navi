# Supabase setup

このプロジェクトを本番運用するためのSupabase設定手順です。

## 1. Supabaseでプロジェクトを作る

1. Supabaseにログインします。
2. New projectを作成します。
3. Project nameは `kaisyuu-mitsumori-navi` などにします。
4. Database passwordは必ず控えておきます。
5. Regionは日本向けなら近い地域を選びます。

## 2. 案件テーブルを作る

1. SupabaseのSQL Editorを開きます。
2. `supabase/schema.sql` の中身を貼り付けます。
3. Runを押します。

これで `leads` テーブルが作られます。

## 3. 環境変数を設定する

Supabaseの Project Settings > API から次の値を確認します。

- Project URL
- service_role key

プロジェクト直下の `.env.local` に貼り付けます。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

`SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しないでください。

## 4. 動作確認

```bash
npm run dev
```

トップページのフォームから送信します。
そのあと `/business/users` を開いて、新しい案件が表示されれば成功です。

## 5. 業者ごとの案件振り分けを有効にする

1. SupabaseのSQL Editorを開きます。
2. `supabase/partner-routing.sql` の中身を貼り付けます。
3. Runを押します。

これで次の2つが作られます。

- `partners`: 業者情報
- `lead_deliveries`: どの案件をどの業者に配信したか

最初の業者として `クリーンリンク` が作られ、既存の案件もその業者に配信済みとして紐づきます。

初期業者ログインは次の通りです。

- メール: `partner@example.com`
- パスワード: `password123`

管理者画面から追加する業者は、追加時に入力したメールアドレスと初期パスワードでログインできます。

## 6. 対応履歴を有効にする

1. SupabaseのSQL Editorを開きます。
2. `supabase/lead-activities.sql` の中身を貼り付けます。
3. Runを押します。

これで案件詳細ページから「電話した」「見積した」「成約」などの履歴を保存できます。

## 7. 運用機能を有効にする

1. SupabaseのSQL Editorを開きます。
2. `supabase/operation-upgrades.sql` の中身を貼り付けます。
3. Runを押します。

これで次の運用機能が使えるようになります。

- 業者ごとの日配信上限
- 業者ごとの月予算上限
- 業者ごとの通知メール
- 自動配信のON/OFF
- 通知ログ
- 請求明細
- 管理画面からのCSV出力
- 希望日時
- 写真名の記録
- 写真URLの記録
- 作業後写真の記録
- 重複送信チェック

写真アップロードでは、Supabase Storageに `lead-photos` バケットを自動作成します。
初回送信時にバケットが作られ、案件ごとの写真URLが `leads.photo_urls` に保存されます。

## 8. 外部サービスを接続するとき

メール、LINE、SMS、クレジット決済は外部サービスの契約とAPIキーが必要です。
本番で使う場合は `.env.local` とVercelの Environment Variables に次を追加します。

```bash
RESEND_API_KEY=
NOTIFICATION_FROM_EMAIL=
ADMIN_NOTIFY_EMAIL=
LINE_CHANNEL_ACCESS_TOKEN=
SMS_PROVIDER_API_KEY=
STRIPE_SECRET_KEY=
```

今のアプリでは、案件が入った時点で通知ログと請求明細を作ります。
実メール送信・LINE送信・SMS送信・Stripe請求は、APIキーを用意してから接続します。

## 9. 管理者が使う画面

- 管理ダッシュボード: `/admin`
- 案件ボード: `/admin/board`
- 分析ダッシュボード: `/admin/analytics`
- 請求管理: `/admin/billing`
- 案件詳細: `/admin/leads/案件ID`
- 業者詳細: `/admin/partners/業者ID`
- 請求書: `/admin/invoices/業者ID`

## 10. Vercel公開時

Vercelの Environment Variables にも同じ2つを設定します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BUSINESS_LOGIN_EMAIL`
- `BUSINESS_LOGIN_PASSWORD`
- `BUSINESS_SESSION_TOKEN`
- `BUSINESS_PARTNER_EMAIL`
- `BUSINESS_PARTNER_NAME`
- `ADMIN_LOGIN_EMAIL`
- `ADMIN_LOGIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

設定後に再デプロイします。
