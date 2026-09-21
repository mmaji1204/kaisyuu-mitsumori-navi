import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/lib/brand";
import { additionalArticles } from "@/lib/blog-articles";
import { preparationArticle } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return additionalArticles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = additionalArticles.find(a => a.slug === slug);
  if (!article) notFound();
  const url = `${brand.siteUrl}/blog/${slug}`;
  return {
    title: `${article.metaTitle} | ${brand.name}`, description: article.description,
    alternates: { canonical: url },
    openGraph: { title: article.title, description: article.description, url, type: "article", siteName: brand.name, locale: "ja_JP", publishedTime: `${article.publishedAt}T00:00:00+09:00` },
    twitter: { card: "summary", title: article.title, description: article.description },
  };
}
export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = additionalArticles.find(a => a.slug === slug);
  if (!article) notFound();
  const url = `${brand.siteUrl}/blog/${slug}`;
  const links = [preparationArticle, ...additionalArticles.filter(a => a.slug !== slug)];
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "BlogPosting", headline: article.title, description: article.description, mainEntityOfPage: url, datePublished: `${article.publishedAt}T00:00:00+09:00`, dateModified: `${article.publishedAt}T00:00:00+09:00`, inLanguage: "ja", author: { "@type": "Organization", name: brand.operatorName, url: brand.siteUrl }, publisher: { "@type": "Organization", name: brand.name, url: brand.siteUrl } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: brand.siteUrl }, { "@type": "ListItem", position: 2, name: "お役立ち記事", item: `${brand.siteUrl}/blog` }, { "@type": "ListItem", position: 3, name: article.title, item: url }] },
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <nav aria-label="パンくず" className="flex flex-wrap gap-2 text-sm leading-6 text-slate-600"><Link href="/" className="underline">ホーム</Link><span>/</span><Link href="/blog" className="underline">お役立ち記事</Link><span>/</span><span>{article.category}</span></nav>
    <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
      <header><p className="font-bold text-green-800">{article.category}</p><h1 className="mt-3 text-2xl font-black leading-relaxed sm:text-4xl sm:leading-snug">{article.title}</h1><p className="mt-4 text-sm leading-7 text-slate-600">公開日：<time dateTime={article.publishedAt}>{article.publishedAt.replaceAll("-", "/")}</time> ／ {brand.operatorName}</p></header>
      <p className="mt-6 leading-8">{article.intro}</p>
      <aside className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 leading-8"><p className="font-bold text-green-900">この記事のポイント</p><p className="mt-2">{article.takeaway}</p></aside>
      <nav aria-label="記事の目次" className="mt-8 rounded-xl bg-slate-50 p-5"><p className="font-bold">目次</p><ol className="mt-3 list-decimal space-y-3 pl-5 leading-7">{article.sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="font-bold text-green-800 underline underline-offset-4">{s.title}</a></li>)}</ol></nav>
      <div className="mt-10 space-y-10">{article.sections.map(s => <section key={s.id} id={s.id} className="scroll-mt-6"><h2 className="mb-5 border-l-4 border-orange-500 pl-3 text-2xl font-black leading-relaxed">{s.title}</h2>{s.paragraphs.map(p => <p key={p} className="mt-4 leading-8">{p}</p>)}{s.checklist && <ul className="mt-5 list-disc space-y-3 rounded-xl bg-slate-50 py-5 pl-10 pr-5 leading-8">{s.checklist.map(c => <li key={c}>{c}</li>)}</ul>}</section>)}</div>
      <aside className="mt-10 rounded-xl bg-green-700 p-6 text-white"><h2 className="text-2xl font-black leading-relaxed">回収方法や費用を相談する</h2><p className="mt-3 leading-8">回収したい品物、お住まいの地域、希望日をお知らせください。搬出条件も伝えて、料金と作業内容を比較しましょう。</p><Link href="/#contact" className="mt-5 inline-block rounded-lg bg-white px-6 py-4 font-black text-green-800 hover:bg-green-50">無料一括見積もりを依頼する</Link><p className="mt-4 text-sm leading-7">回収の可否・料金・日時は各業者の回答をご確認ください。</p></aside>
      <nav aria-label="関連する案内" className="mt-6 flex flex-wrap gap-4 font-bold text-green-800 underline underline-offset-4"><Link href="/#price">料金目安</Link><Link href="/#items">回収品目</Link><Link href="/#flow">ご利用の流れ</Link></nav>
      <section className="mt-10 border-t border-slate-200 pt-6"><h2 className="text-xl font-bold">あわせて読みたい記事</h2><ul className="mt-4 space-y-4 leading-7">{links.map(a => <li key={a.slug}><Link href={`/blog/${a.slug}`} className="font-bold text-green-800 underline underline-offset-4">{a.title}</Link></li>)}</ul></section>
      <section className="mt-8 text-sm leading-7 text-slate-600"><h2 className="font-bold">参考情報</h2><ul className="mt-2 space-y-2">{article.sources.map(s => <li key={s.url}><a href={s.url} className="underline underline-offset-4">{s.title}</a></li>)}</ul><p className="mt-3">2026年9月21日確認。自治体の案内は一例です。実際の手続きは、お住まいの自治体や依頼先の最新情報をご確認ください。</p></section>
    </article>
  </>;
}
