import { NextRequest } from "next/server";
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

async function fetchAllLeads() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as LeadRow[]).map(mapLeadRowToLead);
}

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

  if (areas.length === 0 || areas.some((area) => area.includes("全国"))) {
    return true;
  }

  return areas.some((area) => lead.address.includes(area));
}

async function canDeliverToPartner(partner: PartnerRow, feeAmount: number) {
  const supabase = createSupabaseAdminClient();
  const dayStart = getDayStartIso();
  const monthStart = getMonthStartIso();

  const { count: todayCount } = await supabase
    .from("lead_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partner.id)
    .gte("created_at", dayStart);

  if (
    partner.daily_delivery_limit !== null &&
    partner.daily_delivery_limit !== undefined &&
    (todayCount ?? 0) >= partner.daily_delivery_limit
  ) {
    return false;
  }

  const { data: monthlyItems } = await supabase
    .from("billing_items")
    .select("amount")
    .eq("partner_id", partner.id)
    .gte("created_at", monthStart)
    .neq("status", "void");

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

  await supabase.from("billing_items").upsert(
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
    return Response.json({ leads: [], mode: "demo" });
  }

  try {
    let leads: Lead[];

    try {
      leads = await fetchLeadsForCurrentPartner();
    } catch (routingError) {
      console.warn("GET /api/leads routing fallback:", routingError);
      leads = await fetchAllLeads();
    }

    return Response.json({
      leads,
      mode: "supabase",
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);

    return Response.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { lead, photos } = await parseLeadRequest(request);

  if (!lead.name || !lead.phone || !lead.address || !lead.request) {
    return Response.json(
      { message: "必須項目が不足しています。" },
      { status: 400 },
    );
  }

  if (!hasSupabaseServerEnv()) {
    return Response.json({ lead, mode: "demo" }, { status: 201 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const uploadedPhotos = await uploadLeadPhotos(lead.id, photos);
    const duplicateSince = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentSamePhoneCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("phone", lead.phone)
      .gte("created_at", duplicateSince);
    const duplicateWarning = (recentSamePhoneCount ?? 0) > 0;
    const leadToSave = {
      ...lead,
      photoNames:
        uploadedPhotos.photoNames.length > 0
          ? uploadedPhotos.photoNames
          : lead.photoNames,
      photoUrls: uploadedPhotos.photoUrls,
      duplicateWarning,
      memo: duplicateWarning
        ? [lead.memo, "重複注意: 1時間以内に同じ電話番号の送信があります。"]
            .filter(Boolean)
            .join("\n")
        : lead.memo,
    };
    const { data, error } = await supabase
      .from("leads")
      .insert(mapLeadToInsert(leadToSave))
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/leads Supabase error:", error.message);
      return Response.json({ message: error.message }, { status: 500 });
    }

    const savedLead = mapLeadRowToLead(data as LeadRow);

    try {
      await notifyAdmin(savedLead);
      await deliverLeadToActivePartners(savedLead);
    } catch (deliveryError) {
      console.warn("POST /api/leads delivery skipped:", deliveryError);
    }

    return Response.json(
      { lead: savedLead, mode: "supabase" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/leads error:", error);

    return Response.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
