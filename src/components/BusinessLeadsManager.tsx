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
    const today = new Date();
    const todayText = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
    const totalFee = activeLeads.reduce((sum, lead) => {
      const amount = Number(lead.fee.replace(/[^0-9]/g, ""));
      return sum + amount;
    }, 0);

    return [
      {
        label: "本日の新規案件",
        value: String(leads.filter((lead) => lead.date.startsWith(todayText)).length),
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
        label: "配信金額合計",
        value: totalFee.toLocaleString(),
        unit: "円",
        color: "text-slate-700",
      },
    ];
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="relative overflow-x-auto rounded-2xl border border-white/70 bg-white/70 p-3 shadow-xl shadow-slate-200/70 backdrop-blur">
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
