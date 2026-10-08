# Vercel公開・受付開始の手順

公開先: https://kaisyuu-mitsumori-navi-main.vercel.app/

## 現状（2026年10月8日）

記事・サイトは公開済みです。Supabaseプロジェクト `kiykxxadnhmprdjjjdwz` は停止中で、組織のサービス制限により復元が拒否されています。料金の発生するアップグレードは実施していません。

`QUOTE_INTAKE_ENABLED` の初期値は false です。停止中は個人情報の入力フォームを表示せず、POST /api/leads は本文を読む前に503を返します。ブログは通常どおり閲覧できます。

## 設定

`.env.example` に全項目を記載しています。VercelのProduction環境に設定し、変更後は再デプロイしてください。公開画面はビルド時の設定を使います。

- 保存先: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- 管理者: `ADMIN_LOGIN_EMAIL`, `ADMIN_LOGIN_PASSWORD`, `ADMIN_SESSION_SIGNING_SECRET`
- 業者セッション: `BUSINESS_SESSION_SIGNING_SECRET`
- 通知: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFY_EMAIL`
- 公開情報: `OPERATOR_LEGAL_NAME`, `OPERATOR_ADDRESS`, `OPERATOR_CONTACT_EMAIL`
- 受付切替: `QUOTE_INTAKE_ENABLED=false`（確認完了後に true）

署名鍵はそれぞれ独立した32バイト以上の乱数を使い、画面・ログ・リポジトリへ貼り付けないでください。旧 `ADMIN_SESSION_TOKEN` / `BUSINESS_SESSION_TOKEN` は使用しません。旧Cookieを失効させるため、過去のトークンを新しい署名鍵へ流用しないでください。管理者・業者とも再ログインが必要です。本番でのデモログインは無効です。

## 受付を開始する前の確認

1. Supabase組織の制限を解除し、プロジェクトを復元する。契約や料金変更が必要なら所有者が判断する。
2. 現在のDB構造・既存データ・RLSを確認する。必要な差分のみ適用し、`supabase/migrations/20261008042028_add_lead_consent.sql` で同意版と日時の列を追加する。既存依頼の同意を推定して埋めない。
3. Storageの `lead-photos` を非公開にする。既存の公開URLでは写真を読めないこと、管理者・配信先業者だけが写真を読めることを確認する。アップロード時にも非公開化を確認するが、既存写真保護のため受付開始前に完了させる。
4. `partner@example.com` 等の試用業者が実データにアクセスしないことを点検する。新規業者の自動配信は初期OFF。運営者が許可・対応地域・連絡先・配信条件を確認してから個別に有効にする。
5. 運営会社の正式名称・所在地・窓口を確定し、`/about` に掲載する。`/privacy` は準備中の案内を含むため、実際の委託先・保管場所・保存期間・国外処理条件を確定して本文を仕上げる。現在のSupabaseリージョンは ap-south-1。国外処理の確認を省略しない。
6. 通知の送信元ドメイン、宛先、受信を確認する。`npm run check:launch` は読取専用であり、メール送信や配信・請求を行わない。通知の実受信、RLS、写真の実権限まではこのコマンドだけで確認できない。
7. ステージングの専用業者・合成データで受付→保存→通知→担当業者への表示→同意記録を確認する。実業者への試験送信は配信料・連絡を発生させるため使わない。通知失敗時はDBの通知記録を管理者が確認し対応する。自動再送は未実装。
8. `npm test`, `npm run lint`, `npm run build` を実行する。PC・スマホでフォーム、同意欄、受付完了を確認する。
9. 全項目の確認後だけ `QUOTE_INTAKE_ENABLED=true` で再デプロイする。公開サイトで表示と受付状況を確認する。障害時は false に戻して再デプロイする。

## コードと実環境の区別

自動テストはモックを用い、顧客情報・メール・請求を外部に送信しません。ビルド成功はDB復旧や通知受信の証明ではありません。未設定項目があれば受付は開きませんが、環境変数の存在だけではサービスの稼働は保証されません。

GitHubのmain更新でVercelへ反映します。公開後は `/`, `/blog`, `/about`, `/privacy`, `/partners` と、ログイン前の `/api/leads` のアクセス拒否を確認してください。
