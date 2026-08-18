import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminLoginEmail, isAdminLoggedIn } from "@/lib/admin-auth";
import { brand } from "@/lib/brand";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminLoggedIn()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_460px]">
        <section>
          <Link href="/" className="inline-block">
            <p className="text-[10px] font-bold tracking-[0.45em] text-orange-300">
              ADMIN CONSOLE
            </p>
            <p className="mt-2 text-4xl font-black tracking-normal">
              {brand.name}
            </p>
          </Link>

          <div className="mt-12 max-w-xl">
            <p className="text-sm font-black text-orange-400">OWNER ADMIN</p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              運営者用の管理画面
            </h1>
            <p className="mt-5 text-lg font-bold leading-8 text-slate-300">
              案件、業者、配信状況をまとめて確認します。まずは開発用ログインで管理画面を確認します。
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-7 text-slate-800 shadow-2xl shadow-black/40">
          <h2 className="text-3xl font-black">管理者ログイン</h2>
          <p className="mt-2 text-sm font-bold text-slate-400">
            公開前にパスワードは必ず変更します。
          </p>

          {error ? (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              メールアドレスまたはパスワードが違います。
            </div>
          ) : null}

          <form action="/api/admin/login" method="post" className="mt-6">
            <label className="block">
              <span className="text-sm font-black text-slate-600">
                メールアドレス
              </span>
              <input
                type="email"
                name="email"
                defaultValue={getAdminLoginEmail()}
                required
                className="mt-2 h-13 w-full rounded-md border border-slate-300 px-4 text-lg outline-none focus:border-orange-500"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-600">
                パスワード
              </span>
              <input
                type="password"
                name="password"
                placeholder="admin123"
                required
                className="mt-2 h-13 w-full rounded-md border border-slate-300 px-4 text-lg outline-none focus:border-orange-500"
              />
            </label>

            <button className="mt-7 h-13 w-full rounded-md bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600">
              ログインする
            </button>
          </form>

          <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            <p className="font-black text-slate-600">開発用ログイン情報</p>
            <p>メール: {getAdminLoginEmail()}</p>
            <p>パスワード: admin123</p>
          </div>
        </section>
      </div>
    </main>
  );
}
