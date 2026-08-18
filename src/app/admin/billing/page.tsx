import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type Partner = {
  id: string;
  name: string;
  email: string;
};

type Lead = {
  id: string;
  request: string;
  name: string;
  address: string;
  phone: string;
};

type Delivery = {
  id: string;
  lead_id: string;
  partner_id: string;
};

type BillingItem = {
  id: string;
  lead_delivery_id: string;
  partner_id: string;
  amount: number;
  billing_month: string;
  status: "unbilled" | "invoiced" | "paid" | "void";
  description: string | null;
  created_at: string;
};

type AdminBillingPageProps = {
  searchParams: Promise<{
    month?: string;
    partner?: string;
    status?: string;
    billingUpdated?: string;
    billingError?: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

async function loadBillingData() {
  if (!hasSupabaseServerEnv()) {
    return {
      billingItems: [] as BillingItem[],
      deliveries: [] as Delivery[],
      leads: [] as Lead[],
      partners: [] as Partner[],
      error: "Supabaseが未設定です。",
    };
  }

  const supabase = createSupabaseAdminClient();
  const [billingResult, deliveriesResult, leadsResult, partnersResult] =
    await Promise.all([
      supabase.from("billing_items").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("lead_deliveries").select("*"),
      supabase.from("leads").select("*").order("requested_at", {
        ascending: false,
      }),
      supabase.from("partners").select("*").order("created_at", {
        ascending: false,
      }),
    ]);

  const error =
    billingResult.error?.message ||
    deliveriesResult.error?.message ||
    leadsResult.error?.message ||
    partnersResult.error?.message ||
    "";

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    deliveries: (deliveriesResult.data ?? []) as Delivery[],
    leads: (leadsResult.data ?? []) as Lead[],
    partners: (partnersResult.data ?? []) as Partner[],
    error,
  };
}

export default async function AdminBillingPage({
  searchParams,
}: AdminBillingPageProps) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const filters = await searchParams;
  const { billingItems, deliveries, leads, partners, error } =
    await loadBillingData();
  const monthFilter = filters.month ?? "";
  const partnerFilter = filters.partner ?? "";
  const statusFilter = filters.status ?? "";
  const partnerMap = new Map(partners.map((partner) => [partner.id, partner]));
  const deliveryMap = new Map(
    deliveries.map((delivery) => [delivery.id, delivery]),
  );
  const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
  const months = Array.from(
    new Set(billingItems.map((item) => item.billing_month)),
  );
  const filteredBillingItems = billingItems.filter((item) => {
    const matchesMonth = monthFilter ? item.billing_month === monthFilter : true;
    const matchesPartner = partnerFilter ? item.partner_id === partnerFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesMonth && matchesPartner && matchesStatus;
  });
  const totals = {
    unbilled: filteredBillingItems
      .filter((item) => item.status === "unbilled")
      .reduce((sum, item) => sum + item.amount, 0),
    invoiced: filteredBillingItems
      .filter((item) => item.status === "invoiced")
      .reduce((sum, item) => sum + item.amount, 0),
    paid: filteredBillingItems
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + item.amount, 0),
    all: filteredBillingItems
      .filter((item) => item.status !== "void")
      .reduce((sum, item) => sum + item.amount, 0),
  };

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-black text-orange-500">
              ← 管理ダッシュボードに戻る
            </Link>
            <h1 className="mt-3 text-4xl font-black">請求管理</h1>
            <p className="mt-2 font-bold text-slate-400">
              業者ごとの請求・入金状況をまとめて確認します。
            </p>
          </div>
          <a
            href={`/api/admin/export?type=billing${partnerFilter ? `&partner=${partnerFilter}` : ""}`}
            className="w-fit rounded-md bg-orange-500 px-5 py-3 font-black text-white"
          >
            CSV出力
          </a>
        </div>

        {error ? (
          <div className="mb-6 rounded-md bg-amber-50 px-5 py-4 font-bold text-amber-700">
            {error}
          </div>
        ) : null}

        {filters.billingUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            請求状態を更新しました。
          </div>
        ) : null}

        {filters.billingError ? (
          <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
            請求状態を更新できませんでした。
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["対象合計", totals.all, "円"],
            ["未請求", totals.unbilled, "円"],
            ["請求済み", totals.invoiced, "円"],
            ["入金済み", totals.paid, "円"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {formatCurrency(Number(value))}
                <span className="ml-1 text-base text-slate-500">{unit}</span>
              </p>
            </div>
          ))}
        </section>

        <section className="mt-7 rounded-xl bg-white p-6 shadow-sm">
          <form
            action="/admin/billing"
            className="grid gap-3 lg:grid-cols-[170px_220px_170px_110px]"
          >
            <select
              name="month"
              defaultValue={monthFilter}
              className="h-11 rounded-md border border-slate-300 px-3 font-bold"
            >
              <option value="">全月</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              name="partner"
              defaultValue={partnerFilter}
              className="h-11 rounded-md border border-slate-300 px-3 font-bold"
            >
              <option value="">全業者</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-11 rounded-md border border-slate-300 px-3 font-bold"
            >
              <option value="">全状態</option>
              <option value="unbilled">未請求</option>
              <option value="invoiced">請求済み</option>
              <option value="paid">入金済み</option>
              <option value="void">無効</option>
            </select>
            <button className="h-11 rounded-md bg-slate-900 px-4 font-black text-white hover:bg-orange-500">
              絞り込み
            </button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs font-black text-slate-400">
                <tr>
                  <th className="py-3">月</th>
                  <th>業者</th>
                  <th>案件</th>
                  <th>顧客</th>
                  <th>状態</th>
                  <th className="text-right">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBillingItems.map((item) => {
                  const partner = partnerMap.get(item.partner_id);
                  const delivery = deliveryMap.get(item.lead_delivery_id);
                  const lead = delivery ? leadMap.get(delivery.lead_id) : null;

                  return (
                    <tr key={item.id} className="font-bold text-slate-600">
                      <td className="py-4">{item.billing_month}</td>
                      <td>
                        {partner ? (
                          <Link
                            href={`/admin/partners/${partner.id}`}
                            className="font-black text-slate-800 hover:text-orange-500"
                          >
                            {partner.name}
                          </Link>
                        ) : (
                          "不明な業者"
                        )}
                      </td>
                      <td>
                        {lead ? (
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="font-black text-slate-800 hover:text-orange-500"
                          >
                            {lead.request}
                          </Link>
                        ) : (
                          item.description ?? "案件配信料"
                        )}
                      </td>
                      <td>
                        {lead
                          ? `${lead.name} / ${lead.address} / ${lead.phone}`
                          : "-"}
                      </td>
                      <td>
                        <form
                          action={`/api/admin/billing/${item.id}`}
                          method="post"
                          className="flex gap-2"
                        >
                          <input type="hidden" name="return_to" value="/admin/billing" />
                          <select
                            name="status"
                            defaultValue={item.status}
                            className="h-10 rounded-md border border-slate-300 px-2 text-sm font-bold"
                          >
                            <option value="unbilled">未請求</option>
                            <option value="invoiced">請求済み</option>
                            <option value="paid">入金済み</option>
                            <option value="void">無効</option>
                          </select>
                          <button className="rounded-md bg-slate-900 px-3 text-xs font-black text-white">
                            保存
                          </button>
                        </form>
                      </td>
                      <td className="text-right font-black text-orange-500">
                        {formatCurrency(item.amount)}円
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
