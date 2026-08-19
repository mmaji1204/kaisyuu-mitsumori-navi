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
  address: string;
  progress: LeadProgress;
  request: string;
  duplicate_warning: boolean | null;
};

type Partner = {
  id: string;
  name: string;
  status: "active" | "paused";
};

type BillingItem = {
  partner_id: string;
  amount: number;
  status: "unbilled" | "invoiced" | "paid" | "void";
};

const funnelSteps: LeadProgress[] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function monthKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "不明";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "不明";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function areaKey(address: string) {
  if (!address) {
    return "不明";
  }

  const prefecture = address.match(/^(.*?[都道府県])/)?.[1];

  if (prefecture) {
    return prefecture;
  }

  return address.slice(0, 4);
}

async function loadAnalyticsData() {
  if (!hasSupabaseServerEnv()) {
    return {
      billingItems: [] as BillingItem[],
      leads: [] as Lead[],
      partners: [] as Partner[],
    };
  }

  const supabase = createSupabaseAdminClient();
  const [leadsResult, partnersResult, billingResult] = await Promise.all([
    supabase.from("leads").select("*").order("requested_at", {
      ascending: false,
    }),
    supabase.from("partners").select("id, name, status"),
    supabase.from("billing_items").select("*"),
  ]);

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    leads: (leadsResult.data ?? []) as Lead[],
    partners: (partnersResult.data ?? []) as Partner[],
  };
}

function groupedCounts<T>(items: T[], keyGetter: (item: T) => string) {
  return Array.from(
    items
      .reduce((map, item) => {
        const key = keyGetter(item);
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  );
}

export default async function AdminAnalyticsPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const { billingItems, leads, partners } = await loadAnalyticsData();
  const partnerMap = new Map(partners.map((partner) => [partner.id, partner.name]));
  const activePartnerCount = partners.filter(
    (partner) => partner.status === "active",
  ).length;
  const wonCount = leads.filter((lead) => lead.progress === "成約").length;
  const lostCount = leads.filter((lead) => lead.progress === "失注").length;
  const inProgressCount = leads.filter(
    (lead) => !["成約", "失注"].includes(lead.progress),
  ).length;
  const conversionRate = leads.length === 0 ? 0 : (wonCount / leads.length) * 100;
  const unhandledRate =
    leads.length === 0
      ? 0
      : (leads.filter((lead) => lead.progress === "未対応").length / leads.length) *
        100;
  const totalSales = billingItems
    .filter((item) => item.status !== "void")
    .reduce((sum, item) => sum + item.amount, 0);
  const unbilledTotal = billingItems
    .filter((item) => item.status === "unbilled")
    .reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = billingItems
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const dailyCount = new Set(leads.map((lead) => dayKey(lead.requested_at))).size;
  const averageDailyLeads =
    dailyCount === 0 ? 0 : Math.round((leads.length / dailyCount) * 10) / 10;
  const duplicateCount = leads.filter((lead) => lead.duplicate_warning).length;
  const byMonth = groupedCounts(leads, (lead) => monthKey(lead.requested_at))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8);
  const monthMax = Math.max(...byMonth.map(([, count]) => count), 1);
  const byArea = groupedCounts(leads, (lead) => areaKey(lead.address))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const areaMax = Math.max(...byArea.map(([, count]) => count), 1);
  const salesByPartner = Array.from(
    billingItems
      .filter((item) => item.status !== "void")
      .reduce((map, item) => {
        map.set(item.partner_id, (map.get(item.partner_id) ?? 0) + item.amount);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).sort((a, b) => b[1] - a[1]);
  const salesMax = Math.max(...salesByPartner.map(([, amount]) => amount), 1);

  return (
    <AdminShell
      active="analytics"
      title="分析ダッシュボード"
      description="相見積もりサイトの集客、成約、請求の状態を数字で確認できます。"
      actions={
        <>
          <Link
            href="/admin/board"
            className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-orange-400 hover:text-orange-500"
          >
            案件ボード
          </Link>
          <a
            href="/api/admin/export?type=billing"
            className="rounded-md bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-orange-500"
          >
            請求CSV
          </a>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["総案件数", `${leads.length}`, "問い合わせ全体"],
          ["成約率", formatPercent(conversionRate), "成約 / 総案件"],
          ["進行中", `${inProgressCount}`, "追客できる案件"],
          ["稼働業者", `${activePartnerCount}`, "現在配信可能"],
          ["未請求", `${formatCurrency(unbilledTotal)}円`, "回収予定の売上"],
        ].map(([label, value, helper]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur"
          >
            <p className="text-xs font-black tracking-[0.18em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-sm font-bold text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-orange-500">
                CONVERSION FUNNEL
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                案件の進捗ファネル
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-500">
              未対応率 {formatPercent(unhandledRate)} / 失注 {lostCount}件
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {funnelSteps.map((step) => {
              const count = leads.filter((lead) => lead.progress === step).length;
              const percent = leads.length === 0 ? 0 : (count / leads.length) * 100;

              return (
                <div key={step} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-500">{step}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {count}
                    <span className="ml-1 text-base text-slate-400">件</span>
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${Math.max(5, percent)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-black text-slate-400">
                    {formatPercent(percent)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/70">
          <p className="text-xs font-black tracking-[0.22em] text-orange-300">
            OPERATION INSIGHTS
          </p>
          <h2 className="mt-1 text-2xl font-black">今見るべき数字</h2>
          <div className="mt-6 space-y-3">
            {[
              ["1日平均案件", `${averageDailyLeads}件`, "広告・SEOの伸びを確認"],
              ["重複注意", `${duplicateCount}件`, "同一顧客の二重対応を防止"],
              ["請求済み売上", `${formatCurrency(paidTotal)}円`, "入金済みの実績"],
              ["配信売上合計", `${formatCurrency(totalSales)}円`, "無効を除いた合計"],
            ].map(([label, value, helper]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-slate-300">{label}</p>
                  <p className="text-xl font-black text-orange-300">{value}</p>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <h2 className="text-2xl font-black text-slate-950">月別案件数</h2>
          <div className="mt-5 space-y-4">
            {byMonth.map(([month, count]) => (
              <div key={month}>
                <div className="flex justify-between text-sm font-black">
                  <span>{month}</span>
                  <span className="text-orange-500">{count}件</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-orange-500"
                    style={{ width: `${(count / monthMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {byMonth.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                まだ案件データがありません。
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <h2 className="text-2xl font-black text-slate-950">エリア別案件数</h2>
          <div className="mt-5 space-y-3">
            {byArea.map(([area, count]) => (
              <div key={area} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-slate-800">{area}</span>
                  <span className="font-black text-orange-500">{count}件</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(count / areaMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <h2 className="text-2xl font-black text-slate-950">業者別売上</h2>
          <div className="mt-5 space-y-3">
            {salesByPartner.slice(0, 8).map(([partnerId, amount], index) => (
              <Link
                key={partnerId}
                href={`/admin/partners/${partnerId}`}
                className="block rounded-2xl border border-slate-100 p-4 transition hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-orange-50 text-sm font-black text-orange-500">
                      {index + 1}
                    </span>
                    <span className="font-black text-slate-800">
                      {partnerMap.get(partnerId) ?? "不明な業者"}
                    </span>
                  </div>
                  <span className="font-black text-orange-500">
                    {formatCurrency(amount)}円
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(amount / salesMax) * 100}%` }}
                  />
                </div>
              </Link>
            ))}

            {salesByPartner.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                まだ請求データがありません。
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
