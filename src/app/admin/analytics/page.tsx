import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type Lead = {
  id: string;
  requested_at: string;
  address: string;
  progress: string;
};

type Partner = {
  id: string;
  name: string;
};

type BillingItem = {
  partner_id: string;
  amount: number;
  status: "unbilled" | "invoiced" | "paid" | "void";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function monthKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "不明";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
    supabase.from("partners").select("id, name"),
    supabase.from("billing_items").select("*"),
  ]);

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    leads: (leadsResult.data ?? []) as Lead[],
    partners: (partnersResult.data ?? []) as Partner[],
  };
}

export default async function AdminAnalyticsPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const { billingItems, leads, partners } = await loadAnalyticsData();
  const partnerMap = new Map(partners.map((partner) => [partner.id, partner.name]));
  const totalSales = billingItems
    .filter((item) => item.status !== "void")
    .reduce((sum, item) => sum + item.amount, 0);
  const wonCount = leads.filter((lead) => lead.progress === "成約").length;
  const conversionRate =
    leads.length === 0 ? 0 : Math.round((wonCount / leads.length) * 1000) / 10;
  const byMonth = Array.from(
    leads
      .reduce((map, lead) => {
        const key = monthKey(lead.requested_at);
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).slice(0, 8);
  const byArea = Array.from(
    leads
      .reduce((map, lead) => {
        const key = lead.address.slice(0, 4) || "不明";
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const salesByPartner = Array.from(
    billingItems
      .filter((item) => item.status !== "void")
      .reduce((map, item) => {
        map.set(item.partner_id, (map.get(item.partner_id) ?? 0) + item.amount);
        return map;
      }, new Map<string, number>())
      .entries(),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 border-b border-slate-200 pb-6">
          <Link href="/admin" className="text-sm font-black text-orange-500">
            ← 管理ダッシュボードに戻る
          </Link>
          <h1 className="mt-3 text-4xl font-black">分析ダッシュボード</h1>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["総案件数", leads.length, "件"],
            ["成約数", wonCount, "件"],
            ["成約率", conversionRate, "%"],
            ["売上合計", formatCurrency(totalSales), "円"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {value}
                <span className="ml-1 text-base text-slate-500">{unit}</span>
              </p>
            </div>
          ))}
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-black">月別案件数</h2>
            <div className="space-y-3">
              {byMonth.map(([month, count]) => (
                <div key={month}>
                  <div className="flex justify-between text-sm font-black">
                    <span>{month}</span>
                    <span>{count}件</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-orange-500"
                      style={{ width: `${Math.min(100, count * 12)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-black">エリア別案件数</h2>
            <div className="space-y-3">
              {byArea.map(([area, count]) => (
                <div
                  key={area}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <span className="font-black">{area}</span>
                  <span className="font-black text-orange-500">{count}件</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-black">業者別売上</h2>
            <div className="space-y-3">
              {salesByPartner.map(([partnerId, amount]) => (
                <Link
                  key={partnerId}
                  href={`/admin/partners/${partnerId}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:border-orange-300"
                >
                  <span className="font-black">
                    {partnerMap.get(partnerId) ?? "不明な業者"}
                  </span>
                  <span className="font-black text-orange-500">
                    {formatCurrency(amount)}円
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
