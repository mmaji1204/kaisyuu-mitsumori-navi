import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PhotoGallery } from "@/components/PhotoGallery";
import {
  getBusinessPartnerEmail,
  getCurrentBusinessPartnerId,
  isBusinessLoggedIn,
} from "@/lib/business-auth";
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

type BusinessLeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    activityCreated?: string;
    error?: string;
    photosUpdated?: string;
  }>;
};

type LeadDetailData = {
  activities: LeadActivityRow[];
  delivery: LeadDeliveryRow;
  lead: Lead;
  partnerName: string;
};

const progressOptions: Lead["progress"][] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

async function resolveCurrentPartnerId() {
  const currentPartnerId = await getCurrentBusinessPartnerId();

  if (currentPartnerId) {
    return currentPartnerId;
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("email", getBusinessPartnerEmail())
    .single();

  return (data?.id as string | undefined) ?? null;
}

async function loadLeadDetail(leadId: string): Promise<LeadDetailData | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const partnerId = await resolveCurrentPartnerId();

  if (!partnerId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: deliveryData } = await supabase
    .from("lead_deliveries")
    .select("*")
    .eq("lead_id", leadId)
    .eq("partner_id", partnerId)
    .single();

  if (!deliveryData) {
    return null;
  }

  const [leadResult, activitiesResult, partnerResult] = await Promise.all([
    supabase.from("leads").select("*").eq("id", leadId).single(),
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false }),
    supabase.from("partners").select("name").eq("id", partnerId).single(),
  ]);

  if (leadResult.error || !leadResult.data) {
    return null;
  }

  return {
    activities: (activitiesResult.data ?? []) as LeadActivityRow[],
    delivery: deliveryData as LeadDeliveryRow,
    lead: mapLeadRowToLead(leadResult.data as LeadRow),
    partnerName: (partnerResult.data?.name as string | undefined) ?? "業者",
  };
}

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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="text-sm font-black text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-700">{value || "未入力"}</p>
    </div>
  );
}

export default async function BusinessLeadDetailPage({
  params,
  searchParams,
}: BusinessLeadDetailPageProps) {
  if (!(await isBusinessLoggedIn())) {
    redirect("/business/login");
  }

  const { id } = await params;
  const messages = await searchParams;
  const detail = await loadLeadDetail(id);

  if (!detail) {
    notFound();
  }

  const { activities, delivery, lead, partnerName } = detail;

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-700">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/business/users"
              className="text-sm font-black text-orange-500"
            >
              ← 案件一覧に戻る
            </Link>
            <h1 className="mt-3 text-4xl font-black text-slate-800">
              案件詳細
            </h1>
            <p className="mt-2 font-bold text-slate-400">
              {partnerName} に配信された案件です
            </p>
          </div>
          <form action="/api/business/logout" method="post">
            <button className="rounded-md border bg-white px-4 py-3 font-black text-slate-500 shadow-sm hover:text-orange-500">
              ログアウト
            </button>
          </form>
        </div>

        {messages.activityCreated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            対応履歴を追加しました。
          </div>
        ) : null}

        {messages.photosUpdated ? (
          <div className="mb-6 rounded-md bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
            写真を更新しました。
          </div>
        ) : null}

        {messages.error ? (
          <div className="mb-6 rounded-md bg-red-50 px-5 py-4 font-bold text-red-600">
            保存できませんでした。入力内容を確認してください。
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-md px-4 py-2 text-sm font-black ${
                    delivery.delivery_status === "課金"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {delivery.delivery_status}
                </span>
                <span className="rounded-md bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">
                  {lead.progress}
                </span>
                <span className="rounded-md bg-orange-50 px-4 py-2 text-sm font-black text-orange-500">
                  配信金額 {delivery.fee}
                </span>
              </div>

              <h2 className="text-3xl font-black text-slate-800">
                {lead.request}
              </h2>
              <p className="mt-3 text-sm font-bold text-slate-400">
                配信日時: {lead.date}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="お名前" value={lead.name} />
                <InfoItem label="フリガナ" value={lead.kana} />
                <InfoItem label="電話番号" value={lead.phone} />
                <InfoItem label="住所" value={lead.address} />
                <InfoItem label="希望日時" value={lead.desiredDate ?? ""} />
                <InfoItem label="見積金額" value={lead.estimate} />
                <InfoItem label="メモ" value={lead.memo} />
              </div>

              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-400">相談内容</p>
                <p className="mt-2 whitespace-pre-wrap text-lg font-bold leading-8 text-slate-700">
                  {lead.message || "未入力"}
                </p>
              </div>

              <div className="mt-4 grid min-w-0 gap-4 2xl:grid-cols-2">
                <PhotoGallery
                  photoKind="before"
                  title="回収前写真"
                  urls={lead.photoUrls ?? []}
                />
                <PhotoGallery
                  canDelete
                  canUpload
                  deleteAction={`/api/business/leads/${lead.id}/photos`}
                  emptyText="作業後写真はまだありません。"
                  photoKind="after"
                  title="作業後写真"
                  uploadAction={`/api/business/leads/${lead.id}/photos`}
                  urls={lead.afterPhotoUrls ?? []}
                />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800">対応履歴</h2>
              <div className="mt-5 space-y-3">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="rounded-md bg-blue-50 px-3 py-2 text-sm font-black text-blue-600">
                          {activity.action_type}
                        </p>
                        <p className="text-sm font-bold text-slate-400">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap font-bold leading-7 text-slate-600">
                        {activity.note || "メモなし"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-slate-50 p-5 font-bold text-slate-400">
                    まだ対応履歴はありません。
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-800">対応を記録</h2>
            <form
              action={`/api/leads/${lead.id}/activities`}
              method="post"
              className="mt-5 space-y-4"
            >
              <label className="block">
                <span className="text-sm font-black text-slate-500">対応内容</span>
                <select
                  name="action_type"
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                >
                  <option>電話した</option>
                  <option>不在・折り返し待ち</option>
                  <option>現地見積を予約</option>
                  <option>見積金額を提示</option>
                  <option>成約</option>
                  <option>失注</option>
                  <option>メモ</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">
                  進捗も更新する
                </span>
                <select
                  name="next_progress"
                  defaultValue=""
                  className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-bold"
                >
                  <option value="">変更しない</option>
                  {progressOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-500">メモ</span>
                <textarea
                  name="note"
                  rows={6}
                  placeholder="例: 10時に電話。不在のためSMS送信。"
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-bold leading-7"
                />
              </label>

              <button className="h-12 w-full rounded-md bg-orange-500 font-black text-white shadow-sm hover:bg-orange-600">
                履歴を追加する
              </button>
            </form>
          </aside>
        </section>
      </section>
    </main>
  );
}
