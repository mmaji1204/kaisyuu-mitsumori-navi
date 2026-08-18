import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import { getBusinessLoginEmail, isBusinessLoggedIn } from "@/lib/business-auth";

type BusinessLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function BusinessLoginPage({
  searchParams,
}: BusinessLoginPageProps) {
  if (await isBusinessLoggedIn()) {
    redirect("/business/users");
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_460px]">
        <section>
          <Link href="/" className="inline-block">
            <p className="text-[10px] font-bold tracking-[0.45em] text-slate-500">
              {brand.tagline}
            </p>
            <p className="mt-2 text-4xl font-black tracking-normal text-slate-950">
              {brand.name}
            </p>
          </Link>

          <div className="mt-12 max-w-xl">
            <p className="text-sm font-black text-orange-500">
              PARTNER ADMIN
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight">
              業者向け管理画面にログイン
            </h1>
            <p className="mt-5 text-lg font-bold leading-8 text-slate-500">
              サイトから入った見積もり依頼を確認し、未対応・現地見積・成約などの進捗を管理できます。
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-7 shadow-xl shadow-slate-200/80">
          <h2 className="text-3xl font-black">ログイン</h2>
          <p className="mt-2 text-sm font-bold text-slate-400">
            管理者画面で登録した業者アカウントでログインします。
          </p>

          {error ? (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              メールアドレスまたはパスワードが違います。
            </div>
          ) : null}

          <form action="/api/business/login" method="post" className="mt-6">
            <label className="block">
              <span className="text-sm font-black text-slate-600">
                メールアドレス
              </span>
              <input
                type="email"
                name="email"
                defaultValue={getBusinessLoginEmail()}
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
                placeholder="password123"
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
            <p>メール: {getBusinessLoginEmail()}</p>
            <p>パスワード: password123</p>
            <p className="mt-2">
              管理者画面で追加した業者は、そのメールアドレスと設定したパスワードでログインできます。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
