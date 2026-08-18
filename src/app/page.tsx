import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { brand } from "@/lib/brand";

const navItems = [
  "ホーム",
  "一括見積もりの流れ",
  "料金プラン",
  "回収品目一覧",
  "対応エリア",
  "お客様の声",
  "よくある質問",
];

const meritCards = [
  { title: "最大5社に", body: "まとめて見積もり", mark: "書" },
  { title: "料金を比較して", body: "一番安い業者がわかる", mark: "￥" },
  { title: "口コミ・評価を", body: "見て安心して選べる", mark: "声" },
  { title: "最短即日で", body: "対応可能な業者も！", mark: "車" },
  { title: "見積もり無料", body: "キャンセルも無料", mark: "¥0" },
];

const vendors = [
  { name: "クリーン回収", score: "4.8", color: "bg-emerald-500" },
  { name: "ECOスマイル", score: "4.6", color: "bg-lime-500" },
  { name: "すっきり本舗", score: "4.7", color: "bg-sky-500" },
  { name: "片付けマスター", score: "4.6", color: "bg-red-500" },
  { name: "リサイクル回収センター", score: "4.6", color: "bg-orange-500" },
  { name: "便利屋お片付け本舗", score: "4.4", color: "bg-blue-500" },
];

const priceCompare = [
  { company: "A社", price: "98,000円" },
  { company: "B社", price: "78,000円" },
  { company: "C社", price: "58,000円", best: true },
  { company: "D社", price: "85,000円" },
  { company: "E社", price: "90,000円" },
];

const recentQuotes = [
  ["7月9日 16:25", "東京都練馬区", "冷蔵庫・ベッド・タンスなど", "3社に依頼"],
  ["7月9日 15:43", "神奈川県横浜市", "洗濯機・ソファ・棚など", "5社に依頼"],
  ["7月9日 15:10", "千葉県船橋市", "テレビ・テーブル・椅子など", "4社に依頼"],
  ["7月9日 14:32", "埼玉県さいたま市", "エアコン・机・本棚など", "3社に依頼"],
  ["7月9日 13:58", "大阪府大阪市", "冷蔵庫・洗濯機・電子レンジなど", "5社に依頼"],
];

const flowSteps = [
  "情報を入力",
  "写真を送る",
  "複数社から見積もり",
  "比較して選ぶ",
  "回収作業",
];

const reasons = [
  ["運営会社", "安心の運営実績"],
  ["東証上場企業のグループ会社", "信頼できる体制"],
  ["プライバシー保護", "個人情報は厳重管理"],
  ["お客様満足度", "95.2%"],
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
  return (
    <main className="min-h-screen bg-[#fffdf6] text-neutral-900">
      <header className="sticky top-0 z-30 bg-white shadow">
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
              <span className="block text-xs font-bold">
                {brand.longTagline}
              </span>
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
              className="rounded-md bg-green-600 px-5 py-3 text-center text-sm font-black text-white shadow-sm"
            >
              LINEで見積もり
            </a>
            <a
              href="#contact"
              className="rounded-md bg-green-700 px-5 py-3 text-center text-sm font-black text-white shadow-sm"
            >
              メールで見積もり依頼
            </a>
            <Link
              href="/partners"
              className="rounded-md border-2 border-orange-500 bg-white px-5 py-3 text-center text-sm font-black text-orange-600 shadow-sm"
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

        <nav className="border-y border-neutral-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1180px] overflow-x-auto px-4 lg:px-5">
            {navItems.map((item, index) => (
              <a
                key={item}
                href={index === 0 ? "#" : "#contact"}
                className={`whitespace-nowrap border-r border-neutral-200 px-5 py-3 text-sm font-black first:border-l hover:bg-orange-50 hover:text-orange-600 ${
                  index === 0
                    ? "border-b-2 border-orange-600 text-orange-600"
                    : "text-neutral-700"
                }`}
              >
                <span className="mr-2 text-orange-500">{index === 0 ? "◆" : "●"}</span>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_75%_30%,#e4f6d3_0_18%,transparent_19%),linear-gradient(90deg,#fff7e6_0%,#fffaf0_45%,#eef8df_100%)]">
        <div className="absolute bottom-0 left-0 h-24 w-full bg-[linear-gradient(90deg,rgba(150,210,120,0.18),rgba(255,255,255,0.65)),repeating-linear-gradient(90deg,transparent_0_34px,rgba(136,181,110,0.18)_34px_36px)]" />
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-6 lg:grid-cols-[540px_1fr] lg:px-5">
          <div className="relative z-10">
            <p className="mx-auto mb-5 w-fit bg-orange-600 px-8 py-2 text-center text-xl font-black text-white [clip-path:polygon(5%_0,95%_0,100%_50%,95%_100%,5%_100%,0_50%)] lg:mx-0">
              不用品回収業者をまとめて比較！
            </p>
            <h1 className="text-center text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-left lg:text-[48px]">
              あなたに合う回収業者が
              <br />
              <span className="text-orange-600">すぐ見つかる！</span>
            </h1>

            <ul className="mt-6 space-y-2 text-lg font-black">
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">✓</span>最大<span className="text-orange-600">5社</span>に一括見積もり
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">✓</span>料金・対応スピード・口コミを比較
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">✓</span>完全無料・しつこい営業は一切なし
              </li>
            </ul>

            <a
              href="#contact"
              className="relative mt-7 flex max-w-xl items-center gap-4 rounded-lg border-2 border-orange-500 bg-white p-4 shadow-sm"
            >
              <span className="absolute -top-5 left-1/2 rounded-full border-2 border-orange-500 bg-white px-8 py-1 text-sm font-black text-orange-600 -translate-x-1/2">
                たったの30秒で完了！
              </span>
              <span className="rounded-full bg-yellow-400 px-4 py-5 text-xl font-black text-orange-600">
                無料
              </span>
              <span className="flex-1 rounded-md bg-orange-600 px-4 py-5 text-center text-lg font-black text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)] sm:px-5 sm:text-2xl">
                一括見積もりを依頼する
              </span>
              <span className="text-3xl font-black text-orange-600">›</span>
            </a>
          </div>

          <div className="relative z-10 min-h-[380px]">
            <div className="absolute left-2 top-5 h-56 w-80 rounded-full bg-lime-200/70 blur-sm" />
            <Image
              src="/hero-photo-original.png"
              alt="不用品回収の見積もりをスマートフォンで相談する女性と回収トラック"
              width={500}
              height={310}
              priority
              className="absolute bottom-12 left-0 w-[520px] max-w-none drop-shadow-xl"
            />

            <div className="absolute bottom-0 left-0 right-0 rounded-lg border-2 border-green-500 bg-white p-3">
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
          <div key={card.title} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm font-black shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-black text-orange-500">
              {card.mark}
            </span>
            <span>
              <span className="block">{card.title}</span>
              <span className="block">{card.body}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-5 lg:px-5">
        <h2 className="mb-4 text-center text-xl font-black">
          あなたの地域で対応可能な優良回収業者
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {vendors.map((vendor) => (
            <div key={vendor.name} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${vendor.color} text-lg font-black text-white`}>
                優
              </div>
              <p className="text-center text-sm font-black">{vendor.name}</p>
              <p className="mt-2 text-center text-xs font-bold text-orange-500">
                ★★★★★ <span className="text-neutral-700">{vendor.score}</span>
              </p>
              <p className="mx-auto mt-2 w-fit rounded-full border px-3 py-1 text-xs font-black">
                対応エリア
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-5">
        <div className="rounded-xl border-2 border-lime-500 bg-lime-50 p-5">
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
                    item.best ? "border-orange-500 ring-2 ring-orange-200" : "border-neutral-200"
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

      <section className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-6 lg:grid-cols-2 lg:px-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-black">最近の見積もり依頼</h2>
          <div className="space-y-3 text-sm">
            {recentQuotes.map((row) => (
              <div key={row.join()} className="grid gap-2 border-b border-dashed border-neutral-200 pb-3 sm:grid-cols-[110px_130px_1fr_90px]">
                {row.map((cell, index) => (
                  <span key={cell} className={index === 3 ? "font-black text-orange-600" : ""}>
                    {cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-black">対応エリア</h2>
          <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-lg font-black">全国対応！</p>
              <p className="mt-2 text-sm font-bold leading-6 text-neutral-600">
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

      <section className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-6 lg:grid-cols-2 lg:px-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-center text-xl font-black">ご利用の流れ</h2>
          <div className="grid grid-cols-5 gap-2">
            {flowSteps.map((step, index) => (
              <div key={step} className="relative rounded-lg border bg-white p-3 text-center text-xs font-black">
                <span className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
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

      <footer className="bg-orange-600 text-white shadow-[0_-4px_16px_rgba(0,0,0,0.18)] lg:sticky lg:bottom-0 lg:z-20">
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
              不用品回収業者をまとめて比較！あなたに合う業者を見つけよう！
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
