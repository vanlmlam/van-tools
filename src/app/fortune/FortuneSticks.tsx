"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";

import { SIGNS, dimensionsOf, type Level, type Sign } from "./signs";

/** 各籤別的外觀 */
const LEVEL_STYLE: Record<
  Level,
  { hex: string; chip: string; text: string; bar: string; glow: string }
> = {
  大吉: {
    hex: "#047857",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
    glow: "shadow-emerald-500/25",
  },
  吉: {
    hex: "#16a34a",
    chip: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    text: "text-green-700 dark:text-green-400",
    bar: "bg-green-500",
    glow: "shadow-green-500/25",
  },
  中吉: {
    hex: "#0d9488",
    chip: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
    text: "text-teal-700 dark:text-teal-400",
    bar: "bg-teal-500",
    glow: "shadow-teal-500/25",
  },
  小吉: {
    hex: "#0284c7",
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    text: "text-sky-700 dark:text-sky-400",
    bar: "bg-sky-500",
    glow: "shadow-sky-500/25",
  },
  平: {
    hex: "#71717a",
    chip: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    text: "text-zinc-600 dark:text-zinc-400",
    bar: "bg-zinc-400",
    glow: "shadow-zinc-400/25",
  },
  小凶: {
    hex: "#d97706",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    glow: "shadow-amber-500/25",
  },
  中凶: {
    hex: "#ea580c",
    chip: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
    text: "text-orange-700 dark:text-orange-400",
    bar: "bg-orange-500",
    glow: "shadow-orange-500/25",
  },
  凶: {
    hex: "#e11d48",
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    text: "text-rose-700 dark:text-rose-400",
    bar: "bg-rose-500",
    glow: "shadow-rose-500/25",
  },
  大凶: {
    hex: "#b91c1c",
    chip: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    text: "text-red-700 dark:text-red-400",
    bar: "bg-red-600",
    glow: "shadow-red-600/25",
  },
};

const STORAGE_KEY = "van-tools.fortune.history";

const SHAKE_MS = 1100;

type Phase = "idle" | "shaking" | "revealed";

type HistoryEntry = {
  no: number;
  level: Level;
  time: string;
};

/** 決定性的雜訊，用來排籤的角度與長度 */
function noise(index: number, salt: number): number {
  let x = (Math.imul(index + 1, 2654435761) + Math.imul(salt + 3, 40503)) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function randomIndex(total: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % total;
  }
  return Math.floor(Math.random() * total);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ── 籤史的外部儲存（localStorage） ── */

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStoredHistory(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseHistory(raw: string): HistoryEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as { day?: string; entries?: HistoryEntry[] };
    if (parsed.day !== todayKey()) return [];
    if (!Array.isArray(parsed.entries)) return [];

    return parsed.entries.filter(
      (entry) =>
        entry &&
        typeof entry.no === "number" &&
        typeof entry.level === "string" &&
        typeof entry.time === "string",
    );
  } catch {
    /* 資料損毀就當作沒有紀錄 */
    return [];
  }
}

/** 每支籤在籤筒裡的固定位置 */
const STICKS = SIGNS.map((sign, index) => {
  const spread = index - (SIGNS.length - 1) / 2;
  return {
    no: sign.no,
    x: spread * 3.6,
    rotate: spread * 2.1 + (noise(index, 1) - 0.5) * 6,
    height: 78 + noise(index, 2) * 44,
    depth: noise(index, 3),
  };
});

export default function FortuneSticks() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Sign | null>(null);

  /* 籤史存在 localStorage，用 useSyncExternalStore 讀取 */
  const rawHistory = useSyncExternalStore(
    subscribeToStorage,
    readStoredHistory,
    () => "",
  );
  const history = useMemo(() => parseHistory(rawHistory), [rawHistory]);

  const pendingRef = useRef<Sign | null>(null);

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ day: todayKey(), entries }),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      /* localStorage 不可用時忽略 */
    }
  }, []);

  /* 搖籤的動畫結束後才揭曉結果 */
  useEffect(() => {
    if (phase !== "shaking") return;

    const timer = window.setTimeout(() => {
      const sign = pendingRef.current;
      pendingRef.current = null;
      if (!sign) {
        setPhase("idle");
        return;
      }

      setResult(sign);
      setPhase("revealed");
      saveHistory([
        { no: sign.no, level: sign.level, time: nowLabel() },
        ...history,
      ]);
    }, SHAKE_MS);

    return () => window.clearTimeout(timer);
    // history 只在揭曉時讀一次，避免重複觸發
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, saveHistory]);

  const draw = useCallback(() => {
    if (phase === "shaking") return;

    pendingRef.current = SIGNS[randomIndex(SIGNS.length)];
    setResult(null);
    setPhase("shaking");
  }, [phase]);

  const reset = useCallback(() => {
    setResult(null);
    setPhase("idle");
  }, []);

  const dimensions = useMemo(
    () => (result ? dimensionsOf(result) : []),
    [result],
  );

  const style = result ? LEVEL_STYLE[result.level] : null;
  const winningNo = result?.no ?? null;

  const luckyCount = history.filter(
    (entry) => entry.level === "大吉" || entry.level === "吉" || entry.level === "中吉",
  ).length;

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── 左側：籤筒 ── */}
      <section className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">運籤</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            心中默念一件事，搖一搖籤筒，看看今天的運勢。
          </p>
        </div>

        {/* 籤筒 */}
        <div
          className="fortune-animated relative h-88 w-64 select-none"
          style={
            phase === "shaking"
              ? {
                  animation: "fortune-jiggle 240ms ease-in-out infinite",
                  transformOrigin: "50% 88%",
                }
              : undefined
          }
        >
          {/* 籤 */}
          {STICKS.map((stick) => {
            const isWinner = phase === "revealed" && stick.no === winningNo;

            return (
              <div
                key={stick.no}
                className="fortune-animated absolute bottom-[186px] left-1/2 w-[9px] rounded-t-full rounded-b-sm bg-gradient-to-b from-amber-100 to-amber-700 shadow-sm"
                style={
                  {
                    height: `${stick.height}px`,
                    "--tx": `${stick.x}px`,
                    "--rot": `${stick.rotate}deg`,
                    "--rise": "-40px",
                    zIndex: isWinner ? 40 : 10 + Math.round(stick.depth * 8),
                    transform: isWinner
                      ? undefined
                      : `translateX(calc(-50% + var(--tx))) rotate(var(--rot))`,
                    animation: isWinner
                      ? "fortune-rise 760ms cubic-bezier(0.22, 0.9, 0.28, 1) forwards"
                      : undefined,
                    /* 抽出來的那支籤：加寬、染上籤別的顏色，讓人一眼看出是哪一支 */
                    width: isWinner ? "14px" : undefined,
                    background: isWinner
                      ? `linear-gradient(180deg, #fde68a 0%, ${style?.hex ?? "#d97706"} 55%)`
                      : undefined,
                    boxShadow: isWinner
                      ? "0 0 0 2px rgba(255,255,255,0.75), 0 10px 18px rgba(0,0,0,0.28)"
                      : undefined,
                  } as CSSProperties
                }
              >
                <span
                  className={`absolute left-1/2 top-1 -translate-x-1/2 text-[9px] font-semibold ${
                    isWinner ? "text-white" : "text-red-800"
                  }`}
                  style={{ writingMode: "vertical-rl" }}
                >
                  {String(stick.no).padStart(2, "0")}
                </span>
              </div>
            );
          })}

          {/* 籤筒本體（蓋住籤的下半部） */}
          <div className="absolute inset-x-0 bottom-0 z-20 h-56 rounded-t-[3.5rem] rounded-b-2xl bg-gradient-to-b from-red-700 via-red-800 to-red-950 shadow-xl">
            {/* 筒口的唇 */}
            <div className="absolute -top-3 inset-x-0 h-7 rounded-[50%] bg-red-900 ring-1 ring-black/10" />
            <div className="absolute -top-1 inset-x-2 h-4 rounded-[50%] bg-red-950/80" />

            {/* 筒身的字 */}
            <div className="absolute inset-x-0 top-14 flex flex-col items-center gap-3">
              <span className="font-serif text-5xl font-bold text-amber-200 drop-shadow">
                籤
              </span>
              <span className="text-xs tracking-[0.4em] text-amber-100/70">
                今日運勢
              </span>
            </div>
          </div>
        </div>

        {/* 按鈕 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={draw}
            disabled={phase === "shaking"}
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {phase === "shaking" ? "籤筒搖晃中…" : "抽籤"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={phase === "shaking" || !result}
            className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            收起籤
          </button>
        </div>

        {history.length > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            今日已抽 {history.length} 籤，其中吉籤 {luckyCount} 籤
          </p>
        )}
      </section>

      {/* ── 右側：籤果 ── */}
      <section className="flex flex-col gap-4">
        <div
          aria-live="polite"
          className="flex min-h-[22rem] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          {phase === "shaking" ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              籤筒搖晃中，請稍候…
            </p>
          ) : result && style ? (
            <div className="flex w-full flex-col items-center">
              <p className="text-xs font-medium tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                第 {String(result.no).padStart(2, "0")} 籤
              </p>

              <p
                className={`mt-3 font-serif text-6xl font-bold ${style.text} ${style.glow}`}
              >
                {result.level}
              </p>

              <p className="mt-5 font-serif text-lg leading-8 text-zinc-800 dark:text-zinc-100">
                {result.poem}
              </p>

              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {result.advice}
              </p>

              {/* 運勢分數 */}
              <div className="mt-6 w-full max-w-sm">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    今日運勢
                  </span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {result.score}
                    <span className="text-xs font-normal text-zinc-400"> / 100</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${style.bar} transition-[width] duration-700`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* 各面向 */}
              <dl className="mt-6 w-full max-w-sm space-y-3">
                {dimensions.map((dimension) => (
                  <div key={dimension.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <dt className="text-zinc-500 dark:text-zinc-400">
                        {dimension.label}
                      </dt>
                      <dd className="text-zinc-700 dark:text-zinc-200">
                        {dimension.word}
                      </dd>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${style.bar} opacity-80`}
                        style={{ width: `${dimension.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div>
              <p className="font-serif text-2xl text-zinc-300 dark:text-zinc-700">
                籤
              </p>
              <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
                按「抽籤」，看看今天是大吉還是大凶。
              </p>
            </div>
          )}
        </div>

        {/* 今日籤史 */}
        {history.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              今日籤史
            </h2>
            <ol className="flex flex-wrap gap-2">
              {history.map((entry, index) => {
                const entryStyle = LEVEL_STYLE[entry.level];
                return (
                  <li
                    key={`${entry.no}-${entry.time}-${index}`}
                    className={`rounded-full px-3 py-1 text-sm ${entryStyle.chip}`}
                  >
                    <span className="mr-1 font-mono text-xs opacity-70">
                      {entry.time}
                    </span>
                    {entry.level}
                    <span className="ml-1 text-xs opacity-60">
                      第{String(entry.no).padStart(2, "0")}籤
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          籤由程式隨機抽取，僅供娛樂參考；真正的好運，還是靠自己走出來。
        </p>
      </section>
    </div>
  );
}
