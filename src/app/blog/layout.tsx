import Link from "next/link";
import { brand } from "@/lib/brand";
import { BrandLogo } from "@/components/BrandLogo";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f7f0] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-4">
        <BrandLogo />
        <Link href="/#contact" className="primary-button">無料見積もり</Link>
      </div>
      <nav aria-label="メインナビゲーション" className="mx-auto flex max-w-[1180px] flex-wrap gap-x-6 gap-y-3 px-4 pb-4 text-sm font-bold">
        <Link href="/">ホーム</Link><Link href="/#price">料金目安</Link><Link href="/#items">回収品目</Link><Link href="/blog">お役立ち記事</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">{children}</main>
    <footer className="bg-[#245b43] px-4 py-8 text-white"><div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-4"><Link href="/" className="font-bold">{brand.name}</Link><Link href="/blog" className="underline underline-offset-4">記事一覧へ</Link></div></footer>
  </div>;
}
