import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
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
  partner_id: string;
  amount: number;
  billing_month: string;
  status: "unbilled" | "invoiced" | "paid" | "void";
  description: string | null;
  created_at: string;
};

type NotificationLog = {
  id: string;
  lead_id: string | null;
  partner_id: string | null;
  channel: "email" | "line" | "sms" | "system";
  status: "queued" | "sent" | "failed" | "skipped";
  title: string;
  body: string;
  error_message: string | null;
  created_at: string;
};

type AdminPageProps = {
  searchParams: Promise<{
    deliveryCreated?: string;
    deliveryError?: string;
    partner?: string;
    partnerCreated?: string;
    partnerUpdated?: string;
    partnerError?: string;
    progress?: string;
    q?: string;
  }>;
};

async function loadAdminData() {
  if (!hasSupabaseServerEnv()) {
    return {
      partners: [] as Partner[],
      leads: [] as Lead[],
      deliveries: [] as Delivery[],
      billingItems: [] as BillingItem[],
      notificationLogs: [] as NotificationLog[],
      error: "Supabaseが未設定です。",
    };
  }

  const supabase = createSupabaseAdminClient();
  const [
    partnersResult,
    leadsResult,
    deliveriesResult,
    billingResult,
    notificationResult,
  ] = await Promise.all([
    supabase.from("partners").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("leads").select("*").order("requested_at", {
      ascending: false,
    }),
    supabase.from("lead_deliveries").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("billing_items").select("*").order("created_at", {
      ascending: false,
    }),
    supabase.from("notification_logs").select("*").order("created_at", {
      ascending: false,
    }),
  ]);

  const error =
    partnersResult.error?.message ||
    leadsResult.error?.message ||
    deliveriesResult.error?.message ||
    billingResult.error?.message ||
    notificationResult.error?.message ||
    "";

  return {
    partners: (partnersResult.data ?? []) as Partner[],
    leads: (leadsResult.data ?? []) as Lead[],
    deliveries: (deliveriesResult.data ?? []) as Delivery[],
    billingItems: (billingResult.data ?? []) as BillingItem[],
    notificationLogs: (notificationResult.data ?? []) as NotificationLog[],
    error,
  };
}

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

function statusLabel(status: BillingItem["status"]) {
  const labels = {
    unbilled: "未請求",
    invoiced: "請求済み",
    paid: "入金済み",
    void: "無効",
  };

  return labels[status];
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const messages = await searchParams;
  const q = messages.q?.trim() ?? "";
  const progressFilter = messages.progress ?? "";
  const partnerFilter = messages.partner ?? "";
  const { partners, leads, deliveries, billingItems, notificationLogs, error } =
    await loadAdminData();
  const activePartners = partners.filter((partner) => partner.status === "active");
  const unhandledLeads = leads.filter((lead) => lead.progress === "未対応");
  const deliveryRate =
    leads.length === 0 ? 0 : Math.round((deliveries.length / leads.length) * 10) / 10;
  const partnerMap = new Map(
    partners.map((partner) => [partner.id, partner.name]),
  );
  const deliveriesByLead = deliveries.reduce<Record<string, Delivery[]>>(
    (grouped, delivery) => {
      grouped[delivery.lead_id] = [...(grouped[delivery.lead_id] ?? []), delivery];
      return grouped;
    },
    {},
  );
  const filteredLeads = leads.filter((lead) => {
    const matchesKeyword = q
      ? [lead.request, lead.name, lead.address, lead.phone, lead.progress]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      : true;
    const matchesProgress = progressFilter ? lead.progress === progressFilter : true;
    const matchesPartner = partnerFilter
      ? (deliveriesByLead[lead.id] ?? []).some(
          (delivery) => delivery.partner_id === partnerFilter,
        )
      : true;

    return matchesKeyword && matchesProgress && matchesPartner;
  });
  const unbilledTotal = billingItems
    .filter((item) => item.status === "unbilled")
    .reduce((total, item) => total + item.amount, 0);
  const latestMonth = billingItems[0]?.billing_month ?? "未作成";
  const billingByPartner = partners
    .map((partner) => {
      const items = billingItems.filter((item) => item.partner_id === partner.id);
      const amount = items
        .filter((item) => item.status !== "void")
        .reduce((total, item) => total + item.amount, 0);

      return {
        partner,
        amount,
        count: items.length,
      };
    })
    .sort((a, b) => b.amount - a.amount);
  const today = new Date().toDateString();
  const todaysLeads = leads.filter(
    (lead) => new Date(lead.requested_at).toDateString() === today,
  );
  const failedNotifications = notificationLogs.filter(
    (log) => log.status === "failed",
  );
  const pausedPartners = partners.filter((partner) => partner.status === "paused");

  return (
    <AdminShell
      active="dashboard"
      title="管理ダッシュボード"
      description="案件、配信、請求、通知を一箇所で確認できます。"
      actions={
        <>
            {[
              ["案件CSV", "leads"],
              ["業者CSV", "partners"],
              ["請求CSV", "billing"],
              ["通知CSV", "notifications"],
            ].map(([label, type]) => (
              <a
                key={type}
                href={`/api/admin/export?type=${type}`}
                className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-orange-400 hover:text-orange-500"
              >
                {label}
              </a>
            ))}
        </>
      }
    >
          {error ? (
            <div className="mb-6 rounded-md bg-amber-50 px-5 py-4 font-bold text-amber-700">
              {error}
            </div>
          ) : null}

          {messages.partnerCreated ? (
            <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
              業者を追加しました。
            </div>
          ) : null}

          {messages.partnerUpdated ? (
            <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
              業者情報を更新しました。
            </div>
          ) : null}

          {messages.partnerError ? (
            <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
              業者情報を保存できませんでした。入力内容を確認してください。
            </div>
          ) : null}

          {messages.deliveryCreated ? (
            <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
              案件を業者へ配信しました。
            </div>
          ) : null}

          {messages.deliveryError ? (
            <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
              案件を配信できませんでした。配信先を確認してください。
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["総案件数", leads.length, "件"],
              ["未対応案件", unhandledLeads.length, "件"],
              ["登録業者", partners.length, "社"],
              ["平均配信社数", deliveryRate, "社"],
              ["未請求合計", formatCurrency(unbilledTotal), "円"],
            ].map(([label, value, unit]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur"
              >
                <p className="text-xs font-black tracking-[0.18em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {value}
                  <span className="ml-1 text-base text-slate-500">{unit}</span>
                </p>
              </div>
            ))}
          </section>

          <section className="mt-7 grid gap-4 lg:grid-cols-3">
            {[
              {
                label: "今日の新規案件",
                value: `${todaysLeads.length}件`,
                tone: "bg-emerald-50 text-emerald-700",
              },
              {
                label: "通知失敗",
                value: `${failedNotifications.length}件`,
                tone: "bg-red-50 text-red-600",
              },
              {
                label: "停止中の業者",
                value: `${pausedPartners.length}社`,
                tone: "bg-slate-100 text-slate-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur"
              >
                <div>
                  <p className="text-sm font-black text-slate-400">
                    運用チェック
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-800">
                    {item.label}
                  </p>
                </div>
                <p className={`rounded-lg px-4 py-3 text-2xl font-black ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-7 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-5">
              <h2 className="text-2xl font-black">業者を追加</h2>
              <p className="mt-1 text-sm font-bold text-slate-400">
                追加した業者は、条件に合う新規案件の自動配信対象になります。
              </p>
            </div>

            <form
              action="/api/admin/partners"
              method="post"
              className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_130px_160px]"
            >
              <label className="block">
                <span className="text-sm font-black text-slate-500">業者名</span>
                <input
                  name="name"
                  required
                  placeholder="例: 広島クリーン回収"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">
                  ログイン用メール
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="partner2@example.com"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">対応エリア</span>
                <input
                  name="service_area"
                  placeholder="広島県・岡山県"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">
                  初期パスワード
                </span>
                <input
                  name="password"
                  type="text"
                  minLength={6}
                  placeholder="password123"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">日上限</span>
                <input
                  name="daily_delivery_limit"
                  type="number"
                  min={0}
                  placeholder="10"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none focus:border-orange-500"
                />
              </label>

              <div className="flex items-end">
                <button className="h-12 w-full rounded-md bg-orange-500 font-black text-white shadow-sm hover:bg-orange-600">
                  追加する
                </button>
              </div>
            </form>
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div id="leads" className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-black">案件一覧</h2>
                  <p className="mt-1 text-sm font-bold text-slate-400">
                    条件に一致: {filteredLeads.length}件
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-500">
                  {leads.length}件
                </span>
              </div>

              <form
                action="/admin"
                className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 lg:grid-cols-[1fr_160px_190px_110px]"
              >
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="名前・電話番号・地域・品目で検索"
                  className="h-11 rounded-md border border-slate-300 px-4 font-bold outline-none focus:border-orange-500"
                />
                <select
                  name="progress"
                  defaultValue={progressFilter}
                  className="h-11 rounded-md border border-slate-300 px-3 font-bold"
                >
                  <option value="">全進捗</option>
                  <option value="未対応">未対応</option>
                  <option value="現地見積">現地見積</option>
                  <option value="商談中">商談中</option>
                  <option value="成約">成約</option>
                  <option value="失注">失注</option>
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
                <button className="h-11 rounded-md bg-slate-900 px-4 font-black text-white hover:bg-orange-500">
                  検索
                </button>
              </form>

              <div className="space-y-3">
                {filteredLeads.slice(0, 20).map((lead) => (
                  <div
                    key={lead.id}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg lg:grid-cols-[110px_1fr_220px]"
                  >
                    <p className="font-black text-slate-400">
                      {formatDate(lead.requested_at)}
                    </p>
                    <div>
                      <p className="font-black text-slate-800">{lead.request}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {lead.name} / {lead.address} / {lead.phone}
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-400">
                        配信済み:{" "}
                        {(deliveriesByLead[lead.id] ?? []).length > 0
                          ? deliveriesByLead[lead.id]
                              .map(
                                (delivery) =>
                                  partnerMap.get(delivery.partner_id) ?? "不明な業者",
                              )
                              .join("、")
                          : "未配信"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">
                        {lead.progress}
                      </p>
                      <form
                        action="/api/admin/deliveries"
                        method="post"
                        className="flex gap-2"
                      >
                        <input type="hidden" name="lead_id" value={lead.id} />
                        <select
                          name="partner_id"
                          required
                          className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm font-bold"
                        >
                          <option value="">配信先</option>
                          {activePartners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name}
                            </option>
                          ))}
                        </select>
                        <button className="h-10 rounded-md bg-orange-500 px-3 text-sm font-black text-white hover:bg-orange-600">
                          配信
                        </button>
                      </form>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="mt-2 block rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-black text-slate-600 hover:border-orange-400 hover:text-orange-500"
                      >
                        詳細を開く
                      </Link>
                    </div>
                  </div>
                ))}

                {filteredLeads.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    条件に一致する案件がありません。
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">通知ログ</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-600">
                  最新 {notificationLogs.length}件
                </span>
              </div>

              <div className="space-y-3">
                {notificationLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-800">{log.title}</p>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {partnerMap.get(log.partner_id ?? "") ?? "全体"} /{" "}
                          {log.channel.toUpperCase()}
                        </p>
                      </div>
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-black ${
                          log.status === "failed"
                            ? "bg-red-50 text-red-600"
                            : log.status === "sent"
                              ? "bg-emerald-50 text-emerald-600"
                              : log.status === "skipped"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      {log.body}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                ))}

                {notificationLogs.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    まだ通知ログはありません。新しい案件が入るとここに記録されます。
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">請求集計</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-600">
                  {latestMonth}
                </span>
              </div>

              <div className="space-y-3">
                {billingByPartner.map(({ partner, amount, count }) => (
                  <Link
                    key={partner.id}
                    href={`/admin/partners/${partner.id}`}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-black text-slate-800">{partner.name}</p>
                      <p className="mt-1 text-sm font-bold text-slate-400">
                        配信 {count}件
                      </p>
                    </div>
                    <p className="text-xl font-black text-orange-500">
                      {formatCurrency(amount)}円
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div id="partners" className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">登録業者</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-600">
                  稼働中 {activePartners.length}社
                </span>
              </div>

              <div className="space-y-4">
                {partners.map((partner) => (
                  <div key={partner.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <Link
                          href={`/admin/partners/${partner.id}`}
                          className="text-lg font-black text-slate-900 hover:text-orange-500"
                        >
                          {partner.name}
                        </Link>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {partner.email}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {partner.service_area}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                          <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-600">
                            日上限 {partner.daily_delivery_limit ?? "なし"}件
                          </span>
                          <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-600">
                            月予算{" "}
                            {partner.monthly_budget_limit
                              ? `${formatCurrency(partner.monthly_budget_limit)}円`
                              : "なし"}
                          </span>
                          <span
                            className={`rounded-md px-3 py-2 ${
                              partner.auto_assign_enabled
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            自動配信{" "}
                            {partner.auto_assign_enabled ? "ON" : "OFF"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 xl:text-right">
                        <span
                          className={`inline-block rounded-md px-3 py-2 text-sm font-black ${
                            partner.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {partner.status === "active" ? "稼働中" : "停止中"}
                        </span>
                        <form
                          action={`/api/admin/partners/${partner.id}/toggle`}
                          method="post"
                          className="mt-3"
                        >
                          <button className="rounded-md border px-3 py-2 text-sm font-black text-slate-600 hover:border-orange-300 hover:text-orange-500">
                            {partner.status === "active" ? "停止する" : "再開する"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <form
                      action={`/api/admin/partners/${partner.id}/settings`}
                      method="post"
                      className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-5"
                    >
                      <label className="block">
                        <span className="text-xs font-black text-slate-500">
                          対応エリア
                        </span>
                        <input
                          name="service_area"
                          defaultValue={partner.service_area}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black text-slate-500">
                          通知メール
                        </span>
                        <input
                          name="notification_email"
                          type="email"
                          defaultValue={partner.notification_email ?? partner.email}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black text-slate-500">
                          日配信上限
                        </span>
                        <input
                          name="daily_delivery_limit"
                          type="number"
                          min={0}
                          defaultValue={partner.daily_delivery_limit ?? ""}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black text-slate-500">
                          月予算上限
                        </span>
                        <input
                          name="monthly_budget_limit"
                          type="number"
                          min={0}
                          defaultValue={partner.monthly_budget_limit ?? ""}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-bold"
                        />
                      </label>
                      <div className="flex items-end gap-3">
                        <label className="flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-slate-600">
                          <input
                            name="auto_assign_enabled"
                            type="checkbox"
                            defaultChecked={Boolean(partner.auto_assign_enabled)}
                          />
                          自動
                        </label>
                        <button className="h-11 flex-1 rounded-md bg-slate-900 px-4 text-sm font-black text-white hover:bg-orange-500">
                          保存
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">請求明細</h2>
              <a
                href="/api/admin/export?type=billing"
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-black text-white"
              >
                請求CSVを出力
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs font-black text-slate-400">
                  <tr>
                    <th className="py-3">月</th>
                    <th>業者</th>
                    <th>内容</th>
                    <th>状態</th>
                    <th className="text-right">金額</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {billingItems.slice(0, 10).map((item) => (
                    <tr key={item.id} className="font-bold text-slate-600">
                      <td className="py-4">{item.billing_month}</td>
                      <td>{partnerMap.get(item.partner_id) ?? "不明な業者"}</td>
                      <td>{item.description ?? "案件配信料"}</td>
                      <td>
                        <form
                          action={`/api/admin/billing/${item.id}`}
                          method="post"
                          className="flex gap-2"
                        >
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
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          現在: {statusLabel(item.status)}
                        </p>
                      </td>
                      <td className="text-right font-black text-orange-500">
                        {formatCurrency(item.amount)}円
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
    </AdminShell>
  );
}
