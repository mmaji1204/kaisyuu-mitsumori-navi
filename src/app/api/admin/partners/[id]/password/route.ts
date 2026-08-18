import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const { id } = await params;
  const formData = await request.formData();
  const password = formData.get("password")?.toString() ?? "";
  const returnTo = formData.get("return_to")?.toString() || `/admin/partners/${id}`;

  if (password.length < 6 || !hasSupabaseServerEnv()) {
    return NextResponse.redirect(new URL(`${returnTo}?partnerError=1`, request.url), {
      status: 303,
    });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("partners")
    .update({ password_hash: hashPassword(password) })
    .eq("id", id);

  if (error) {
    console.error("POST /api/admin/partners/[id]/password error:", error.message);
    return NextResponse.redirect(new URL(`${returnTo}?partnerError=1`, request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL(`${returnTo}?partnerUpdated=1`, request.url), {
    status: 303,
  });
}
