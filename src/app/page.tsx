import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { brand } from "@/lib/brand";

const siteUrl = "https://kaisyuu-mitsumori-navi.vercel.app";

export const metadata: Metadata = {
  title: "不用品回収の相見積もり・料金比較なら回収見積もりナビ",
  description:
    "不用品回収・粗大ゴミ処分の見積もりを無料で比較。最大5社の料金、口コミ、対応スピード、追加費用をまとめて確認できます。写真を送って最短即日相談。",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "不用品回収の相見積もり・料金比較なら回収見積もりナビ",
    description:
      "不用品回収・粗大ゴミ処分の見積もりを無料で比較。料金、口コミ、対応スピードをまとめて確認できます。",
    url: siteUrl,
    siteName: brand.name,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: `${siteUrl}/hero-photo-original.png`,
        width: 1200,
        height: 630,
        alt: "回収見積もりナビの不用品回収相見積もりサービス",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "不用品回収の相見積もり・料金比較なら回収見積もりナビ",
    description:
      "最大5社の不用品回収見積もりを無料比較。料金、口コミ、対応スピードを見て選べます。",
    images: [`${siteUrl}/hero-photo-original.png`],
  },
};

const navItems = [
  { label: "ホーム", href: "#" },
  { label: "流れ", href: "#flow" },
  { label: "料金目安", href: "#price" },
  { label: "回収品目", href: "#items" },
  { label: "対応エリア", href: "#area" },
  { label: "口コミ", href: "#reviews" },
  { label: "よくある質問", href: "#faq" },
];

const trustStats = [
  { label: "比較できる業者", value: "最大5社" },
  { label: "入力時間", value: "約30秒" },
  { label: "見積もり費用", value: "0円" },
  { label: "写真見積もり", value: "対応" },
];

const heroChecks = [
  "料金・口コミ・対応日時をまとめて比較",
  "写真だけでも概算見積もりを取りやすい",
  "追加費用やキャンセル条件も確認できる",
];

const meritCards = [
  { title: "最大5社に", body: "まとめて見積もり", mark: "5" },
  { title: "料金を比較", body: "安い業者を探せる", mark: "￥" },
  { title: "口コミを確認", body: "対応品質も見える", mark: "声" },
  { title: "最短即日", body: "急ぎの回収も相談", mark: "即" },
  { title: "無料で依頼", body: "キャンセル相談も無料", mark: "0" },
];

const comparisonPoints = [
  {
    title: "総額見積もり",
    body: "基本料金・作業費・出張費・処分費をまとめて確認。",
    icon: "￥",
  },
  {
    title: "トラック量",
    body: "軽トラ、1.5t、2tなど量に合わせて比較。",
    icon: "車",
  },
  {
    title: "口コミ・返信速度",
    body: "料金だけでなく、対応の丁寧さや返信時間も見える。",
    icon: "★",
  },
  {
    title: "追加費用",
    body: "階段作業、搬出距離、家電リサイクル料金を事前確認。",
    icon: "＋",
  },
];

const vendors = [
  {
    name: "クリーン回収",
    score: "4.8",
    price: "軽トラ 12,800円〜",
    speed: "平均返信 12分",
    badge: "即日OK",
    color: "bg-emerald-500",
  },
  {
    name: "ECOスマイル",
    score: "4.6",
    price: "1.5t 28,000円〜",
    speed: "写真見積もり対応",
    badge: "口コミ多数",
    color: "bg-lime-500",
  },
  {
    name: "すっきり本舗",
    score: "4.7",
    price: "軽トラ 14,000円〜",
    speed: "平均返信 18分",
    badge: "女性スタッフ可",
    color: "bg-sky-500",
  },
  {
    name: "片付けマスター",
    score: "4.6",
    price: "2t 48,000円〜",
    speed: "大型家具に強い",
    badge: "保険加入",
    color: "bg-red-500",
  },
  {
    name: "リサイクル回収センター",
    score: "4.6",
    price: "軽トラ 13,500円〜",
    speed: "買取相談OK",
    badge: "買取対応",
    color: "bg-orange-500",
  },
  {
    name: "便利屋お片付け本舗",
    score: "4.4",
    price: "少量 5,500円〜",
    speed: "単品回収OK",
    badge: "少量向け",
    color: "bg-blue-500",
  },
];

const priceGuides = [
  { title: "単品回収", volume: "洗濯機・テレビなど", price: "5,500円〜", note: "近距離・少量向け" },
  { title: "軽トラック", volume: "1Kの片付け目安", price: "12,800円〜", note: "一番相談が多い" },
  { title: "1.5tトラック", volume: "1DK〜2DK目安", price: "28,000円〜", note: "家具家電まとめて" },
  { title: "2tトラック", volume: "家族住まい・大型家具", price: "48,000円〜", note: "現地確認がおすすめ" },
];

const searchIntentCards = [
  {
    title: "不用品回収の費用を安くしたい",
    body: "同じ品目でも業者によって料金差が出やすいため、複数社の総額見積もりを比べるのがおすすめです。",
  },
  {
    title: "粗大ゴミを早く片付けたい",
    body: "自治体回収の予約が先になる場合でも、民間業者なら即日・土日対応を相談できます。",
  },
  {
    title: "大型家具や家電をまとめて処分したい",
    body: "搬出経路、階段、トラック量を写真で共有すると、追加費用のズレを減らせます。",
  },
];

const pickupItems = [
  "ソファ",
  "ベッド",
  "マットレス",
  "冷蔵庫",
  "洗濯機",
  "テレビ",
  "タンス",
  "食器棚",
  "机",
  "椅子",
  "エアコン",
  "電子レンジ",
];

const priceCompare = [
  { company: "A社", price: "98,000円" },
  { company: "B社", price: "78,000円" },
  { company: "C社", price: "58,000円", best: true },
  { company: "D社", price: "85,000円" },
  { company: "E社", price: "90,000円" },
];

const recentQuotes = [
  ["08月19日 07:25", "広島県広島市", "ソファ・テーブル・棚など", "5社に依頼"],
  ["08月19日 07:08", "東京都港区", "洗濯機・冷蔵庫・ベッド", "4社に依頼"],
  ["08月19日 06:52", "神奈川県横浜市", "テレビ・机・衣装ケース", "3社に依頼"],
  ["08月18日 22:41", "大阪府大阪市", "大型家具・家電まとめて", "5社に依頼"],
  ["08月18日 21:33", "福岡県福岡市", "不用品回収 軽トラック", "4社に依頼"],
];

const flowSteps = [
  { title: "条件入力", body: "地域・品目・量を入力" },
  { title: "写真追加", body: "スマホ写真で精度UP" },
  { title: "複数社へ配信", body: "対応可能な業者に送信" },
  { title: "見積もり比較", body: "料金・口コミを確認" },
  { title: "回収予約", body: "納得した業者に依頼" },
];

const reasons = [
  ["相見積もり特化", "料金差を見逃しにくい"],
  ["業者情報を整理", "口コミ・対応範囲を確認"],
  ["写真で相談", "概算のズレを減らせる"],
  ["営業を抑制", "必要な連絡だけ受け取る"],
];

const reviewCards = [
  {
    area: "広島県広島市",
    title: "ソファと棚をまとめて回収",
    body: "写真を送ったので当日の追加説明が少なく、料金も比較して選べました。",
  },
  {
    area: "東京都港区",
    title: "引っ越し前の家電回収",
    body: "返信が早い業者と料金が安い業者を見比べられて、急ぎでも決めやすかったです。",
  },
  {
    area: "大阪府大阪市",
    title: "大型家具を2tトラックで相談",
    body: "階段作業の追加費用まで事前に確認でき、見積もりの不安が減りました。",
  },
];

const faqItems = [
  {
    question: "不用品回収の見積もりは本当に無料ですか？",
    answer:
      "はい。回収見積もりナビからの一括見積もり依頼は無料です。実際に回収を依頼する前に、料金や追加費用を確認できます。",
  },
  {
    question: "写真なしでも見積もりできますか？",
    answer:
      "写真なしでも相談できますが、品目の量や搬出状況が分かる写真を送ると、概算見積もりのズレを減らしやすくなります。",
  },
  {
    question: "自治体の粗大ゴミ回収と何が違いますか？",
    answer:
      "自治体回収は安い場合がありますが、日時指定や搬出に制限があります。民間業者は即日対応や室内からの搬出、まとめて回収を相談しやすい点が特徴です。",
  },
  {
    question: "どのくらいの業者に見積もり依頼できますか？",
    answer:
      "地域や回収内容に応じて、対応可能な業者へ最大5社を目安に見積もり依頼できます。",
  },
];

const areaLabels = [
  { name: "北海道", x: "76%", y: "10%" },
  { name: "東北", x: "72%", y: "28%" },
  { name: "関東", x: "70%", y: "58%" },
  { name: "中部", x: "54%", y: "56%" },
  { name: "近畿", x: "44%", y: "66%" },
  { name: "中国", x: "31%", y: "65%" },
  { name: "四国", x: "38%", y: "78%" },
  { name: "九州", x: "18%", y: "78%" },
  { name: "沖縄", x: "9%", y: "91%" },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: brand.name,
        url: siteUrl,
        description: metadata.description,
      },
      {
        "@type": "Service",
        name: "不用品回収の相見積もり・料金比較",
        provider: {
          "@type": "Organization",
          name: brand.operatorName,
        },
        areaServed: "JP",
        serviceType: "不用品回収、粗大ゴミ処分、一括見積もり",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "JPY",
          description: "無料一括見積もり",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#fffaf2] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 py-3 lg:px-5">
          <a href="#" className="flex min-w-0 items-center gap-3">
            <span className="relative h-16 w-20 shrink-0">
              <span className="absolute left-1 top-2 h-12 w-12 rounded-full bg-[#5b351f] shadow-sm" />
              <span className="absolute left-0 top-1 h-5 w-5 rounded-full bg-[#5b351f]" />
              <span className="absolute left-9 top-1 h-5 w-5 rounded-full bg-[#5b351f]" />
              <span className="absolute left-3 top-4 h-8 w-8 rounded-full bg-white" />
              <span className="absolute left-4 top-5 h-3 w-3 rounded-full bg-neutral-900" />
              <span className="absolute left-8 top-5 h-3 w-3 rounded-full bg-neutral-900" />
              <span className="absolute left-[26px] top-8 h-2 w-2 rounded-full bg-orange-500" />
              <span className="absolute left-5 top-0 h-4 w-7 rounded-t-full bg-green-600" />
              <span className="absolute bottom-1 right-0 h-8 w-10 rounded bg-amber-700 shadow-sm" />
              <span className="absolute bottom-5 right-0 h-1 w-10 bg-amber-500" />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-bold text-slate-600">{brand.longTagline}</span>
              <span className="block text-2xl font-black tracking-normal sm:text-3xl">
                {brand.namePrefix}
                <span className="text-orange-600">{brand.nameAccent}</span>
              </span>
            </span>
          </a>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-xs font-bold">受付時間 8:00〜20:00 年中無休で対応！</p>
              <a href={brand.phoneHref} className="text-3xl font-black text-orange-600">
                {brand.phone}
              </a>
            </div>
            <a
              href="#contact"
              className="rounded-md bg-green-600 px-5 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-green-700"
            >
              LINEで見積もり
            </a>
            <a
              href="#contact"
              className="rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              メールで見積もり依頼
            </a>
            <Link
              href="/partners"
              className="rounded-md border-2 border-orange-500 bg-white px-5 py-3 text-center text-sm font-black text-orange-600 shadow-sm transition hover:bg-orange-50"
            >
              掲載会社様へ
            </Link>
          </div>

          <a
            href="#contact"
            className="ml-auto rounded-md bg-orange-600 px-4 py-3 text-sm font-black text-white lg:hidden"
          >
            無料見積もり
          </a>
        </div>

        <nav className="border-y border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1180px] overflow-x-auto px-4 lg:px-5">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`whitespace-nowrap border-r border-slate-200 px-5 py-3 text-sm font-black first:border-l hover:bg-orange-50 hover:text-orange-600 ${
                  index === 0
                    ? "border-b-2 border-orange-600 text-orange-600"
                    : "text-slate-700"
                }`}
              >
                <span className="mr-2 text-orange-500">{index === 0 ? "◆" : "●"}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#fff3d8_0%,#fffaf2_44%,#eaf8db_100%)]">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(90deg,rgba(30,151,92,0.12),rgba(255,255,255,0.7)),repeating-linear-gradient(90deg,transparent_0_34px,rgba(30,151,92,0.13)_34px_36px)]" />
        <div className="mx-auto grid w-full max-w-[1180px] gap-7 px-4 py-7 lg:grid-cols-[530px_1fr] lg:px-5 lg:py-9">
          <div className="relative z-10">
            <p className="mb-5 w-fit bg-orange-600 px-7 py-2 text-center text-lg font-black text-white [clip-path:polygon(5%_0,95%_0,100%_50%,95%_100%,5%_100%,0_50%)] sm:text-xl">
              不用品回収の相見積もりサイト
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-[48px]">
              料金も口コミも比べて
              <br />
              <span className="text-orange-600">納得できる回収業者へ</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-bold leading-8 text-slate-700">
              回収品目・地域・写真を送るだけ。対応できる業者の見積もりをまとめて受け取り、
              料金、返信速度、口コミ、追加費用を同じ画面で比較できます。
            </p>

            <ul className="mt-5 grid gap-2 text-base font-black">
              {heroChecks.map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-md bg-white/80 px-3 py-2 shadow-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="relative mt-7 flex max-w-xl items-center gap-3 rounded-xl border-2 border-orange-500 bg-white p-3 shadow-lg shadow-orange-100"
            >
              <span className="absolute -top-5 left-1/2 rounded-full border-2 border-orange-500 bg-white px-8 py-1 text-sm font-black text-orange-600 -translate-x-1/2">
                たったの30秒で完了！
              </span>
              <span className="rounded-full bg-yellow-400 px-4 py-5 text-xl font-black text-orange-600">
                無料
              </span>
              <span className="flex-1 rounded-lg bg-orange-600 px-4 py-5 text-center text-lg font-black text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)] sm:text-2xl">
                一括見積もりを依頼する
              </span>
              <span className="text-3xl font-black text-orange-600">›</span>
            </a>

            <div className="mt-5 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {trustStats.map((item) => (
                <div key={item.label} className="rounded-lg border border-white bg-white/90 p-3 text-center shadow-sm">
                  <p className="text-xs font-bold text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 min-h-[520px] lg:min-h-[500px]">
            <div className="absolute right-2 top-6 h-72 w-72 rounded-full bg-lime-200/70 blur-sm" />
            <Image
              src="/hero-photo-original.png"
              alt="回収品とトラックを背景にスマートフォンで見積もりする女性"
              width={560}
              height={360}
              priority
              className="absolute bottom-24 left-0 h-auto w-[560px] max-w-none drop-shadow-xl"
            />

            <div className="absolute left-0 top-2 w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200 lg:left-4">
              <p className="text-sm font-black text-orange-600">見積もり条件チェック</p>
              <div className="mt-3 space-y-2 text-sm font-bold">
                {["郵便番号・エリア", "回収したい品目", "写真・希望日時", "連絡先"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-orange-50 p-3">
                <p className="text-xs font-bold text-slate-600">現在の対応状況</p>
                <p className="mt-1 text-2xl font-black text-orange-600">12社が受付中</p>
                <p className="mt-1 text-xs font-bold text-slate-600">平均返信 18分 / 写真見積もり対応</p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 rounded-xl border-2 border-green-500 bg-white p-3 shadow-lg">
              <p className="mx-auto -mt-7 mb-2 w-fit rounded-full bg-green-600 px-8 py-2 text-center text-base font-black text-white">
                写真を送るだけでOK！
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                <div className="rounded-md bg-orange-50 p-2">1 情報を入力</div>
                <div className="rounded-md bg-orange-50 p-2">2 写真を送る</div>
                <div className="rounded-md bg-orange-50 p-2">3 見積もりが届く</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-5 lg:px-5">
        {meritCards.map((card) => (
          <div key={card.title} className="flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-black shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-black text-orange-600">
              {card.mark}
            </span>
            <span>
              <span className="block">{card.title}</span>
              <span className="block text-slate-600">{card.body}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-orange-600">検索で来た方へ</p>
          <h2 className="mt-1 text-2xl font-black">
            不用品回収・粗大ゴミ処分でよくある悩みを、相見積もりで解決
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {searchIntentCards.map((item) => (
              <article key={item.title} className="rounded-xl bg-orange-50 p-4">
                <h3 className="font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
          <a
            href="#contact"
            className="mt-5 inline-flex rounded-lg bg-orange-600 px-6 py-3 font-black text-white shadow-sm"
          >
            まずは無料で料金を比較する
          </a>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-orange-600">比較できる項目</p>
            <h2 className="text-2xl font-black">安さだけで選ばないためのチェック項目</h2>
          </div>
          <p className="max-w-md text-sm font-bold leading-6 text-slate-600">
            他社の相見積もりサイトでよく見られる「料金・口コミ・量・対応条件」を、最初から比較しやすい形にしました。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {comparisonPoints.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">
                {item.icon}
              </span>
              <h3 className="mt-4 text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="price" className="scroll-mt-32 mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="mb-4 text-center">
          <p className="text-sm font-black text-orange-600">対応業者の例</p>
          <h2 className="text-2xl font-black">あなたの地域で比較できる回収業者</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <div key={vendor.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${vendor.color} text-lg font-black text-white`}>
                  優
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black">{vendor.name}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-black text-orange-600">
                      {vendor.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-orange-500">
                    ★★★★★ <span className="text-slate-700">{vendor.score}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">料金目安</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{vendor.price}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-slate-500">特徴</p>
                  <p className="mt-1 text-sm font-black text-green-700">{vendor.speed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-orange-600">料金目安</p>
              <h2 className="text-2xl font-black">量に合わせて相場感を先に確認</h2>
            </div>
            <p className="text-sm font-bold text-slate-600">実際の料金は品目・階段・距離・地域で変わります。</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {priceGuides.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-[#fffaf2] p-4">
                <p className="font-black">{item.title}</p>
                <p className="mt-2 text-sm font-bold text-slate-600">{item.volume}</p>
                <p className="mt-4 text-2xl font-black text-orange-600">{item.price}</p>
                <p className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-2xl border-2 border-lime-500 bg-lime-50 p-5">
          <h2 className="text-center text-2xl font-black text-green-700">
            一括見積もりでこんなにお得！
          </h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr]">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="font-black">ご利用事例</p>
              <p className="mt-3 text-sm font-bold leading-6">
                東京都在住 A様
                <br />
                回収品目：冷蔵庫・洗濯機・ソファ・タンスなど
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {priceCompare.map((item) => (
                <div
                  key={item.company}
                  className={`rounded-lg border bg-white p-4 text-center shadow-sm ${
                    item.best ? "border-orange-500 ring-2 ring-orange-200" : "border-slate-200"
                  }`}
                >
                  <p className="font-black">{item.company}</p>
                  {item.best ? (
                    <p className="mt-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-black text-white">
                      一番お得！
                    </p>
                  ) : null}
                  <p className={`mt-3 text-2xl font-black ${item.best ? "text-orange-600" : ""}`}>
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 rounded-full border-2 border-orange-400 bg-white px-4 py-3 text-center text-3xl font-black text-orange-600">
            40,000円もお得に！
          </p>
        </div>
      </section>

      <section id="reviews" className="scroll-mt-32 mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="mb-4 text-center">
          <p className="text-sm font-black text-orange-600">利用者の声</p>
          <h2 className="text-2xl font-black">不用品回収の見積もり比較で安心できた口コミ</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {reviewCards.map((review) => (
            <article key={review.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black text-green-700">{review.area}</p>
              <h3 className="mt-2 font-black">{review.title}</h3>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{review.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-6 lg:grid-cols-2 lg:px-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-black">最近の見積もり依頼</h2>
          <div className="space-y-3 text-sm">
            {recentQuotes.map((row) => (
              <div key={row.join()} className="grid gap-2 border-b border-dashed border-slate-200 pb-3 sm:grid-cols-[110px_130px_1fr_90px]">
                {row.map((cell, index) => (
                  <span key={cell} className={index === 3 ? "font-black text-orange-600" : ""}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div id="area" className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-black">対応エリア</h2>
          <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-lg font-black">全国対応！</p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                北海道から沖縄まで、主要エリアの不用品回収業者へ一括で相談できます。
                一部離島・山間部は確認が必要です。
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="font-black text-green-700">対応都道府県</p>
                  <p className="mt-1 text-2xl font-black">47</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="font-black text-orange-600">最短対応</p>
                  <p className="mt-1 text-2xl font-black">即日</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-green-50 p-2">
              <svg
                viewBox="0 0 520 360"
                className="h-full min-h-[280px] w-full"
                role="img"
                aria-label="日本全国の対応エリア地図"
              >
                <defs>
                  <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.16" />
                  </filter>
                </defs>
                <rect width="520" height="360" rx="24" fill="transparent" />
                <path
                  d="M372 22 C405 7 451 14 474 40 C493 62 486 92 456 101 C421 111 372 102 348 79 C326 58 338 37 372 22Z"
                  fill="#8bcf63"
                  stroke="#ffffff"
                  strokeWidth="6"
                  filter="url(#mapShadow)"
                />
                <path
                  d="M374 95 C397 120 392 150 369 172 C342 199 339 230 362 258 C376 275 371 296 348 307 C322 320 288 311 280 289 C273 269 291 251 304 232 C321 207 313 184 291 168 C266 149 259 126 279 109 C304 88 345 69 374 95Z"
                  fill="#79c957"
                  stroke="#ffffff"
                  strokeWidth="7"
                  filter="url(#mapShadow)"
                />
                <path
                  d="M282 169 C265 188 245 201 219 205 C197 208 184 222 185 240 C188 261 214 269 235 258 C255 248 278 244 300 249 C318 253 331 241 326 225 C320 204 296 193 282 169Z"
                  fill="#96d66c"
                  stroke="#ffffff"
                  strokeWidth="7"
                  filter="url(#mapShadow)"
                />
                <path
                  d="M192 229 C168 221 139 226 119 244 C98 263 93 293 112 310 C133 330 165 318 173 292 C179 273 194 258 216 251 C230 247 226 235 192 229Z"
                  fill="#8bcf63"
                  stroke="#ffffff"
                  strokeWidth="7"
                  filter="url(#mapShadow)"
                />
                <path
                  d="M210 278 C236 265 269 264 294 276 C306 282 302 297 288 301 C266 307 232 304 209 295 C196 290 197 284 210 278Z"
                  fill="#a9dc7a"
                  stroke="#ffffff"
                  strokeWidth="6"
                  filter="url(#mapShadow)"
                />
                <path
                  d="M61 300 C78 293 99 299 108 314 C116 330 103 346 84 345 C65 343 49 329 51 315 C52 309 55 304 61 300Z"
                  fill="#94d56a"
                  stroke="#ffffff"
                  strokeWidth="6"
                  filter="url(#mapShadow)"
                />
                <circle cx="52" cy="331" r="7" fill="#79c957" stroke="#ffffff" strokeWidth="4" />
                <circle cx="34" cy="342" r="5" fill="#79c957" stroke="#ffffff" strokeWidth="3" />
                <circle cx="18" cy="350" r="4" fill="#79c957" stroke="#ffffff" strokeWidth="3" />
              </svg>

              {areaLabels.map((area) => (
                <span
                  key={area.name}
                  className="absolute rounded-full border border-orange-200 bg-white/95 px-3 py-1 text-xs font-black text-orange-600 shadow-sm"
                  style={{ left: area.x, top: area.y, transform: "translate(-50%, -50%)" }}
                >
                  {area.name}
                </span>
              ))}
            </div>
          </div>
          <a href="#contact" className="mt-5 inline-flex rounded-md bg-green-600 px-5 py-3 font-black text-white">
            詳しい対応エリアを見る
          </a>
        </div>
      </section>

      <section id="items" className="scroll-mt-32 mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-orange-600">回収品目一覧</p>
              <h2 className="text-2xl font-black">家具・家電・粗大ゴミをまとめて見積もり</h2>
            </div>
            <p className="max-w-md text-sm font-bold leading-6 text-slate-600">
              複数品目をまとめるほど、トラック量と搬出条件の比較が大切です。
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {pickupItems.map((item) => (
              <a
                key={item}
                href="#contact"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-black hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="scroll-mt-32 mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-6 lg:grid-cols-2 lg:px-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-center text-xl font-black">ご利用の流れ</h2>
          <div className="grid gap-2 sm:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="relative min-h-28 rounded-lg border border-slate-200 bg-white p-3 text-center text-xs font-black">
                <span className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
                  {index + 1}
                </span>
                <span className="block">{step.title}</span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">{step.body}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-center text-xl font-black">{brand.name}が選ばれる理由</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reasons.map(([title, body]) => (
              <div key={title} className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-3 text-center">
                <p className="font-black text-orange-600">{title}</p>
                <p className="mt-2 text-sm font-bold">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-center text-sm font-black text-orange-600">よくある質問</p>
          <h2 className="mt-1 text-center text-2xl font-black">
            不用品回収の見積もり比較でよくある質問
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-black">{item.question}</summary>
                <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-32 bg-green-600">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-5">
          <div className="text-white">
            <h2 className="text-3xl font-black">無料一括見積もりを依頼する</h2>
            <p className="mt-3 font-bold leading-7">
              回収したいものやお住まいの地域を入力してください。複数社の料金・スピード・口コミを比較できます。
            </p>
            <a
              href={brand.phoneHref}
              className="mt-5 inline-flex rounded-md bg-orange-600 px-6 py-4 text-xl font-black text-white shadow-sm"
            >
              電話で相談する
            </a>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="bg-orange-600 text-white shadow-[0_-4px_16px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex items-center gap-3">
            <span className="relative hidden h-16 w-20 shrink-0 sm:block">
              <span className="absolute left-1 top-2 h-12 w-12 rounded-full bg-[#5b351f]" />
              <span className="absolute left-3 top-4 h-8 w-8 rounded-full bg-white" />
              <span className="absolute left-4 top-5 h-3 w-3 rounded-full bg-neutral-900" />
              <span className="absolute left-8 top-5 h-3 w-3 rounded-full bg-neutral-900" />
              <span className="absolute bottom-1 right-0 h-8 w-10 rounded bg-amber-700 shadow-sm" />
            </span>
            <p className="text-sm font-black">
              {brand.name}で不用品回収業者をまとめて比較。料金・口コミ・対応スピードを見て選べます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="rounded-lg border-2 border-white px-6 py-3 text-center text-lg font-black">
              無料 一括見積もりを依頼する
            </a>
            <a href="#contact" className="rounded-lg bg-green-600 px-6 py-3 text-center text-lg font-black">
              LINEで簡単見積もり
            </a>
            <span className="relative hidden h-16 w-12 rotate-6 rounded-lg border-4 border-white bg-neutral-900 lg:block">
              <span className="absolute inset-1 rounded bg-green-100" />
              <span className="absolute left-3 top-4 h-2 w-4 rounded bg-green-600" />
              <span className="absolute left-3 top-8 h-2 w-4 rounded bg-orange-500" />
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
