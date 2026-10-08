import { isQuoteIntakeOpen } from "@/lib/intake-status";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { BrandLogo } from "@/components/BrandLogo";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f7f0] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-4">
        <BrandLogo />
        <Link href="/#contact" className="primary-button">{isQuoteIntakeOpen() ? "無料相見積もり" : "受付状況を確認"}</Link>
      </div>
      <nav aria-label="メインナビゲーション" className="mx-auto flex max-w-[1180px] flex-wrap gap-x-6 gap-y-3 px-4 pb-4 text-sm font-bold">
        <Link href="/">ホーム</Link><Link href="/#price">料金目安</Link><Link href="/#items">回収品目</Link><Link href="/blog">お役立ち記事</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">{children}</main>
    <footer className="bg-[#245b43] px-4 py-8 text-white"><div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-4"><Link href="/" className="font-bold">{brand.name}</Link><nav className="flex flex-wrap gap-5 text-sm underline underline-offset-4"><Link href="/blog">記事一覧へ</Link><Link href="/about">運営者情報</Link><Link href="/privacy">個人情報の取り扱い</Link></nav></div></footer>
  </div>;
}
