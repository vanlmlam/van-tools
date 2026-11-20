import type { Metadata } from "next";
import WheelTool from "./WheelTool";

export const metadata: Metadata = {
  title: "抽獎轉盤 | van-tools",
  description: "輸入名單，轉動轉盤抽出中獎者。",
};

export default function WheelPage() {
  return (
    <main className="flex flex-1 flex-col">
      <WheelTool />
    </main>
  );
}
