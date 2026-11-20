import Link from "next/link";

const TOOLS = [
  {
    href: "/wheel",
    title: "抽獎轉盤",
    description: "輸入名單，轉動轉盤抽出中獎者。可連續抽出多輪，不會重複。",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M12 3v9l6.4 6.4" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M12 12 4.6 16.7" fill="none" strokeWidth="2" stroke="currentColor" />
      </svg>
    ),
  },
  {
    href: "/pomodoro",
    title: "番茄鐘",
    description: "25 分鐘專注、5 分鐘休息。完成四輪進入長休息，陪你專注做事。",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="13" r="8" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M12 9v4l2.5 2.5" fill="none" strokeWidth="2" stroke="currentColor" />
        <path d="M9 2h6" fill="none" strokeWidth="2" stroke="currentColor" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          van-tools
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          一堆好用的小工具。
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 transition group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
              {tool.icon}
            </span>
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {tool.title}
            </span>
            <span className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {tool.description}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
