import Image from "next/image";
import Link from "next/link";

type ArticleCardData = {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  image: { src: string; alt: string };
};

export function BlogArticleCard({ article, headingLevel = 3 }: {
  article: ArticleCardData;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700"
    >
      <div className="relative aspect-video overflow-hidden bg-[#f5f3ec]">
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          loading="eager"
          sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 895px) 50vw, 432px"
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="rounded bg-green-50 px-2 py-1 font-bold text-green-800">{article.category}</span>
          <time dateTime={article.publishedAt} className="text-slate-500">{article.publishedAt.replaceAll("-", "/")}</time>
        </div>
        <Heading className="mt-3 text-base font-bold leading-7 text-slate-900 group-hover:text-green-800 sm:text-lg">
          {article.title}
        </Heading>
        <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-green-800">
          記事を読む
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-orange-600">
            <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function RelatedArticles({ articles }: { articles: ArticleCardData[] }) {
  return (
    <section id="related-articles" aria-labelledby="related-articles-heading" className="mt-10 scroll-mt-6 border-t border-slate-200 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="related-articles-heading" className="text-xl font-bold">あわせて読みたい記事</h2>
        <Link href="/blog" className="text-sm font-bold text-green-800 underline underline-offset-4">記事一覧を見る</Link>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {articles.map(article => <li key={article.slug} className="min-w-0"><BlogArticleCard article={article} /></li>)}
      </ul>
    </section>
  );
}
