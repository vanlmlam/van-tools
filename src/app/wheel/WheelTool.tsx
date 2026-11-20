"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** 轉盤配色：白字對比度皆 ≥ 4.5:1 */
const SECTOR_COLORS = [
  "#1d4ed8",
  "#c2410c",
  "#047857",
  "#7e22ce",
  "#b91c1c",
  "#0f766e",
  "#a16207",
  "#4338ca",
  "#be185d",
  "#15803d",
  "#6d28d9",
  "#0369a1",
];

const SPIN_MS = 5200;
const RESET_MS = 500;

const CX = 200;
const CY = 200;
const R = 178;

const STORAGE_KEY = "van-tools.wheel.names";

/** 角度 0 = 正上方，順時針增加 */
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.sin(rad), y: CY - radius * Math.cos(rad) };
}

function sectorPath(index: number, total: number) {
  const a0 = (index * 360) / total;
  const a1 = ((index + 1) * 360) / total;
  const p0 = polar(a0, R);
  const p1 = polar(a1, R);
  const largeArc = a1 - a0 > 180 ? 1 : 0;

  return `M ${CX} ${CY} L ${p0.x} ${p0.y} A ${R} ${R} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
}

/**
 * 把傾斜角收斂到 -90°～90° 之間，文字才不會上下顛倒。
 * 0° = 文字水平朝右，順時針為正。
 */
function normalizeTilt(angle: number): number {
  let a = ((((angle + 180) % 360) + 360) % 360) - 180;
  if (a > 90) a -= 180;
  if (a < -90) a += 180;
  return a;
}

/** 支援換行、逗號、頓號、斜線分隔，並去除重複與空白 */
function parseNames(raw: string): string[] {
  const parts = raw.split(/[\n,，、;；\/]+/);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const name = part.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }

  return result;
}

function randomIndex(total: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % total;
  }
  return Math.floor(Math.random() * total);
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/* ── 名單的外部儲存（localStorage） ── */

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStoredNames(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeNames(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* localStorage 不可用時忽略 */
  }
}

export default function WheelTool() {
  /* 名單存在 localStorage，hydration 後自動帶入 */
  const storedNames = useSyncExternalStore(
    subscribeToStorage,
    readStoredNames,
    () => "",
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const pendingWinnerRef = useRef<string | null>(null);

  const rawNames = draft ?? storedNames;
  const names = useMemo(() => parseNames(rawNames), [rawNames]);
  const pool = useMemo(() => names.filter((n) => !drawn.includes(n)), [names, drawn]);

  /*
   * 每個標籤在「螢幕上」應有的傾斜角。
   * 轉盤轉了 rotation 之後，第 i 格實際位於螢幕的 middle + rotation，
   * 文字要沿著半徑方向擺放就是 tilt = middle + rotation - 90，
   * 再收斂到 -90°～90° 以免上下顛倒。
   */
  const labelTilt = useMemo(
    () =>
      names.map(
        (_, index) =>
          normalizeTilt(((index + 0.5) * 360) / names.length + rotation - 90),
      ),
    [names, rotation],
  );

  /* 編輯名單時同時寫入 localStorage */
  const updateNames = useCallback((value: string) => {
    setDraft(value);
    storeNames(value);
  }, []);

  /* 名單異動時重置轉盤（旋轉中不動作） */
  const namesKey = names.join("\n");
  useEffect(() => {
    if (spinningRef.current) return;

    const current = rotationRef.current;
    rotationRef.current = current - (current % 360);
    setRotation(rotationRef.current);
    setWinner(null);
    setDrawn((prev) => prev.filter((n) => names.includes(n)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey]);

  const finishSpin = useCallback(() => {
    if (!spinningRef.current) return;

    spinningRef.current = false;
    setSpinning(false);

    const picked = pendingWinnerRef.current;
    pendingWinnerRef.current = null;
    if (!picked) return;

    setWinner(picked);
    setDrawn((prev) => (prev.includes(picked) ? prev : [...prev, picked]));
    setHistory((prev) => [picked, ...prev].slice(0, 12));
  }, []);

  /* 轉場事件在某些情況下可能不觸發，用 timeout 兜底 */
  useEffect(() => {
    if (!spinning) return;
    const timer = window.setTimeout(finishSpin, SPIN_MS + 300);
    return () => window.clearTimeout(timer);
  }, [spinning, finishSpin]);

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    if (pool.length === 0) return;

    const picked = pool[randomIndex(pool.length)];
    const index = names.indexOf(picked);
    const total = names.length;
    if (total === 0) return;

    /* 讓第 index 格的中心對準正上方的指標 */
    const middle = ((index + 0.5) * 360) / total;
    const current = rotationRef.current;
    const currentMod = ((current % 360) + 360) % 360;
    const targetMod = (360 - middle) % 360;

    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;

    const turns = 5 + Math.floor(Math.random() * 3);
    const next = current + turns * 360 + delta;

    rotationRef.current = next;
    setRotation(next);
    pendingWinnerRef.current = picked;
    spinningRef.current = true;
    setSpinning(true);
    setWinner(null);
  }, [pool, names]);

  const removeWinner = () => {
    if (!winner) return;
    updateNames(names.filter((n) => n !== winner).join("\n"));
  };

  const resetRound = () => {
    setDrawn([]);
    setWinner(null);
    setHistory([]);
  };

  const clearAll = () => {
    updateNames("");
    setDrawn([]);
    setWinner(null);
    setHistory([]);
  };

  const canSpin = pool.length > 0 && !spinning;
  const labelSize = Math.max(10, Math.min(20, 150 / names.length));
  const showLabels = names.length > 0 && 360 / names.length >= 14;

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── 左側：名單 ── */}
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">抽獎轉盤</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            貼上這次的名單，每行一個（也可用逗號分隔），然後按「抽獎」。
          </p>
        </div>

        <textarea
          value={rawNames}
          onChange={(event) => updateNames(event.target.value)}
          placeholder={"陳大文\n李小明\n王美玲\n陳大文\n林志豪"}
          spellCheck={false}
          className="min-h-56 w-full resize-y rounded-xl border border-zinc-300 bg-white p-3 font-mono text-sm leading-6 text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/10"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={spin}
            disabled={!canSpin}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {spinning ? "轉盤旋轉中…" : "抽獎"}
          </button>
          <button
            type="button"
            onClick={resetRound}
            disabled={spinning || (drawn.length === 0 && history.length === 0)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            重設本輪
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={spinning || names.length === 0}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            清空
          </button>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          共 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{names.length}</span> 人
          {drawn.length > 0 && (
            <>
              ，已抽出 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{drawn.length}</span> 人
            </>
          )}
          {pool.length === 0 && names.length > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              {" "}
              — 所有人都已抽過，按「重設本輪」開始新一輪
            </span>
          )}
        </p>

        {history.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              中獎紀錄
            </h2>
            <ol className="flex flex-wrap gap-2">
              {history.map((name, index) => (
                <li
                  key={`${name}-${index}`}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <span className="mr-1 text-xs text-zinc-400">{index + 1}.</span>
                  {name}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ── 右側：轉盤 ── */}
      <section className="flex flex-col items-center gap-5">
        <div className="relative aspect-square w-full max-w-[440px]">
          {/* 指標 */}
          <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
            <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">
              <path
                d="M15 37 L3 6 A14 14 0 0 1 27 6 Z"
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <svg
            viewBox="0 0 400 400"
            className="h-full w-full drop-shadow-xl"
            role="img"
            aria-label={`抽獎轉盤，共 ${names.length} 位候選人`}
          >
            <circle cx={CX} cy={CY} r={R + 10} className="fill-white dark:fill-zinc-800" />

            <g
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "50% 50%",
                transformBox: "view-box",
                transition: `transform ${
                  spinning ? SPIN_MS : RESET_MS
                }ms cubic-bezier(0.16, 0.84, 0.28, 1)`,
              }}
              onTransitionEnd={(event) => {
                /* 標籤也有 transform 過場，只接受轉盤本身結束的事件 */
                if (event.target !== event.currentTarget) return;
                if (event.propertyName === "transform") finishSpin();
              }}
            >
              {names.map((name, index) => {
                const isDrawn = drawn.includes(name);
                const middle = ((index + 0.5) * 360) / names.length;
                const label = polar(middle, R * 0.6);

                return (
                  <g key={name}>
                    <path
                      d={sectorPath(index, names.length)}
                      fill={
                        isDrawn
                          ? undefined
                          : SECTOR_COLORS[index % SECTOR_COLORS.length]
                      }
                      className={isDrawn ? "fill-zinc-400 dark:fill-zinc-700" : undefined}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {showLabels && (
                      <>
                        <title>{name}</title>
                        <text
                          x={label.x}
                          y={label.y}
                          style={{
                            /*
                             * 文字跟著格子繞圈，但用反向旋轉抵消轉盤的旋轉，
                             * 讓它在螢幕上永遠是正立的。
                             * 轉盤與文字使用同一組 transition（同一段時間、
                             * 同一條緩動函數），兩者的旋轉量會精確互相抵消。
                             */
                            transform: `rotate(${labelTilt[index] - rotation}deg)`,
                            transformOrigin: `${label.x}px ${label.y}px`,
                            transformBox: "view-box",
                            transition: `transform ${
                              spinning ? SPIN_MS : RESET_MS
                            }ms cubic-bezier(0.16, 0.84, 0.28, 1)`,
                          }}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={labelSize}
                          fontWeight={600}
                          fill="#ffffff"
                          className="select-none"
                        >
                          {truncate(name, 10)}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 中間的輪軸（不隨轉盤旋轉） */}
            <circle
              cx={CX}
              cy={CY}
              r="30"
              className="fill-white stroke-zinc-300 dark:fill-zinc-100 dark:stroke-zinc-600"
              strokeWidth="3"
            />
          </svg>

          {/* 輪軸上的抽獎按鈕 */}
          <button
            type="button"
            onClick={spin}
            disabled={!canSpin}
            aria-label="抽獎"
            className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {spinning ? "…" : "抽獎"}
          </button>
        </div>

        {/* 結果 */}
        <div
          aria-live="polite"
          className="flex min-h-24 w-full max-w-[440px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          {winner ? (
            <div>
              <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                中獎者
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {winner}
              </p>
              <button
                type="button"
                onClick={removeWinner}
                disabled={spinning}
                className="mt-2 text-xs text-zinc-500 underline underline-offset-4 transition hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                從名單移除
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">
              {names.length === 0
                ? "請先輸入名單"
                : spinning
                  ? "轉盤旋轉中…"
                  : "按「抽獎」開始"}
            </p>
          )}
        </div>

        {drawn.length > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            灰色區塊為已抽出者，不會再被抽中
          </p>
        )}
      </section>
    </div>
  );
}
