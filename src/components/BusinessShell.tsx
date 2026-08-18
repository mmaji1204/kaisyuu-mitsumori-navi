import Link from "next/link";
import { ReactNode } from "react";
import { brand } from "@/lib/brand";

type BusinessShellProps = {
  actions?: ReactNode;
  active: "home" | "leads" | "shop" | "report" | "support";
  children: ReactNode;
  description?: string;
  title: string;
};

const navItems = [
  { id: "home", href: "/business", label: "HOME", mark: "H" },
  { id: "leads", href: "/business/users", label: "案件一覧", mark: "L" },
  { id: "shop", href: "#", label: "店舗情報", mark: "S" },
  { id: "report", href: "#", label: "配信レポート", mark: "R" },
  { id: "support", href: "#", label: "お問い合わせ", mark: "?" },
] as const;

export function BusinessShell({
  actions,
  active,
  children,
  description,
  title,
}: BusinessShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fafc_0%,#fff7ed_48%,#eefbf3_100%)] text-slate-800">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-white/70 bg-white/85 px-5 py-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-7 block rounded-2xl p-3">
          <p className="text-[10px] font-black tracking-[0.35em] text-slate-400">
            {brand.tagline}
          </p>
          <p className="mt-2 text-3xl font-black leading-tight text-slate-950">
            {brand.namePrefix}
            <span className="block text-orange-500">{brand.nameAccent}</span>
          </p>
        </Link>

        <div className="mb-5 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs font-black text-orange-300">PARTNER PORTAL</p>
          <p className="mt-2 text-lg font-black">クリーンリンク</p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            案件受信・見積・成約管理
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === active;
            const className = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
              isActive
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`;

            const content = (
              <>
                <span
                  className={`grid size-9 place-items-center rounded-xl text-xs ${
                    isActive
                      ? "bg-white/20"
                      : "bg-white text-orange-500 shadow-sm"
                  }`}
                >
                  {item.mark}
                </span>
                {item.label}
              </>
            );

            return item.href.startsWith("/") ? (
              <Link key={item.id} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <a key={item.id} href={item.href} className={className}>
                {content}
              </a>
            );
          })}
        </nav>

        <form action="/api/business/logout" method="post" className="mt-auto">
          <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-500">
            ログアウト
          </button>
        </form>
      </aside>

      <section className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/80 bg-white/80 px-5 py-4 shadow-sm shadow-slate-200/60 backdrop-blur-xl lg:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.28em] text-orange-500">
                BUSINESS WORKSPACE
              </p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 lg:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <div className="ml-0 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm xl:ml-2">
                <div className="grid size-10 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
                  CL
                </div>
                <div>
                  <p className="max-w-36 truncate text-sm font-black text-slate-700">
                    hisamura12...
                  </p>
                  <p className="text-xs font-bold text-slate-400">クリーンリンク</p>
                </div>
              </div>
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
