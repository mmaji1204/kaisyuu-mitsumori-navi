import { NextRequest } from "next/server";
import { createSupabaseAdminClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { mapLeadRowToLead, LeadRow } from "@/lib/supabase/leads";
import { Lead } from "@/lib/leads";
import { isBusinessLoggedIn } from "@/lib/business-auth";

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
  const updates = (await request.json()) as Partial<Lead>;

  if (updates.progress && !progressValues.includes(updates.progress)) {
    return Response.json({ message: "進捗の値が不正です。" }, { status: 400 });
  }

  if (!hasSupabaseServerEnv()) {
    return Response.json({ lead: { id, ...updates }, mode: "demo" });
  }

  const supabaseUpdates = {
    progress: updates.progress,
    estimate: updates.estimate,
    memo: updates.memo,
  };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update(supabaseUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({
    lead: mapLeadRowToLead(data as LeadRow),
    mode: "supabase",
  });
}
