export type Level =
  | "大吉"
  | "吉"
  | "中吉"
  | "小吉"
  | "平"
  | "小凶"
  | "中凶"
  | "凶"
  | "大凶";

export type Sign = {
  /** 籤號 */
  no: number;
  level: Level;
  /** 今日運勢分數（0～100） */
  score: number;
  /** 籤詩 */
  poem: string;
  /** 建議 */
  advice: string;
};

export const SIGNS: Sign[] = [
  {
    no: 1,
    level: "大吉",
    score: 95,
    poem: "雲開月出掛天邊，好景從此向前排。",
    advice: "想做什麼就去做，心願多半會成。",
  },
  {
    no: 2,
    level: "吉",
    score: 88,
    poem: "春水初生暖，江帆一路開。",
    advice: "順著自己的節奏走，不必跟別人比。",
  },
  {
    no: 3,
    level: "中吉",
    score: 80,
    poem: "半山雲霧散，前路漸分明。",
    advice: "把第一步走穩，剩下的路會自己浮現。",
  },
  {
    no: 4,
    level: "小吉",
    score: 72,
    poem: "細雨初晴時，禾苗漸漸長。",
    advice: "進度不快也沒關係，正在生長就是好事。",
  },
  {
    no:  5,
    level: "中吉",
    score: 78,
    poem: "風正帆滿時，宜行遠路。",
    advice: "難得的好運勢，別客氣，拿出來用。",
  },
  {
    no: 6,
    level: "小吉",
    score: 70,
    poem: "舊友一通電話，轉機自此生。",
    advice: "回頭看看很久沒聯絡的人。",
  },
  {
    no: 7,
    level: "平",
    score: 60,
    poem: "潮平風靜水，慢慢來就好。",
    advice: "今天沒有驚喜，也沒有意外，安穩最好。",
  },
  {
    no: 8,
    level: "小凶",
    score: 48,
    poem: "門前有車一輛，繞行無大礙。",
    advice: "行程留一點餘地，別把自己排太滿。",
  },
  {
    no: 9,
    level: "中凶",
    score: 42,
    poem: "烏雲遮半日，暫時莫著急。",
    advice: "事情卡住就先放著，換個時間再講。",
  },
  {
    no: 10,
    level: "凶",
    score: 35,
    poem: "逆風舟行慢，收帆待時來。",
    advice: "別硬撐，退一步、保存實力最重要。",
  },
  {
    no: 11,
    level: "大凶",
    score: 25,
    poem: "雷雨忽而過，靜候月明時。",
    advice: "今天什麼都別勉強，睡一覺再說。",
  },
  {
    no: 12,
    level: "大吉",
    score: 93,
    poem: "久旱逢甘霖，舊願今朝成。",
    advice: "擱置很久的事，今天重啟剛好。",
  },
  {
    no: 13,
    level: "吉",
    score: 85,
    poem: "燈下文章成，抬頭見月明。",
    advice: "你準備很久的事，會被看見。",
  },
  {
    no: 14,
    level: "小吉",
    score: 68,
    poem: "細雨濕青苔，路上小心滑。",
    advice: "人際上要說話直接一點，少猜測。",
  },
  {
    no: 15,
    level: "平",
    score: 58,
    poem: "流水不爭先，先到者先安。",
    advice: "順序照舊就好，別臨時改流程。",
  },
  {
    no: 16,
    level: "小凶",
    score: 45,
    poem: "路中有石一塊，繞一步無妨。",
    advice: "小麻煩別硬碰，繞路反而更快。",
  },
  {
    no: 17,
    level: "中凶",
    score: 40,
    poem: "霧中看山山，不見本來形。",
    advice: "今天資訊很亂，先確認再回覆。",
  },
  {
    no: 18,
    level: "吉",
    score: 82,
    poem: "秋收滿倉時，回鄉喜訊多。",
    advice: "家裡、朋友那邊會有好消息。",
  },
  {
    no: 19,
    level: "中吉",
    score: 76,
    poem: "烹茶得真味，對坐可長談。",
    advice: "約人吃飯聊天，比加班划算。",
  },
  {
    no: 20,
    level: "大吉",
    score: 91,
    poem: "月滿中庭時，團圓好運來。",
    advice: "今天適合和重要的人待在一起。",
  },
  {
    no: 21,
    level: "小吉",
    score: 74,
    poem: "枝頭新芽出，慢慢也會長。",
    advice: "種子剛下，不必天天挖出來看。",
  },
  {
    no: 22,
    level: "平",
    score: 55,
    poem: "水到橋頭時，自然有人應。",
    advice: "需要幫忙就開口，別自己硬扛。",
  },
  {
    no: 23,
    level: "中凶",
    score: 44,
    poem: "夜行風頗大，記得添件衣。",
    advice: "小心疲勞與失誤，細節多檢查一次。",
  },
  {
    no: 24,
    level: "小凶",
    score: 50,
    poem: "抽屜深處處，藏著小確幸。",
    advice: "表面不順，翻一翻舊東西會有收穫。",
  },
];

export type DimensionKey = "overall" | "work" | "love" | "money" | "health";

export const DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: "overall", label: "整體運勢" },
  { key: "work", label: "事業" },
  { key: "love", label: "感情" },
  { key: "money", label: "財運" },
  { key: "health", label: "健康" },
];

/** 各面向在不同分數帶的說法，由 band 0（最好）到 band 4（最差） */
const DIMENSION_WORDS: Record<DimensionKey, string[]> = {
  overall: ["事事順心", "穩步前進", "平安普通", "起伏較大", "宜守不宜攻"],
  work: ["衝勁十足", "順利推進", "照常進行", "略有阻滯", "先整頓再出發"],
  love: ["桃花正盛", "甜甜蜜蜜", "平淡如水", "需要耐心", "先顧好自己"],
  money: ["意外之財", "進帳穩定", "量入為出", "花錢偏多", "守財為上"],
  health: ["精神奕奕", "體力充沛", "尚可", "略感疲累", "多多休息"],
};

/** 決定性的雜訊，讓每支籤的五個面向略有不同，但每次看都一樣 */
function noise(no: number, salt: number): number {
  let x = (Math.imul(no + 1, 2654435761) + Math.imul(salt + 7, 40503)) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function band(score: number): number {
  if (score >= 85) return 0;
  if (score >= 70) return 1;
  if (score >= 52) return 2;
  if (score >= 38) return 3;
  return 4;
}

export type Dimension = {
  key: DimensionKey;
  label: string;
  score: number;
  word: string;
};

export function dimensionsOf(sign: Sign): Dimension[] {
  const salts: Record<DimensionKey, number> = {
    overall: 1,
    work: 2,
    love: 3,
    money: 4,
    health: 5,
  };

  return DIMENSIONS.map(({ key, label }) => {
    const score =
      key === "overall"
        ? sign.score
        : Math.max(
            0,
            Math.min(100, sign.score + Math.round((noise(sign.no, salts[key]) - 0.5) * 24)),
          );

    return { key, label, score, word: DIMENSION_WORDS[key][band(score)] };
  });
}
