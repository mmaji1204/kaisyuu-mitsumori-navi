import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function InformationPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f7f8f4] text-[#263d32]">
    <header className="border-b border-[#dce5d6] bg-white px-5 py-6"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5"><BrandLogo /><Link href="/" className="text-sm font-bold underline underline-offset-4">ホームへ戻る</Link></div></header>
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><p className="text-sm font-bold tracking-widest text-[#bd511f]">INFORMATION</p><h1 className="mt-4 text-3xl font-bold leading-relaxed sm:text-4xl">{title}</h1><div className="mt-9 space-y-8 rounded-2xl border border-[#dce5d6] bg-white p-6 text-sm leading-8 sm:p-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_a]:underline [&_a]:underline-offset-4">{children}</div></main>
    <footer className="mx-auto flex max-w-3xl flex-wrap gap-6 px-5 pb-12 text-sm font-bold underline underline-offset-4"><Link href="/about">運営者情報</Link><Link href="/privacy">個人情報の取り扱い</Link><Link href="/blog">お役立ち記事</Link></footer>
  </div>;
}
