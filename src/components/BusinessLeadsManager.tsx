"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { LEADS_STORAGE_KEY, Lead } from "@/lib/leads";

type BusinessLeadsManagerProps = {
  initialLeads: Lead[];
};

const progressOptions: Lead["progress"][] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

function cleanNumber(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

function hasEstimate(lead: Lead) {
  return Boolean(lead.estimate && !lead.estimate.startsWith("例"));
}

function actionLabel(lead: Lead) {
  if (lead.progress === "未対応") {
    return "まず電話";
  }

  if (!hasEstimate(lead)) {
    return "見積入力";
  }

  if (lead.progress === "現地見積") {
    return "予約確認";
  }

  if (lead.progress === "商談中") {
    return "追客";
  }

  return "確認";
}

function progressTone(progress: Lead["progress"]) {
  if (progress === "成約") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (progress === "失注") {
    return "bg-slate-100 text-slate-500";
  }

  if (progress === "未対応") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-blue-100 text-blue-700";
}

function priorityScore(lead: Lead) {
  let score = 0;

  if (lead.status === "課金") {
    score += 20;
  }

  if (lead.progress === "未対応") {
    score += 40;
  }

  if (!hasEstimate(lead)) {
    score += 20;
  }

  if (lead.photoUrls?.length) {
    score += 10;
  }

  if (lead.message) {
    score += 5;
  }

  return score;
}

function loadStoredLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) ?? "[]") as Lead[];
  } catch {
    return [];
  }
}

function subscribeToStoredLeads(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

function getStoredLeadsSnapshot() {
  return localStorage.getItem(LEADS_STORAGE_KEY) ?? "[]";
}

function getServerStoredLeadsSnapshot() {
  return "[]";
}

export function BusinessLeadsManager({ initialLeads }: BusinessLeadsManagerProps) {
  const storedLeadsSnapshot = useSyncExternalStore(
    subscribeToStoredLeads,
    getStoredLeadsSnapshot,
    getServerStoredLeadsSnapshot,
  );
  const [leadEdits, setLeadEdits] = useState<Record<string, Partial<Lead>>>({});
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("すべて");
  const [progress, setProgress] = useState("すべて");
  const [insightLeadId, setInsightLeadId] = useState<string | null>(null);
  const [serverLeads, setServerLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const storedLeads = useMemo(() => {
    try {
      return JSON.parse(storedLeadsSnapshot) as Lead[];
    } catch {
      return [];
    }
  }, [storedLeadsSnapshot]);

  const leads = useMemo(() => {
    const localOnlyLeads = storedLeads.filter(
      (storedLead) =>
        !serverLeads.some((serverLead) => serverLead.id === storedLead.id),
    );

    return [...serverLeads, ...localOnlyLeads, ...initialLeads].map((lead) => ({
      ...lead,
      ...leadEdits[lead.id],
    }));
  }, [initialLeads, leadEdits, serverLeads, storedLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchText = [
        lead.name,
        lead.kana,
        lead.address,
        lead.request,
        lead.phone,
        lead.message,
      ].join(" ");
      const keywordMatched = searchText.includes(keyword);
      const statusMatched = status === "すべて" || lead.status === status;
      const progressMatched = progress === "すべて" || lead.progress === progress;

      return keywordMatched && statusMatched && progressMatched;
    });
  }, [keyword, leads, progress, status]);

  const summaryCards = useMemo(() => {
    const activeLeads = leads.filter((lead) => lead.status === "課金");
    const totalFee = activeLeads.reduce((sum, lead) => {
      return sum + cleanNumber(lead.fee);
    }, 0);

    return [
      {
        label: "配信案件",
        value: String(activeLeads.length),
        unit: "件",
        color: "text-blue-500",
      },
      {
        label: "未対応",
        value: String(leads.filter((lead) => lead.progress === "未対応").length),
        unit: "件",
        color: "text-orange-500",
      },
      {
        label: "現地見積",
        value: String(leads.filter((lead) => lead.progress === "現地見積").length),
        unit: "件",
        color: "text-emerald-500",
      },
      {
        label: "見積未入力",
        value: String(activeLeads.filter((lead) => !hasEstimate(lead)).length),
        unit: "件",
        color: "text-rose-500",
      },
      {
        label: "配信金額合計",
        value: totalFee.toLocaleString(),
        unit: "円",
        color: "text-slate-700",
      },
    ];
  }, [leads]);

  const priorityLeads = useMemo(() => {
    return [...leads]
      .filter((lead) => lead.status === "課金" && lead.progress !== "成約")
      .sort((a, b) => priorityScore(b) - priorityScore(a))
      .slice(0, 3);
  }, [leads]);

  const salesMetrics = useMemo(() => {
    const activeLeads = leads.filter((lead) => lead.status === "課金");
    const closedLeads = activeLeads.filter((lead) => lead.progress === "成約");
    const estimatedLeads = activeLeads.filter(hasEstimate);
    const estimatedTotal = estimatedLeads.reduce(
      (sum, lead) => sum + cleanNumber(lead.estimate),
      0,
    );

    return {
      closeRate: activeLeads.length
        ? Math.round((closedLeads.length / activeLeads.length) * 100)
        : 0,
      estimatedAverage: estimatedLeads.length
        ? Math.round(estimatedTotal / estimatedLeads.length).toLocaleString()
        : "0",
      nextCalls: activeLeads.filter((lead) => lead.progress === "未対応").length,
    };
  }, [leads]);

  const insightLead = useMemo(
    () => leads.find((lead) => lead.id === insightLeadId) ?? null,
    [insightLeadId, leads],
  );

  async function fetchServerLeads() {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/leads", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("案件を取得できませんでした。");
      }

      const result = (await response.json()) as {
        leads: Lead[];
        mode?: "demo" | "supabase";
      };

      setServerLeads(result.leads);
    } catch {
      setLoadError(
        "サーバーの案件を取得できませんでした。ローカル保存分とデモ案件を表示しています。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialServerLeads() {
      try {
        const response = await fetch("/api/leads", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("案件を取得できませんでした。");
        }

        const result = (await response.json()) as {
          leads: Lead[];
          mode?: "demo" | "supabase";
        };

        if (!ignore) {
          setServerLeads(result.leads);
        }
      } catch {
        if (!ignore) {
          setLoadError(
            "サーバーの案件を取得できませんでした。ローカル保存分とデモ案件を表示しています。",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialServerLeads();

    return () => {
      ignore = true;
    };
  }, []);

  async function updateLead(id: string, updates: Partial<Lead>) {
    setLeadEdits((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...updates,
      },
    }));

    if (!id.startsWith("demo-")) {
      const nextStoredLeads = loadStoredLeads().map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead,
      );

      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(nextStoredLeads));

      try {
        await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      } catch {
        setLoadError(
          "進捗の保存に失敗しました。画面上は更新されていますが、再読み込み後に戻る可能性があります。",
        );
      }
    }

    if (updates.progress && updates.progress !== "未対応") {
      setInsightLeadId(id);
    }
  }

  function exportCsv() {
    const header = [
      "配信状況",
      "配信日時",
      "依頼内容",
      "名前",
      "電話番号",
      "住所",
      "配信金額",
      "進捗",
      "見積金額",
      "メモ",
    ];
    const rows = filteredLeads.map((lead) => [
      lead.status,
      lead.date,
      lead.request,
      lead.name,
      lead.phone,
      lead.address,
      lead.fee,
      lead.progress,
      lead.estimate,
      lead.memo,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur"
          >
            <p className="text-xs font-black tracking-[0.16em] text-slate-400">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-black ${card.color}`}>
              {card.value}
              <span className="ml-1 text-base">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mb-7 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-slate-900/10 bg-slate-950 p-5 text-white shadow-xl shadow-slate-300/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-orange-300">
                TODAY ACTION
              </p>
              <h2 className="mt-2 text-2xl font-black">今日の優先対応</h2>
            </div>
            <p className="text-sm font-bold text-slate-300">
              未対応・見積未入力・写真ありを優先表示
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {priorityLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-white/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black">
                    {actionLabel(lead)}
                  </span>
                  <span className="text-xs font-bold text-slate-300">{lead.date}</span>
                </div>
                <p className="mt-4 text-lg font-black">{lead.name} 様</p>
                <p className="mt-1 text-sm font-bold text-slate-300">{lead.address}</p>
                <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-200">
                  {lead.request}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-black">
                  <a
                    href={`tel:${lead.phone}`}
                    className="rounded-xl bg-white px-3 py-3 text-slate-950"
                  >
                    電話
                  </a>
                  <a
                    href={`/business/users/${lead.id}`}
                    className="rounded-xl border border-white/20 px-3 py-3 text-white"
                  >
                    詳細
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
          <p className="text-xs font-black tracking-[0.18em] text-slate-400">
            SALES CHECK
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            対応の進み具合
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-700">成約率</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {salesMetrics.closeRate}%
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-black text-orange-700">次に電話する案件</p>
              <p className="mt-2 text-3xl font-black text-orange-600">
                {salesMetrics.nextCalls}
                <span className="ml-1 text-base">件</span>
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-black text-blue-700">平均見積金額</p>
              <p className="mt-2 text-3xl font-black text-blue-600">
                {salesMetrics.estimatedAverage}
                <span className="ml-1 text-base">円</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mb-7 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px]">
          <label className="block">
            <span className="text-sm font-black text-slate-500">キーワード検索</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="名前・電話番号・住所・依頼内容で検索"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-500">配信状況</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option>すべて</option>
              <option>課金</option>
              <option>除外</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-500">進捗</span>
            <select
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option>すべて</option>
              {progressOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="h-12 w-full rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">
              検索する
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setProgress("未対応")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-black text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-500"
          >
            未対応のみ表示
          </button>
          <button
            onClick={() => setProgress("すべて")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-black text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-500"
          >
            表示をリセット
          </button>
          <button
            onClick={exportCsv}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-black text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-500"
          >
            表示中の案件をCSV出力
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black text-slate-500">
            表示中: {filteredLeads.length} 件 / 全 {leads.length} 件
          </p>
          <p className="mt-1 text-sm font-bold text-slate-400">
            {isLoading
              ? "サーバーの新着案件を確認中です。"
              : serverLeads.length > 0
                ? `サーバー保存案件: ${serverLeads.length} 件`
                : "Supabase未設定時は、このブラウザの送信分とデモ案件を表示します。"}
          </p>
        </div>
        <button
          onClick={() => {
            setLeadEdits({});
            window.dispatchEvent(new StorageEvent("storage"));
            void fetchServerLeads();
          }}
          className="w-fit rounded-xl bg-blue-500 px-4 py-3 font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
        >
          新着を再読み込み
        </button>
      </div>

      {loadError ? (
        <div className="mb-4 rounded-md bg-amber-50 px-5 py-4 font-bold text-amber-700">
          {loadError}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 lg:hidden">
        {filteredLeads.map((lead) => (
          <article
            key={lead.id}
            className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl shadow-slate-200/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-slate-900">
                  {lead.name} 様
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">{lead.date}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${progressTone(lead.progress)}`}>
                {lead.progress}
              </span>
            </div>
            <p className="mt-4 text-sm font-black leading-6 text-slate-700">
              {lead.request}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-bold text-slate-500">
              <p className="rounded-xl bg-slate-50 p-3">
                住所
                <span className="mt-1 block font-black text-slate-800">
                  {lead.address}
                </span>
              </p>
              <p className="rounded-xl bg-slate-50 p-3">
                配信金額
                <span className="mt-1 block font-black text-slate-800">
                  {lead.fee}
                </span>
              </p>
            </div>
            {lead.message ? (
              <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm font-bold leading-6 text-orange-700">
                {lead.message}
              </p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <select
                value={lead.progress}
                onChange={(event) =>
                  updateLead(lead.id, {
                    progress: event.target.value as Lead["progress"],
                  })
                }
                className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
              >
                {progressOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <input
                inputMode="numeric"
                value={lead.estimate.startsWith("例") ? "" : lead.estimate}
                onChange={(event) =>
                  updateLead(lead.id, { estimate: event.target.value })
                }
                placeholder="見積金額"
                className="h-12 rounded-xl border border-slate-200 px-3 text-sm font-bold"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-black">
              <a
                href={`tel:${lead.phone}`}
                className="rounded-xl bg-orange-500 px-3 py-3 text-white"
              >
                電話
              </a>
              <a
                href={`/business/users/${lead.id}`}
                className="rounded-xl bg-slate-900 px-3 py-3 text-white"
              >
                詳細
              </a>
              <button
                onClick={() => updateLead(lead.id, { memo: lead.memo || "確認済み" })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-700"
              >
                保存
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="relative hidden overflow-x-auto rounded-2xl border border-white/70 bg-white/70 p-3 shadow-xl shadow-slate-200/70 backdrop-blur lg:block">
        {insightLead ? (
          <div className="absolute right-10 top-16 z-10 w-[min(520px,calc(100vw-2rem))] rounded-2xl bg-white shadow-2xl shadow-slate-300">
            <div className="rounded-t-lg bg-sky-50 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-lg font-black text-slate-700">
                    <span className="text-sky-500">▣</span>
                    開示インサイト
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    営業状況を入力すると、他社の営業データを確認できます
                  </p>
                </div>
                <button
                  onClick={() => setInsightLeadId(null)}
                  className="text-xl font-black text-slate-400"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-4">
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-400">配信社数</p>
                <p className="mt-3 rounded-md bg-white py-2 text-center font-black text-sky-500">
                  {insightLead.progress === "未対応" ? "非開示" : "4社"}
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-400">他社見積平均</p>
                <p className="mt-3 rounded-md bg-white py-2 text-center font-black text-green-500">
                  {insightLead.progress === "未対応" ? "非開示" : "48,000円"}
                </p>
              </div>
            </div>

            <div className="mx-4 mb-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
              <p className="font-black text-slate-700">更新で開示</p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                {insightLead.name} 様の進捗を「{insightLead.progress}」に更新しました。
                他社対応状況と見積相場を確認できます。
              </p>
            </div>
            <div className="absolute -bottom-2 right-10 h-4 w-4 rotate-45 bg-white" />
          </div>
        ) : null}

        <div className="min-w-[1900px]">
          <div className="sticky top-0 z-[1] grid grid-cols-[70px_110px_170px_250px_130px_150px_170px_110px_160px_150px_190px_90px] rounded-xl bg-slate-100 px-6 py-4 text-sm font-black text-slate-500">
            <span>詳細</span>
            <span>配信状況</span>
            <span>配信日時</span>
            <span>依頼内容</span>
            <span>名前</span>
            <span>電話番号</span>
            <span>住所</span>
            <span>配信金額</span>
            <span>進捗</span>
            <span>見積金額</span>
            <span>メモ</span>
            <span>保存</span>
          </div>

          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="grid min-h-28 grid-cols-[70px_110px_170px_250px_130px_150px_170px_110px_160px_150px_190px_90px] items-center rounded-2xl bg-white px-6 py-5 text-base shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <a
                  href={`/business/users/${lead.id}`}
                  className="text-left text-2xl text-slate-600"
                  aria-label={`${lead.name}様の案件詳細を開く`}
                >
                  ↗
                </a>
                <span
                  className={`w-fit rounded-md px-4 py-2 text-base font-black ${
                    lead.statusColor === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {lead.status}
                </span>
                <span>{lead.date}</span>
                <span>
                  <span className="block font-black text-slate-600">{lead.request}</span>
                  {lead.message ? (
                    <span className="mt-1 block text-sm text-slate-400">
                      {lead.message}
                    </span>
                  ) : null}
                </span>
                <span>
                  <span className="block text-sm font-black text-slate-500">
                    {lead.kana || "カナ未入力"}
                  </span>
                  <span className="font-black text-orange-600">{lead.name}</span>
                </span>
                <span>{lead.phone || "未入力"}</span>
                <span>{lead.address}</span>
                <span>{lead.fee}</span>
                <select
                  value={lead.progress}
                  onChange={(event) =>
                    updateLead(lead.id, {
                      progress: event.target.value as Lead["progress"],
                    })
                  }
                  className="h-12 w-40 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  {progressOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <input
                  value={lead.estimate.startsWith("例") ? "" : lead.estimate}
                  onChange={(event) =>
                    updateLead(lead.id, { estimate: event.target.value })
                  }
                  placeholder={lead.estimate.startsWith("例") ? lead.estimate : undefined}
                  className="h-12 w-36 rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
                <input
                  value={lead.memo}
                  onChange={(event) => updateLead(lead.id, { memo: event.target.value })}
                  placeholder="折り返し済み等"
                  className="h-12 w-44 rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
                <button
                  onClick={() => updateLead(lead.id, { memo: lead.memo || "確認済み" })}
                  className="h-12 w-20 rounded-xl bg-blue-500 font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
