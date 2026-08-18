# Vercel公開手順

## 1. GitHubにアップロードする

1. GitHubで新しいリポジトリを作成します。
2. リポジトリ名は `kaisyuu-mitsumori-navi` がおすすめです。
3. このプロジェクトをGitHubへpushします。

## 2. Vercelでプロジェクトを作る

1. Vercelにログインします。
2. `Add New...` → `Project` を選びます。
3. GitHubの `kaisyuu-mitsumori-navi` を選びます。
4. Framework Preset は `Next.js` のままでOKです。

## 3. Environment Variablesを設定する

Vercelの `Settings` → `Environment Variables` に以下を設定します。

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

必要になったら追加するもの:

```text
RESEND_API_KEY
NOTIFICATION_FROM_EMAIL
LINE_CHANNEL_ACCESS_TOKEN
SMS_PROVIDER_API_KEY
STRIPE_SECRET_KEY
```

## 4. Deployする

環境変数を入れたら `Deploy` を押します。

成功すると、次のようなURLが発行されます。

```text
https://kaisyuu-mitsumori-navi.vercel.app
```

## 5. 公開後に確認するページ

- `/`
- `/admin/login`
- `/admin`
- `/business/login`
- `/business/users`
- `/partners`

## 本番前の注意

- Supabaseの `service_role` または `secret` key は再発行してください。
- 管理者パスワードは `admin123` のままにしないでください。
- 業者パスワードは `password123` のままにしないでください。
- 独自ドメインを使う場合は、Vercelの `Domains` から設定します。
