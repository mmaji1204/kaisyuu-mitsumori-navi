import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
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

function redirectToDetail(request: NextRequest, id: string, key: string) {
  return NextResponse.redirect(new URL(`/admin/leads/${id}?${key}=1`, request.url), {
    status: 303,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return redirectToDetail(request, id, "error");
  }

  const formData = await request.formData();
  const progress = formData.get("progress")?.toString() as Lead["progress"];
  const estimate = formData.get("estimate")?.toString().trim() ?? "";
  const memo = formData.get("memo")?.toString().trim() ?? "";
  const fee = formData.get("fee")?.toString().trim() ?? "";

  if (!progressValues.includes(progress)) {
    return redirectToDetail(request, id, "error");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("leads")
    .update({
      progress,
      estimate,
      memo,
      fee,
    })
    .eq("id", id);

  if (error) {
    console.error("POST /api/admin/leads/[id] error:", error.message);
    return redirectToDetail(request, id, "error");
  }

  await supabase.from("notification_logs").insert({
    lead_id: id,
    channel: "system",
    status: "queued",
    title: "管理者が案件情報を更新しました",
    body: `進捗を「${progress}」に更新しました。`,
  });

  return redirectToDetail(request, id, "updated");
}
