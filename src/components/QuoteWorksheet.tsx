"use client";

import { useState } from "react";

const checks = ["室内からの搬出", "階段・養生", "取り外し・分解", "出張・駐車費用"] as const;
type Quote = { company: string; total: string; kind: string; buyback: string; date: string; expiry: string; extras: string; cancellation: string; scope: string[] };
const emptyQuote = (): Quote => ({ company: "", total: "", kind: "未確認", buyback: "", date: "", expiry: "", extras: "", cancellation: "", scope: checks.map(() => "未確認") });
const inputClass = "mt-2 w-full rounded-lg border border-[#c9d6cd] bg-white px-3 py-3 text-base text-[#20382e]";

export function QuoteWorksheet() {
  const [conditions, setConditions] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>(() => [emptyQuote(), emptyQuote(), emptyQuote()]);
  const [notice, setNotice] = useState("");
  function update(index: number, patch: Partial<Quote>) {
    setQuotes(current => current.map((quote, i) => i === index ? { ...quote, ...patch } : quote));
    setNotice("");
  }
  const active = quotes.map((quote, i) => ({ quote, i })).filter(({ quote }) => quote.company || quote.total);
  function download() {
    const text = ["不用品回収 見積もり比較メモ", "共通の依頼条件", conditions || "未記入", "", ...quotes.flatMap((q, i) => [
      `【${String.fromCharCode(65 + i)}社】${q.company || "業者名未記入"}`,
      `提示された税込総額：${q.total ? `${q.total}円` : "未記入"}（買取の差引前）`,
      `金額の確度：${q.kind}`, `買取提示額（別記）：${q.buyback || "未確認"}`,
      ...checks.map((name, k) => `${name}：${q.scope[k]}`),
      `追加料金の条件：${q.extras || "未確認"}`, `回収日時：${q.date || "未確認"}`,
      `見積もりの有効期限：${q.expiry || "未確認"}`, `訪問見積もり・キャンセル費用：${q.cancellation || "未確認"}`, "",
    ]), "利用者が入力した比較用メモです。正式な見積書・予約・契約ではありません。各社の見積書と照合してください。"].join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "不用品回収-見積もり比較メモ.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("比較メモのダウンロードを開始しました。保存先をご確認ください。");
  }
  return <form onSubmit={event => { event.preventDefault(); download(); }} className="mt-10 space-y-8">
    <section className="rounded-2xl border border-[#dce3da] bg-white p-5 sm:p-8" aria-labelledby="conditions-heading">
      <p className="text-sm font-bold text-[#bc4b22]">STEP 01</p><h2 id="conditions-heading" className="mt-2 text-xl font-bold">まず、各社に伝える条件をそろえる</h2>
      <label className="mt-5 block font-bold">品目・数量・サイズ・搬出条件・希望日
        <textarea value={conditions} onChange={e => setConditions(e.target.value)} rows={4} maxLength={3000} className={inputClass} placeholder="例：2人掛けソファ1台（幅150cm）。集合住宅3階、エレベーターなし。室内からの搬出を希望。12月10日までに回収。" />
      </label><p className="mt-3 text-sm leading-7 text-[#5c6b62]">同じ品物・数量・作業範囲の見積書を用意してください。氏名・電話番号・詳しい住所の入力は不要です。</p>
    </section>
    <section aria-labelledby="quotes-heading">
      <p className="text-sm font-bold text-[#bc4b22]">STEP 02</p><h2 id="quotes-heading" className="mt-2 text-2xl font-bold">受け取った見積もりを並べる</h2>
      <p className="mt-3 leading-7 text-[#5c6b62]">最大3社。わからない項目は「未確認」のまま残し、依頼前に確認しましょう。</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">{quotes.map((q, i) => <fieldset key={i} className="min-w-0 rounded-2xl border border-[#dce3da] bg-white p-5 sm:p-6">
        <legend className="rounded-full bg-[#204f3e] px-5 py-2 font-bold text-white">{String.fromCharCode(65 + i)}社</legend>
        <label className="mt-2 block text-sm font-bold">業者名<input maxLength={100} value={q.company} onChange={e => update(i, {company:e.target.value})} className={inputClass} placeholder="業者名または自分用の呼び名" /></label>
        <label className="mt-5 block text-sm font-bold">提示された税込総額（円）<input type="number" min="0" max="999999999" step="1" value={q.total} onChange={e => update(i, {total:e.target.value})} className={inputClass} placeholder="例：18000" /></label>
        <p className="mt-2 text-xs leading-6 text-[#5c6b62]">買取額を差し引く前の総額。追加費用が未定なら概算として記録します。</p>
        <label className="mt-5 block text-sm font-bold">この金額は？<select value={q.kind} onChange={e => update(i, {kind:e.target.value})} className={inputClass}>{["未確認", "概算", "現地確認が必要", "条件を確認した確定額"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="mt-5 block text-sm font-bold">買取提示額・査定条件（別記）<input value={q.buyback} maxLength={300} onChange={e => update(i, {buyback:e.target.value})} className={inputClass} placeholder="例：買取なし／査定後に決定" /></label>
        <div className="mt-6 border-t border-[#dce3da] pt-5"><p className="font-bold">総額に含まれる作業</p>{checks.map((name, k) => <label key={name} className="mt-4 block text-sm">{name}<select value={q.scope[k]} onChange={e => update(i, {scope:q.scope.map((v, n) => n === k ? e.target.value : v)})} className={inputClass}>{["未確認", "総額に含む", "別料金", "不要・対象外"].map(v => <option key={v}>{v}</option>)}</select></label>)}</div>
        <label className="mt-5 block text-sm font-bold">追加料金の条件<textarea maxLength={1000} value={q.extras} onChange={e => update(i, {extras:e.target.value})} rows={3} className={inputClass} placeholder="例：品物追加時は再見積もり。階段料金は総額に含む。" /></label>
        <label className="mt-5 block text-sm font-bold">回収日時・予約状況<input maxLength={300} value={q.date} onChange={e => update(i, {date:e.target.value})} className={inputClass} placeholder="例：12月8日午前・仮案内" /></label>
        <label className="mt-5 block text-sm font-bold">見積もりの有効期限<input maxLength={300} value={q.expiry} onChange={e => update(i, {expiry:e.target.value})} className={inputClass} placeholder="例：12月5日まで" /></label>
        <label className="mt-5 block text-sm font-bold">訪問見積もり・キャンセル費用<textarea maxLength={1000} rows={2} value={q.cancellation} onChange={e => update(i, {cancellation:e.target.value})} className={inputClass} placeholder="無料の範囲、費用が発生する時点など" /></label>
      </fieldset>)}</div>
    </section>
    <section className="rounded-2xl bg-[#edf3e9] p-5 sm:p-8" aria-labelledby="review-heading">
      <p className="text-sm font-bold text-[#bc4b22]">STEP 03</p><h2 id="review-heading" className="mt-2 text-2xl font-bold">金額と、まだ確認が必要な条件を見る</h2>
      <p className="mt-3 leading-7">概算と確定額は、そのまま比べられません。「別料金」の項目は金額を確認してから、同じ作業を含む総額で比べましょう。</p>
      {active.length === 0 ? <p className="mt-5 rounded-lg bg-white p-4">業者名または総額を入力すると、ここに確認事項が表示されます。</p> : <ul className="mt-5 grid gap-4 md:grid-cols-3">{active.map(({quote:q,i}) => <li key={i} className="min-w-0 rounded-xl bg-white p-5">
        <h3 className="break-words font-bold">{String.fromCharCode(65+i)}社 {q.company}</h3>
        <p className="mt-3 text-2xl font-bold">{q.total && Number.isFinite(Number(q.total)) && Number(q.total) >= 0 ? `${Number(q.total).toLocaleString("ja-JP")}円` : "総額未確認"}</p><p className="mt-1 text-sm">{q.kind}・買取差引前</p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[#8c3d20]">
          {q.kind !== "条件を確認した確定額" && <li>・金額が確定する条件を確認</li>}
          {checks.map((name,k) => ["未確認","別料金"].includes(q.scope[k]) && <li key={name}>・{name}：{q.scope[k]}</li>)}
          {!q.extras.trim() && <li>・追加料金の条件が未記入</li>}
          {!q.date.trim() && <li>・回収日時が未記入</li>}
          {!q.expiry.trim() && <li>・有効期限が未記入</li>}
          {!q.cancellation.trim() && <li>・訪問見積もり・キャンセル費用が未記入</li>}
        </ul>
      </li>)}</ul>}
      {active.length === 1 && <p className="mt-4 text-sm font-bold">比較するには、もう1社の見積もりを入力してください。</p>}
      <div className="mt-6"><button type="submit" className="primary-button">比較メモを保存する（テキスト） ↓</button><p role="status" className="mt-3 text-sm">{notice}</p></div>
      <p className="mt-3 text-sm leading-7">入力内容はこの画面内だけで使い、送信・自動保存しません。再読み込みや画面を閉じると消えるため、必要な内容は保存してください。このメモは正式な見積書・予約・契約ではありません。</p>
    </section>
  </form>;
}
