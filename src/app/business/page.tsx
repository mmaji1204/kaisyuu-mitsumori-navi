import { BusinessShell } from "@/components/BusinessShell";

const gauges = [
  {
    label: "配信上限件数（日）",
    value: "1",
    unit: "件",
    caption: "1 件/上限なし",
    note: "本日の日次配信件数 / 日次配信上限件数",
    color: "#ff3939",
    bg: "bg-sky-50",
  },
  {
    label: "配信上限金額（日）",
    value: "900",
    unit: "円",
    caption: "900 円/上限なし",
    note: "現在の日次配信金額 / 日次配信上限金額",
    color: "#ff8a00",
    bg: "bg-sky-50",
  },
  {
    label: "配信上限件数（月）",
    value: "2",
    unit: "件",
    caption: "2 件/上限なし",
    note: "現在の月次配信件数 / 月次配信上限件数",
    color: "#34c759",
    bg: "bg-indigo-50",
  },
  {
    label: "配信上限金額（月）",
    value: "4,200",
    unit: "円",
    caption: "4,200 円/300,000 円",
    note: "現在の月次配信金額 / 月次配信上限金額",
    color: "#1d7af3",
    bg: "bg-indigo-50",
    muted: true,
  },
];

const recentDeliveries = [
  ["07/04", "0", "0"],
  ["07/05", "0", "0"],
  ["07/06", "0", "0"],
  ["07/07", "0", "0"],
  ["07/08", "0", "0"],
  ["07/09", "1", "900"],
  ["07/10", "1", "900"],
];

function Gauge({
  color,
  value,
  unit,
  muted,
}: {
  color: string;
  value: string;
  unit: string;
  muted?: boolean;
}) {
  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} 0deg ${muted ? "16deg" : "330deg"}, #e9edf5 ${muted ? "16deg" : "330deg"} 360deg)`,
        }}
      />
      <div className="absolute inset-3 rounded-full bg-white/90" />
      <p className="relative text-center text-2xl font-bold" style={{ color }}>
        {value}
        <span className="ml-1 text-base">{unit}</span>
      </p>
    </div>
  );
}

export default function BusinessDashboardPage() {
  return (
    <BusinessShell
      active="home"
      title="配信データ"
      description="配信上限、今月の配信状況、直近の案件を確認できます。"
    >
          <section className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur lg:p-8">
            <div className="mb-7 flex items-center gap-3">
              <span className="text-3xl text-blue-500">▣</span>
              <h1 className="border-b-4 border-blue-400 pb-2 text-3xl font-black">
                配信データ
              </h1>
            </div>

            <div className="mb-8 flex flex-col gap-3 rounded-md border border-blue-100 bg-slate-200 px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <p className="text-2xl font-black">26年4月フリー</p>
              <p className="text-lg font-bold text-slate-500">
                ▣ 2026年07月01日(水) ~ 2026年07月31日(金)
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="grid gap-4 rounded-xl bg-sky-50 p-6 md:grid-cols-2">
                {gauges.slice(0, 2).map((gauge) => (
                  <div key={gauge.label} className="text-center">
                    <p className="mb-3 text-lg font-bold text-slate-400">
                      {gauge.label}
                    </p>
                    <Gauge {...gauge} />
                    <p className="mt-5 text-xl font-black text-slate-600">
                      {gauge.caption}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      ({gauge.note})
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 rounded-xl bg-indigo-50 p-6 md:grid-cols-2">
                {gauges.slice(2).map((gauge) => (
                  <div key={gauge.label} className="text-center">
                    <p className="mb-3 text-lg font-bold text-slate-400">
                      {gauge.label}
                    </p>
                    <Gauge {...gauge} />
                    <p className="mt-5 text-xl font-black text-slate-600">
                      {gauge.caption}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      ({gauge.note})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.55fr_1fr]">
            <section className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur lg:p-8">
              <div className="mb-7 flex items-center gap-3">
                <span className="text-3xl text-blue-500">⌁</span>
                <h2 className="border-b-4 border-blue-400 pb-2 text-3xl font-black">
                  日次配信推移
                </h2>
              </div>

              <div className="mb-8 flex flex-wrap items-end justify-center gap-8">
                <label className="block">
                  <span className="text-sm font-bold text-slate-400">開始日</span>
                  <input
                    type="text"
                    value="2026/07/04"
                    readOnly
                    className="mt-1 h-12 w-40 rounded-md border px-4 text-lg text-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-400">終了日</span>
                  <input
                    type="text"
                    value="2026/07/10"
                    readOnly
                    className="mt-1 h-12 w-40 rounded-md border px-4 text-lg text-slate-500"
                  />
                </label>
                <button className="h-12 rounded-md bg-orange-500 px-6 font-black text-white">
                  結果を表示する
                </button>
              </div>

              <div className="mx-auto mb-5 flex w-fit items-center gap-5 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-4 w-12 bg-slate-400" />
                  配信金額
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-4 w-12 bg-blue-400" />
                  配信件数
                </span>
              </div>

              <div className="relative h-80 border-l border-b border-slate-200 pl-4">
                <div className="absolute right-0 top-0 text-slate-400">5,000</div>
                <div className="absolute left-[-22px] top-0 text-slate-400">1</div>
                <div className="flex h-full items-end justify-around gap-4 pr-10">
                  {recentDeliveries.map(([date, count, amount]) => (
                    <div key={date} className="flex h-full flex-1 flex-col justify-end">
                      <div className="flex h-56 items-end justify-center gap-1">
                        <span
                          className="w-8 rounded-t bg-slate-400"
                          style={{ height: `${Number(amount) / 25}px` }}
                        />
                        <span
                          className="w-8 rounded-t bg-blue-400"
                          style={{ height: `${Number(count) * 210}px` }}
                        />
                      </div>
                      <p className="mt-3 text-center text-sm font-bold text-slate-400">
                        {date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-8">
              <section className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur lg:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <span className="text-3xl text-blue-500">●</span>
                  <h2 className="border-b-4 border-blue-400 pb-2 text-3xl font-black">
                    最新のお知らせ
                  </h2>
                </div>
                <p className="text-lg font-bold text-slate-400">03/16 19:30</p>
                <div className="mt-4 flex gap-4">
                  <span className="text-3xl text-slate-600">⬢</span>
                  <p className="text-lg font-black leading-8 text-orange-500">
                    【管理画面アップデートのお知らせ】他社状況が確認できる新機能を追加しました
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur lg:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl text-blue-500">✈</span>
                  <h2 className="border-b-4 border-blue-400 pb-2 text-3xl font-black">
                    直近の配信
                  </h2>
                </div>
                <div className="overflow-hidden rounded-xl border bg-slate-50">
                  <div className="grid grid-cols-[110px_1fr_90px] border-b bg-slate-100 px-4 py-3 text-sm font-black text-slate-500">
                    <span>日時</span>
                    <span>案件内容</span>
                    <span>金額</span>
                  </div>
                  {[
                    ["07/10", "冷蔵庫・洗濯機の回収", "900円"],
                    ["07/09", "ソファ・棚の回収", "900円"],
                    ["07/04", "ベッド・タンスの回収", "900円"],
                  ].map((row) => (
                    <div
                      key={row.join()}
                      className="grid grid-cols-[110px_1fr_90px] px-4 py-3 text-sm font-bold"
                    >
                      {row.map((cell) => (
                        <span key={cell}>{cell}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
    </BusinessShell>
  );
}
