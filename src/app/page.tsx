import Link from "next/link";

const TOOLS = [
  {
    href: "/wheel",
    title: "抽獎轉盤",
    description:
      "貼上名單，轉動轉盤抽出中獎者。抽過的人會自動標記，不會重複中獎。",
    features: ["支援任意名單，逗號或換行都能解析", "已抽出者轉為灰色，不再被抽中", "中獎紀錄保留最近 12 位"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 3v9l6.4 6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 12 4.6 16.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    href: "/fortune",
    title: "運籤",
    description:
      "搖一搖籤筒，隨機抽一支籤。大吉、大凶一目了然，還有今日各面向的運勢解析。",
    features: ["24 支籤，含籤詩與運勢分數", "整體、事業、感情、財運、健康五項解析", "今日籤史自動記錄，隔日歸零"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M7 20h10l-1-11H8L7 20Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M10 9V4M14 9V3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    gradient: "from-rose-500 to-amber-400",
    iconBg: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
  {
    href: "/pomodoro",
    title: "番茄鐘",
    description:
      "25 分鐘專注、5 分鐘休息。完成四輪進入長休息，陪你把事情一件件做完。",
    features: ["專注與休息時長都可自行調整", "四輪一組，自動進入長休息", "提示音與桌面通知，不會漏掉"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 9v4l2.5 2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 2h6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m4 10.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* ── 裝飾背景 ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="dot-grid dot-mask absolute inset-0 opacity-70 dark:opacity-30" />
        <div className="absolute -top-48 left-1/2 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -top-32 right-4 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/10" />
        <div className="absolute top-32 -left-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/10" />
      </div>

      {/* ── Hero ── */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            三個小工具，隨手就能用
          </span>

          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Van 的
            <span className="bg-gradient-to-r from-blue-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {" "}
              小工具箱
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
            抽獎轉盤、運籤、番茄鐘 —— 幾個不用安裝、隨手打開就能用的小工具。
            打開分頁就解決，剩下的交給它。
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#tools"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-700 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              看看有哪些工具
            </a>
            <Link
              href="/fortune"
              className="rounded-full border border-zinc-300 bg-white/70 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:border-zinc-500"
            >
              先抽一籤
            </Link>
          </div>

          <dl className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-3">
            {[
              { label: "工具數", value: "3" },
              { label: "需要安裝", value: "0" },
              { label: "需要註冊", value: "0" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white/60 px-3 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <dd className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {item.value}
                </dd>
                <dt className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 工具列表 ── */}
      <section
        id="tools"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-8 sm:pb-24"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              工具列表
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              點進去就能用，不需要註冊，也不需要設定。
            </p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-500 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            共 3 個
          </span>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              {/* 卡���頂端的漸層色條 */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.gradient}`}
              />

              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tool.iconBg} transition-transform duration-300 group-hover:scale-105`}
              >
                {tool.icon}
              </span>

              <h3 className="mt-5 font-serif text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {tool.title}
              </h3>

              <p className="mt-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {tool.description}
              </p>

              <ul className="mt-5 space-y-2 border-t border-zinc-100 pt-5 text-sm text-zinc-600 dark:border-zinc-800/70 dark:text-zinc-400">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckIcon />
                    <span className="leading-5">{feature}</span>
                  </li>
                ))}
              </ul>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                開始使用
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
