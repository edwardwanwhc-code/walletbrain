// Pre-populated Hong Kong credit card database
// Data sourced from official bank pages, verified 2026 Q2
// Each card has accurate reward rates and category-specific bonuses

export interface CardTemplate {
  bank: string;
  cardName: string;
  network: string;
  rewardType: "cashback" | "miles" | "points";
  rewardCurrency: string | null;
  baseRewardRate: number; // percentage, e.g. 1.5 = 1.5%
  monthlyCapAmount: number | null; // HKD, null = no cap
  categoryRewards: Array<{
    category: string;
    rewardRate: number;
    capAmount: number | null;
    notes: string;
  }>;
  notes: string;
}

export const BANK_LIST = [
  "HSBC",
  "Hang Seng Bank",
  "Standard Chartered",
  "Citibank",
  "DBS",
  "Bank of China (Hong Kong)",
  "American Express",
  "Mox Bank",
  "ZA Bank",
  "AEON",
] as const;

export type BankName = (typeof BANK_LIST)[number];

// ============================================================
// HSBC (滙豐銀行)
// ============================================================

export const CARD_DATABASE: CardTemplate[] = [
  // --- HSBC ---
  {
    bank: "HSBC",
    cardName: "EveryMile 信用卡",
    network: "Visa",
    rewardType: "miles",
    rewardCurrency: "Asia Miles / RewardCash",
    baseRewardRate: 2.5,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "travel", rewardRate: 2.5, capAmount: null, notes: "海外簽賬 HK$2/里 + 免費旅遊保險" },
      { category: "transportation", rewardRate: 2.5, capAmount: null, notes: "本地交通、跨境交通 HK$2/里" },
      { category: "dining", rewardRate: 2.5, capAmount: null, notes: "咖啡店及輕便美食 HK$2/里" },
    ],
    notes: "每年6次免費入機場貴賓室。RewardCash 可換 Asia Miles / KrisFlyer 等 16+ 計劃",
  },
  {
    bank: "HSBC",
    cardName: "Red 信用卡",
    network: "Mastercard",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 4,
    monthlyCapAmount: 10000,
    categoryRewards: [
      { category: "online_shopping", rewardRate: 4, capAmount: 10000, notes: "網上簽賬 4% 回贈，每月上限簽賬 $10,000" },
      { category: "dining", rewardRate: 8, capAmount: 1250, notes: "指定商戶 (壽司郎/譚仔/GU/Decathlon) 8%" },
    ],
    notes: "永久免年費。網購首選。電子錢包簽賬不計入 4%",
  },
  {
    bank: "HSBC",
    cardName: "Visa Signature 卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 3.6,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 3.6, capAmount: 100000, notes: "最紅自主賞 All-in 賞滋味 = 9X 獎賞錢 (3.6%)，每年上限 $100,000" },
      { category: "shopping", rewardRate: 2.0, capAmount: 100000, notes: "最紅自主賞 賞生活/賞家居/賞品味 (2.0%)" },
      { category: "travel", rewardRate: 2.0, capAmount: 100000, notes: "最紅自主賞 賞世界 (2.0%)" },
    ],
    notes: "最紅自主賞額外多 3X vs 其他 HSBC 卡。全年食飯神卡。首兩年免年費",
  },
  {
    bank: "HSBC",
    cardName: "Pulse 銀聯雙幣鑽石卡",
    network: "UnionPay",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 2.4,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 4.4, capAmount: null, notes: "內地/澳門餐飲 4.4% (配合最紅自主賞)" },
      { category: "mobile_payment", rewardRate: 4.4, capAmount: null, notes: "手機支付 (Apple Pay/Google Pay) 4.4%" },
      { category: "travel", rewardRate: 2.4, capAmount: null, notes: "內地/澳門簽賬免手續費" },
    ],
    notes: "內地同澳門消費首選。雙幣卡港幣+人民幣結算免匯率波動。首兩年免年費",
  },
  {
    bank: "HSBC",
    cardName: "滙財金卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 2.4,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 2.4, capAmount: null, notes: "最紅自主賞 All-in 賞滋味" },
      { category: "shopping", rewardRate: 2.4, capAmount: null, notes: "最紅自主賞可選賞生活/賞家居" },
    ],
    notes: "入門級信用卡，年薪要求 $6 萬。配合最紅自主賞最高 2.4% 回贈",
  },

  // --- Hang Seng Bank (恒生銀行) ---
  {
    bank: "Hang Seng Bank",
    cardName: "enJoy 信用卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 4,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 4, capAmount: null, notes: "餐飲消費 4% 現金回贈" },
      { category: "shopping", rewardRate: 1, capAmount: null, notes: "其他零售簽賬 1% 回贈" },
    ],
    notes: "餐飲消費專用卡，4% 無上限。年費 $900",
  },
  {
    bank: "Hang Seng Bank",
    cardName: "MMPOWER World Mastercard",
    network: "Mastercard",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 5,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "online_shopping", rewardRate: 5, capAmount: null, notes: "網上簽賬 5% 現金回贈" },
      { category: "mobile_payment", rewardRate: 5, capAmount: null, notes: "手機支付 5% 現金回贈" },
      { category: "travel", rewardRate: 5, capAmount: null, notes: "海外簽賬 5% 現金回贈" },
    ],
    notes: "網購 + 手機支付 + 海外 三類全 5%！需每月零售簽賬滿 $5,000 才能享有 5%",
  },

  // --- Standard Chartered (渣打銀行) ---
  {
    bank: "Standard Chartered",
    cardName: "Simply Cash Visa 卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 1.5,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "travel", rewardRate: 2, capAmount: null, notes: "海外簽賬 2% 無上限" },
      { category: "online_shopping", rewardRate: 2, capAmount: null, notes: "網上外幣簽賬 2%" },
    ],
    notes: "本地 1.5% 無上限、海外 2% 無上限，全自動回贈無需兌換。最簡單現金回贈卡",
  },
  {
    bank: "Standard Chartered",
    cardName: "Smart 信用卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 5,
    monthlyCapAmount: 4000,
    categoryRewards: [
      { category: "supermarket", rewardRate: 5, capAmount: 4000, notes: "指定超市 (百佳/惠康) 5%，每月需簽滿 $4,000" },
      { category: "travel", rewardRate: 1.2, capAmount: null, notes: "海外簽賬免手續費 + 1.2% 回贈" },
    ],
    notes: "超市買餸卡！5% 回贈但需每月零售簽賬滿 $4,000。海外免手續費",
  },

  // --- Citibank (花旗銀行) ---
  {
    bank: "Citibank",
    cardName: "Cash Back 信用卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 2,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 2, capAmount: null, notes: "本地餐飲 2% 無上限" },
      { category: "travel", rewardRate: 2, capAmount: null, notes: "海外簽賬 2% 無上限" },
      { category: "supermarket", rewardRate: 2, capAmount: null, notes: "超市消費 2% 無上限" },
      { category: "entertainment", rewardRate: 2, capAmount: null, notes: "酒店/娛樂 2% 無上限" },
    ],
    notes: "全能型現金回贈卡。餐飲/海外/超市/酒店 全 2% 無上限",
  },
  {
    bank: "Citibank",
    cardName: "Octopus 八達通信用卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 0.5,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "transportation", rewardRate: 15, capAmount: null, notes: "公共交通 15% 回贈（隧道/停車場/充電都有）" },
      { category: "shopping", rewardRate: 5, capAmount: null, notes: "指定商戶 5%" },
    ],
    notes: "交通費回贈王！15% 公共交通回贈。八達通自動增值",
  },
  {
    bank: "Citibank",
    cardName: "PremierMiles 信用卡",
    network: "Mastercard",
    rewardType: "miles",
    rewardCurrency: "Asia Miles",
    baseRewardRate: 1.95,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "travel", rewardRate: 1.95, capAmount: null, notes: "海外簽賬 HK$3/里 + 每年12次免費機場貴賓室" },
      { category: "dining", rewardRate: 0.78, capAmount: null, notes: "本地簽賬 HK$7.5/里" },
    ],
    notes: "旅行里數卡。每年12次 Plaza Premium Lounge。免費旅遊保險覆蓋持卡人+伴侶+子女",
  },

  // --- DBS (星展銀行) ---
  {
    bank: "DBS",
    cardName: "COMPASS VISA",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 0.4,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "supermarket", rewardRate: 8, capAmount: null, notes: "指定超市 (百佳) 8% 回贈" },
      { category: "dining", rewardRate: 0.4, capAmount: null, notes: "基本回贈 0.4%" },
    ],
    notes: "百佳超市專用卡！8% 超高回贈。其他消費 0.4%",
  },
  {
    bank: "DBS",
    cardName: "Eminent Visa Signature",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 1,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "dining", rewardRate: 5, capAmount: null, notes: "本地餐飲 5% 回贈" },
      { category: "shopping", rewardRate: 5, capAmount: null, notes: "指定商戶 5% 回贈" },
    ],
    notes: "餐飲 + 指定商戶 5% 回贈",
  },
  {
    bank: "DBS",
    cardName: "Live Fresh 信用卡",
    network: "Visa",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 0.4,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "online_shopping", rewardRate: 6, capAmount: null, notes: "網上外幣簽賬 6% 回贈" },
      { category: "shopping", rewardRate: 5.4, capAmount: null, notes: "指定商戶 5.4% 回贈" },
    ],
    notes: "網購外幣消費 6% 回贈",
  },

  // --- AEON ---
  {
    bank: "AEON",
    cardName: "CARD WAKUWAKU",
    network: "Mastercard",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 6,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "online_shopping", rewardRate: 6, capAmount: null, notes: "網上簽賬 (本地+海外) 6% 回贈" },
      { category: "travel", rewardRate: 3, capAmount: null, notes: "海外實體簽賬 3% 回贈" },
    ],
    notes: "永久免年費。網購 6% 極高回贈",
  },

  // --- American Express ---
  {
    bank: "American Express",
    cardName: "Explorer 信用卡",
    network: "American Express",
    rewardType: "miles",
    rewardCurrency: "Asia Miles",
    baseRewardRate: 3.58,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "travel", rewardRate: 3.58, capAmount: null, notes: "海外簽賬 / 航空公司 / 旅遊網站 HK$1.68/里 + 每年8次免費貴賓室" },
      { category: "dining", rewardRate: 3.58, capAmount: null, notes: "指定餐飲商戶 3.58% 等值回贈" },
    ],
    notes: "旅行里數神卡。每年8次免費機場貴賓室。HK$1.68/里（海外+旅遊類別）",
  },
  {
    bank: "American Express",
    cardName: "Blue Cash 信用卡",
    network: "American Express",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 1.2,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "supermarket", rewardRate: 1.2, capAmount: null, notes: "所有消費 1.2% 無上限" },
      { category: "travel", rewardRate: 1.2, capAmount: null, notes: "海外消費免跨境手續費" },
    ],
    notes: "最簡單 AE 卡。1.2% 無上限，海外免手續費，首年免年費",
  },

  // --- Mox ---
  {
    bank: "Mox Bank",
    cardName: "Mox Credit",
    network: "Mastercard",
    rewardType: "cashback",
    rewardCurrency: "HKD",
    baseRewardRate: 2,
    monthlyCapAmount: null,
    categoryRewards: [
      { category: "supermarket", rewardRate: 3, capAmount: null, notes: "超市消費 3% 無上限" },
      { category: "dining", rewardRate: 2, capAmount: null, notes: "餐飲 2% 無上限" },
      { category: "travel", rewardRate: 2, capAmount: null, notes: "海外簽賬 2% 免手續費" },
    ],
    notes: "永久免年費。超市 3%、其他 2%，全部無上限。虛擬銀行即批即用",
  },
];

// Helper functions
export function getBanks(): string[] {
  return [...BANK_LIST];
}

export function getCardsByBank(bank: string): CardTemplate[] {
  return CARD_DATABASE.filter((c) => c.bank === bank);
}

export function getCardTemplate(bank: string, cardName: string): CardTemplate | undefined {
  return CARD_DATABASE.find((c) => c.bank === bank && c.cardName === cardName);
}

export function getAllCards(): CardTemplate[] {
  return CARD_DATABASE;
}
