import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { preparationArticle as article } from "@/lib/blog";

const url = `${brand.siteUrl}/blog/${article.slug}`;
export const metadata: Metadata = {
  title: `不用品回収の見積もり準備・写真の撮り方 | ${brand.name}`,
  description: article.description,
  alternates: { canonical: url },
  openGraph: { title: article.title, description: article.description, url, siteName: brand.name, locale: "ja_JP", type: "article", publishedTime: `${article.publishedAt}T00:00:00+09:00`, images: [{ url: `${brand.siteUrl}/hero-photo-original.png`, alt: "不用品の写真見積もりのイメージ" }] },
  twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [`${brand.siteUrl}/hero-photo-original.png`] },
};
const sections = [
  ["checklist", "見積もり前に準備する5つの情報"],
  ["photos", "写真見積もりで伝わりやすい撮り方"],
  ["questions", "追加料金を確認する質問と比較ポイント"],
  ["message", "そのまま使える見積もり依頼文の例"],
  ["faq", "見積もり前によくある質問"],
];
const linkStyle = "font-bold text-green-800 underline underline-offset-4";

export default function ArticlePage() {
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "BlogPosting", headline: article.title, description: article.description, datePublished: `${article.publishedAt}T00:00:00+09:00`, dateModified: `${article.publishedAt}T00:00:00+09:00`, mainEntityOfPage: url, image: `${brand.siteUrl}/hero-photo-original.png`, author: { "@type": "Organization", name: brand.operatorName, url: brand.siteUrl }, publisher: { "@type": "Organization", name: brand.name, url: brand.siteUrl }, inLanguage: "ja" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: brand.siteUrl }, { "@type": "ListItem", position: 2, name: "お役立ち記事", item: `${brand.siteUrl}/blog` }, { "@type": "ListItem", position: 3, name: article.title, item: url }] },
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <nav aria-label="パンくず" className="flex flex-wrap gap-2 text-sm leading-6 text-slate-600"><Link href="/" className="underline">ホーム</Link><span>/</span><Link href="/blog" className="underline">お役立ち記事</Link><span>/</span><span>見積もり前の準備</span></nav>
    <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
      <header><p className="font-bold text-green-800">見積もり・依頼の準備</p><h1 className="mt-3 text-2xl font-black leading-relaxed sm:text-4xl sm:leading-snug">{article.title}</h1><p className="mt-4 text-sm text-slate-600">公開日：<time dateTime={article.publishedAt}>2026年9月21日</time> ／ {brand.operatorName}</p></header>
      <p className="mt-6 leading-8">不用品回収の見積もりを頼む前に、まず「何を・いくつ・どこから運び出すか」を整理しましょう。品物の写真だけでなく、サイズや階段の有無、希望日も伝えると、各社が同じ条件で見積もりを出しやすくなります。</p>
      <p className="mt-4 leading-8">この記事では、初めて依頼する方に向けて、準備する情報と写真の撮り方、契約前の確認事項をまとめます。写真で出る金額は概算の場合があるため、作業前に総額と変更条件を確認することが大切です。</p>
      <Image src="/hero-photo-original.png" alt="家具や不用品を背景にスマートフォンで見積もりを相談するイメージ" width={1200} height={630} className="mt-6 h-auto w-full rounded-xl" />
      <aside className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5"><p className="font-bold text-green-900">まずはこの3点から</p><ul className="mt-3 list-disc space-y-2 pl-5 leading-7"><li>回収品のリストと全体がわかる写真を用意する</li><li>階数・エレベーター・搬出経路を伝える</li><li>税込総額と、追加費用が発生する条件を確認する</li></ul></aside>
      <nav aria-label="記事の目次" className="mt-8 rounded-xl bg-slate-50 p-5"><p className="font-bold">目次</p><ol className="mt-3 list-decimal space-y-3 pl-5">{sections.map(([id, title]) => <li key={id}><a href={`#${id}`} className={linkStyle}>{title}</a></li>)}</ol></nav>
      <div className="mt-10 space-y-10 leading-8 [&_h2]:mb-5 [&_h2]:border-l-4 [&_h2]:border-orange-500 [&_h2]:pl-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-relaxed [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_p+p]:mt-4 [&_section]:scroll-mt-6">
        <section id="checklist"><h2>見積もり前に準備する5つの情報</h2>
          <h3>1. 品目・個数・おおよそのサイズ</h3><p>「家具が数点」だけでなく、「2人掛けソファ1台、幅約150cm」のように書き出します。大きな家具は幅・奥行き・高さを測り、家電は型番や容量、動作するかもわかる範囲で添えましょう。袋や箱に入った不用品は個数と中身の種類も伝えます。</p><p>何を依頼できるか迷ったら、<Link href="/#items" className={linkStyle}>回収品目の案内</Link>を確認し、一覧にないものは対応可否を個別に相談してください。</p>
          <h3>2. 残すものと回収するものの区別</h3><p>同じ部屋にある家具でも、回収しないものがあれば明記します。写真のどの品物が対象かを番号で対応させると伝わりやすくなります。引き出しの中身や家具の周囲にある小物を含むかも、先に決めておきましょう。</p>
          <h3>3. 階数・エレベーター・搬出経路</h3><p>建物の種類と階数、エレベーターの有無、玄関や廊下の狭さを伝えます。階段での搬出、家具の分解、吊り下ろしなどが必要か判断しづらいときは、無理に動かさず、業者へ現地確認を相談しましょう。</p>
          <h3>4. 駐車位置と建物のルール</h3><p>敷地内に停められるか、玄関から車まで距離があるかを共有します。集合住宅では作業できる時間帯や共用部の養生について管理会社に確認してください。駐車場所がわからない場合は「未確認」と伝えれば大丈夫です。</p>
          <h3>5. 希望日・期限・当日の立ち会い</h3><p>退去日などの期限がある場合は最初に知らせ、可能なら複数の候補日を出します。希望する時間帯、立ち会える人、当日の連絡方法も整理しましょう。急ぎの相談でも、回収日時が確定したかを確認してから予定を組んでください。</p>
        </section>
        <section id="photos"><h2>写真見積もりで伝わりやすい撮り方</h2><p>写真は「全体」「品物ごとの詳細」「搬出経路」の順に用意すると、説明がまとまります。暗い場所では照明をつけ、全体が入る位置から撮影してください。</p>
          <ul className="mt-4 list-disc space-y-3 pl-5"><li><strong>全体：</strong>回収する品物がどれくらいあるか、部屋や置き場を少し離れて撮る。</li><li><strong>詳細：</strong>大型家具は全体の形、家電は型番や容量の表示を撮る。破損や分解済みの状態も伝える。</li><li><strong>経路：</strong>玄関、曲がり角、階段など運び出しに影響しそうな場所を撮る。幅が狭い箇所は寸法も添える。</li></ul>
          <p className="mt-4">同じ品物を別の角度から撮る場合は「写真1と2は同じソファ」と補足し、二重に数えられないようにします。写真に写らない収納の中身や別室の品物も忘れずに記載しましょう。</p><p>郵便物の住所、身分証、家族の顔など、見積もりに不要な個人情報は写さないようにしてください。撮影のために重い家具を一人で動かす必要はありません。</p>
        </section>
        <section id="questions"><h2>追加料金を確認する質問と比較ポイント</h2><p>安さを比べる前に、その事業者へ依頼できるかを確認します。家庭から出る廃棄物の処理は自治体の案内に従い、民間業者へ依頼する場合は市区町村の窓口やホームページで一般廃棄物処理業の許可業者を確認してください。</p><p>国民生活センターも、複数社の見積もりと追加料金の確認を呼びかけています。詳しくは<a href="https://www.kokusen.go.jp/news/data/n-20221102_1.html" className={linkStyle}>不用品回収サービスのトラブルに関する注意喚起</a>をご覧ください。</p>
          <h3>見積書で確認したい項目</h3><ul className="list-disc space-y-3 pl-5"><li>提示額は税込の支払総額か。基本料、搬出・作業費、出張費、処分に関する費用は含まれるか。</li><li>階段作業、分解、養生、駐車料金などで追加費用がかかるか。</li><li>回収できない品物や、別途手続き・費用が必要な品物はないか。</li><li>写真見積もりは概算か確定額か。どんな場合に金額が変わるか。</li><li>訪問見積もりだけで断った場合や、日程変更・キャンセル時の費用はあるか。</li></ul>
          <p className="mt-4">例えば「ソファ1台、3階・エレベーターなし」という同じ条件を各社へ伝え、作業範囲と総額を並べて比較します。「一式」の記載だけなら含まれる作業を聞き、メールや見積書で回答を残しましょう。追加作業が必要になった場合も、開始前に変更額を説明してもらうよう依頼します。</p><p>サイトの<Link href="/#price" className={linkStyle}>料金目安</Link>は検討の入り口として使い、実際の費用は現物・量・搬出条件を伝えて確認してください。依頼の手順は<Link href="/#flow" className={linkStyle}>見積もりから回収までの流れ</Link>で確認できます。</p>
        </section>
        <section id="message"><h2>そのまま使える見積もり依頼文の例</h2><p>以下は記入例です。ご自身の状況に置き換え、未確認の項目はその旨を記入してください。</p><blockquote className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5"><p>不用品回収の見積もりを希望します。</p><p>地域：○○市○○区<br />品目：2人掛けソファ1台（幅150×奥行80×高さ80cm）、衣装ケース3個<br />建物：集合住宅3階、エレベーターなし<br />搬出：玄関幅約80cm。ソファの分解が必要か未確認<br />駐車：敷地内は不可。近隣の駐車場所は未確認<br />希望日：○月○日または○月○日。○月○日までに完了希望</p><p>品物の全体と階段の写真を添付します。税込総額、料金に含まれる作業、追加費用が発生する条件、見積もり後に断った場合の費用を教えてください。現地確認が必要かもお知らせください。</p></blockquote><p className="mt-4">写真の後に品物が増えた場合は、回収当日まで待たずに見積もりの更新を相談します。内容を変えたら、比較中の他社にも同じ情報を伝えましょう。</p></section>
        <section id="faq"><h2>見積もり前によくある質問</h2><h3>片付けが終わっていなくても見積もりできますか？</h3><p>まずは現在の状態で相談し、回収する範囲と、まだ数量が確定していないことを伝えましょう。袋詰めや分別をどちらが担当するかでも作業内容が変わるため、必要な準備を業者に確認してください。</p><h3>写真だけで料金は確定しますか？</h3><p>業者や品物、搬出条件によって異なります。写真では大きさや経路が十分にわからない場合もあるため、「概算か確定額か」を確認します。大型家具や大量の不用品は、現地見積もりの要否も相談しましょう。</p><h3>見積もりを取ったら契約しなければいけませんか？</h3><p>見積もり依頼と回収の契約は分けて確認しましょう。訪問・見積もり自体が有料の場合もあるので、申込み前に費用の有無と、どの時点で契約になるかを尋ねます。提示条件に納得してから依頼してください。</p></section>
      </div>
      <aside className="mt-10 rounded-xl bg-green-700 p-6 text-white"><h2 className="text-2xl font-black leading-relaxed">回収品と希望日を整理して、無料見積もりへ</h2><p className="mt-3 leading-8">わかる範囲の品目・地域・搬出条件を入力してください。写真も添えて、料金と作業条件を比較する準備を始めましょう。</p><Link href="/#contact" className="mt-5 inline-block rounded-lg bg-white px-6 py-4 font-black text-green-800 hover:bg-green-50">無料一括見積もりを依頼する</Link><p className="mt-4 text-sm leading-6">回収の可否・料金・日時は各業者の回答をご確認ください。</p></aside>
      <p className="mt-6 text-sm leading-7 text-slate-600">参考：国民生活センター「不用品回収サービスのトラブル」（2022年11月2日公表、2026年9月21日確認）。地域や品物によって取扱いが異なるため、お住まいの自治体の案内もご確認ください。</p>
    </article>
  </>;
}
