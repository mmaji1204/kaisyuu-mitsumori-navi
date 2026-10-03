# イラスト入りトップの更新

ユーザーが提示した黄色の背景・水色のパネル・回収トラック・無料見積もりボタンの画面を参考に、現在のトップを更新。

- コピー：「不用品回収、いくらかかる？」「料金も、対応も。比べて納得。」
- 「日本最大級」「もっとも安いが今スグわかる」など、確認できない主張は使用しない。
- ボタンは既存の地域入力へ接続し、その地域が見積もりフォームへ引き継がれる。
- 新規イラスト：`public/hero-collection-truck.webp`（1200×900、透明背景）。組み込みimage_genで制作。参照の他社ロゴ・イラストは転載していない。
- 従来の写真と記事・フォーム・URLは保持。

## 生成プロンプト
Create an original flat editorial vector-style illustration for a friendly Japanese household unwanted-item collection comparison website. Isolated on a truly transparent background. One compact Japanese cab-over pickup removal truck facing LEFT, shown in appealing three-quarter front view; the cabin at lower left, cargo bed toward right. Entire truck and tires visible with generous clear margin. Truck body warm ivory white, dark forest green lower body and accents, turquoise windows, bright golden yellow cargo bed accents. Carefully arranged recognizable household items in cargo: a small pale refrigerator, front-loading washing machine, ochre armchair, two cardboard boxes and a rolled rug, secure neatly inside bed. Bold clean dark navy outlines, rounded geometry, crisp flat colors, no gradients, almost no shading. Friendly modern commercial illustration, strong silhouette readable at small size. Add three small yellow sparkle accents near cargo. No people, no rubbish bags, no trash spill, no text, no letters, no logos, no watermark, no background, no ground pattern. Landscape 4:3 composition. Original artwork; do not imitate any existing brand mascot or exact competitor truck illustration.

## 確認
lint・本番ビルド成功。PC 1440px、スマホ390px・320pxで横はみ出しなし。トラック画像の表示、無料見積もりボタンから地域入力への移動、市区町村のフォームへの引き継ぎ、ブラウザ実行時エラーなしを確認。
