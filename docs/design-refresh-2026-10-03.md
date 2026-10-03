# 2026-10-03 デザイン更新

## 参照と範囲
参照チャット「不用品回収サイトデザイン案」の取得可能な本文に基づく。添付デザイン画像・実物の成果物は取得できず、画像の忠実な複製ではない。白・緑・オレンジ、明るい住宅と回収スタッフの写真、地域から見積もりへ進む導線を実装。

名称を「不用品回収の窓口」に統一。トップ、共通ロゴ、記事のヘッダーとフッター、フォームを更新。既存のURL、API、記事本文、日付、記事画像、サイトマップは維持。洗濯機記事を含む公開済み7記事を保持。

既存トップの業者名・評価・口コミ・実績件数・料金・返信速度は裏付けが確認できないサンプルだったため削除。料金は数量別の確認事項と既存解説記事へ接続。口コミは評価の読み方に置き換えた。地域別の公開業者一覧・詳細・条件検索は現行ソースに存在しないため、実在する機能として表示していない。都道府県を選択し、市区町村を手入力すると見積もりフォームへ引き継ぐ。

## 画像
- 保存先: `public/hero-home-collection.webp`
- 組み込みの image_gen による新規生成。既存画像は保持。WebP化して約104KB。
- サービスのイメージ画像であり、実在する業者・作業実績・利用者ではない。表示上にも注記。
- 最終生成プロンプト:

> Create a polished photorealistic editorial website hero photograph, landscape 3:2. A bright clean contemporary Japanese home living room, warm daylight, white walls, pale oak floor, cream sofa and a leafy green plant. Two friendly Japanese adult removal-service staff in clean muted forest green polo shirts, beige work trousers and white gloves, carefully handling a medium cardboard box near the sofa. Natural candid reassuring interaction, tidy uncluttered space, professional lifestyle advertising photography, soft warm neutral colors, authentic proportions. Compose staff on the right two-thirds with airy window light on left. No text, no logo, no watermark, no collage. This is an illustrative service image, not a real company or testimonial.

## 公開方針
元プロジェクトの「サイト運用・SEO管理/リンク君_サイト運用権限.md」に日常運用の判断・実行・公開の委任が記録されている。検証後、既存の main → GitHub → Vercel の経路を利用する。別サイトには変更しない。

## 残る制約
地域別業者検索・業者詳細・実データの口コミは未実装。掲載会社向けページの既存相談フォームは送信処理が未接続（今回のデザイン更新対象外）。顧客への実通知や本番DBへの問い合わせ登録は今回の表示検証では行わない。依存パッケージと認証・業者管理・配信処理は変更しない。

## 検証
- lint・本番ビルド（Next.js 16.2.10）成功。31ページの生成完了。
- 1440px・390px・320pxのブラウザ表示で横はみ出しなし。トップの画像を全て読み込み確認。
- 地域選択から「広島県広島市中区」の引き継ぎ、フォーム先頭へのフォーカス移動を確認。
- APIの応答をブラウザ内で置き換え、送信失敗時のエラー表示と成功時の完了表示を確認。実問い合わせ・通知は発生させていない。
- FAQの開閉、トップのページ内リンク、記事一覧7件、洗濯機記事のcanonical・公開日・スマホ表示を確認。
- ブラウザの実行時エラーなし。
- 既存依存関係のnpm監査は13件（moderate 1、high 11、critical 1）を報告。今回依存関係は変更せず、別途保守が必要。
