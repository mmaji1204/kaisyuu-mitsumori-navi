import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { BlogArticleCard } from "@/components/BlogArticleCard";
import { ContactForm } from "@/components/ContactForm";
import { AreaSearch, QuoteJourney } from "@/components/QuoteJourney";
import { brand } from "@/lib/brand";
import { additionalArticles } from "@/lib/blog-articles";

const title = `不用品回収の無料見積もり・料金比較 | ${brand.name}`;
const description = "不用品回収の料金・対応日時・作業条件をそろえて比較。お住まいの地域や回収品目、写真を添えて無料見積もりを相談できます。家具・家電の処分や見積もり準備に役立つ記事もご紹介。";
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: brand.siteUrl },
  openGraph: { title, description, url: brand.siteUrl, siteName: brand.name, locale: "ja_JP", type: "website", images: [{ url: `${brand.siteUrl}/hero-collection-truck.webp`, width: 1200, height: 900, alt: "家具や家電を積んだ回収トラックのイラスト" }] },
  twitter: { card: "summary_large_image", title, description, images: [`${brand.siteUrl}/hero-collection-truck.webp`] },
};

const faqs = [
  { question: "見積もりの相談は無料ですか？", answer: "このサイトからの見積もり相談は無料です。回収作業の費用は、品目・量・搬出条件によって異なります。見積もりの総額と追加費用の条件を確認してから依頼してください。" },
  { question: "写真がなくても相談できますか？", answer: "写真なしでも相談できます。品目・数量・サイズ・搬出経路が分かる写真を添えると、状況が伝わりやすくなります。写真は5枚まで添付できます。" },
  { question: "今日や明日の回収も相談できますか？", answer: "希望日時をフォームに記入してご相談ください。対応できる日時は地域・回収内容・業者の空き状況によって異なります。送信した時点では予約は確定しません。" },
  { question: "見積もりを依頼すると、必ず契約になりますか？", answer: "フォームの送信は見積もりの相談です。回収の予約・契約は、提示された料金や作業条件を確認してから決めてください。訪問見積もりやキャンセルに費用がかかるかは依頼先に確認しましょう。" },
];

function Icon({ name, className = "" }: { name: "pin" | "box" | "truck" | "check" | "clock" | "yen" | "photo" | "arrow"; className?: string }) {
  const paths = {
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    box: <><path d="m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v11M7 5l10 4" /></>,
    truck: <><path d="M2 5h12v13H2V5Zm12 5h4l4 5v3h-8M14 15h8" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
    yen: <><path d="m6 3 6 8 6-8M12 11v10M6 12h12M6 16h12" /></>,
    photo: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="m7 5 1-3h8l1 3" /><circle cx="12" cy="13" r="4" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const articles = [...additionalArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", name: brand.name, url: brand.siteUrl, description },
    { "@type": "Service", name: "不用品回収の無料見積もり相談", provider: { "@type": "Organization", name: brand.operatorName }, serviceType: "不用品回収の見積もり相談" },
    { "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ] };
  return <QuoteJourney><div className="collection-site">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <a href="#main-content" className="skip-link">本文へ移動</a>
    <header className="site-header">
      <div className="site-container header-main">
        <BrandLogo />
        <div className="header-actions"><Link href="/partners">掲載をご希望の事業者様へ <span aria-hidden="true">↗</span></Link><a className="primary-button" href="#contact">無料見積もり <Icon name="arrow" /></a></div>
      </div>
      <nav className="site-container main-nav" aria-label="メインナビゲーション">
        <a href="#area">地域から相談</a><a href="#compare">業者の比較ポイント</a><a href="#price">料金の目安</a><a href="#flow">ご利用の流れ</a><Link href="/blog">お役立ち記事</Link><a href="#faq">よくある質問</a>
      </nav>
    </header>
    <main id="main-content">
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">不用品回収の無料見積もり相談</p>
            <h1>料金も、対応も。<br /><em>納得して選ぶ、</em><br />不用品回収。</h1>
            <p className="hero-description">片付けたいものも、希望の日程も。<br />あなたの条件を伝えて、<br className="mobile-break" />自分に合った回収方法を見つけましょう。</p>
            <div className="hero-checks"><span><Icon name="check" />家具1点から相談</span><span><Icon name="check" />写真も添付OK</span></div>
            <div className="hero-action">
              <a className="primary-button hero-button" href="#area">無料で見積もりを相談する <Icon name="arrow" /></a>
              <p className="hero-note">まずは、お住まいの地域から。</p>
            </div>
          </div>
          <aside className="hero-guide" aria-label="見積もりの比較ポイント">
            <p className="hero-guide-label">選ぶ前に、ここをチェック</p>
            <h2>比べたいのは、<br />あなたに合うかどうか。</h2>
            <ul>
              <li><span className="hero-guide-icon"><Icon name="yen" /></span><div><strong>料金</strong><p>追加費用まで含めた総額</p></div></li>
              <li><span className="hero-guide-icon"><Icon name="clock" /></span><div><strong>日程</strong><p>希望する日時に対応できるか</p></div></li>
              <li><span className="hero-guide-icon"><Icon name="box" /></span><div><strong>作業内容</strong><p>搬出や取り外しの対応範囲</p></div></li>
            </ul>
            <div className="hero-guide-foot"><p>小さな片付けから、<br />新しい暮らしの準備まで。</p><Image src="/hero-collection-truck.webp" alt="家具や家電を載せた回収トラックのイメージイラスト" width={120} height={90} sizes="120px" className="hero-image" /></div>
          </aside>
        </div>
      </section>
      <section id="area" className="site-container area-section" aria-labelledby="area-title">
        <div className="area-panel"><div className="area-heading"><span className="icon-bubble"><Icon name="pin" /></span><div><p className="eyebrow">まずは、お住まいの地域から</p><h2 id="area-title">回収を希望する地域を入力</h2></div><span className="free-label">相談無料</span></div>
          <AreaSearch />
          <p className="field-note">入力した地域を見積もりフォームに引き継ぎます。対応可否は地域・回収内容をもとに確認します。</p>
        </div>
      </section>
      <section id="compare" className="site-container content-section">
        <div className="section-heading"><p className="eyebrow">COMPARE</p><h2>安さだけで決めない、<br className="mobile-break" />納得できる業者選び。</h2><p>同じ品目・作業条件を伝えて、見積もりを比べましょう。</p></div>
        <div className="comparison-grid">
          {[
            { icon: "yen" as const, num: "01", title: "追加費用を含む総額", body: "基本料金だけでなく、搬出・出張・処分にかかる費用まで。見積書で内訳を確認しましょう。", tags: ["税込の総額", "追加料金の条件"] },
            { icon: "clock" as const, num: "02", title: "希望日と対応の丁寧さ", body: "回収日時や返信内容、説明の分かりやすさを確認。口コミは投稿内容や時期も見て判断しましょう。", tags: ["希望日時", "口コミ・説明内容"] },
            { icon: "check" as const, num: "03", title: "回収方法と作業条件", body: "処分先や回収の方法、室内からの搬出範囲、キャンセル条件まで。気になる点は依頼前に相談を。", tags: ["搬出・養生", "キャンセル条件"] },
          ].map(card => <article className="comparison-card" key={card.num}><div className="card-topline"><span className="icon-bubble"><Icon name={card.icon} /></span><span className="card-number">{card.num}</span></div><h3>{card.title}</h3><p>{card.body}</p><div className="tag-row">{card.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}
        </div>
        <div className="section-footnote"><p>料金・口コミ・対応条件は、ご自身でも依頼先に確認しましょう。</p><Link href="/blog/estimate-preparation">見積もりの確認リストを見る <span aria-hidden="true">→</span></Link></div>
      </section>
      <section id="price" className="tinted-section">
        <div className="site-container content-section">
          <div className="section-heading"><p className="eyebrow">PRICE GUIDE</p><h2>どのくらい片付ける？<br className="mobile-break" />量から考える料金の目安。</h2><p>回収量に加えて、品目や搬出条件で費用が変わります。</p></div>
          <div className="price-grid">
            {[
              { icon: "box" as const, label: "家具・家電を1点から", title: "単品・少量の回収", text: "ソファやマットレスなど、品目とサイズを伝えて相談。", href: "/blog/sofa-disposal", link: "ソファの処分費用を読む" },
              { icon: "truck" as const, label: "お部屋の片付けに", title: "軽トラックでの回収", text: "まとめて処分したいときは、積める量と料金に含まれる作業を確認。", href: "/blog/kei-truck-plan", link: "軽トラプランの確認事項" },
              { icon: "truck" as const, label: "引っ越し・大型家具に", title: "トラックでまとめて回収", text: "荷物の全体量と搬出経路を伝え、車両や人員を含めて相談。", href: "/blog/moving-disposal-schedule", link: "引っ越し前の準備を読む" },
            ].map(card => <article className="price-card" key={card.title}><Icon name={card.icon} /><p className="price-label">{card.label}</p><h3>{card.title}</h3><p className="price-value">条件に応じてお見積もり</p><p className="price-description">{card.text}</p><Link href={card.href}>{card.link} <span aria-hidden="true">→</span></Link></article>)}
          </div>
          <p className="field-note centered">掲載業者の確定料金表ではありません。階段作業や取り外しなども含む総額を、依頼先に確認してください。</p>
        </div>
      </section>
      <section id="items" className="site-container content-section items-section">
        <div><p className="eyebrow">PICKUP ITEMS</p><h2>片付けたいものから、<br />まずは調べてみる。</h2><p>処分の方法や準備は、品物によってさまざま。<br />相談前の疑問を、記事で解消できます。</p></div>
        <div className="item-links">{[["洗濯機", "washing-machine-disposal"], ["冷蔵庫", "refrigerator-disposal"], ["ソファ", "sofa-disposal"], ["マットレス", "mattress-disposal"], ["引っ越しの不用品", "moving-disposal-schedule"], ["まとめて片付け", "kei-truck-plan"]].map(([name, slug]) => <Link href={`/blog/${slug}`} key={slug}>{name}<span aria-hidden="true">↗</span></Link>)}</div>
      </section>
      <section id="flow" className="flow-section">
        <div className="site-container content-section"><div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>相談から回収まで、<br className="mobile-break" />ひとつずつ。</h2></div>
          <ol className="flow-grid">{[
            ["相談する", "地域・品目・希望日を入力。写真を添えると状況が伝わります。"],
            ["見積もりを確認する", "連絡を受けたら、総額・作業範囲・対応日時を確認します。"],
            ["納得して依頼する", "条件に納得したら回収を予約。気になる点は契約前に確認を。"],
          ].map(([heading, body], i) => <li key={heading}><span className="step-number">STEP <b>0{i + 1}</b></span><h3>{heading}</h3><p>{body}</p></li>)}</ol>
        </div>
      </section>
      <section id="reviews" className="site-container review-guide">
        <span className="quote-mark" aria-hidden="true">“</span><div><p className="eyebrow">口コミを参考にするときは</p><h2>星の数より、<br className="mobile-break" />自分と近い依頼内容を。</h2><p>同じ品目・量・搬出条件の体験談かを確認しましょう。追加料金の説明や当日の対応など、具体的な内容が比較のヒントになります。</p></div><Link href="/blog/estimate-preparation" className="outline-button">業者選びの準備を読む <Icon name="arrow" /></Link>
      </section>
      <section className="tinted-section"><div className="site-container content-section">
        <div className="section-heading split-heading"><div><p className="eyebrow">JOURNAL</p><h2>片付けを、もっとわかりやすく。</h2><p>処分方法から費用の確認まで。暮らしに役立つ読みもの。</p></div><Link href="/blog" className="text-link">すべての記事を見る <span aria-hidden="true">→</span></Link></div>
        <div className="journal-grid">{articles.map(article => <BlogArticleCard key={article.slug} article={article} />)}</div>
      </div></section>
      <section id="faq" className="site-container content-section faq-section"><div><p className="eyebrow">Q & A</p><h2>よくあるご質問</h2><p>ご相談前の気になること。</p></div><div className="faq-list">{faqs.map(faq => <details key={faq.question}><summary><span>Q.</span>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
      <section id="contact" className="contact-section"><div className="site-container contact-grid">
        <div className="contact-copy"><p className="eyebrow">LET’S GET STARTED</p><h2>すっきりした暮らしを、<br />ここから。</h2><p>何を、いつ、どのくらい片付けたいか。<br />まずはお気軽にご相談ください。</p><ul><li><Icon name="check" />見積もりの相談は無料</li><li><Icon name="check" />写真は任意・5枚まで添付可能</li><li><Icon name="check" />条件を確認してから回収を予約</li></ul><div className="contact-note">地域や回収内容によって、ご案内できる業者・対応日時は異なります。</div></div>
        <div className="quote-form"><div className="quote-form-heading"><span>無料</span><h3>見積もり相談フォーム</h3></div><ContactForm /></div>
      </div></section>
    </main>
    <footer className="site-footer"><div className="site-container"><div className="footer-main"><BrandLogo /><nav aria-label="フッターナビゲーション"><Link href="/blog">お役立ち記事</Link><Link href="/partners">掲載会社様へ</Link><Link href="/business/login">業者ログイン</Link></nav></div><div className="footer-bottom"><p>不用品回収の見積もりを、もっとわかりやすく。</p><small>© {new Date().getFullYear()} {brand.name}</small></div></div></footer>
    <div className="mobile-cta"><a href="#area" className="outline-button">地域から相談</a><a href="#contact" className="primary-button">無料見積もり <Icon name="arrow" /></a></div>
  </div></QuoteJourney>;
}
