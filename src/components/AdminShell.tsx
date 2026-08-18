import Link from "next/link";
import { ReactNode } from "react";
import { brand } from "@/lib/brand";

type AdminShellProps = {
  actions?: ReactNode;
  active: "dashboard" | "leads" | "billing" | "board" | "analytics" | "partners";
  children: ReactNode;
  description?: string;
  title: string;
};

const navItems = [
  { id: "dashboard", href: "/admin", label: "ダッシュボード", mark: "D" },
  { id: "leads", href: "/admin#leads", label: "案件管理", mark: "L" },
  { id: "billing", href: "/admin/billing", label: "請求管理", mark: "B" },
  { id: "board", href: "/admin/board", label: "案件ボード", mark: "K" },
  { id: "analytics", href: "/admin/analytics", label: "分析", mark: "A" },
  { id: "partners", href: "/admin#partners", label: "業者管理", mark: "P" },
] as const;

export function AdminShell({
  actions,
  active,
  children,
  description,
  title,
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0,#f7fafc_34%,#eef4ff_100%)] text-slate-800">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/20 bg-slate-950/95 px-5 py-6 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/admin" className="group mb-8 block rounded-2xl p-3">
          <p className="text-[10px] font-black tracking-[0.45em] text-orange-300">
            OPERATION OS
          </p>
          <p className="mt-2 text-2xl font-black leading-tight">
            {brand.namePrefix}
            <span className="block text-orange-400">管理センター</span>
          </p>
        </Link>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
          <div className="rounded-xl bg-white/10 px-3 py-3">
            <p className="text-[10px] font-black text-slate-400">MODE</p>
            <p className="mt-1 text-sm font-black text-emerald-300">LIVE</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-3">
            <p className="text-[10px] font-black text-slate-400">ROLE</p>
            <p className="mt-1 text-sm font-black text-orange-300">ADMIN</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === active;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-xl text-xs ${
                    isActive ? "bg-white/20" : "bg-white/10 text-orange-200"
                  }`}
                >
                  {item.mark}
                </span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/business/users"
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-xs text-orange-200">
              S
            </span>
            業者画面
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-xs text-orange-200">
              W
            </span>
            サイトを見る
          </Link>
        </nav>

        <form action="/api/admin/logout" method="post" className="mt-auto">
          <button className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10">
            ログアウト
          </button>
        </form>
      </aside>

      <section className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-5 py-4 shadow-sm shadow-slate-200/60 backdrop-blur-xl lg:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.28em] text-orange-500">
                ADMIN WORKSPACE
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 lg:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {actions}
              <form action="/api/admin/logout" method="post" className="lg:hidden">
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm">
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </section>
    </main>
  );
}
