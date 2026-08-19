import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type LeadProgress = "未対応" | "現地見積" | "商談中" | "成約" | "失注";

type Lead = {
  id: string;
  requested_at: string;
  request: string;
  name: string;
  address: string;
  phone: string;
  progress: LeadProgress;
  duplicate_warning: boolean | null;
  fee: string | null;
};

const columns: {
  progress: LeadProgress;
  label: string;
  helper: string;
  tone: string;
  dot: string;
}[] = [
  {
    progress: "未対応",
    label: "新着対応",
    helper: "まず電話・配信判断",
    tone: "border-orange-200 bg-orange-50/70",
    dot: "bg-orange-500",
  },
  {
    progress: "現地見積",
    label: "現地見積",
    helper: "訪問日程と金額確認",
    tone: "border-blue-200 bg-blue-50/70",
    dot: "bg-blue-500",
  },
  {
    progress: "商談中",
    label: "商談中",
    helper: "成約へ追いかけ",
    tone: "border-violet-200 bg-violet-50/70",
    dot: "bg-violet-500",
  },
  {
    progress: "成約",
    label: "成約",
    helper: "請求・実績確認",
    tone: "border-emerald-200 bg-emerald-50/70",
    dot: "bg-emerald-500",
  },
  {
    progress: "失注",
    label: "失注",
    helper: "理由を次へ反映",
    tone: "border-slate-200 bg-slate-50",
    dot: "bg-slate-400",
  },
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function elapsedLabel(value: string, nowMs: number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "不明";
  }

  const diffHours = Math.max(
    0,
    Math.floor((nowMs - date.getTime()) / 1000 / 60 / 60),
  );

  if (diffHours < 1) {
    return "1時間以内";
  }

  if (diffHours < 24) {
    return `${diffHours}時間`;
  }

  return `${Math.floor(diffHours / 24)}日`;
}

function urgencyTone(lead: Lead, nowMs: number) {
  const date = new Date(lead.requested_at);
  const diffHours = Number.isNaN(date.getTime())
    ? 0
    : Math.floor((nowMs - date.getTime()) / 1000 / 60 / 60);

  if (lead.progress === "未対応" && diffHours >= 24) {
    return "bg-red-50 text-red-600";
  }

  if (lead.progress === "未対応" && diffHours >= 6) {
    return "bg-orange-50 text-orange-600";
  }

  return "bg-slate-100 text-slate-500";
}

function compactAddress(address: string) {
  if (!address) {
    return "住所未入力";
  }

  return address.length > 18 ? `${address.slice(0, 18)}...` : address;
}

function feeLabel(fee: string | null) {
  if (!fee) {
    return "";
  }

  return fee.includes("円") ? fee : `${fee}円`;
}

async function loadLeads() {
  if (!hasSupabaseServerEnv()) {
    return [] as Lead[];
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("requested_at", {
      ascending: false,
    });

  return (data ?? []) as Lead[];
}

export default async function AdminBoardPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const leads = await loadLeads();
  const nowMs = new Date().getTime();
  const today = new Date().toDateString();
  const unhandled = leads.filter((lead) => lead.progress === "未対応");
  const todayLeads = leads.filter(
    (lead) => new Date(lead.requested_at).toDateString() === today,
  );
  const duplicateWarnings = leads.filter((lead) => lead.duplicate_warning);
  const stalledLeads = unhandled.filter((lead) => {
    const date = new Date(lead.requested_at);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return nowMs - date.getTime() > 1000 * 60 * 60 * 6;
  });

  return (
    <AdminShell
      active="board"
      title="案件ボード"
      description="新着案件の初動、見積状況、成約までの流れをボード形式で確認できます。"
      actions={
        <>
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-orange-400 hover:text-orange-500"
          >
            案件一覧
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded-md bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-orange-500"
          >
            分析を見る
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["総案件", leads.length, "全ステータス"],
          ["今日の新着", todayLeads.length, "本日の問い合わせ"],
          ["未対応", unhandled.length, "初動が必要"],
          ["重複注意", duplicateWarnings.length, "電話番号など要確認"],
        ].map(([label, value, helper]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur"
          >
            <p className="text-xs font-black tracking-[0.18em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-orange-500">
              PRIORITY QUEUE
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              先に対応する案件
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              未対応のまま6時間以上経過した案件と、重複注意の案件を優先表示します。
            </p>
          </div>
          <span className="w-fit rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-orange-600">
            要確認 {stalledLeads.length + duplicateWarnings.length}件
          </span>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          {[...stalledLeads, ...duplicateWarnings]
            .filter(
              (lead, index, array) =>
                array.findIndex((item) => item.id === lead.id) === index,
            )
            .slice(0, 6)
            .map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-orange-500">
                      {formatDate(lead.requested_at)} / 経過{" "}
                      {elapsedLabel(lead.requested_at, nowMs)}
                    </p>
                    <p className="mt-2 font-black text-slate-950">{lead.request}</p>
                  </div>
                  {lead.duplicate_warning ? (
                    <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">
                      重複
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {lead.name} / {compactAddress(lead.address)}
                </p>
              </Link>
            ))}

          {stalledLeads.length + duplicateWarnings.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500 xl:col-span-3">
              優先対応が必要な案件はありません。新着案件が入ったらここに表示されます。
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const columnLeads = leads.filter(
            (lead) => lead.progress === column.progress,
          );

          return (
            <div
              key={column.progress}
              className={`rounded-3xl border p-4 shadow-xl shadow-slate-200/60 ${column.tone}`}
            >
              <div className="mb-4 rounded-2xl bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${column.dot}`} />
                    <h2 className="text-lg font-black text-slate-950">
                      {column.label}
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-black text-white">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  {column.helper}
                </p>
              </div>

              <div className="space-y-3">
                {columnLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="block rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-400">
                        {formatDate(lead.requested_at)}
                      </p>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-black ${urgencyTone(lead, nowMs)}`}
                      >
                        {elapsedLabel(lead.requested_at, nowMs)}
                      </span>
                    </div>

                    <p className="line-clamp-2 min-h-[3rem] font-black leading-relaxed text-slate-900">
                      {lead.request}
                    </p>

                    <div className="mt-3 space-y-2 text-sm font-bold text-slate-500">
                      <p>{lead.name}</p>
                      <p>{compactAddress(lead.address)}</p>
                      <p>{lead.phone}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {lead.duplicate_warning ? (
                        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">
                          重複注意
                        </span>
                      ) : null}
                      {lead.fee ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">
                          配信 {feeLabel(lead.fee)}
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">
                          金額未設定
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {columnLeads.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-center text-sm font-bold text-slate-400">
                    このステータスの案件はありません。
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>
    </AdminShell>
  );
}
