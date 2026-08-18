import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type Lead = {
  id: string;
  requested_at: string;
  request: string;
  name: string;
  address: string;
  phone: string;
  progress: "未対応" | "現地見積" | "商談中" | "成約" | "失注";
  duplicate_warning: boolean | null;
};

const columns: Lead["progress"][] = [
  "未対応",
  "現地見積",
  "商談中",
  "成約",
  "失注",
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function loadLeads() {
  if (!hasSupabaseServerEnv()) {
    return [] as Lead[];
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("leads").select("*").order("requested_at", {
    ascending: false,
  });

  return (data ?? []) as Lead[];
}

export default async function AdminBoardPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const leads = await loadLeads();

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <section className="px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-black text-orange-500">
              ← 管理ダッシュボードに戻る
            </Link>
            <h1 className="mt-3 text-4xl font-black">案件ステータスボード</h1>
          </div>
          <Link
            href="/admin/analytics"
            className="w-fit rounded-md bg-slate-900 px-5 py-3 font-black text-white"
          >
            分析を見る
          </Link>
        </div>

        <section className="grid gap-4 xl:grid-cols-5">
          {columns.map((column) => {
            const columnLeads = leads.filter((lead) => lead.progress === column);

            return (
              <div key={column} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">{column}</h2>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-500">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="block rounded-lg border p-4 hover:border-orange-300"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-slate-400">
                          {formatDate(lead.requested_at)}
                        </p>
                        {lead.duplicate_warning ? (
                          <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">
                            重複注意
                          </span>
                        ) : null}
                      </div>
                      <p className="font-black text-slate-800">{lead.request}</p>
                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {lead.name} / {lead.address}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-400">
                        {lead.phone}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}
