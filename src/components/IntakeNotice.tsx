import Link from "next/link";

export function IntakeNotice() {
  return <div className="rounded-xl border border-[#dce5d6] bg-white p-6 text-[#263d32] sm:p-8">
    <p className="text-sm font-bold tracking-wider text-[#bd511f]">見積もり受付について</p>
    <h3 className="mt-3 text-2xl font-bold leading-relaxed">ただいま、受付準備中です。</h3>
    <p className="mt-4 text-sm leading-8">現在、一括見積もりのお申し込みを受け付けていません。受付開始は、このページでお知らせします。</p>
    <p className="mt-3 text-sm leading-8">処分方法や料金を比べるときのポイントは、お役立ち記事からご覧いただけます。</p>
    <Link href="/blog" className="primary-button mt-6">処分方法・費用の記事を読む <span aria-hidden="true">→</span></Link>
  </div>;
}
