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

type Delivery = {
  lead_id: string;
  partner_id: string;
  delivery_status: string;
  fee: string | null;
  created_at: string;
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
      deliveries: [] as Delivery[],
      leads: [] as Lead[],
      partners: [] as Partner[],
    };
  }

  const supabase = createSupabaseAdminClient();
  const [leadsResult, partnersResult, billingResult, deliveriesResult] =
    await Promise.all([
    supabase.from("leads").select("*").order("requested_at", {
      ascending: false,
    }),
    supabase.from("partners").select("id, name, status"),
    supabase.from("billing_items").select("*"),
    supabase.from("lead_deliveries").select("*").order("created_at", {
      ascending: false,
    }),
  ]);

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    deliveries: (deliveriesResult.data ?? []) as Delivery[],
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

  const { billingItems, deliveries, leads, partners } = await loadAnalyticsData();
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
  const deliveredLeadIds = new Set(deliveries.map((delivery) => delivery.lead_id));
  const deliveryCoverageRate =
    leads.length === 0 ? 0 : (deliveredLeadIds.size / leads.length) * 100;
  const collectionRate =
    totalSales === 0 ? 0 : (paidTotal / totalSales) * 100;
  const byMonth = groupedCounts(leads, (lead) => monthKey(lead.requested_at))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8);
  const monthMax = Math.max(...byMonth.map(([, count]) => count), 1);
  const lastMonthCount = byMonth.at(-1)?.[1] ?? 0;
  const previousMonthCount = byMonth.at(-2)?.[1] ?? 0;
  const monthTrend =
    previousMonthCount === 0
      ? lastMonthCount > 0
        ? 100
        : 0
      : ((lastMonthCount - previousMonthCount) / previousMonthCount) * 100;
  const byArea = groupedCounts(leads, (lead) => areaKey(lead.address))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const areaMax = Math.max(...byArea.map(([, count]) => count), 1);
  const topArea = byArea[0]?.[0] ?? "未計測";
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
  const partnerDeliveryStats = partners
    .map((partner) => {
      const partnerDeliveries = deliveries.filter(
        (delivery) => delivery.partner_id === partner.id,
      );
      const sales = salesByPartner.find(([partnerId]) => partnerId === partner.id)?.[1] ?? 0;

      return {
        partner,
        deliveryCount: partnerDeliveries.length,
        sales,
        averageFee:
          partnerDeliveries.length === 0
            ? 0
            : Math.round(sales / partnerDeliveries.length),
      };
    })
    .sort((a, b) => b.deliveryCount - a.deliveryCount)
    .slice(0, 6);
  const actionPlan = [
    {
      title: "未対応案件を減らす",
      value: formatPercent(unhandledRate),
      body:
        unhandledRate >= 25
          ? "初動が遅れると成約率が落ちます。案件ボードで新着対応を優先してください。"
          : "未対応率は抑えられています。今の対応速度を維持しましょう。",
      href: "/admin/board",
      tone:
        unhandledRate >= 25
          ? "border-red-100 bg-red-50 text-red-600"
          : "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      title: "配信漏れをなくす",
      value: formatPercent(deliveryCoverageRate),
      body:
        deliveryCoverageRate < 90
          ? "業者へ配信されていない案件があります。配信待ち案件を確認してください。"
          : "ほとんどの案件が業者へ配信されています。",
      href: "/admin#leads",
      tone:
        deliveryCoverageRate < 90
          ? "border-orange-100 bg-orange-50 text-orange-600"
          : "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      title: "入金回収を確認する",
      value: formatPercent(collectionRate),
      body:
        unbilledTotal > 0
          ? "未請求が残っています。月末前に請求画面で確認してください。"
          : "未請求はありません。請求管理は良い状態です。",
      href: "/admin/billing",
      tone:
        unbilledTotal > 0
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
  ];

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

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/70">
          <p className="text-xs font-black tracking-[0.22em] text-orange-300">
            GROWTH SUMMARY
          </p>
          <h2 className="mt-1 text-2xl font-black">今月の伸びを見る</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["直近月の案件", `${lastMonthCount}件`, `前月比 ${formatPercent(monthTrend)}`],
              ["強いエリア", topArea, "SEO記事・広告を厚くする候補"],
              ["配信カバー率", formatPercent(deliveryCoverageRate), "業者に渡せた案件割合"],
              ["入金回収率", formatPercent(collectionRate), "請求売上に対する入金割合"],
            ].map(([label, value, helper]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              >
                <p className="text-sm font-black text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-orange-500">
                NEXT ACTIONS
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                改善アクション
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-500">
              数字から優先作業を自動で整理
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {actionPlan.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${action.tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">{action.title}</p>
                    <p className="mt-2 text-sm font-bold text-slate-600">
                      {action.body}
                    </p>
                  </div>
                  <p className="shrink-0 text-2xl font-black">{action.value}</p>
                </div>
              </Link>
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

      <section className="mt-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-orange-500">
              PARTNER PERFORMANCE
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              業者別の配信成果
            </h2>
          </div>
          <Link
            href="/admin#partners"
            className="w-fit rounded-md border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 hover:border-orange-400 hover:text-orange-500"
          >
            業者管理へ
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <div className="hidden grid-cols-[1fr_120px_140px_140px_120px] bg-slate-50 px-4 py-3 text-sm font-black text-slate-500 lg:grid">
            <p>業者</p>
            <p>状態</p>
            <p>配信数</p>
            <p>売上</p>
            <p>平均単価</p>
          </div>
          {partnerDeliveryStats.map(({ partner, deliveryCount, sales, averageFee }) => (
            <Link
              key={partner.id}
              href={`/admin/partners/${partner.id}`}
              className="grid gap-3 border-t border-slate-100 px-4 py-4 text-sm font-bold transition hover:bg-orange-50/40 lg:grid-cols-[1fr_120px_140px_140px_120px] lg:items-center"
            >
              <div>
                <p className="font-black text-slate-900">{partner.name}</p>
                <p className="mt-1 text-xs text-slate-400">詳細を見る</p>
              </div>
              <p
                className={`w-fit rounded-md px-3 py-1 text-xs font-black ${
                  partner.status === "active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {partner.status === "active" ? "稼働中" : "停止中"}
              </p>
              <p className="text-slate-700">{deliveryCount}件</p>
              <p className="font-black text-orange-500">
                {formatCurrency(sales)}円
              </p>
              <p className="text-slate-700">{formatCurrency(averageFee)}円</p>
            </Link>
          ))}

          {partnerDeliveryStats.length === 0 ? (
            <p className="border-t border-slate-100 p-5 text-sm font-bold text-slate-500">
              まだ配信データがありません。
            </p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
