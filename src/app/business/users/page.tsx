import { BusinessShell } from "@/components/BusinessShell";
import { BusinessLeadsManager } from "@/components/BusinessLeadsManager";
import { Lead } from "@/lib/leads";

const leads: Lead[] = [
  {
    id: "demo-1",
    status: "課金",
    statusColor: "green",
    date: "2026/07/10 02:47",
    request: "不用品回収 軽トラック 1台分",
    kana: "クボ マサヒロ",
    name: "久保 舞広",
    address: "広島県広島市中区",
    phone: "090-1111-2222",
    fee: "900 円",
    progress: "未対応",
    estimate: "例: 50000",
    memo: "",
    message: "できれば今週中に回収希望です。",
  },
  {
    id: "demo-2",
    status: "課金",
    statusColor: "green",
    date: "2026/07/09 19:52",
    request: "不用品回収 2tトラック 1台分",
    kana: "イノウエ シンイチ",
    name: "井上 眞一",
    address: "広島県広島市中区",
    phone: "080-3333-4444",
    fee: "3,300 円",
    progress: "現地見積",
    estimate: "40000",
    memo: "午前中に折り返し予定",
    message: "ソファと棚も追加で相談したいです。",
  },
  {
    id: "demo-3",
    status: "除外",
    statusColor: "red",
    date: "2026/07/09 16:10",
    request: "不用品回収 乗用車 1台分",
    kana: "ミツモリ タロウ",
    name: "見積 太郎",
    address: "東京都港区",
    phone: "070-5555-6666",
    fee: "0 円",
    progress: "未対応",
    estimate: "例: 50000",
    memo: "",
    message: "少量回収の相談です。",
  },
  {
    id: "demo-4",
    status: "除外",
    statusColor: "red",
    date: "2026/07/09 16:07",
    request: "不用品回収 乗用車 1台分",
    kana: "ミツモリ タロウ",
    name: "見積 太郎",
    address: "東京都港区",
    phone: "070-5555-6666",
    fee: "0 円",
    progress: "未対応",
    estimate: "例: 50000",
    memo: "",
    message: "別フォームからの重複相談です。",
  },
  {
    id: "demo-5",
    status: "課金",
    statusColor: "green",
    date: "2026/07/08 11:36",
    request: "不用品回収 軽トラック 1台分",
    kana: "アンドウ ハルカ",
    name: "安藤 遥",
    address: "大阪府大阪市北区",
    phone: "090-7777-8888",
    fee: "900 円",
    progress: "商談中",
    estimate: "35000",
    memo: "見積提示済み",
    message: "引っ越し前にまとめて処分したいです。",
  },
];

export default function BusinessUsersPage() {
  return (
    <BusinessShell
      active="leads"
      title="案件一覧"
      description="サイトから入った見積もり依頼を確認し、進捗と見積金額を管理します。"
    >

          <div className="mb-8 rounded-2xl border border-orange-100 bg-orange-50 px-6 py-5 text-base font-bold text-orange-600 shadow-sm">
            ⓘ　見積金額の入力形式を変更いたしました。： 数値のみ（半角数字）で入力してください。テキストの入力はメモ欄をご活用ください。
          </div>

          <BusinessLeadsManager initialLeads={leads} />
    </BusinessShell>
  );
}
