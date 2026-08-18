import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type Partner = {
  id: string;
  name: string;
  email: string;
  service_area: string;
  status: "active" | "paused";
  auto_assign_enabled: boolean | null;
  daily_delivery_limit: number | null;
  monthly_budget_limit: number | null;
  notification_email: string | null;
};

type Lead = {
  id: string;
  requested_at: string;
  request: string;
  name: string;
  address: string;
  phone: string;
  progress: string;
  fee: string;
};

type Delivery = {
  id: string;
  lead_id: string;
  partner_id: string;
  delivery_status: string;
  fee: string;
  created_at: string;
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

type NotificationLog = {
  id: string;
  channel: "email" | "line" | "sms" | "system";
  status: "queued" | "sent" | "failed" | "skipped";
  title: string;
  body: string;
  created_at: string;
};

type AdminPartnerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    partnerUpdated?: string;
    partnerError?: string;
    billingUpdated?: string;
    billingError?: string;
  }>;
};

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

async function loadPartnerDetail(partnerId: string) {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const [partnerResult, deliveriesResult, leadsResult, billingResult, logsResult] =
    await Promise.all([
      supabase.from("partners").select("*").eq("id", partnerId).single(),
      supabase
        .from("lead_deliveries")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("requested_at", {
        ascending: false,
      }),
      supabase
        .from("billing_items")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("notification_logs")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false }),
    ]);

  if (partnerResult.error || !partnerResult.data) {
    return null;
  }

  const deliveries = (deliveriesResult.data ?? []) as Delivery[];
  const deliveryLeadIds = new Set(deliveries.map((delivery) => delivery.lead_id));
  const leads = ((leadsResult.data ?? []) as Lead[]).filter((lead) =>
    deliveryLeadIds.has(lead.id),
  );

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    deliveries,
    leads,
    notificationLogs: (logsResult.data ?? []) as NotificationLog[],
    partner: partnerResult.data as Partner,
  };
}

export default async function AdminPartnerDetailPage({
  params,
  searchParams,
}: AdminPartnerDetailPageProps) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const messages = await searchParams;
  const detail = await loadPartnerDetail(id);

  if (!detail) {
    notFound();
  }

  const { billingItems, deliveries, leads, notificationLogs, partner } = detail;
  const leadMap = new Map(leads.map((lead) => [lead.id, lead]));
  const deliveryMap = new Map(deliveries.map((delivery) => [delivery.id, delivery]));
  const unbilledTotal = billingItems
    .filter((item) => item.status === "unbilled")
    .reduce((total, item) => total + item.amount, 0);
  const paidTotal = billingItems
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + item.amount, 0);
  const wonLeads = leads.filter((lead) => lead.progress === "成約").length;

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-black text-orange-500">
              ← 管理ダッシュボードに戻る
            </Link>
            <h1 className="mt-3 text-4xl font-black">{partner.name}</h1>
            <p className="mt-2 font-bold text-slate-400">
              {partner.email} / {partner.service_area}
            </p>
          </div>
          <a
            href={`/api/admin/export?type=billing&partner=${partner.id}`}
            className="w-fit rounded-md bg-orange-500 px-5 py-3 font-black text-white"
          >
            請求CSV
          </a>
        </div>

        {messages.partnerUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            業者情報を更新しました。
          </div>
        ) : null}

        {messages.partnerError || messages.billingError ? (
          <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
            保存できませんでした。入力内容を確認してください。
          </div>
        ) : null}

        {messages.billingUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            請求状態を更新しました。
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["配信案件", deliveries.length, "件"],
            ["成約", wonLeads, "件"],
            ["未請求", formatCurrency(unbilledTotal), "円"],
            ["入金済み", formatCurrency(paidTotal), "円"],
            ["通知ログ", notificationLogs.length, "件"],
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

        <section className="mt-7 grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black">業者設定</h2>
              <form
                action={`/api/admin/partners/${partner.id}/settings`}
                method="post"
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="return_to"
                  value={`/admin/partners/${partner.id}`}
                />
                <label className="block">
                  <span className="text-sm font-black text-slate-500">
                    対応エリア
                  </span>
                  <input
                    name="service_area"
                    defaultValue={partner.service_area}
                    className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-slate-500">
                    通知メール
                  </span>
                  <input
                    name="notification_email"
                    type="email"
                    defaultValue={partner.notification_email ?? partner.email}
                    className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-slate-500">
                      日配信上限
                    </span>
                    <input
                      name="daily_delivery_limit"
                      type="number"
                      min={0}
                      defaultValue={partner.daily_delivery_limit ?? ""}
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-500">
                      月予算上限
                    </span>
                    <input
                      name="monthly_budget_limit"
                      type="number"
                      min={0}
                      defaultValue={partner.monthly_budget_limit ?? ""}
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-black text-slate-600">
                  <input
                    name="auto_assign_enabled"
                    type="checkbox"
                    defaultChecked={Boolean(partner.auto_assign_enabled)}
                  />
                  自動配信を有効にする
                </label>
                <button className="w-full rounded-md bg-slate-900 px-5 py-3 font-black text-white hover:bg-orange-500">
                  保存する
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black">パスワード再発行</h2>
              <form
                action={`/api/admin/partners/${partner.id}/password`}
                method="post"
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="return_to"
                  value={`/admin/partners/${partner.id}`}
                />
                <label className="block">
                  <span className="text-sm font-black text-slate-500">
                    新しい初期パスワード
                  </span>
                  <input
                    name="password"
                    type="text"
                    minLength={6}
                    placeholder="6文字以上"
                    className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                  />
                </label>
                <button className="w-full rounded-md border border-orange-300 px-5 py-3 font-black text-orange-500 hover:bg-orange-50">
                  パスワードを再発行
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black">通知ログ</h2>
              <div className="space-y-3">
                {notificationLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-lg border p-4">
                    <p className="font-black text-slate-800">{log.title}</p>
                    <p className="mt-1 text-xs font-black text-slate-400">
                      {log.channel.toUpperCase()} / {log.status}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {log.body}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black">配信案件</h2>
              <div className="space-y-3">
                {deliveries.map((delivery) => {
                  const lead = leadMap.get(delivery.lead_id);

                  return (
                    <Link
                      key={delivery.id}
                      href={`/admin/leads/${delivery.lead_id}`}
                      className="grid gap-3 rounded-lg border p-4 hover:border-orange-300 lg:grid-cols-[120px_1fr_100px]"
                    >
                      <p className="font-black text-slate-400">
                        {formatDate(delivery.created_at)}
                      </p>
                      <div>
                        <p className="font-black text-slate-800">
                          {lead?.request ?? "案件情報なし"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {lead?.name ?? ""} / {lead?.address ?? ""} /{" "}
                          {lead?.phone ?? ""}
                        </p>
                      </div>
                      <p className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">
                        {lead?.progress ?? "-"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">請求明細</h2>
                <Link
                  href={`/admin/invoices/${partner.id}`}
                  className="rounded-md border px-4 py-2 text-sm font-black text-slate-600 hover:border-orange-400 hover:text-orange-500"
                >
                  請求書を開く
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs font-black text-slate-400">
                    <tr>
                      <th className="py-3">月</th>
                      <th>案件</th>
                      <th>状態</th>
                      <th className="text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {billingItems.map((item) => {
                      const delivery = deliveryMap.get(item.lead_delivery_id);
                      const lead = delivery ? leadMap.get(delivery.lead_id) : null;

                      return (
                        <tr key={item.id} className="font-bold text-slate-600">
                          <td className="py-4">{item.billing_month}</td>
                          <td>{lead?.request ?? item.description ?? "案件配信料"}</td>
                          <td>
                            <form
                              action={`/api/admin/billing/${item.id}`}
                              method="post"
                              className="flex gap-2"
                            >
                              <input
                                type="hidden"
                                name="return_to"
                                value={`/admin/partners/${partner.id}`}
                              />
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
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
