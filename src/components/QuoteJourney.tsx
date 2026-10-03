"use client";

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction, type FormEvent } from "react";

const QuoteContext = createContext<{ area: string; setArea: Dispatch<SetStateAction<string>> } | null>(null);

export function QuoteJourney({ children }: { children: ReactNode }) {
  const [area, setArea] = useState("");
  return <QuoteContext.Provider value={{ area, setArea }}>{children}</QuoteContext.Provider>;
}

export function useQuoteArea() {
  const context = useContext(QuoteContext);
  if (!context) throw new Error("Quote form requires QuoteJourney");
  return context;
}

const prefectures = "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県".split(" ");

export function AreaSearch() {
  const { setArea } = useQuoteArea();

  function continueToQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setArea(`${data.get("prefecture") ?? ""}${String(data.get("city") ?? "").trim()}`);
    window.history.replaceState(null, "", "#contact");
    document.getElementById("contact")?.scrollIntoView({ behavior: "instant" });
    document.querySelector<HTMLInputElement>('#contact input[name="name"]')?.focus({ preventScroll: true });
  }

  return <form onSubmit={continueToQuote} className="area-search">
    <label><span id="prefecture-label">都道府県</span><select name="prefecture" aria-labelledby="prefecture-label" defaultValue="" required autoComplete="address-level1">
      <option value="" disabled>都道府県を選択</option>
      {prefectures.map(name => <option key={name}>{name}</option>)}
    </select></label>
    <label><span>市区町村</span><input name="city" placeholder="例：広島市中区" required pattern=".*\S.*" autoComplete="address-level2" /></label>
    <button className="primary-button" type="submit">この地域で見積もり相談 <span aria-hidden="true">→</span></button>
  </form>;
}
