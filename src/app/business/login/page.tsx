import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import {
  getBusinessLoginEmail,
  isBusinessLoggedIn,
  isDevelopmentBusinessAuthFallbackEnabled,
} from "@/lib/business-auth";

type BusinessLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    setup?: string;
  }>;
};

export default async function BusinessLoginPage({
  searchParams,
}: BusinessLoginPageProps) {
  if (await isBusinessLoggedIn()) {
    redirect("/business/users");
  }

  const { error, setup } = await searchParams;
  const showsDevelopmentHint = isDevelopmentBusinessAuthFallbackEnabled();

  return (
    <main className="min-h-screen bg-[#f4f6fa] text-slate-800">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-[1fr_460px] lg:gap-10">
        <section>
          <Link href="/" className="inline-block">
            <p className="text-[10px] font-bold tracking-[0.32em] text-slate-500 sm:tracking-[0.45em]">
              {brand.tagline}
            </p>
            <p className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {brand.name}
            </p>
          </Link>

          <div className="mt-8 max-w-xl sm:mt-12">
            <p className="text-sm font-black text-orange-500">
              PARTNER ADMIN
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:mt-4 sm:text-5xl">
              業者向け管理画面にログイン
            </h1>
            <p className="mt-4 text-base font-bold leading-7 text-slate-500 sm:mt-5 sm:text-lg sm:leading-8">
              サイトから入った見積もり依頼を確認し、未対応・現地見積・成約などの進捗を管理できます。
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/80 sm:p-7">
          <h2 className="text-2xl font-black sm:text-3xl">ログイン</h2>
          <p className="mt-2 text-sm font-bold text-slate-400">
            管理者画面で登録した業者アカウントでログインします。
          </p>

          {error ? (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              メールアドレスまたはパスワードが違います。
            </div>
          ) : null}

          {setup ? (
            <div className="mt-5 rounded-md bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-700">
              業者ログインが未設定です。Supabaseのpartnersテーブルに業者を登録するか、開発用の業者ログイン環境変数を設定してください。
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
                defaultValue={
                  showsDevelopmentHint ? getBusinessLoginEmail() : undefined
                }
                required
                className="mt-2 h-[52px] w-full rounded-md border border-slate-300 px-4 text-base outline-none focus:border-orange-500 sm:text-lg"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-600">
                パスワード
              </span>
              <input
                type="password"
                name="password"
                placeholder={
                  showsDevelopmentHint ? "password123" : "パスワードを入力"
                }
                required
                className="mt-2 h-[52px] w-full rounded-md border border-slate-300 px-4 text-base outline-none focus:border-orange-500 sm:text-lg"
              />
            </label>

            <button className="mt-7 h-[52px] w-full rounded-md bg-orange-500 text-base font-black text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600 sm:text-lg">
              ログインする
            </button>
          </form>

          {showsDevelopmentHint ? (
            <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-500">
              <p className="font-black text-slate-600">開発用ログイン情報</p>
              <p>メール: {getBusinessLoginEmail()}</p>
              <p>パスワード: password123</p>
              <p className="mt-2">
                管理者画面で追加した業者は、そのメールアドレスと設定したパスワードでログインできます。
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
