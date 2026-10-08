import type { Metadata } from "next";
import Link from "next/link";
import { InformationPage } from "@/components/InformationPage";
import { getOperatorDetails, isQuoteIntakeOpen } from "@/lib/intake-status";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `運営者情報 | ${brand.name}`,
  alternates: { canonical: `${brand.siteUrl}/about` },
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  const operator = getOperatorDetails();
  const complete = operator.name && operator.address && operator.email;
  return <InformationPage title="運営者情報">
    <section><h2>不用品回収ナビについて</h2><p>不用品回収の相見積もりを通じて、料金・日程・作業内容を比べるためのサイトです。処分方法や見積もり前の確認事項を記事で紹介しています。</p><p className="mt-3">当サイトへの見積もり依頼だけでは、回収の予約・契約は成立しません。実際の作業内容・料金・契約条件は、依頼先の業者にご確認ください。</p></section>
    <section><h2>運営者・お問い合わせ</h2>{complete ? <dl className="grid gap-3 sm:grid-cols-[8rem_1fr]"><dt className="font-bold">運営者</dt><dd>{operator.name}</dd><dt className="font-bold">所在地</dt><dd>{operator.address}</dd><dt className="font-bold">窓口</dt><dd className="break-all"><a href={`mailto:${operator.email}`}>{operator.email}</a></dd></dl> : <p>運営者情報・お問い合わせ窓口は掲載準備中です。情報の掲載と受付体制の確認が完了するまで、見積もりのお申し込みは受け付けません。</p>}</section>
    <section><h2>受付状況</h2><p>{isQuoteIntakeOpen() ? "見積もり依頼フォームからご相談いただけます。地域・回収内容によって、ご案内できる業者数や対応日時は異なります。" : "現在は見積もり受付の準備中です。開始時期が決まり次第、ホームページでお知らせします。"}</p><Link href="/#contact">見積もりの受付状況を確認する</Link></section>
  </InformationPage>;
}
