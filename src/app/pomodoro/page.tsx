import type { Metadata } from "next";
import PomodoroTimer from "./PomodoroTimer";

export const metadata: Metadata = {
  title: "番茄鐘 | van-tools",
  description: "用番茄工作法專注：25 分鐘專注、5 分鐘休息，完成四輪後進入長休息。",
};

export default function PomodoroPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PomodoroTimer />
    </main>
  );
}
