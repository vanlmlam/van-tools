import Link from "next/link";

const TOOL_LINKS = [
  { href: "/wheel", label: "抽獎轉盤", hint: "隨機抽出中獎者" },
  { href: "/fortune", label: "運籤", hint: "看看今天的運勢" },
  { href: "/pomodoro", label: "番茄鐘", hint: "專注與休息計時" },
];

/*
 * 靜態 prerender 時 Next.js 不允許直接呼叫 new Date()，
 * 用 use cache 把「今年是幾年」快取起來即可。
 */
async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await getYear();

  return (
    <footer className="border-t border-zinc-200 bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* 品牌 */}
          <div className="max-w-xs">
            <Link
              href="/"
              className="font-serif text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Van 的小工具箱
            </Link>
            <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              幾個不用安裝、隨手打開就能用的小工具。
              打開分頁就能用，剩下的交給它。
            </p>
          </div>

          {/* 工具連結 */}
          <nav aria-label="工具">
            <p className="text-xs font-medium tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              工具
            </p>
            <ul className="mt-4 space-y-3">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex flex-col"
                  >
                    <span className="text-sm font-medium text-zinc-800 transition group-hover:text-zinc-950 dark:text-zinc-200 dark:group-hover:text-white">
                      {link.label}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {link.hint}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 其他 */}
          <nav aria-label="關於">
            <p className="text-xs font-medium tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              關於
            </p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>純前端製作，資料留在你自己的瀏覽器</li>
              <li>不需要註冊，也不收集任何資料</li>
              <li>用手機、電腦都能開</li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-400 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-500">
          <p>© {year} Van 的小工具箱</p>
          <p>用 Next.js 打造 · 抽籤結果僅供娛樂參考</p>
        </div>
      </div>
    </footer>
  );
}
