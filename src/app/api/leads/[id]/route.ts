import { NextRequest } from "next/server";
import { createSupabaseAdminClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { mapLeadRowToLead, LeadRow } from "@/lib/supabase/leads";
import { Lead } from "@/lib/leads";
import { getCurrentBusinessPartnerId, isBusinessLoggedIn } from "@/lib/business-auth";

const progressValues: Lead["progress"][] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isBusinessLoggedIn())) {
    return Response.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const { id } = await params;
  let updates: Partial<Lead>;
  try {
    updates = await request.json();
  } catch {
    return Response.json({ message: "入力内容を読み取れませんでした。" }, { status: 400 });
  }

  if (!updates || [updates.progress, updates.estimate, updates.memo].some(
    value => value !== undefined && (typeof value !== "string" || value.length > 5000),
  )) {
    return Response.json({ message: "入力内容が不正です。" }, { status: 400 });
  }

  if (updates.progress && !progressValues.includes(updates.progress)) {
    return Response.json({ message: "進捗の値が不正です。" }, { status: 400 });
  }

  if (!hasSupabaseServerEnv()) {
    return Response.json({ message: "現在、更新を利用できません。" }, { status: 503 });
  }

  const supabaseUpdates = {
    progress: updates.progress,
    estimate: updates.estimate,
    memo: updates.memo,
  };

  const supabase = createSupabaseAdminClient();
  const partnerId = await getCurrentBusinessPartnerId();
  if (!partnerId) {
    return Response.json({ message: "ログインが必要です。" }, { status: 401 });
  }
  const { data: delivery, error: deliveryError } = await supabase
    .from("lead_deliveries")
    .select("id")
    .eq("lead_id", id)
    .eq("partner_id", partnerId)
    .single();
  if (deliveryError || !delivery) {
    return Response.json({ message: "対象の案件を確認できません。" }, { status: 404 });
  }
  const { data, error } = await supabase
    .from("leads")
    .update(supabaseUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return Response.json({ message: "案件を更新できませんでした。" }, { status: 500 });
  }

  return Response.json({
    lead: mapLeadRowToLead(data as LeadRow),
    mode: "supabase",
  });
}
