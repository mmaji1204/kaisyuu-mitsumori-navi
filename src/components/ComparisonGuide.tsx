"use client";

import { useState } from "react";

const points = [
  {
    label: "料金", number: "01", title: "比べるのは、最後に払う総額。",
    body: "基本料金の安さだけでは、比較できません。搬出・出張・処分など、必要な費用がすべて含まれているか確認しましょう。",
    checks: ["税込みの総額", "追加料金が発生する条件", "見積もり・キャンセルの費用"],
    question: "「この見積もり以外に、費用がかかる場合はありますか？」",
  },
  {
    label: "日程", number: "02", title: "希望の日に、どこまで頼める？",
    body: "退去や引っ越しの期限があるなら、回収日時を具体的に。希望を伝えた段階と、予約が確定した段階を分けて確認しましょう。",
    checks: ["回収日と訪問時間帯", "予約が確定するタイミング", "日程変更・キャンセルの条件"],
    question: "「○月○日までに片付けたいです。回収日時は確定できますか？」",
  },
  {
    label: "作業内容", number: "03", title: "運び出しも、取り外しも確認。",
    body: "玄関先での引取りと、室内からの搬出では作業が違います。置いてある場所や階段の有無を伝え、同じ条件で比べましょう。",
    checks: ["室内からの搬出・階段作業", "取り外し・分解と養生", "回収する品目と処分方法"],
    question: "「設置したままです。取り外しから搬出まで、料金に含まれますか？」",
  },
];

export function ComparisonGuide() {
  const [selected, setSelected] = useState(0);
  const point = points[selected];
  return <div className="comparison-guide">
    <div className="comparison-controls" role="group" aria-label="比較するポイントを選択">
      {points.map((item, i) => <button type="button" key={item.label} aria-pressed={i === selected} aria-controls="comparison-detail" onClick={() => setSelected(i)}><span>{item.number}</span>{item.label}</button>)}
    </div>
    <div id="comparison-detail" className="comparison-detail" aria-live="polite" aria-atomic="true">
      <div className="guide-title"><span>{point.number}</span><h3>{point.title}</h3></div>
      <p>{point.body}</p>
      <ul>{point.checks.map(check => <li key={check}><span aria-hidden="true">✓</span>{check}</li>)}</ul>
      <div className="question-example"><span>こんなふうに聞いてみよう</span><p>{point.question}</p></div>
    </div>
  </div>;
}
