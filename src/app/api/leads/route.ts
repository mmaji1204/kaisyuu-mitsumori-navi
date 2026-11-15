import { createHash } from "node:crypto";
import { isQuoteIntakeOpen } from "@/lib/intake-status";
import { PRIVACY_VERSION } from "@/lib/consent";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import {
  LeadDeliveryRow,
  LeadRow,
  PartnerRow,
  mapLeadRowToLead,
  mapLeadToInsert,
} from "@/lib/supabase/leads";
import { Lead } from "@/lib/leads";
import { sendEmailNotification } from "@/lib/notifications";
import { uploadLeadPhotos } from "@/lib/supabase/photos";
import {
  getBusinessPartnerEmail,
  getCurrentBusinessPartnerId,
  isBusinessLoggedIn,
} from "@/lib/business-auth";

async function parseLeadRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const leadJson = formData.get("lead")?.toString() ?? "";
    const lead = JSON.parse(leadJson) as Lead;
    const photos = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0);

    return {
      lead,
      photos,
    };
  }

  return {
    lead: (await request.json()) as Lead,
    photos: [] as File[],
  };
}

async function fetchLeadsForCurrentPartner() {
  const supabase = createSupabaseAdminClient();
  const currentPartnerId = await getCurrentBusinessPartnerId();
  const partnerQuery = supabase.from("partners").select("*");
  const { data: partnerData, error: partnerError } = currentPartnerId
    ? await partnerQuery.eq("id", currentPartnerId).single()
    : await partnerQuery.eq("email", getBusinessPartnerEmail()).single();

  if (partnerError) {
    throw new Error(partnerError.message);
  }

  const partner = partnerData as PartnerRow;
  const { data: deliveryData, error: deliveryError } = await supabase
    .from("lead_deliveries")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  if (deliveryError) {
    throw new Error(deliveryError.message);
  }

  const deliveries = (deliveryData ?? []) as LeadDeliveryRow[];

  if (deliveries.length === 0) {
    return [];
  }

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .in(
      "id",
      deliveries.map((delivery) => delivery.lead_id),
    );

  if (leadError) {
    throw new Error(leadError.message);
  }

  const leadMap = new Map(
    ((leadData ?? []) as LeadRow[]).map((lead) => [lead.id, lead]),
  );

  return deliveries.flatMap((delivery) => {
    const lead = leadMap.get(delivery.lead_id);

    if (!lead) {
      return [];
    }

    return [
      {
        ...mapLeadRowToLead(lead),
        status: delivery.delivery_status,
        statusColor: delivery.delivery_status === "課金" ? "green" : "red",
        fee: delivery.fee,
      } satisfies Lead,
    ];
  });
}

function parseFeeAmount(fee: string) {
  return Number(fee.replace(/[^0-9]/g, "")) || 0;
}

function getBillingMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDayStartIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getMonthStartIso() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function normalizeAreas(serviceArea: string) {
  return serviceArea
    .split(/[、,・\s]+/)
    .map((area) => area.trim())
    .filter(Boolean);
}

function matchesServiceArea(partner: PartnerRow, lead: Lead) {
  const areas = normalizeAreas(partner.service_area);

  if (areas.length === 0) return false;
  if (areas.includes("全国")) return true;

  return areas.some((area) => lead.address.includes(area));
}

async function canDeliverToPartner(partner: PartnerRow, feeAmount: number) {
  const supabase = createSupabaseAdminClient();
  const dayStart = getDayStartIso();
  const monthStart = getMonthStartIso();

  const { count: todayCount, error: dailyError } = await supabase
    .from("lead_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partner.id)
    .gte("created_at", dayStart);

  if (dailyError) throw new Error("配信件数を確認できませんでした。");

  if (
    partner.daily_delivery_limit !== null &&
    partner.daily_delivery_limit !== undefined &&
    (todayCount ?? 0) >= partner.daily_delivery_limit
  ) {
    return false;
  }

  const { data: monthlyItems, error: budgetError } = await supabase
    .from("billing_items")
    .select("amount")
    .eq("partner_id", partner.id)
    .gte("created_at", monthStart)
    .neq("status", "void");

  if (budgetError) throw new Error("配信予算を確認できませんでした。");

  const monthlyTotal = ((monthlyItems ?? []) as { amount: number }[]).reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (
    partner.monthly_budget_limit !== null &&
    partner.monthly_budget_limit !== undefined &&
    monthlyTotal + feeAmount > partner.monthly_budget_limit
  ) {
    return false;
  }

  return true;
}

async function writeNotificationLog({
  lead,
  partner,
  status,
  errorMessage = "",
}: {
  lead: Lead;
  partner: PartnerRow;
  status: "queued" | "sent" | "failed" | "skipped";
  errorMessage?: string;
}) {
  const supabase = createSupabaseAdminClient();

  await supabase.from("notification_logs").insert({
    lead_id: lead.id,
    partner_id: partner.id,
    channel: "email",
    status,
    title: `新規案件: ${lead.request}`,
    body: `${lead.name}様 / ${lead.address} / ${lead.phone}`,
    error_message: errorMessage,
  });
}

async function notifyPartner(lead: Lead, partner: PartnerRow) {
  const body = [
    `${lead.name}様から新規案件が入りました。`,
    `品目: ${lead.request}`,
    `住所: ${lead.address}`,
    `電話番号: ${lead.phone}`,
    lead.desiredDate ? `希望日時: ${lead.desiredDate}` : "",
    lead.message ? `相談内容: ${lead.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const result = await sendEmailNotification({
    body,
    subject: `新規案件: ${lead.request}`,
    to: partner.notification_email || partner.email,
  });

  await writeNotificationLog({
    lead,
    partner,
    status: result.sent ? "sent" : result.skipped ? "queued" : "failed",
    errorMessage: result.error,
  });
}

async function notifyAdmin(lead: Lead) {
  const supabase = createSupabaseAdminClient();
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_LOGIN_EMAIL || "";
  const body = [
    "新規案件が入りました。",
    `品目: ${lead.request}`,
    `お名前: ${lead.name}`,
    `住所: ${lead.address}`,
    `電話番号: ${lead.phone}`,
    lead.desiredDate ? `希望日時: ${lead.desiredDate}` : "",
    lead.duplicateWarning ? "重複注意: 同じ電話番号の送信があります。" : "",
  ]
    .filter(Boolean)
    .join("\n");
  const result = await sendEmailNotification({
    body,
    subject: `管理者通知: ${lead.request}`,
    to,
  });

  await supabase.from("notification_logs").insert({
    lead_id: lead.id,
    channel: "email",
    status: result.sent ? "sent" : result.skipped ? "queued" : "failed",
    title: "管理者向け新規案件通知",
    body,
    error_message: result.error,
  });
}

async function createBillingItem({
  deliveryId,
  partnerId,
  fee,
}: {
  deliveryId: string;
  partnerId: string;
  fee: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("billing_items").upsert(
    {
      lead_delivery_id: deliveryId,
      partner_id: partnerId,
      amount: parseFeeAmount(fee),
      billing_month: getBillingMonth(),
      description: "案件配信料",
    },
    {
      onConflict: "lead_delivery_id",
      ignoreDuplicates: true,
    },
  );
  if (error) throw new Error("配信料の記録を確認できませんでした。");
}

async function deliverLeadToActivePartners(lead: Lead) {
  const supabase = createSupabaseAdminClient();
  const { data: partnerData, error: partnerError } = await supabase
    .from("partners")
    .select("*")
    .eq("status", "active")
    .eq("auto_assign_enabled", true);

  if (partnerError) {
    throw new Error(partnerError.message);
  }

  const partners = ((partnerData ?? []) as PartnerRow[]).filter((partner) =>
    matchesServiceArea(partner, lead),
  );

  if (partners.length === 0) {
    return;
  }

  for (const partner of partners) {
    const fee = lead.fee || "900 円";
    const deliverable = await canDeliverToPartner(partner, parseFeeAmount(fee));

    if (!deliverable) {
      await writeNotificationLog({
        lead,
        partner,
        status: "skipped",
        errorMessage: "配信上限に達しているため自動配信をスキップしました。",
      });
      continue;
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from("lead_deliveries")
      .insert({
        lead_id: lead.id,
        partner_id: partner.id,
        delivery_status: "課金",
        fee,
      })
      .select("id")
      .single();

    if (deliveryError) {
      await writeNotificationLog({
        lead,
        partner,
        status: "failed",
        errorMessage: deliveryError.message,
      });
      continue;
    }

    await createBillingItem({
      deliveryId: delivery.id as string,
      partnerId: partner.id,
      fee,
    });
    await notifyPartner(lead, partner);
  }
}

export async function GET() {
  if (!(await isBusinessLoggedIn())) {
    return Response.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  if (!hasSupabaseServerEnv()) {
    return Response.json({ message: "現在、案件を取得できません。" }, { status: 503 });
  }

  try {
    const leads = await fetchLeadsForCurrentPartner();

    return Response.json({
      leads,
      mode: "supabase",
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);

    return Response.json(
      { message: "案件を取得できませんでした。" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isQuoteIntakeOpen()) {
    return Response.json({ message: "現在、見積もりの受付は準備中です。" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let parsed: Awaited<ReturnType<typeof parseLeadRequest>>;
  try {
    parsed = await parseLeadRequest(request);
  } catch {
    return Response.json({ message: "入力内容を読み取れませんでした。" }, { status: 400 });
  }
  const { lead: submittedLead, photos } = parsed;

  if (photos.length > 5 || photos.some(photo => photo.size > 8 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(photo.type))) {
    return Response.json({ message: "写真は対応形式・1枚8MB以下で、5枚まで送信できます。" }, { status: 400 });
  }

  if (!submittedLead || [submittedLead.name, submittedLead.phone, submittedLead.address, submittedLead.request]
    .some(value => typeof value !== "string" || !value.trim() || value.length > 1000)) {
    return Response.json(
      { message: "必須項目が不足しています。" },
      { status: 400 },
    );
  }

  if (!hasSupabaseServerEnv()) {
    return Response.json({ message: "現在、見積もりの受付を利用できません。" }, { status: 503 });
  }

  const consent = submittedLead as Lead & { privacyAgreed?: unknown; privacyVersion?: unknown };
  if (consent.privacyAgreed !== true || consent.privacyVersion !== PRIVACY_VERSION) {
    return Response.json({ message: "個人情報の取り扱いをご確認のうえ、同意してください。" }, { status: 400 });
  }

  const requestKey = (submittedLead as Lead & { requestKey?: unknown }).requestKey;
  if (typeof requestKey !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) {
    return Response.json({ message: "ページを再読み込みしてお試しください。" }, { status: 400 });
  }
  const digest = createHash("sha256").update(`quote-intake-v1:${requestKey.toLowerCase()}`).digest("hex");
  const receiptId = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
  const receipt = () => Response.json({ receiptId, mode: "supabase", status: "received" },
    { status: 201, headers: { "Cache-Control": "no-store" } });

  // Public requests cannot set delivery fees, internal status, IDs or stored URLs.
  const lead: Lead = {
    id: receiptId, date: new Date().toISOString(),
    status: "課金", statusColor: "green", progress: "未対応", fee: "900 円",
    name: submittedLead.name.trim(), phone: submittedLead.phone.trim(),
    address: submittedLead.address.trim(), request: submittedLead.request.trim(),
    kana: "", estimate: "", memo: "",
    message: typeof submittedLead.message === "string" ? submittedLead.message.slice(0, 5000) : "",
    desiredDate: typeof submittedLead.desiredDate === "string" ? submittedLead.desiredDate.slice(0, 200) : "",
    photoNames: [], photoUrls: [], afterPhotoNames: [], afterPhotoUrls: [],
  };

  try {
    const supabase = createSupabaseAdminClient();

    const duplicateSince = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentSamePhoneCount, error: duplicateCheckError } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("phone", lead.phone)
      .gte("created_at", duplicateSince);
    if (duplicateCheckError) throw new Error("重複確認ができませんでした。");
    const duplicateWarning = (recentSamePhoneCount ?? 0) > 0;
    const leadToSave = {
      ...lead,
      duplicateWarning,
      memo: ["【配信要確認】受付を保存。配信・通知の完了を管理画面で確認してください。", duplicateWarning ? "重複注意: 1時間以内に同じ電話番号の送信があります。" : ""].filter(Boolean).join("\n"),
    };
    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...mapLeadToInsert(leadToSave),
        consent_version: PRIVACY_VERSION,
        consented_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error?.code === "23505") return receipt();
    if (error) {
      console.error("POST /api/leads Supabase error:", error.message);
      return Response.json({ message: "見積もりの受付に失敗しました。" }, { status: 500 });
    }

    let savedLead = mapLeadRowToLead(data as LeadRow);
    // After reservation, always acknowledge storage. Retrying must not distribute twice.
    // The durable memo remains for operator reconciliation, including interrupted runs.
    try {
      const uploadedPhotos = await uploadLeadPhotos(lead.id, photos);
      if (photos.length) {
        const { error: photoError } = await supabase.from("leads").update({
          photo_names: uploadedPhotos.photoNames, photo_urls: uploadedPhotos.photoUrls,
        }).eq("id", lead.id);
        if (photoError) throw new Error("写真の保存結果を確認できませんでした。");
        savedLead = { ...savedLead, ...uploadedPhotos };
      }
      // A recent repeat with a new key requires manual review, never automatic rebilling.
      if (!duplicateWarning) await deliverLeadToActivePartners(savedLead);
    } catch (deliveryError) {
      console.warn("POST /api/leads requires operator review:", deliveryError);
    }
    try {
      await notifyAdmin(savedLead);
    } catch (notificationError) {
      console.warn("POST /api/leads admin notification requires review:", notificationError);
    }
    return receipt();
  } catch (error) {
    console.error("POST /api/leads error:", error);

    return Response.json(
      { message: "見積もりの受付に失敗しました。" },
      { status: 500 },
    );
  }
}
