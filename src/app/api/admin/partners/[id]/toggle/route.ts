import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

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
  const supabase = createSupabaseAdminClient();
  const { data: partner, error: fetchError } = await supabase
    .from("partners")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !partner) {
    console.error(
      "POST /api/admin/partners/[id]/toggle fetch error:",
      fetchError?.message,
    );
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  const nextStatus = partner.status === "active" ? "paused" : "active";
  const { error: updateError } = await supabase
    .from("partners")
    .update({ status: nextStatus })
    .eq("id", id);

  if (updateError) {
    console.error(
      "POST /api/admin/partners/[id]/toggle update error:",
      updateError.message,
    );
    return NextResponse.redirect(new URL("/admin?partnerError=1", request.url), {
      status: 303,
    });
  }

  return NextResponse.redirect(new URL("/admin?partnerUpdated=1", request.url), {
    status: 303,
  });
}
