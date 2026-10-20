import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { BlogArticleCard } from "@/components/BlogArticleCard";
import { ComparisonGuide } from "@/components/ComparisonGuide";
import { ContactForm } from "@/components/ContactForm";
import { AreaSearch, QuoteJourney } from "@/components/QuoteJourney";
import { IntakeNotice } from "@/components/IntakeNotice";
import { isQuoteIntakeOpen } from "@/lib/intake-status";
import { brand } from "@/lib/brand";
import { additionalArticles } from "@/lib/blog-articles";

const title = `不用品回収の一括見積もり・相見積もり比較 | ${brand.name}`;
const description = "不用品回収ナビは、不用品回収業者の相見積もりサイトです。一度の入力で対応業者へ無料見積もりを相談。複数業者の料金・日程・作業内容を比較して選べます。ご案内できる業者数は地域・回収内容によって異なります。";
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: brand.siteUrl },
  openGraph: { title, description, url: brand.siteUrl, siteName: brand.name, locale: "ja_JP", type: "website", images: [{ url: `${brand.siteUrl}/hero-home-collection.webp`, width: 1440, height: 960, alt: "室内で荷物を運ぶ回収作業のイメージ" }] },
  twitter: { card: "summary_large_image", title, description, images: [`${brand.siteUrl}/hero-home-collection.webp`] },
};

const faqs = [
  { question: "相見積もりはどのように進みますか？", answer: "フォームに地域・回収品目・希望日を入力すると、対応業者へ相談内容を共有します。各業者から案内される料金・日程・作業内容を比較し、納得してから依頼先を選んでください。ご案内できる業者数は地域や回収内容、対応状況によって異なります。" },
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
  const intakeOpen = isQuoteIntakeOpen();
  const ctaLabel = intakeOpen ? "無料で相見積もり" : "受付状況を見る";
  const articles = [...additionalArticles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  const visibleFaqs = intakeOpen ? faqs : [
    { question: "今すぐ見積もりを依頼できますか？", answer: "現在、一括見積もりは受付準備中です。受付開始はこのサイトでお知らせします。処分方法や見積もりの比較ポイントは、お役立ち記事をご利用ください。" },
    ...faqs,
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", name: brand.name, url: brand.siteUrl, description },
    { "@type": "Service", name: "不用品回収の無料相見積もり相談", provider: { "@type": "Organization", name: brand.operatorName }, serviceType: "不用品回収の相見積もり相談" },
    { "@type": "FAQPage", mainEntity: visibleFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ] };
  return <QuoteJourney><div className="collection-site">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <a href="#main-content" className="skip-link">本文へ移動</a>
    <header className="site-header">
      <div className="site-container header-main">
        <BrandLogo />
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          <a href="#compare">相見積もりのポイント</a><a href="#flow">ご利用の流れ</a><Link href="/blog">お役立ち記事</Link>
        </nav>
        <a className="primary-button header-cta" href="#contact">{ctaLabel}<Icon name="arrow" /></a>
      </div>
    </header>
    <main id="main-content">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="hero-category"><span />不用品回収の一括見積もり・比較サイト</p>
            <h1 id="hero-title"><span className="hero-intro">不用品回収は、</span><em>相見積もり</em>で。<span className="hero-ending">比べて、納得。</span></h1>
            <p className="hero-description">料金も、日程も、作業内容も。<br />複数の業者を比べて、<br className="mobile-break" />あなたに合う回収選び。</p>
            <div className="hero-benefits"><span><Icon name="check" />相談無料</span><span><Icon name="check" />入力は一度</span><span><Icon name="check" />比較してから依頼</span></div>
            <div className="hero-actions">
              <Link href={intakeOpen ? "#area" : "/blog"} className="primary-button hero-cta">{intakeOpen ? "無料でまとめて見積もり" : "回収費用・処分方法を調べる"}<Icon name="arrow" /></Link>
              <a href={intakeOpen ? "#compare" : "#contact"} className="hero-secondary">{intakeOpen ? "比較のポイントを見る" : "見積もりの受付状況"}<span aria-hidden="true">↗</span></a>
            </div>
            <p className="hero-note">{intakeOpen ? "ご案内できる業者数は、地域・回収内容によって異なります。" : "現在、見積もり受付は準備中です。"}</p>
          </div>
          <div className="hero-scene">
            <div className="hero-photo">
              <Image src="/hero-home-collection.webp" alt="室内で荷物を運ぶ回収作業のイメージ" width={1440} height={960} sizes="(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 560px" loading="eager" fetchPriority="high" />
              <span className="photo-caption">暮らしに、次の余白を。<small>回収作業のイメージ</small></span>
            </div>
            <div className="hero-comparison" aria-label="相見積もりのイメージ">
              <div className="comparison-intro"><span>相見積もりのイメージ</span><strong>一度の相談から、複数社を比較。</strong></div>
              <div className="company-papers">{["A", "B", "C"].map(company => <div className="company-paper" key={company}>
                <span className="company-letter">{company}<small>社</small></span><span className="paper-title">お見積もり</span><span className="paper-rule" /><span className="paper-rule short" />
              </div>)}</div>
              <div className="comparison-bottom"><span>税込総額</span><span>希望日</span><span>作業範囲</span><Icon name="check" /></div>
            </div>
            <p className="scene-note">紹介できる業者数は地域・回収内容によって異なります。</p>
          </div>
        </div>
        <div className="hero-navigation"><div className="site-container"><span>まずは、気になることから。</span><a href="#price">費用の考え方<Icon name="arrow" /></a><a href="#items">品物から調べる<Icon name="arrow" /></a><a href="#compare">業者の比べ方<Icon name="arrow" /></a></div></div>
      </section>

      <section id="compare" className="site-container content-section compare-section" aria-labelledby="compare-title">
        <div className="section-heading"><p className="eyebrow">01 / 比べる</p><h2 id="compare-title">安さだけで、<br />決めないための相見積もり。</h2><p>同じ品物・同じ作業条件を伝えること。<br />それが、納得できる比較のはじまりです。</p><Link href="/blog/estimate-preparation" className="text-link">相談前の準備を読む<Icon name="arrow" /></Link></div>
        <ComparisonGuide />
      </section>

      <section id="flow" className="flow-section">
        <div className="site-container content-section">
          <div className="section-heading split-heading"><div><p className="eyebrow">02 / 相談する</p><h2>一度、伝える。<br />比べて、選ぶ。</h2></div><p>あちこちに、同じ説明をする手間を少なく。<br />{intakeOpen ? "相見積もりは、3つのステップで進みます。" : "受付開始後は、3つのステップで相談できます。"}</p></div>
          <ol className="flow-grid">{[
            { icon: "photo" as const, heading: "片付けたいものを伝える", body: "地域・品目・希望日を一度入力。写真も添えて、対応業者へまとめて相談します。" },
            { icon: "yen" as const, heading: "各社の見積もりを比べる", body: "業者から電話等で届く案内を確認。料金・日程・作業内容をそろえて比べます。" },
            { icon: "check" as const, heading: "納得できる業者に依頼", body: "条件を確認して、依頼先を決定。相談の送信だけで契約や予約は確定しません。" },
          ].map((step, i) => <li key={step.heading}><div className="step-top"><span className="step-number">0{i + 1}</span><Icon name={step.icon} /></div><h3>{step.heading}</h3><p>{step.body}</p></li>)}</ol>
          <p className="field-note">ご案内できる業者数・対応日時は、地域や回収内容、各社の対応状況によって異なります。</p>
        </div>
      </section>

      <section id="area" className="site-container area-section" aria-labelledby="area-title">
        {intakeOpen ? <div className="area-panel"><div className="area-heading"><Icon name="pin" /><div><p className="eyebrow">相談は無料</p><h2 id="area-title">回収する地域から、はじめましょう。</h2></div></div><AreaSearch /><p className="field-note">選択した地域を、見積もりフォームに引き継ぎます。</p></div> : <div className="availability-bar"><span className="availability-dot" /><div><h2 id="area-title">一括見積もりは、ただいま受付準備中です。</h2><p>受付開始はこのサイトでお知らせします。</p></div><a href="#contact">受付について<Icon name="arrow" /></a></div>}
      </section>

      <section id="price" className="site-container content-section price-section" aria-labelledby="price-title">
        <div className="section-heading split-heading"><div><p className="eyebrow">03 / 費用を知る</p><h2 id="price-title">片付ける量で、<br />見積もりの見方も変わります。</h2></div><p>金額だけで比べる前に、<br />料金に含まれる作業を確認しましょう。</p></div>
        <div className="price-list">{[
          { num: "01", icon: "box" as const, label: "家具・家電を1点から", title: "単品・少量", body: "品目とサイズ、搬出する場所を伝える。", note: "回収費用に加え、出張・搬出費用も確認。", href: "/blog/sofa-disposal", link: "ソファの処分方法" },
          { num: "02", icon: "truck" as const, label: "お部屋の片付け", title: "軽トラック", body: "積める量と、プランに含む作業を確認。", note: "積み放題でも、対象品目や積載量に条件があります。", href: "/blog/kei-truck-plan", link: "軽トラプランの注意点" },
          { num: "03", icon: "truck" as const, label: "引っ越し・家財の整理", title: "まとめて回収", body: "全体の物量と、搬出経路を写真で伝える。", note: "階段・取り外し・必要な人数も含む総額で比較。", href: "/blog/moving-disposal-schedule", link: "引っ越し前の片付け" },
        ].map(row => <article className="price-row" key={row.num}><span className="price-number">{row.num}</span><div className="price-name"><Icon name={row.icon} /><div><p>{row.label}</p><h3>{row.title}</h3></div></div><div className="price-detail"><strong>{row.body}</strong><p>{row.note}</p></div><Link href={row.href} aria-label={row.link}><span>{row.link}</span><Icon name="arrow" /></Link></article>)}</div>
        <div className="price-footnote"><span>料金は条件に応じてお見積もり</span><p>品目・量・搬出条件によって変わります。税込総額と追加料金の条件を、依頼先に確認してください。</p></div>
      </section>

      <section id="items" className="items-section"><div className="site-container content-section">
        <div className="section-heading split-heading"><div><p className="eyebrow">04 / 品物から探す</p><h2>これは、どうやって捨てる？</h2></div><Link href="/blog" className="text-link">すべての記事を見る<Icon name="arrow" /></Link></div>
        <div className="item-links">{[
          ["冷蔵庫", "refrigerator-disposal", "回収先・事前の準備"], ["洗濯機", "washing-machine-disposal", "水抜き・取り外し"], ["テレビ", "television-disposal", "リサイクル・費用"], ["エアコン", "air-conditioner-disposal", "室外機・取り外し工事"],
          ["ソファ", "sofa-disposal", "粗大ごみ・運び出し"], ["マットレス", "mattress-disposal", "素材・搬出条件"], ["パソコン", "computer-disposal", "無料回収・データ消去"], ["モバイルバッテリー", "mobile-battery-disposal", "回収先・膨張した場合"],
        ].map(([name, slug, detail]) => <Link href={`/blog/${slug}`} key={slug}><span><strong>{name}</strong><small>{detail}</small></span><span className="item-arrow" aria-hidden="true">↗</span></Link>)}</div>
      </div></section>

      <section className="site-container content-section journal-section" aria-labelledby="journal-title">
        <div className="section-heading split-heading"><div><p className="eyebrow">読みもの</p><h2 id="journal-title">片付けの前に、ひと読み。</h2></div><Link href="/blog" className="text-link">記事一覧へ<Icon name="arrow" /></Link></div>
        <div className="journal-grid">{articles.map(article => <BlogArticleCard key={article.slug} article={article} />)}</div>
      </section>

      <section id="faq" className="site-container content-section faq-section" aria-labelledby="faq-title"><div className="section-heading"><p className="eyebrow">よくある質問</p><h2 id="faq-title">気になること、<br />先に解決。</h2></div><div className="faq-list">{visibleFaqs.map(faq => <details key={faq.question}><summary><span>Q</span>{faq.question}<span className="faq-toggle" aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></section>

      <section id="contact" className="contact-section"><div className="site-container contact-grid">
        <div className="contact-copy"><p className="eyebrow">不用品回収ナビ</p><h2>その片付けに、<br />納得できる選択を。</h2><p>料金・日程・作業内容。<br />あなたの条件に合う回収選びをお手伝いします。</p><div className="contact-checks"><span><Icon name="check" />見積もり相談無料</span><span><Icon name="check" />比較してから依頼</span></div></div>
        <div className="quote-form">{intakeOpen ? <><div className="quote-form-heading"><span>無料</span><h3>一括見積もり依頼フォーム</h3></div><ContactForm /></> : <IntakeNotice />}</div>
      </div></section>
    </main>
    <footer className="site-footer"><div className="site-container"><div className="footer-main"><div><BrandLogo /><p>不用品回収の見積もりを、もっとわかりやすく。</p></div><nav aria-label="フッターナビゲーション"><Link href="/blog">お役立ち記事</Link><Link href="/partners">掲載をご希望の事業者様</Link><Link href="/about">運営者情報</Link><Link href="/privacy">個人情報の取り扱い</Link><Link href="/business/login">業者ログイン</Link></nav></div><div className="footer-bottom"><span>くらしを、すっきり。その一歩に。</span><small>© {new Date().getFullYear()} {brand.name}</small></div></div></footer>
    <nav className="mobile-cta" aria-label="すぐに使えるメニュー"><Link href={intakeOpen ? "#compare" : "#items"}>{intakeOpen ? "比較のポイント" : "品物から調べる"}</Link><a href="#contact" className="primary-button">{ctaLabel}<Icon name="arrow" /></a></nav>
  </div></QuoteJourney>;
}
