import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { preparationArticle } from "@/lib/blog";
import { additionalArticles } from "@/lib/blog-articles";

export const metadata: Metadata = {
  title: `不用品回収のお役立ち記事 | ${brand.name}`,
  description: "不用品回収の見積もりや依頼前の準備に役立つ情報を紹介します。料金と作業条件を確認して、納得できる回収方法を選びましょう。",
  alternates: { canonical: `${brand.siteUrl}/blog` },
};

export default function BlogPage() {
  return <>
    <p className="text-sm text-slate-600"><Link href="/" className="underline">ホーム</Link> / お役立ち記事</p>
    <h1 className="mt-6 text-3xl font-black">不用品回収のお役立ち記事</h1>
    <p className="mt-4 leading-8 text-slate-700">見積もりの準備から依頼時の確認まで。納得して不用品を片付けるためのガイドです。</p>
    {[...additionalArticles, preparationArticle].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map(article => <article key={article.slug} className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/blog/${article.slug}`} className="group block sm:grid sm:grid-cols-[0.8fr_1.2fr]">
        <Image src="/hero-photo-original.png" alt="不用品の写真見積もりを相談するイメージ" width={1200} height={630} className="h-full max-h-72 w-full object-cover" />
        <div className="p-6"><time dateTime={article.publishedAt} className="text-sm text-slate-600">{article.publishedAt.replaceAll("-", "/")}</time><h2 className="mt-3 text-xl font-black leading-relaxed group-hover:text-orange-700">{article.title}</h2><p className="mt-3 leading-7 text-slate-700">{article.description}</p><p className="mt-4 font-bold text-green-800 underline">記事を読む</p></div>
      </Link>
    </article>)}
  </>;
}
