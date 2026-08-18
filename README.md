# 回収見積もりナビ

不用品回収業者を相見積もりで比較できるWebサイトです。

## 開発環境で開く

```bash
npm run dev
```

ブラウザで開くURL:

```text
http://localhost:3000
```

## 主なページ

- トップページ: `/`
- 業者ログイン: `/business/login`
- 業者案件一覧: `/business/users`
- 管理者ログイン: `/admin/login`
- 管理画面: `/admin`

## 公開前に確認すること

`.env.local` はGitHubにアップロードしません。秘密情報はVercelの環境変数に設定します。

Vercelに設定する主な環境変数:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BUSINESS_LOGIN_EMAIL
BUSINESS_LOGIN_PASSWORD
BUSINESS_SESSION_TOKEN
ADMIN_LOGIN_EMAIL
ADMIN_LOGIN_PASSWORD
ADMIN_SESSION_TOKEN
ADMIN_NOTIFY_EMAIL
```

本番公開前に必ず変更するもの:

```text
BUSINESS_LOGIN_PASSWORD
BUSINESS_SESSION_TOKEN
ADMIN_LOGIN_PASSWORD
ADMIN_SESSION_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

特に `SUPABASE_SERVICE_ROLE_KEY` は強い権限を持つため、チャットや画面共有で見せた場合はSupabaseで再発行してください。

## 動作確認

```bash
npm run lint
npm run build
```

どちらも成功してからVercelへ公開します。
