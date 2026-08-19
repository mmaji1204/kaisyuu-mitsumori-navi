import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { PhotoGallery } from "@/components/PhotoGallery";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { Lead } from "@/lib/leads";
import {
  LeadActivityRow,
  LeadDeliveryRow,
  LeadRow,
  mapLeadRowToLead,
} from "@/lib/supabase/leads";
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
  partner_id: string | null;
  channel: "email" | "line" | "sms" | "system";
  status: "queued" | "sent" | "failed" | "skipped";
  title: string;
  body: string;
  error_message: string | null;
  created_at: string;
};

type AdminLeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    updated?: string;
    error?: string;
    billingUpdated?: string;
    billingError?: string;
    deliveryCreated?: string;
    deliveryError?: string;
    photosUpdated?: string;
  }>;
};

type LeadDetailData = {
  activities: LeadActivityRow[];
  activePartners: Partner[];
  billingItems: BillingItem[];
  deliveries: LeadDeliveryRow[];
  lead: Lead;
  notificationLogs: NotificationLog[];
  partners: Partner[];
};

const progressOptions: Lead["progress"][] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function billingStatusLabel(status: BillingItem["status"]) {
  const labels = {
    unbilled: "未請求",
    invoiced: "請求済み",
    paid: "入金済み",
    void: "無効",
  };

  return labels[status];
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-slate-700">
        {value || "未入力"}
      </p>
    </div>
  );
}

function progressTone(progress: Lead["progress"]) {
  const tones = {
    未対応: "bg-orange-50 text-orange-600 ring-orange-100",
    現地見積: "bg-blue-50 text-blue-600 ring-blue-100",
    商談中: "bg-violet-50 text-violet-600 ring-violet-100",
    成約: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    失注: "bg-slate-100 text-slate-500 ring-slate-200",
  };

  return tones[progress];
}

function nextActionLabel(progress: Lead["progress"]) {
  const labels = {
    未対応: "電話確認と配信判断",
    現地見積: "訪問日程と概算確認",
    商談中: "追客して成約確認",
    成約: "請求状態と作業写真確認",
    失注: "失注理由をメモへ記録",
  };

  return labels[progress];
}

function feeLabel(fee: string) {
  if (!fee) {
    return "未設定";
  }

  return fee.includes("円") ? fee : `${fee}円`;
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

async function loadLeadDetail(leadId: string): Promise<LeadDetailData | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const [
    leadResult,
    partnersResult,
    deliveriesResult,
    activitiesResult,
    billingResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", leadId).single(),
    supabase.from("partners").select("*").order("created_at", {
      ascending: false,
    }),
    supabase
      .from("lead_deliveries")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_items")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("notification_logs")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
  ]);

  if (leadResult.error || !leadResult.data) {
    return null;
  }

  const partners = (partnersResult.data ?? []) as Partner[];
  const deliveries = (deliveriesResult.data ?? []) as LeadDeliveryRow[];
  const deliveryIds = new Set(deliveries.map((delivery) => delivery.id));

  return {
    activities: (activitiesResult.data ?? []) as LeadActivityRow[],
    activePartners: partners.filter((partner) => partner.status === "active"),
    billingItems: ((billingResult.data ?? []) as BillingItem[]).filter((item) =>
      deliveryIds.has(item.lead_delivery_id),
    ),
    deliveries,
    lead: mapLeadRowToLead(leadResult.data as LeadRow),
    notificationLogs: (notificationsResult.data ?? []) as NotificationLog[],
    partners,
  };
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: AdminLeadDetailPageProps) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const messages = await searchParams;
  const detail = await loadLeadDetail(id);

  if (!detail) {
    notFound();
  }

  const {
    activities,
    activePartners,
    billingItems,
    deliveries,
    lead,
    notificationLogs,
    partners,
  } = detail;
  const partnerMap = new Map(partners.map((partner) => [partner.id, partner]));
  const billingByDelivery = new Map(
    billingItems.map((item) => [item.lead_delivery_id, item]),
  );
  const beforePhotoCount = lead.photoUrls?.length ?? 0;
  const afterPhotoCount = lead.afterPhotoUrls?.length ?? 0;
  const unbilledTotal = billingItems
    .filter((item) => item.status === "unbilled")
    .reduce((total, item) => total + item.amount, 0);

  return (
    <AdminShell
      active="leads"
      title="案件詳細"
      description={`受付日時: ${lead.date}`}
      actions={
        <>
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm hover:border-orange-300 hover:text-orange-500"
            >
              戻る
            </Link>
            <a
              href={phoneHref(lead.phone)}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25"
            >
              電話する
            </a>
        </>
      }
    >

        {messages.updated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            案件情報を更新しました。
          </div>
        ) : null}

        {messages.billingUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            請求状態を更新しました。
          </div>
        ) : null}

        {messages.deliveryCreated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            案件を追加配信しました。
          </div>
        ) : null}

        {messages.photosUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            写真を更新しました。
          </div>
        ) : null}

        {messages.error || messages.billingError || messages.deliveryError ? (
          <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
            保存できませんでした。入力内容を確認してください。
          </div>
        ) : null}

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/70 bg-slate-950 shadow-2xl shadow-slate-300/60">
          <div className="grid gap-0 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 p-6 text-white lg:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-black ring-1 ${progressTone(
                    lead.progress,
                  )}`}
                >
                  {lead.progress}
                </span>
                {lead.duplicateWarning ? (
                  <span className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-black text-red-200 ring-1 ring-red-400/30">
                    重複注意
                  </span>
                ) : null}
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-slate-300 ring-1 ring-white/10">
                  受付 {lead.date}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight lg:text-5xl">
                {lead.request}
              </h2>
              <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-slate-300">
                次の対応:{" "}
                <span className="text-orange-300">
                  {nextActionLabel(lead.progress)}
                </span>
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["お客様", lead.name || "未入力"],
                  ["電話番号", lead.phone || "未入力"],
                  ["対応地域", lead.address || "未入力"],
                  ["希望日時", lead.desiredDate || "未入力"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs font-black tracking-[0.16em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 truncate text-lg font-black text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] p-6 2xl:border-l 2xl:border-t-0">
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                {[
                  ["配信先", `${deliveries.length}社`, "業者へ送信済み"],
                  ["配信単価", feeLabel(lead.fee), "この案件の課金単価"],
                  ["写真", `前${beforePhotoCount} / 後${afterPhotoCount}`, "作業証跡"],
                  ["未請求", `${formatCurrency(unbilledTotal)}円`, "請求回収待ち"],
                ].map(([label, value, helper]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white"
                  >
                    <p className="text-xs font-black tracking-[0.16em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-orange-300">
                      {value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {helper}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-black ring-1 ${progressTone(
                    lead.progress,
                  )}`}
                >
                  {lead.progress}
                </span>
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-orange-500">
                  配信金額 {feeLabel(lead.fee)}
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-600">
                  配信先 {deliveries.length}社
                </span>
              </div>

              <h2 className="text-3xl font-black text-slate-800">
                {lead.request}
              </h2>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-base font-bold leading-8 text-slate-600">
                {lead.message || "相談内容は未入力です。"}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="お名前" value={lead.name} />
                <InfoItem label="ふりがな" value={lead.kana} />
                <InfoItem label="電話番号" value={lead.phone} />
                <InfoItem label="住所" value={lead.address} />
                <InfoItem label="希望日時" value={lead.desiredDate ?? ""} />
                <InfoItem
                  label="写真"
                  value={
                    lead.photoNames && lead.photoNames.length > 0
                      ? lead.photoNames.join("、")
                      : ""
                  }
                />
              </div>

              {lead.duplicateWarning ? (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 font-black text-red-600">
                  重複注意: 1時間以内に同じ電話番号から送信されています。
                </div>
              ) : null}

              <div className="mt-6 grid min-w-0 gap-4 2xl:grid-cols-2">
                <PhotoGallery
                  canDelete
                  canUpload
                  deleteAction={`/api/admin/leads/${id}/photos`}
                  photoKind="before"
                  title="回収前写真"
                  uploadAction={`/api/admin/leads/${id}/photos`}
                  urls={lead.photoUrls ?? []}
                />
                <PhotoGallery
                  canDelete
                  canUpload
                  deleteAction={`/api/admin/leads/${id}/photos`}
                  emptyText="作業後写真はまだありません。"
                  photoKind="after"
                  title="作業後写真"
                  uploadAction={`/api/admin/leads/${id}/photos`}
                  urls={lead.afterPhotoUrls ?? []}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <h2 className="mb-5 text-2xl font-black text-slate-800">
                管理メモ・進捗
              </h2>
              <form
                action={`/api/admin/leads/${id}`}
                method="post"
                className="grid gap-4"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-black text-slate-500">進捗</span>
                    <select
                      name="progress"
                      defaultValue={lead.progress}
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 px-3 font-bold"
                    >
                      {progressOptions.map((progress) => (
                        <option key={progress} value={progress}>
                          {progress}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-500">
                      見積金額
                    </span>
                    <input
                      name="estimate"
                      defaultValue={lead.estimate}
                      placeholder="例: 50000"
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-500">
                      配信金額
                    </span>
                    <input
                      name="fee"
                      defaultValue={lead.fee}
                      placeholder="例: 900円"
                      className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-black text-slate-500">
                    管理者メモ
                  </span>
                  <textarea
                    name="memo"
                    defaultValue={lead.memo}
                    rows={5}
                    placeholder="電話内容、注意事項、希望日時など"
                    className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-bold"
                  />
                </label>
                <button className="w-fit rounded-md bg-slate-900 px-6 py-3 font-black text-white hover:bg-orange-500">
                  案件情報を保存
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800">配信管理</h2>
                <form
                  action="/api/admin/deliveries"
                  method="post"
                  className="flex gap-2"
                >
                  <input type="hidden" name="lead_id" value={id} />
                  <input type="hidden" name="return_to" value={`/admin/leads/${id}`} />
                  <select
                    name="partner_id"
                    required
                    className="h-11 rounded-md border border-slate-300 px-3 text-sm font-bold"
                  >
                    <option value="">追加配信先</option>
                    {activePartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-md bg-orange-500 px-4 text-sm font-black text-white">
                    配信
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                {deliveries.map((delivery) => {
                  const partner = partnerMap.get(delivery.partner_id);
                  const billing = billingByDelivery.get(delivery.id);

                  return (
                    <div
                      key={delivery.id}
                      className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_170px_220px]"
                    >
                      <div>
                        <p className="text-lg font-black text-slate-800">
                          {partner?.name ?? "不明な業者"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {partner?.email ?? "メール不明"} /{" "}
                          {partner?.service_area ?? "エリア不明"}
                        </p>
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          配信日時: {formatDate(delivery.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400">配信状態</p>
                        <p
                          className={`mt-2 w-fit rounded-md px-3 py-2 text-sm font-black ${
                            delivery.delivery_status === "課金"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {delivery.delivery_status}
                        </p>
                      </div>
                      <div>
                        {billing ? (
                          <form
                            action={`/api/admin/billing/${billing.id}`}
                            method="post"
                            className="flex gap-2"
                          >
                            <input type="hidden" name="lead_id" value={id} />
                            <select
                              name="status"
                              defaultValue={billing.status}
                              className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm font-bold"
                            >
                              <option value="unbilled">未請求</option>
                              <option value="invoiced">請求済み</option>
                              <option value="paid">入金済み</option>
                              <option value="void">無効</option>
                            </select>
                            <button className="rounded-md bg-slate-900 px-3 text-sm font-black text-white">
                              保存
                            </button>
                          </form>
                        ) : (
                          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm font-bold text-slate-500">
                            請求明細なし
                          </p>
                        )}
                        <p className="mt-2 text-sm font-black text-orange-500">
                          {billing
                            ? `${billingStatusLabel(billing.status)} / ${formatCurrency(
                                billing.amount,
                              )}円`
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {deliveries.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    まだ配信先がありません。
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-6">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <h2 className="mb-5 text-2xl font-black text-slate-800">
                対応履歴
              </h2>
              <div className="space-y-3">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="rounded-lg border p-4">
                    <p className="font-black text-slate-800">
                      {activity.action_type}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-slate-500">
                      {activity.note || "メモなし"}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                ))}

                {activities.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    業者側の対応履歴はまだありません。
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
              <h2 className="mb-5 text-2xl font-black text-slate-800">
                通知ログ
              </h2>
              <div className="space-y-3">
                {notificationLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-800">{log.title}</p>
                        <p className="mt-1 text-xs font-black text-slate-400">
                          {partnerMap.get(log.partner_id ?? "")?.name ?? "全体"} /{" "}
                          {log.channel.toUpperCase()}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {log.body}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                ))}

                {notificationLogs.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    この案件の通知ログはまだありません。
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </section>
    </AdminShell>
  );
}
