import type { Metadata } from "next";
import FortuneSticks from "./FortuneSticks";

export const metadata: Metadata = {
  title: "運籤 | van-tools",
  description: "搖一搖籤筒，隨機抽一支籤，看看今天的運勢。",
};

export default function FortunePage() {
  return (
    <main className="flex flex-1 flex-col">
      <FortuneSticks />
    </main>
  );
}
