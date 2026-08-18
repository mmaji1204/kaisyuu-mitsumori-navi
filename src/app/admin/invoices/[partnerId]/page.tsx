import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { brand } from "@/lib/brand";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type Partner = {
  id: string;
  name: string;
  email: string;
};

type BillingItem = {
  id: string;
  amount: number;
  billing_month: string;
  status: "unbilled" | "invoiced" | "paid" | "void";
  description: string | null;
  created_at: string;
};

type InvoicePageProps = {
  params: Promise<{
    partnerId: string;
  }>;
  searchParams: Promise<{
    month?: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

async function loadInvoice(partnerId: string) {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const [partnerResult, billingResult] = await Promise.all([
    supabase.from("partners").select("id, name, email").eq("id", partnerId).single(),
    supabase
      .from("billing_items")
      .select("*")
      .eq("partner_id", partnerId)
      .neq("status", "void")
      .order("created_at", { ascending: false }),
  ]);

  if (partnerResult.error || !partnerResult.data) {
    return null;
  }

  return {
    billingItems: (billingResult.data ?? []) as BillingItem[],
    partner: partnerResult.data as Partner,
  };
}

export default async function InvoicePage({ params, searchParams }: InvoicePageProps) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const { partnerId } = await params;
  const filters = await searchParams;
  const invoice = await loadInvoice(partnerId);

  if (!invoice) {
    notFound();
  }

  const { billingItems, partner } = invoice;
  const month =
    filters.month || billingItems[0]?.billing_month || new Date().toISOString().slice(0, 7);
  const items = billingItems.filter((item) => item.billing_month === month);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.floor(total * 0.1);
  const grandTotal = total + tax;

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-900 print:bg-white">
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm print:shadow-none">
        <div className="mb-8 flex justify-between print:hidden">
          <Link href={`/admin/partners/${partner.id}`} className="font-black text-orange-500">
            ← 業者詳細に戻る
          </Link>
          <p className="rounded-md bg-slate-900 px-5 py-3 font-black text-white">
            ブラウザの印刷でPDF保存
          </p>
        </div>

        <div className="border-b-4 border-slate-900 pb-6">
          <p className="text-sm font-black tracking-[0.3em] text-slate-400">
            INVOICE
          </p>
          <h1 className="mt-3 text-5xl font-black">請求書</h1>
          <p className="mt-4 text-lg font-bold">対象月: {month}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-black text-slate-400">請求先</p>
            <p className="mt-2 text-2xl font-black">{partner.name} 御中</p>
            <p className="mt-1 font-bold text-slate-500">{partner.email}</p>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-black text-slate-400">発行元</p>
            <p className="mt-2 text-2xl font-black">{brand.name}</p>
            <p className="mt-1 font-bold text-slate-500">{brand.operatorName}</p>
          </div>
        </div>

        <table className="mt-10 w-full text-left">
          <thead className="border-b text-sm font-black text-slate-400">
            <tr>
              <th className="py-3">内容</th>
              <th>状態</th>
              <th className="text-right">金額</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="font-bold">
                <td className="py-4">{item.description ?? "案件配信料"}</td>
                <td>{item.status}</td>
                <td className="text-right">{formatCurrency(item.amount)}円</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 ml-auto w-full max-w-sm space-y-3 text-lg font-bold">
          <div className="flex justify-between">
            <span>小計</span>
            <span>{formatCurrency(total)}円</span>
          </div>
          <div className="flex justify-between">
            <span>消費税</span>
            <span>{formatCurrency(tax)}円</span>
          </div>
          <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-2xl font-black">
            <span>合計</span>
            <span>{formatCurrency(grandTotal)}円</span>
          </div>
        </div>
      </section>
    </main>
  );
}
