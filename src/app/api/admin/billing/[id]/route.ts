import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

const billingStatuses = ["unbilled", "invoiced", "paid", "void"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();
  const status = formData.get("status")?.toString() ?? "";
  const leadId = formData.get("lead_id")?.toString() ?? "";
  const returnTo = formData.get("return_to")?.toString() ?? "";
  const returnPath = returnTo || (leadId ? `/admin/leads/${leadId}` : "/admin");

  if (!billingStatuses.includes(status) || !hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL(`${returnPath}?billingError=1`, request.url), {
      status: 303,
    });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("billing_items")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("POST /api/admin/billing/[id] error:", error.message);
    return NextResponse.redirect(new URL(`${returnPath}?billingError=1`, request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL(`${returnPath}?billingUpdated=1`, request.url), {
    status: 303,
  });
}
