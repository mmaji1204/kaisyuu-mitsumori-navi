import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { preparationArticle } from "@/lib/blog";
import { additionalArticles } from "@/lib/blog-articles";
import { BlogArticleCard } from "@/components/BlogArticleCard";

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
    <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {[...additionalArticles, preparationArticle].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map(article =>
        <li key={article.slug} className="min-w-0"><BlogArticleCard article={article} headingLevel={2} /></li>
      )}
    </ul>
  </>;
}
