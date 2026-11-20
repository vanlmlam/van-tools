"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSyncExternalStore } from "react";

type Mode = "focus" | "short" | "long";

type Stored = {
  task: string;
  durations: Record<Mode, number>;
  completed: number;
  day: string;
  autoStart: boolean;
};

const STORAGE_KEY = "van-tools.pomodoro";

const DEFAULT_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABEL: Record<Mode, string> = {
  focus: "專注",
  short: "短休息",
  long: "長休息",
};

const MODE_RING: Record<Mode, string> = {
  focus: "text-emerald-500",
  short: "text-sky-500",
  long: "text-violet-500",
};

const MODE_TEXT: Record<Mode, string> = {
  focus: "text-emerald-600 dark:text-emerald-400",
  short: "text-sky-600 dark:text-sky-400",
  long: "text-violet-600 dark:text-violet-400",
};

const LONG_BREAK_EVERY = 4;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const DEFAULTS: Stored = {
  task: "",
  durations: DEFAULT_DURATIONS,
  completed: 0,
  day: "",
  autoStart: true,
};

/* ── localStorage 讀寫 ──
 * 用 useSyncExternalStore 讀取，避免 hydration 時使用 server snapshot。
 * 寫入後手動派發 storage 事件，讓同一個分頁也能收到更新。
 */

let cache: { raw: string; value: Stored } | null = null;

function parseStored(raw: string): Stored {
  if (cache && cache.raw === raw) return cache.value;

  let value: Stored = {
    ...DEFAULTS,
    durations: { ...DEFAULT_DURATIONS },
  };

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Stored>;
      value = {
        task: typeof parsed.task === "string" ? parsed.task : "",
        durations: { ...DEFAULT_DURATIONS, ...(parsed.durations ?? {}) },
        completed: typeof parsed.completed === "number" ? parsed.completed : 0,
        day: typeof parsed.day === "string" ? parsed.day : "",
        autoStart: parsed.autoStart !== false,
      };
    } catch {
      /* 資料損毀就退回預設值 */
    }
  }

  /* 跨日就歸零 */
  if (value.day !== todayKey()) value.completed = 0;

  cache = { raw, value };
  return value;
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStored(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStored(value: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    /* localStorage 不可用時忽略 */
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const raw = useSyncExternalStore(subscribeToStorage, readStored, () => "");
  const saved = useMemo(() => parseStored(raw), [raw]);

  const [mode, setMode] = useState<Mode>("focus");
  /* null 代表「尚未開始」，顯示整段時長 */
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notifyState, setNotifyState] = useState<"default" | "granted" | "denied">(
    "default",
  );

  const endAtRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const modeRef = useRef<Mode>("focus");
  const savedRef = useRef(saved);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  const full = saved.durations[mode];
  const display = Math.max(0, Math.min(full, remaining ?? full));
  const progress = full > 0 ? 1 - display / full : 0;

  /* ── 提示音 ── */
  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") {
        void audioRef.current.resume();
      }
    } catch {
      /* 沒有音訊支援就靜默略過 */
    }
  }, []);

  const playChime = useCallback(() => {
    if (muted) return;
    try {
      ensureAudio();
      const ctx = audioRef.current;
      if (!ctx) return;

      const start = ctx.currentTime;
      [880, 1174.66, 1567.98].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = start + index * 0.16;

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.22, at + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);

        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.6);
      });
    } catch {
      /* 播放失敗不影響計時 */
    }
  }, [ensureAudio, muted]);

  const sendNotification = useCallback(() => {
    try {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      const finished = MODE_LABEL[modeRef.current];
      new Notification("番茄鐘", {
        body: `${finished}結束囉，休息一下吧！`,
      });
    } catch {
      /* 通知失敗不影響計時 */
    }
  }, []);

  const switchTo = useCallback((next: Mode, autoStart: boolean) => {
    modeRef.current = next;
    setMode(next);
    setRemaining(null);
    endAtRef.current = null;

    if (autoStart) {
      endAtRef.current = Date.now() + savedRef.current.durations[next] * 1000;
      setRunning(true);
    } else {
      setRunning(false);
    }
  }, []);

  const finish = useCallback(() => {
    playChime();
    sendNotification();

    const store = savedRef.current;

    if (modeRef.current === "focus") {
      const next = store.completed + 1;
      writeStored({ ...store, completed: next, day: todayKey() });
      switchTo(next % LONG_BREAK_EVERY === 0 ? "long" : "short", store.autoStart);
    } else {
      switchTo("focus", store.autoStart);
    }
  }, [playChime, sendNotification, switchTo]);

  /* ── 計時迴圈 ──
   * 以「結束時間戳」計算剩餘時間，背景分頁被瀏覽器降頻也不會走鐘。
   */
  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt === null) return;

      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);

      if (left <= 0) {
        endAtRef.current = null;
        setRunning(false);
        finish();
      }
    };

    const id = window.setInterval(tick, 200);
    tick();
    return () => window.clearInterval(id);
  }, [running, finish]);

  const toggle = useCallback(() => {
    if (running) {
      const endAt = endAtRef.current;
      if (endAt !== null) {
        setRemaining(Math.max(0, Math.round((endAt - Date.now()) / 1000)));
      }
      endAtRef.current = null;
      setRunning(false);
      return;
    }

    ensureAudio();
    const base = remaining ?? saved.durations[mode];
    endAtRef.current = Date.now() + base * 1000;
    setRunning(true);
  }, [running, remaining, saved.durations, mode, ensureAudio]);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setRunning(false);
    setRemaining(null);
  }, []);

  /* 空白鍵開始／暫停 */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  /* 標題列顯示倒數 */
  useEffect(() => {
    document.title = running
      ? `${formatTime(display)} · ${MODE_LABEL[mode]} | van-tools`
      : `${MODE_LABEL[mode]} | van-tools`;
  }, [running, display, mode]);

  const updateSettings = (patch: Partial<Stored>) => {
    writeStored({ ...saved, ...patch });
  };

  const updateDuration = (next: Mode, minutes: number) => {
    const clamped = Math.max(1, Math.min(180, minutes));
    updateSettings({
      durations: { ...saved.durations, [next]: clamped * 60 },
    });
    if (next === mode) reset();
  };

  const requestNotifications = async () => {
    try {
      if (typeof Notification === "undefined") return;
      const permission = await Notification.requestPermission();
      setNotifyState(permission === "granted" ? "granted" : "denied");
    } catch {
      setNotifyState("denied");
    }
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const cycleDone = saved.completed % LONG_BREAK_EVERY;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col items-center">
        {/* 模式切換 */}
        <div
          role="tablist"
          aria-label="計時模式"
          className="inline-flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800"
        >
          {(Object.keys(MODE_LABEL) as Mode[]).map((key) => {
            const active = key === mode;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTo(key, false)}
                disabled={running}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
                  active
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {MODE_LABEL[key]}
              </button>
            );
          })}
        </div>

        {/* 倒數圓環 */}
        <div className="relative mt-8 h-64 w-64 sm:h-72 sm:w-72">
          <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90">
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              strokeWidth="12"
              className="stroke-zinc-200 dark:stroke-zinc-800"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className={`${MODE_RING[mode]} transition-[stroke-dashoffset] duration-200 ease-linear`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-sm font-medium tracking-wide ${MODE_TEXT[mode]}`}
            >
              {MODE_LABEL[mode]}
            </span>
            <span className="mt-1 font-mono text-5xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              {formatTime(display)}
            </span>
          </div>
        </div>

        {/* 目前任務 */}
        <input
          value={saved.task}
          onChange={(event) => updateSettings({ task: event.target.value })}
          placeholder="這次要專注做什麼？（可留空）"
          aria-label="目前任務"
          className="mt-6 w-full max-w-md rounded-full border border-zinc-200 bg-white px-4 py-2 text-center text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
        />

        {/* 控制 */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {running ? "暫停" : "開始"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={!running && remaining === null}
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            重設
          </button>
        </div>

        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          按空白鍵可以開始或暫停
        </p>

        {/* 統計與輪次 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2" aria-hidden="true">
            {Array.from({ length: LONG_BREAK_EVERY }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${
                  index < cycleDone
                    ? "bg-emerald-500"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            今日已完成{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {saved.completed}
            </span>{" "}
            個番茄
            {cycleDone > 0 && `（再完成 ${LONG_BREAK_EVERY - cycleDone} 個進入長休息）`}
          </p>
        </div>

        {/* 設定 */}
        <div className="mt-8 w-full max-w-md">
          <button
            type="button"
            onClick={() => setShowSettings((value) => !value)}
            aria-expanded={showSettings}
            className="text-sm text-zinc-500 underline underline-offset-4 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {showSettings ? "收合設定" : "調整設定"}
          </button>

          {showSettings && (
            <div className="mt-4 space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-3 gap-3">
                {(["focus", "short", "long"] as Mode[]).map((key) => (
                  <label key={key} className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {MODE_LABEL[key]}（分鐘）
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={Math.round(saved.durations[key] / 60)}
                      onChange={(event) =>
                        updateDuration(key, Number(event.target.value) || 1)
                      }
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-600"
                    />
                  </label>
                ))}
              </div>

              <label className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">
                  階段結束後自動開始下一階段
                </span>
                <input
                  type="checkbox"
                  checked={saved.autoStart}
                  onChange={(event) =>
                    updateSettings({ autoStart: event.target.checked })
                  }
                  className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={muted}
                    onChange={(event) => setMuted(event.target.checked)}
                    className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="text-zinc-600 dark:text-zinc-300">靜音</span>
                </label>

                <button
                  type="button"
                  onClick={requestNotifications}
                  className="text-sm text-zinc-500 underline underline-offset-4 transition hover:text-zinc-900 disabled:no-underline dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {notifyState === "granted"
                    ? "桌面通知已開啟"
                    : notifyState === "denied"
                      ? "桌面通知已被拒絕"
                      : "開啟桌面通知"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
