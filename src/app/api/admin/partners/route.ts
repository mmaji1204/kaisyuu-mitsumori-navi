import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() || "password123";
  const serviceArea =
    formData.get("service_area")?.toString().trim() || "全国対応";
  const dailyDeliveryLimitValue = formData
    .get("daily_delivery_limit")
    ?.toString()
    .trim();
  const dailyDeliveryLimit = dailyDeliveryLimitValue
    ? Number(dailyDeliveryLimitValue)
    : 10;

  if (!name || !email || password.length < 6 || Number.isNaN(dailyDeliveryLimit)) {
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("partners").insert({
    name,
    email,
    password_hash: hashPassword(password),
    service_area: serviceArea,
    daily_delivery_limit: dailyDeliveryLimit,
    monthly_budget_limit: 300000,
    notification_email: email,
    auto_assign_enabled: true,
    status: "active",
  });

  if (error) {
    console.error("POST /api/admin/partners error:", error.message);
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL("/admin?partnerCreated=1", request.url), {
    status: 303,
  });
}
