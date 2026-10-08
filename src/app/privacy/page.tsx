import type { Metadata } from "next";
import Link from "next/link";
import { InformationPage } from "@/components/InformationPage";
import { getOperatorDetails, isQuoteIntakeOpen } from "@/lib/intake-status";
import { PRIVACY_VERSION } from "@/lib/consent";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `個人情報の取り扱い | ${brand.name}`,
  alternates: { canonical: `${brand.siteUrl}/privacy` },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  const operator = getOperatorDetails();
  return <InformationPage title="個人情報の取り扱い">
    {!isQuoteIntakeOpen() && <p className="rounded-lg bg-[#f2f6ed] p-4 font-bold">現在、見積もり受付は準備中です。以下は受付開始後の利用案内です。運営者情報・窓口を掲載し、取り扱い体制を確認してから受付を開始します。</p>}
    <section><h2>お預かりする情報と利用目的</h2><p>見積もりフォームのお名前、電話番号、回収地域、品目、希望日時、ご相談内容、任意で添付する写真を、見積もりの受付、対応可能な業者の確認、ご相談への連絡、業者への見積もり依頼の共有に利用します。受付・共有・同意の記録は、対応状況の確認やお問い合わせへの対応に使用します。</p></section>
    <section><h2>対応業者への情報提供</h2><p>同意をいただいたうえで、ご相談に対応する掲載業者へ、お名前・電話番号・地域・品目・希望日時・相談内容・写真を共有します。業者は見積もりや回収について電話等でご連絡します。地域・内容に応じて複数の業者から連絡する場合があります。共有した業者は配信記録に残します。</p><p className="mt-3">見積もり依頼の送信は、回収契約への同意ではありません。連絡時に業者名を確認し、作業条件や総額に納得してからご契約ください。</p></section>
    <section><h2>保管・システムの利用</h2><p>受付内容と写真の保存、通知メールの送信などに外部のクラウドサービスを利用します。関係者のアクセスを制限し、写真はログインした管理者または当該相談の配信先業者が閲覧する仕組みとします。保存先・委託先の取り扱い条件と国外での処理については、受付開始前に確認し、必要な情報をこのページに掲載します。</p><p className="mt-3">ログイン状態の保持にはCookieを使用します。また、サイト配信のため、配信基盤にアクセスログが記録される場合があります。</p></section>
    <section><h2>入力・写真についてのお願い</h2><p>見積もりに不要な身分証、顔、郵便物、口座番号等は送信しないでください。写真は回収する品物と搬出条件が伝わる範囲で撮影してください。</p></section>
    <section><h2>内容の確認・訂正・削除等のお問い合わせ</h2><p>受付内容の確認、訂正、削除、利用停止等は、運営窓口へご連絡ください。ご本人の確認を行ったうえで、内容を確認して対応をご案内します。</p>{operator.email ? <p><a href={`mailto:${operator.email}`}>{operator.email}</a></p> : <p>窓口は掲載準備中です。掲載が完了するまでフォームで個人情報を受け付けません。</p>}<Link href="/about">運営者情報を確認する</Link></section>
    <p className="text-xs text-slate-500">案内の版：{PRIVACY_VERSION}</p>
  </InformationPage>;
}
