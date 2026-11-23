import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Van 的小工具箱",
    template: "%s | Van 的小工具箱",
  },
  description: "抽獎轉盤、運籤、番茄鐘，幾個隨手打開就能用的小工具。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-rose-500 to-amber-500 font-serif text-sm font-bold text-white shadow-sm transition group-hover:scale-105">
                V
              </span>
              <span className="hidden font-serif text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:inline">
                Van 的小工具箱
              </span>
            </Link>
            <Nav />
          </div>
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
