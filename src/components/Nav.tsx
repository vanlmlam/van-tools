"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "首頁", short: "首頁" },
  { href: "/wheel", label: "抽獎轉盤", short: "轉盤" },
  { href: "/pomodoro", label: "番茄鐘", short: "番茄" },
  { href: "/fortune", label: "運籤", short: "運籤" },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {/* 窄螢幕用短標，避免選單被擠到換行 */}
            <span className="sm:hidden">{link.short}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
