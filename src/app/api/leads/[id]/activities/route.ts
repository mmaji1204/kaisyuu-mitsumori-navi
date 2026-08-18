import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessPartnerEmail,
  getCurrentBusinessPartnerId,
  isBusinessLoggedIn,
} from "@/lib/business-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";
import { Lead } from "@/lib/leads";

const progressValues: Lead["progress"][] = [
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
  const { data, error } = await supabase
    .from("partners")
    .select("id")
    .eq("email", getBusinessPartnerEmail())
    .single();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isBusinessLoggedIn())) {
    return NextResponse.redirect(new URL("/business/login", request.url), {
      status: 303,
    });
  }

  const { id } = await params;

  if (!hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL(`/business/users/${id}`, request.url), {
      status: 303,
    });
  }

  const partnerId = await resolveCurrentPartnerId();

  if (!partnerId) {
    return NextResponse.redirect(
      new URL(`/business/users/${id}?error=1`, request.url),
      { status: 303 },
    );
  }

  const formData = await request.formData();
  const actionType = formData.get("action_type")?.toString() || "メモ";
  const note = formData.get("note")?.toString().trim() ?? "";
  const nextProgress = formData.get("next_progress")?.toString() as
    | Lead["progress"]
    | "";

  const supabase = createSupabaseAdminClient();
  const { data: delivery } = await supabase
    .from("lead_deliveries")
    .select("id")
    .eq("lead_id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!delivery) {
    return NextResponse.redirect(
      new URL(`/business/users/${id}?error=1`, request.url),
      { status: 303 },
    );
  }

  const { error: insertError } = await supabase.from("lead_activities").insert({
    lead_id: id,
    partner_id: partnerId,
    action_type: actionType,
    note,
  });

  if (insertError) {
    console.error("POST /api/leads/[id]/activities error:", insertError.message);
    return NextResponse.redirect(
      new URL(`/business/users/${id}?error=1`, request.url),
      { status: 303 },
    );
  }

  if (nextProgress && progressValues.includes(nextProgress)) {
    await supabase.from("leads").update({ progress: nextProgress }).eq("id", id);
  }

  return NextResponse.redirect(
    new URL(`/business/users/${id}?activityCreated=1`, request.url),
    { status: 303 },
  );
}
