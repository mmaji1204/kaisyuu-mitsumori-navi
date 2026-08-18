import { NextRequest, NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type CsvValue = string | number | boolean | null | undefined;

function escapeCsv(value: CsvValue) {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsv(headers: string[], rows: CsvValue[][]) {
  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");
}

function csvResponse(filename: string, csv: string) {
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: NextRequest) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  if (!hasSupabaseServerEnv()) {
    return csvResponse("empty.csv", toCsv(["error"], [["Supabaseが未設定です。"]]));
  }

  const type = request.nextUrl.searchParams.get("type") ?? "leads";
  const supabase = createSupabaseAdminClient();

  if (type === "partners") {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return csvResponse("partners-error.csv", toCsv(["error"], [[error.message]]));
    }

    return csvResponse(
      "partners.csv",
      toCsv(
        [
          "業者ID",
          "業者名",
          "メール",
          "対応エリア",
          "状態",
          "自動配信",
          "日配信上限",
          "月予算上限",
          "通知メール",
          "作成日",
        ],
        (data ?? []).map((partner) => [
          partner.id,
          partner.name,
          partner.email,
          partner.service_area,
          partner.status,
          partner.auto_assign_enabled,
          partner.daily_delivery_limit,
          partner.monthly_budget_limit,
          partner.notification_email,
          partner.created_at,
        ]),
      ),
    );
  }

  if (type === "billing") {
    const partnerId = request.nextUrl.searchParams.get("partner");
    let query = supabase
      .from("billing_items")
      .select("*, partners(name)")
      .order("created_at", { ascending: false });

    if (partnerId) {
      query = query.eq("partner_id", partnerId);
    }

    const { data, error } = await query;

    if (error) {
      return csvResponse("billing-error.csv", toCsv(["error"], [[error.message]]));
    }

    return csvResponse(
      "billing.csv",
      toCsv(
        ["請求ID", "請求月", "業者", "金額", "状態", "内容", "作成日"],
        (data ?? []).map((item) => [
          item.id,
          item.billing_month,
          item.partners?.name,
          item.amount,
          item.status,
          item.description,
          item.created_at,
        ]),
      ),
    );
  }

  if (type === "notifications") {
    const { data, error } = await supabase
      .from("notification_logs")
      .select("*, partners(name)")
      .order("created_at", { ascending: false });

    if (error) {
      return csvResponse(
        "notifications-error.csv",
        toCsv(["error"], [[error.message]]),
      );
    }

    return csvResponse(
      "notifications.csv",
      toCsv(
        [
          "通知ID",
          "作成日",
          "業者",
          "チャンネル",
          "状態",
          "タイトル",
          "本文",
          "エラー",
        ],
        (data ?? []).map((log) => [
          log.id,
          log.created_at,
          log.partners?.name,
          log.channel,
          log.status,
          log.title,
          log.body,
          log.error_message,
        ]),
      ),
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) {
    return csvResponse("leads-error.csv", toCsv(["error"], [[error.message]]));
  }

  return csvResponse(
    "leads.csv",
    toCsv(
      [
        "案件ID",
        "受付日時",
        "依頼内容",
        "名前",
        "電話番号",
        "住所",
        "進捗",
        "配信金額",
        "見積金額",
        "メモ",
        "相談内容",
      ],
      (data ?? []).map((lead) => [
        lead.id,
        lead.requested_at,
        lead.request,
        lead.name,
        lead.phone,
        lead.address,
        lead.progress,
        lead.fee,
        lead.estimate,
        lead.memo,
        lead.message,
      ]),
    ),
  );
}
