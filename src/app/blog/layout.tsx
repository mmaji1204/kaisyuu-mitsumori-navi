import Link from "next/link";
import { brand } from "@/lib/brand";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#fffaf2] text-slate-900">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-xl font-black sm:text-3xl">{brand.namePrefix}<span className="text-orange-600">{brand.nameAccent}</span></Link>
        <Link href="/#contact" className="rounded-md bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800">無料見積もり</Link>
      </div>
      <nav aria-label="メインナビゲーション" className="mx-auto flex max-w-[1180px] flex-wrap gap-x-6 gap-y-3 px-4 pb-4 text-sm font-bold">
        <Link href="/">ホーム</Link><Link href="/#price">料金目安</Link><Link href="/#items">回収品目</Link><Link href="/blog">お役立ち記事</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">{children}</main>
    <footer className="bg-orange-600 px-4 py-8 text-white"><div className="mx-auto flex max-w-4xl flex-wrap justify-between gap-4"><Link href="/" className="font-bold">{brand.name}</Link><Link href="/blog" className="underline underline-offset-4">記事一覧へ</Link></div></footer>
  </div>;
}
