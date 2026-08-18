import Link from "next/link";
import { brand } from "@/lib/brand";

const strengths = [
  {
    title: "見込み客に直接アプローチ",
    body: "不用品回収を検討しているユーザーからの相談を受け取れます。",
  },
  {
    title: "対応エリアに合わせて掲載",
    body: "営業したい地域や対応可能な品目に合わせて掲載内容を調整できます。",
  },
  {
    title: "比較検討中のユーザーへ訴求",
    body: "料金・スピード・口コミを見て選ぶユーザーに自社の強みを伝えられます。",
  },
];

const flow = [
  "お問い合わせ",
  "掲載条件の確認",
  "会社情報の登録",
  "掲載スタート",
];

const metrics = [
  ["掲載エリア", "全国対応"],
  ["相談カテゴリ", "家具・家電・粗大ごみ"],
  ["掲載開始", "最短3営業日"],
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#fffdf6] text-neutral-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-4 lg:px-5">
          <Link href="/" className="text-2xl font-black">
            {brand.namePrefix}
            <span className="text-orange-600">{brand.nameAccent}</span>
          </Link>
          <a
            href="#partner-contact"
            className="rounded-md bg-orange-600 px-5 py-3 text-sm font-black text-white"
          >
            掲載について相談
          </a>
          <Link
            href="/business"
            className="hidden rounded-md border-2 border-orange-500 px-5 py-3 text-sm font-black text-orange-600 sm:inline-flex"
          >
            管理画面デモ
          </Link>
        </div>
      </header>

      <section className="bg-[linear-gradient(100deg,#fff7e6_0%,#fffdf6_48%,#eaf7df_100%)]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-14 lg:grid-cols-[1fr_420px] lg:px-5">
          <div>
            <p className="mb-4 w-fit bg-orange-600 px-6 py-2 text-lg font-black text-white [clip-path:polygon(6%_0,94%_0,100%_50%,94%_100%,6%_100%,0_50%)]">
              不用品回収業者様向け
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              回収依頼を増やしたい業者様へ。
              <br />
              <span className="text-orange-600">集客導線を作ります。</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-neutral-700">
              「{brand.name}」は、不用品回収を検討しているユーザーと、
              地域の回収業者をつなぐ相見積もりサイトです。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#partner-contact"
                className="rounded-lg bg-orange-600 px-8 py-4 text-center text-xl font-black text-white shadow-sm"
              >
                掲載について無料相談
              </a>
              <Link
                href="/"
                className="rounded-lg border-2 border-orange-500 bg-white px-8 py-4 text-center text-xl font-black text-orange-600"
              >
                ユーザー向けページを見る
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-green-500 bg-white p-6 shadow-sm">
            <h2 className="text-center text-2xl font-black text-green-700">
              掲載で期待できること
            </h2>
            <div className="mt-5 grid gap-3">
              {metrics.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3"
                >
                  <span className="font-black text-green-700">{label}</span>
                  <span className="text-xl font-black">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 lg:px-5">
        <h2 className="text-center text-3xl font-black">
          選ばれる理由
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {strengths.map((item, index) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl font-black text-orange-600">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-black">{item.title}</h3>
              <p className="mt-3 font-bold leading-7 text-neutral-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-green-50">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-10 lg:px-5">
          <h2 className="text-center text-3xl font-black">
            掲載開始までの流れ
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {flow.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-green-200 bg-white p-5 text-center shadow-sm"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg font-black text-white">
                  {index + 1}
                </span>
                <p className="mt-3 font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="partner-contact" className="bg-orange-600">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-10 text-white lg:grid-cols-[0.8fr_1.2fr] lg:px-5">
          <div>
            <h2 className="text-3xl font-black">掲載について相談する</h2>
            <p className="mt-3 font-bold leading-7">
              対応エリア、回収品目、現在の集客状況をお聞きしたうえで、
              掲載方法をご案内します。
            </p>
          </div>
          <form className="rounded-xl bg-white p-6 text-neutral-900 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black">会社名</span>
                <input className="mt-2 h-12 w-full rounded-md border px-4" placeholder="株式会社サンプル" />
              </label>
              <label className="block">
                <span className="text-sm font-black">ご担当者名</span>
                <input className="mt-2 h-12 w-full rounded-md border px-4" placeholder="山田 太郎" />
              </label>
              <label className="block">
                <span className="text-sm font-black">電話番号</span>
                <input className="mt-2 h-12 w-full rounded-md border px-4" placeholder="03-0000-0000" />
              </label>
              <label className="block">
                <span className="text-sm font-black">対応エリア</span>
                <input className="mt-2 h-12 w-full rounded-md border px-4" placeholder="東京都・神奈川県など" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-black">相談内容</span>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-md border px-4 py-3"
                placeholder="掲載について知りたい内容を入力してください。"
              />
            </label>
            <button
              type="button"
              className="mt-5 rounded-md bg-green-600 px-6 py-3 font-black text-white"
            >
              掲載相談を送信する
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
