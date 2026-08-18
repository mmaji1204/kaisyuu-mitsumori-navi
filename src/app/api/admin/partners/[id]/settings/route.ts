import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  if (!text) {
    return null;
  }

  const numberValue = Number(text);

  return Number.isNaN(numberValue) ? undefined : numberValue;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  const { id } = await params;
  const formData = await request.formData();
  const returnTo = formData.get("return_to")?.toString() || "/admin";
  const serviceArea =
    formData.get("service_area")?.toString().trim() || "全国対応";
  const notificationEmail =
    formData.get("notification_email")?.toString().trim() || null;
  const dailyDeliveryLimit = parseOptionalNumber(
    formData.get("daily_delivery_limit"),
  );
  const monthlyBudgetLimit = parseOptionalNumber(
    formData.get("monthly_budget_limit"),
  );
  const autoAssignEnabled = formData.get("auto_assign_enabled") === "on";

  if (dailyDeliveryLimit === undefined || monthlyBudgetLimit === undefined) {
    return NextResponse.redirect(new URL(`${returnTo}?partnerError=1`, request.url), {
      status: 303,
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("partners")
    .update({
      service_area: serviceArea,
      notification_email: notificationEmail,
      daily_delivery_limit: dailyDeliveryLimit,
      monthly_budget_limit: monthlyBudgetLimit,
      auto_assign_enabled: autoAssignEnabled,
    })
    .eq("id", id);

  if (error) {
    console.error("POST /api/admin/partners/[id]/settings error:", error.message);
    return NextResponse.redirect(new URL(`${returnTo}?partnerError=1`, request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL(`${returnTo}?partnerUpdated=1`, request.url), {
    status: 303,
  });
}
