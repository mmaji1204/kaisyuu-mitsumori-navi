import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();
  const leadId = formData.get("lead_id")?.toString() ?? "";
  const partnerId = formData.get("partner_id")?.toString() ?? "";
  const returnTo = formData.get("return_to")?.toString() || "/admin";
  const successUrl = `${returnTo}?deliveryCreated=1`;
  const errorUrl = `${returnTo}?deliveryError=1`;

  if (!leadId || !partnerId || !hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL(errorUrl, request.url), {
      status: 303,
    });
  }

  const supabase = createSupabaseAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("status, fee")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    console.error("POST /api/admin/deliveries lead error:", leadError?.message);
    return NextResponse.redirect(new URL(errorUrl, request.url), {
      status: 303,
    });
  }

  const { data: delivery, error } = await supabase.from("lead_deliveries").upsert(
    {
      lead_id: leadId,
      partner_id: partnerId,
      delivery_status: lead.status,
      fee: lead.fee,
    },
    {
      onConflict: "lead_id,partner_id",
      ignoreDuplicates: true,
    },
  ).select("id").single();

  if (error) {
    console.error("POST /api/admin/deliveries error:", error.message);
    return NextResponse.redirect(new URL(errorUrl, request.url), {
      status: 303,
    });
  }

  if (delivery?.id) {
    const amount = Number(String(lead.fee).replace(/[^0-9]/g, "")) || 0;
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await supabase.from("billing_items").upsert(
      {
        lead_delivery_id: delivery.id,
        partner_id: partnerId,
        amount,
        billing_month: billingMonth,
        description: "案件配信料",
      },
      {
        onConflict: "lead_delivery_id",
        ignoreDuplicates: true,
      },
    );

    await supabase.from("notification_logs").insert({
      lead_id: leadId,
      partner_id: partnerId,
      channel: "system",
      status: "queued",
      title: "管理者が案件を手動配信しました",
      body: "業者画面で案件を確認できます。",
    });
  }

  return NextResponse.redirect(new URL(successUrl, request.url), {
    status: 303,
  });
}
