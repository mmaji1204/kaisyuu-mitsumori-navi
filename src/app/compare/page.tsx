import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { QuoteWorksheet } from "@/components/QuoteWorksheet";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `見積もり比較シート｜総額・追加料金・作業範囲を整理 | ${brand.name}`,
  description: "受け取った不用品回収の見積もりを最大3社まで整理。税込総額、概算・確定額、搬出作業、追加料金の条件をそろえて比較し、メモを保存できます。登録不要。",
  alternates: { canonical: `${brand.siteUrl}/compare` },
};
export default function ComparePage() {
  return <div className="min-h-screen bg-[#f5f7f0] text-[#20382e]">
    <header className="border-b border-[#dce3da] bg-white"><div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-5"><BrandLogo /><Link href="/" className="text-sm font-bold underline underline-offset-4">ホームへ</Link></div></header>
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:py-14">
      <nav aria-label="パンくず" className="text-sm"><Link href="/" className="underline">ホーム</Link><span> / 見積もり比較シート</span></nav>
      <p className="mt-10 text-sm font-bold tracking-widest text-[#bc4b22]">COMPARE YOUR QUOTES</p>
      <h1 className="mt-4 text-3xl font-bold leading-relaxed sm:text-5xl sm:leading-snug">安さだけで決めない。<br />同じ条件で、見積もりを比較。</h1>
      <p className="mt-5 max-w-2xl leading-8 text-[#5c6b62]">手元の見積書や業者からの回答を、ここに整理できます。金額に含まれる作業と追加費用を確かめて、依頼前の行き違いを減らしましょう。</p>
      <p className="mt-5 inline-block rounded-full bg-[#e4eddf] px-4 py-2 text-sm font-bold">登録不要・入力内容の送信なし</p>
      <QuoteWorksheet />
      <nav aria-label="比較の参考記事" className="mt-8 flex flex-wrap gap-5 text-sm font-bold underline underline-offset-4"><Link href="/blog/estimate-preparation">見積もり前の準備</Link><Link href="/blog/estimate-additional-fees">追加料金の確認ポイント</Link><Link href="/#contact">一括見積もりの受付状況</Link></nav>
    </main>
    <footer className="bg-[#204f3e] px-5 py-8 text-white"><div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-4"><Link href="/">{brand.name}</Link><Link href="/privacy" className="text-sm underline">個人情報の取り扱い</Link></div></footer>
  </div>;
}
