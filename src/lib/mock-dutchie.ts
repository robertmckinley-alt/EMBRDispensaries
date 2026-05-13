import type { DutchieFinancialPeriod, DutchieInventorySummary, DutchieProductSummary, DutchieSyncResult } from "@/lib/dutchie";
import type { DutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";

export type Period = "weekly" | "monthly";

export type Kpi = {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
  detail: string;
  series: number[];
};

export type ComparisonMetric = {
  label: string;
  current: string;
  previous: string;
  delta: string;
  percent: string;
  direction: "up" | "down" | "flat";
  detail: string;
};

export type RevenuePoint = {
  label: string;
  revenue: number;
  transactions: number;
};

export type CategoryMix = {
  label: string;
  value: number;
  color: string;
};

export type InventorySignal = {
  label: string;
  value: number;
  detail: string;
  tone: "good" | "warn" | "risk";
};

export type StoreStatus = "Healthy" | "Watch" | "Action";

export type StoreSnapshot = {
  id: string;
  name: string;
  city: string;
  market: string;
  priorWeekRevenue: string;
  priorWeekGross: string;
  priorWeekNet: string;
  priorWeekTransactions: string;
  averageBasket: string;
  monthToDateNet: string;
  inventory: string;
  status: StoreStatus;
  change: string;
  comparison: {
    netSales: ComparisonMetric;
    transactions: ComparisonMetric;
    averageTicket: ComparisonMetric;
  };
};

export type BudtenderMetric = {
  name: string;
  store: string;
  transactions: number;
  grossSales: string;
  netSales: string;
  discounts: string;
  averageBasket: string;
  units: number;
};

export type ProductVelocity = {
  name: string;
  category: string;
  units: number;
  revenue: string;
  trend: string;
  sku?: string;
  brand?: string;
  vendor?: string;
  avgNetPrice?: string;
  margin?: string;
  marginDollars?: string;
  lineItems?: ProductVelocityLineItem[];
};

export type ProductVelocityLineItem = {
  productId: number;
  sku: string;
  name: string;
  brand: string;
  vendor: string;
  category: string;
  units: number;
  revenue: string;
  avgNetPrice: string;
  margin: string;
  marginDollars: string;
};

export type Alert = {
  title: string;
  body: string;
  tone: "good" | "warn" | "risk";
};

export type DashboardData = {
  period: Period;
  title: string;
  subtitle: string;
  lastSync: string;
  dateRange: string;
  periodContext: PeriodContext;
  comparisonTitle: string;
  comparisons: ComparisonMetric[];
  kpis: Kpi[];
  revenueSeries: RevenuePoint[];
  categoryMix: CategoryMix[];
  inventorySignals: InventorySignal[];
  stores: StoreSnapshot[];
  products: ProductVelocity[];
  budtenders: {
    top: BudtenderMetric[];
    bottom: BudtenderMetric[];
  };
  alerts: Alert[];
};

export type StoreReport = {
  store: StoreSnapshot;
  period: Period;
  title: string;
  subtitle: string;
  dateRange: string;
  periodContext: PeriodContext;
  comparisonTitle: string;
  comparisons: ComparisonMetric[];
  kpis: Kpi[];
  revenueSeries: RevenuePoint[];
  categoryMix: CategoryMix[];
  inventorySignals: InventorySignal[];
  inventoryItems: DutchieInventorySummary[];
  products: ProductVelocity[];
  budtenders: {
    top: BudtenderMetric[];
    bottom: BudtenderMetric[];
  };
  alerts: Alert[];
};

export type PeriodContext = {
  currentPeriod: string;
  comparisonPeriod: string;
  basis: string;
  includedStores: string;
  excludedStores: string;
  source: string;
  lastSync: string;
};

const rawStores: StoreSnapshot[] = [
  {
    id: "springfield",
    name: "EMBR Springfield",
    city: "Springfield",
    market: "Adult-use",
    priorWeekRevenue: "$112.4K",
    priorWeekGross: "$121.8K",
    priorWeekNet: "$112.4K",
    priorWeekTransactions: "1,782",
    averageBasket: "$63.08",
    monthToDateNet: "$453.8K",
    inventory: "82%",
    status: "Healthy",
    change: "+9.8%",
    comparison: {
      netSales: { label: "Net sales", current: "$112.4K", previous: "$102.4K", delta: "+$10.0K", percent: "+9.8%", direction: "up", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "1,782", previous: "1,656", delta: "+126", percent: "+7.6%", direction: "up", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$63.08", previous: "$61.75", delta: "+$1.33", percent: "+2.2%", direction: "up", detail: "net per ticket" }
    }
  },
  {
    id: "northampton",
    name: "EMBR Northampton",
    city: "Northampton",
    market: "Mixed",
    priorWeekRevenue: "$94.7K",
    priorWeekGross: "$103.1K",
    priorWeekNet: "$94.7K",
    priorWeekTransactions: "1,489",
    averageBasket: "$63.60",
    monthToDateNet: "$381.2K",
    inventory: "76%",
    status: "Watch",
    change: "+7.1%",
    comparison: {
      netSales: { label: "Net sales", current: "$94.7K", previous: "$88.4K", delta: "+$6.3K", percent: "+7.1%", direction: "up", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "1,489", previous: "1,417", delta: "+72", percent: "+5.1%", direction: "up", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$63.60", previous: "$62.43", delta: "+$1.17", percent: "+1.9%", direction: "up", detail: "net per ticket" }
    }
  },
  {
    id: "fyre-ants",
    name: "FYRE ANTS",
    city: "FYRE ANTS",
    market: "Adult-use",
    priorWeekRevenue: "$84.1K",
    priorWeekGross: "$91.5K",
    priorWeekNet: "$84.1K",
    priorWeekTransactions: "1,352",
    averageBasket: "$62.20",
    monthToDateNet: "$340.6K",
    inventory: "88%",
    status: "Healthy",
    change: "+5.9%",
    comparison: {
      netSales: { label: "Net sales", current: "$84.1K", previous: "$79.4K", delta: "+$4.7K", percent: "+5.9%", direction: "up", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "1,352", previous: "1,286", delta: "+66", percent: "+5.1%", direction: "up", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$62.20", previous: "$61.73", delta: "+$0.47", percent: "+0.8%", direction: "up", detail: "net per ticket" }
    }
  },
  {
    id: "la-mesa",
    name: "EMBR La Mesa",
    city: "La Mesa",
    market: "Adult-use",
    priorWeekRevenue: "$76.8K",
    priorWeekGross: "$84.6K",
    priorWeekNet: "$76.8K",
    priorWeekTransactions: "1,227",
    averageBasket: "$62.59",
    monthToDateNet: "$307.4K",
    inventory: "69%",
    status: "Watch",
    change: "+14.0%",
    comparison: {
      netSales: { label: "Net sales", current: "$76.8K", previous: "$67.4K", delta: "+$9.4K", percent: "+14.0%", direction: "up", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "1,227", previous: "1,073", delta: "+154", percent: "+14.4%", direction: "up", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$62.59", previous: "$62.80", delta: "-$0.21", percent: "-0.3%", direction: "down", detail: "net per ticket" }
    }
  },
  {
    id: "lake-elsinore",
    name: "EMBR Lake Elsinore",
    city: "Lake Elsinore",
    market: "Adult-use",
    priorWeekRevenue: "$60.6K",
    priorWeekGross: "$66.2K",
    priorWeekNet: "$60.6K",
    priorWeekTransactions: "992",
    averageBasket: "$61.09",
    monthToDateNet: "$237.1K",
    inventory: "63%",
    status: "Action",
    change: "-3.4%",
    comparison: {
      netSales: { label: "Net sales", current: "$60.6K", previous: "$62.7K", delta: "-$2.1K", percent: "-3.4%", direction: "down", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "992", previous: "1,028", delta: "-36", percent: "-3.5%", direction: "down", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$61.09", previous: "$61.05", delta: "+$0.04", percent: "+0.1%", direction: "up", detail: "net per ticket" }
    }
  },
  {
    id: "hlc-greenfield",
    name: "HLC Greenfield",
    city: "Greenfield",
    market: "Adult-use",
    priorWeekRevenue: "$71.2K",
    priorWeekGross: "$77.9K",
    priorWeekNet: "$71.2K",
    priorWeekTransactions: "1,124",
    averageBasket: "$63.35",
    monthToDateNet: "$291.5K",
    inventory: "81%",
    status: "Healthy",
    change: "+6.5%",
    comparison: {
      netSales: { label: "Net sales", current: "$71.2K", previous: "$66.9K", delta: "+$4.3K", percent: "+6.5%", direction: "up", detail: "vs previous week" },
      transactions: { label: "Transactions", current: "1,124", previous: "1,043", delta: "+81", percent: "+7.8%", direction: "up", detail: "ticket count" },
      averageTicket: { label: "Avg net ticket", current: "$63.35", previous: "$64.13", delta: "-$0.78", percent: "-1.2%", direction: "down", detail: "net per ticket" }
    }
  }
];

export const stores: StoreSnapshot[] = rawStores.map(normalizeStore);

const weeklyBudtenders: BudtenderMetric[] = [
  { name: "Maya R.", store: "EMBR Springfield", transactions: 248, grossSales: "$18.9K", netSales: "$17.6K", discounts: "$1.3K", averageBasket: "$70.96", units: 721 },
  { name: "Chris T.", store: "EMBR La Mesa", transactions: 226, grossSales: "$16.8K", netSales: "$15.9K", discounts: "$0.9K", averageBasket: "$70.35", units: 664 },
  { name: "Jordan P.", store: "EMBR Northampton", transactions: 219, grossSales: "$15.7K", netSales: "$14.8K", discounts: "$0.9K", averageBasket: "$67.58", units: 619 },
  { name: "Sam K.", store: "HLC Greenfield", transactions: 107, grossSales: "$6.3K", netSales: "$5.7K", discounts: "$0.6K", averageBasket: "$53.27", units: 284 },
  { name: "Taylor N.", store: "EMBR Lake Elsinore", transactions: 98, grossSales: "$5.8K", netSales: "$5.1K", discounts: "$0.7K", averageBasket: "$52.04", units: 251 },
  { name: "Avery L.", store: "FYRE ANTS", transactions: 91, grossSales: "$5.2K", netSales: "$4.7K", discounts: "$0.5K", averageBasket: "$51.65", units: 229 }
].map(normalizeBudtender);

const monthlyBudtenders: BudtenderMetric[] = [
  { name: "Maya R.", store: "EMBR Springfield", transactions: 934, grossSales: "$72.4K", netSales: "$67.8K", discounts: "$4.6K", averageBasket: "$72.59", units: 2761 },
  { name: "Chris T.", store: "EMBR La Mesa", transactions: 891, grossSales: "$65.1K", netSales: "$61.0K", discounts: "$4.1K", averageBasket: "$68.46", units: 2527 },
  { name: "Jordan P.", store: "EMBR Northampton", transactions: 846, grossSales: "$61.8K", netSales: "$57.9K", discounts: "$3.9K", averageBasket: "$68.44", units: 2408 },
  { name: "Sam K.", store: "HLC Greenfield", transactions: 406, grossSales: "$24.3K", netSales: "$22.0K", discounts: "$2.3K", averageBasket: "$54.19", units: 1102 },
  { name: "Taylor N.", store: "EMBR Lake Elsinore", transactions: 378, grossSales: "$21.9K", netSales: "$19.4K", discounts: "$2.5K", averageBasket: "$51.32", units: 978 },
  { name: "Avery L.", store: "FYRE ANTS", transactions: 351, grossSales: "$19.8K", netSales: "$17.8K", discounts: "$2.0K", averageBasket: "$50.71", units: 905 }
].map(normalizeBudtender);

const weekly: DashboardData = {
  period: "weekly",
  title: "Previous week snapshot",
  subtitle: "Six-store owner view with store report links",
  lastSync: "Today, 6:12 AM",
  dateRange: "May 4 - May 10, 2026",
  periodContext: {
    currentPeriod: "May 4 - May 10, 2026",
    comparisonPeriod: "Apr 27 - May 3, 2026",
    basis: "Net sales after discounts; avg net ticket is net sales divided by transaction count.",
    includedStores: "6 of 6 sample stores",
    excludedStores: "None",
    source: "Mock fallback completed Monday-Sunday week",
    lastSync: "Today, 6:12 AM"
  },
  comparisonTitle: "Week over week, net basis",
  comparisons: [
    { label: "Net sales", current: "$499.8K", previous: "$462.4K", delta: "+$37.4K", percent: "+8.1%", direction: "up", detail: "current week vs previous week" },
    { label: "Transactions", current: "7,966", previous: "7,529", delta: "+437", percent: "+5.8%", direction: "up", detail: "ticket count change" },
    { label: "Avg net ticket", current: "$62.74", previous: "$61.41", delta: "+$1.33", percent: "+2.2%", direction: "up", detail: "net sales per ticket" },
    { label: "Net sales / day", current: "$71.4K", previous: "$66.1K", delta: "+$5.3K", percent: "+8.1%", direction: "up", detail: "daily net run-rate" }
  ],
  kpis: [
    { label: "Net sales", value: "$499.8K", change: "+$37.4K", direction: "up", detail: "week over week", series: [36, 43, 40, 48, 55, 62, 67] },
    { label: "Transactions", value: "7,966", change: "+5.8%", direction: "up", detail: "avg 1,138 per day", series: [52, 58, 49, 61, 64, 70, 73] },
    { label: "Avg net ticket", value: "$62.74", change: "+2.7%", direction: "up", detail: "net sales per ticket", series: [46, 44, 47, 52, 54, 57, 60] },
    { label: "At-risk inventory", value: "41 SKUs", change: "-12", direction: "down", detail: "needs reorder review", series: [72, 68, 64, 60, 55, 51, 44] }
  ],
  revenueSeries: [
    { label: "Wed", revenue: 63500, transactions: 1031 },
    { label: "Thu", revenue: 69400, transactions: 1116 },
    { label: "Fri", revenue: 79100, transactions: 1261 },
    { label: "Sat", revenue: 86600, transactions: 1374 },
    { label: "Sun", revenue: 72100, transactions: 1183 },
    { label: "Mon", revenue: 61600, transactions: 997 },
    { label: "Tue", revenue: 67480, transactions: 1004 }
  ],
  categoryMix: [
    { label: "Flower", value: 34, color: "#56d68a" },
    { label: "Vapes", value: 24, color: "#5cc7d7" },
    { label: "Pre-rolls", value: 17, color: "#f3c969" },
    { label: "Edibles", value: 15, color: "#f07f6b" },
    { label: "Other", value: 10, color: "#b9a7ff" }
  ],
  inventorySignals: [
    { label: "Days of supply", value: 72, detail: "Balanced", tone: "good" },
    { label: "Low-stock winners", value: 38, detail: "Reorder in 72h", tone: "warn" },
    { label: "Dead stock exposure", value: 19, detail: "$18.4K tied up", tone: "risk" }
  ],
  stores,
  products: [
    { name: "Blue Dream 3.5g", category: "Flower", units: 812, revenue: "$32.1K", trend: "+18%" },
    { name: "Live Resin Cart 1g", category: "Vapes", units: 648, revenue: "$29.8K", trend: "+11%" },
    { name: "Solventless Gummies", category: "Edibles", units: 531, revenue: "$10.7K", trend: "+7%" },
    { name: "Infused Mini Pre-roll", category: "Pre-rolls", units: 497, revenue: "$8.4K", trend: "+24%" }
  ],
  budtenders: {
    top: weeklyBudtenders.slice(0, 3),
    bottom: weeklyBudtenders.slice(-3)
  },
  alerts: [
    { title: "EMBR La Mesa is pacing above forecast", body: "Weekend traffic lifted net sales 14% over the previous four-week average.", tone: "good" },
    { title: "EMBR Lake Elsinore needs replenishment", body: "Nine top-decile SKUs are below three days of supply.", tone: "risk" },
    { title: "Vape category margin watch", body: "Discounting is up 6.8 points versus last week.", tone: "warn" }
  ]
};

const monthly: DashboardData = {
  period: "monthly",
  title: "Previous month report",
  subtitle: "Completed calendar month ownership summary",
  lastSync: "Today, 6:12 AM",
  dateRange: "Apr 1 - Apr 30, 2026",
  periodContext: {
    currentPeriod: "Apr 1 - Apr 30, 2026",
    comparisonPeriod: "Mar 1 - Mar 31, 2026",
    basis: "Net sales after discounts; avg net ticket is net sales divided by transaction count.",
    includedStores: "6 of 6 sample stores",
    excludedStores: "None",
    source: "Mock fallback completed calendar month",
    lastSync: "Today, 6:12 AM"
  },
  comparisonTitle: "Completed month vs prior completed month, net basis",
  comparisons: [
    { label: "Net sales", current: "$2.01M", previous: "$1.80M", delta: "+$205K", percent: "+11.4%", direction: "up", detail: "same elapsed days" },
    { label: "Transactions", current: "31,994", previous: "29,252", delta: "+2,742", percent: "+9.4%", direction: "up", detail: "ticket count change" },
    { label: "Avg net ticket", current: "$62.83", previous: "$61.70", delta: "+$1.13", percent: "+1.8%", direction: "up", detail: "net sales per ticket" },
    { label: "Net sales / day", current: "$64.9K", previous: "$58.3K", delta: "+$6.6K", percent: "+11.4%", direction: "up", detail: "daily net run-rate" }
  ],
  kpis: [
    { label: "Net sales", value: "$2.01M", change: "+$205K", direction: "up", detail: "Completed month net basis", series: [41, 45, 48, 54, 52, 61, 69] },
    { label: "Transactions", value: "31,994", change: "+9.4%", direction: "up", detail: "steady weekend lift", series: [50, 52, 55, 58, 61, 64, 71] },
    { label: "Avg net ticket", value: "$62.83", change: "+1.8%", direction: "up", detail: "net sales per ticket", series: [47, 47, 49, 50, 53, 54, 57] },
    { label: "Inventory turns", value: "3.8x", change: "+0.4", direction: "up", detail: "monthly run-rate", series: [38, 43, 42, 49, 55, 58, 63] }
  ],
  revenueSeries: [
    { label: "W1", revenue: 462200, transactions: 7484 },
    { label: "W2", revenue: 499800, transactions: 7966 },
    { label: "W3", revenue: 527900, transactions: 8238 },
    { label: "W4", revenue: 522100, transactions: 8306 }
  ],
  categoryMix: [
    { label: "Flower", value: 31, color: "#56d68a" },
    { label: "Vapes", value: 26, color: "#5cc7d7" },
    { label: "Pre-rolls", value: 18, color: "#f3c969" },
    { label: "Edibles", value: 16, color: "#f07f6b" },
    { label: "Other", value: 9, color: "#b9a7ff" }
  ],
  inventorySignals: [
    { label: "Days of supply", value: 78, detail: "Improving", tone: "good" },
    { label: "Low-stock winners", value: 54, detail: "Buying window", tone: "warn" },
    { label: "Dead stock exposure", value: 24, detail: "$46.9K tied up", tone: "risk" }
  ],
  stores,
  products: [
    { name: "Blue Dream 3.5g", category: "Flower", units: 3018, revenue: "$119.6K", trend: "+21%" },
    { name: "Live Resin Cart 1g", category: "Vapes", units: 2542, revenue: "$116.9K", trend: "+16%" },
    { name: "Infused Mini Pre-roll", category: "Pre-rolls", units: 2190, revenue: "$37.2K", trend: "+28%" },
    { name: "Solventless Gummies", category: "Edibles", units: 2044, revenue: "$41.3K", trend: "+9%" }
  ],
  budtenders: {
    top: monthlyBudtenders.slice(0, 3),
    bottom: monthlyBudtenders.slice(-3)
  },
  alerts: [
    { title: "Premium flower is gaining share", body: "Top-shelf 3.5g SKUs now account for 22% of flower net sales.", tone: "good" },
    { title: "Lake Elsinore avg net ticket erosion", body: "EMBR Lake Elsinore avg net ticket is down 4.1% from last month.", tone: "risk" },
    { title: "Pre-roll velocity has reordering risk", body: "Two high-velocity products will stock out before the next scheduled delivery.", tone: "warn" }
  ]
};

const storeMultipliers: Record<string, number> = {
  springfield: 1.16,
  northampton: 1.02,
  "fyre-ants": 0.94,
  "la-mesa": 0.88,
  "lake-elsinore": 0.72,
  "hlc-greenfield": 0.82
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatTicket(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatSignedTicket(value: number) {
  if (Math.abs(value) < 0.005) {
    return "$0.00";
  }

  return `${value > 0 ? "+" : "-"}${formatTicket(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  if (Math.abs(value) < 0.05) {
    return "0.0%";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function directionFromDelta(value: number): "up" | "down" | "flat" {
  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "flat";
}

function isAverageTicketLabel(label: string) {
  const normalized = label.toLowerCase();
  return normalized === "average ticket" || normalized === "avg ticket" || normalized === "avg net ticket";
}

function parseMoneyLabel(label: string) {
  const trimmed = label.trim();
  const sign = trimmed.startsWith("-") ? -1 : 1;
  const normalized = trimmed.replace(/[$,+-]/g, "").trim().toUpperCase();
  const suffix = normalized.endsWith("M") ? "M" : normalized.endsWith("K") ? "K" : "";
  const number = Number(normalized.replace(/[MK]/g, ""));

  if (!Number.isFinite(number)) {
    return 0;
  }

  if (suffix === "M") {
    return sign * number * 1_000_000;
  }

  if (suffix === "K") {
    return sign * number * 1_000;
  }

  return sign * number;
}

function parseCountLabel(label: string) {
  const value = Number(label.replace(/[,+]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function netAverageTicket(netSales: string, transactions: string | number) {
  const transactionCount = typeof transactions === "number" ? transactions : parseCountLabel(transactions);

  if (transactionCount <= 0) {
    return 0;
  }

  return parseMoneyLabel(netSales) / transactionCount;
}

function buildAverageTicketComparison(netSales: ComparisonMetric, transactions: ComparisonMetric): ComparisonMetric {
  const current = netAverageTicket(netSales.current, transactions.current);
  const previous = netAverageTicket(netSales.previous, transactions.previous);
  const delta = current - previous;
  const percent = previous > 0 ? (delta / previous) * 100 : 0;

  return {
    label: "Avg net ticket",
    current: formatTicket(current),
    previous: formatTicket(previous),
    delta: formatSignedTicket(delta),
    percent: formatSignedPercent(percent),
    direction: directionFromDelta(delta),
    detail: "net sales per ticket"
  };
}

function normalizeStore(store: StoreSnapshot): StoreSnapshot {
  const averageTicket = buildAverageTicketComparison(store.comparison.netSales, store.comparison.transactions);

  return {
    ...store,
    priorWeekRevenue: store.priorWeekNet,
    averageBasket: averageTicket.current,
    comparison: {
      ...store.comparison,
      averageTicket
    }
  };
}

function normalizeBudtender(budtender: BudtenderMetric): BudtenderMetric {
  return {
    ...budtender,
    averageBasket: formatTicket(netAverageTicket(budtender.netSales, budtender.transactions))
  };
}

function normalizeDashboardData(data: DashboardData): DashboardData {
  const netSales = data.comparisons.find((comparison) => comparison.label === "Net sales");
  const transactions = data.comparisons.find((comparison) => comparison.label === "Transactions");
  const averageTicket = netSales && transactions ? buildAverageTicketComparison(netSales, transactions) : null;

  if (!averageTicket) {
    return data;
  }

  return {
    ...data,
    comparisons: data.comparisons.map((comparison) =>
      isAverageTicketLabel(comparison.label) ? averageTicket : comparison
    ),
    kpis: data.kpis.map((kpi) =>
      isAverageTicketLabel(kpi.label)
        ? {
            ...kpi,
            label: "Avg net ticket",
            value: averageTicket.current,
            change: averageTicket.percent,
            direction: averageTicket.direction,
            detail: averageTicket.detail
          }
        : kpi
    )
  };
}

type LiveDutchieResult = DutchieSyncResult & {
  analytics: NonNullable<DutchieSyncResult["analytics"]>;
};

function isLiveDutchieResult(result: DutchieSyncResult): result is LiveDutchieResult {
  return Boolean(result.verified && result.analytics);
}

function getLiveDutchieResults(snapshot: DutchieSyncSnapshot | null | undefined) {
  return snapshot?.results.filter(isLiveDutchieResult) ?? [];
}

function formatCompactMoney(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absolute >= 1_000_000) {
    return `${sign}$${(absolute / 1_000_000).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  }

  return `${sign}${formatMoney(absolute)}`;
}

function formatSignedCompactMoney(value: number) {
  if (Math.abs(value) < 0.5) {
    return "$0";
  }

  return `${value > 0 ? "+" : ""}${formatCompactMoney(value)}`;
}

function formatSignedCount(value: number) {
  if (value === 0) {
    return "0";
  }

  return `${value > 0 ? "+" : ""}${Math.round(value).toLocaleString("en-US")}`;
}

function percentChange(current: number, previous: number) {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function comparisonDirection(current: number, previous: number) {
  return directionFromDelta(current - previous);
}

function buildLiveMoneyComparison(label: string, current: number, previous: number, detail: string): ComparisonMetric {
  const delta = current - previous;

  return {
    label,
    current: formatCompactMoney(current),
    previous: formatCompactMoney(previous),
    delta: formatSignedCompactMoney(delta),
    percent: formatSignedPercent(percentChange(current, previous)),
    direction: directionFromDelta(delta),
    detail
  };
}

function buildLiveCountComparison(label: string, current: number, previous: number, detail: string): ComparisonMetric {
  const delta = current - previous;

  return {
    label,
    current: Math.round(current).toLocaleString("en-US"),
    previous: Math.round(previous).toLocaleString("en-US"),
    delta: formatSignedCount(delta),
    percent: formatSignedPercent(percentChange(current, previous)),
    direction: directionFromDelta(delta),
    detail
  };
}

function customerShare(count: number, total: number) {
  if (total <= 0) {
    return "0.0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

function buildLiveCustomerComparison(
  label: string,
  current: number,
  previous: number,
  currentTotal: number,
  previousTotal: number,
  detail: string
): ComparisonMetric {
  const comparison = buildLiveCountComparison(label, current, previous, detail);

  return {
    ...comparison,
    detail: `${detail}; ${customerShare(current, currentTotal)} of current customers vs ${customerShare(previous, previousTotal)} prior.`
  };
}

function buildLiveTicketComparison(current: number, previous: number): ComparisonMetric {
  const delta = current - previous;

  return {
    label: "Avg net ticket",
    current: formatTicket(current),
    previous: formatTicket(previous),
    delta: formatSignedTicket(delta),
    percent: formatSignedPercent(percentChange(current, previous)),
    direction: directionFromDelta(delta),
    detail: "Dutchie closing-report averageCartNetSales"
  };
}

function emptyFinancialPeriod(): DutchieFinancialPeriod {
  return {
    from: "",
    to: "",
    grossSales: 0,
    discounts: 0,
    netSales: 0,
    taxes: 0,
    totalPayments: 0,
    transactionCount: 0,
    customerCount: 0,
    newCustomerCount: 0,
    returningCustomerCount: 0,
    itemCount: 0,
    averageNetTicket: 0,
    returnTotal: 0,
    voidTotal: 0
  };
}

function sumFinancialPeriods(periods: DutchieFinancialPeriod[]): DutchieFinancialPeriod {
  if (periods.length === 0) {
    return emptyFinancialPeriod();
  }

  const totals = periods.reduce(
    (total, period) => ({
      from: total.from && total.from < period.from ? total.from : period.from,
      to: total.to && total.to > period.to ? total.to : period.to,
      grossSales: total.grossSales + period.grossSales,
      discounts: total.discounts + period.discounts,
      netSales: total.netSales + period.netSales,
      taxes: total.taxes + period.taxes,
      totalPayments: total.totalPayments + period.totalPayments,
      transactionCount: total.transactionCount + period.transactionCount,
      customerCount: total.customerCount + (period.customerCount ?? 0),
      newCustomerCount: total.newCustomerCount + (period.newCustomerCount ?? 0),
      returningCustomerCount: total.returningCustomerCount + (period.returningCustomerCount ?? 0),
      itemCount: total.itemCount + period.itemCount,
      averageNetTicket: 0,
      returnTotal: total.returnTotal + period.returnTotal,
      voidTotal: total.voidTotal + period.voidTotal
    }),
    { ...emptyFinancialPeriod(), from: periods[0].from, to: periods[0].to }
  );

  return {
    ...totals,
    averageNetTicket: totals.transactionCount > 0 ? totals.netSales / totals.transactionCount : 0
  };
}

function periodFor(result: LiveDutchieResult, period: Period) {
  return result.analytics[period];
}

function formatDateRange(from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Live Dutchie period";
  }

  const timeZone = "America/Los_Angeles";
  const startParts = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone }).formatToParts(start);
  const endParts = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone }).formatToParts(end);
  const startYear = Number(startParts.find((part) => part.type === "year")?.value);
  const endYear = Number(endParts.find((part) => part.type === "year")?.value);
  const sameYear = startYear === endYear;
  const startFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone
  });
  const endFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone });

  return `${startFormatter.format(start)} - ${endFormatter.format(end)}`;
}

function formatLastSync(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Live Dutchie sync";
  }

  return `Dutchie sync ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date)}`;
}

function localDateKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function inventoryRiskCounts(inventory: DutchieInventorySummary[]) {
  const lowStock = inventory.filter((item) => item.onHand <= 5).length;
  const expiring = inventory.filter((item) => item.daysToExpire !== null && item.daysToExpire <= 30).length;
  const lowRoi = inventory.filter((item) => item.estimatedRoi <= 15).length;
  const atRisk = new Set(
    inventory
      .filter((item) => item.onHand <= 5 || (item.daysToExpire !== null && item.daysToExpire <= 30) || item.estimatedRoi <= 15)
      .map((item) => `${item.inventoryId}-${item.sku}-${item.packageId}`)
  );

  return { lowStock, expiring, lowRoi, atRisk: atRisk.size, total: inventory.length };
}

function inventoryHealthLabel(inventory: DutchieInventorySummary[], fallback: string) {
  if (inventory.length === 0) {
    return fallback;
  }

  const risk = inventoryRiskCounts(inventory);
  return `${Math.max(0, Math.round(100 - (risk.atRisk / Math.max(risk.total, 1)) * 100))}%`;
}

function makeLiveComparisonSet(current: DutchieFinancialPeriod, previous: DutchieFinancialPeriod): ComparisonMetric[] {
  const currentNetPerDay = current.netSales / Math.max((new Date(current.to).getTime() - new Date(current.from).getTime()) / 86_400_000, 1);
  const previousNetPerDay = previous.netSales / Math.max((new Date(previous.to).getTime() - new Date(previous.from).getTime()) / 86_400_000, 1);

  return [
    buildLiveMoneyComparison("Net sales", current.netSales, previous.netSales, "Dutchie closing-report netSales"),
    buildLiveCountComparison("Transactions", current.transactionCount, previous.transactionCount, "Dutchie closing-report transactionCount"),
    buildLiveTicketComparison(current.averageNetTicket, previous.averageNetTicket),
    buildLiveCustomerComparison(
      "Returning customers",
      current.returningCustomerCount ?? 0,
      previous.returningCustomerCount ?? 0,
      current.customerCount ?? 0,
      previous.customerCount ?? 0,
      "Dutchie closing-report customerCount minus newCustomerCount"
    ),
    buildLiveCustomerComparison(
      "New customers",
      current.newCustomerCount ?? 0,
      previous.newCustomerCount ?? 0,
      current.customerCount ?? 0,
      previous.customerCount ?? 0,
      "Dutchie closing-report newCustomerCount"
    ),
    buildLiveMoneyComparison("Net sales / day", currentNetPerDay, previousNetPerDay, "Daily net run-rate from closing-report")
  ];
}

const categoryColors = ["#4ade80", "#22d3ee", "#facc15", "#fb7185", "#a78bfa", "#f97316"];

function makeProductVelocityCategoryMix(products: ProductVelocity[], fallback: CategoryMix[]): CategoryMix[] {
  const categories = new Map<string, number>();

  for (const product of products) {
    const lineItems = product.lineItems ?? [];

    if (lineItems.length === 0) {
      categories.set(product.category, (categories.get(product.category) ?? 0) + parseMoneyLabel(product.revenue));
      continue;
    }

    for (const line of lineItems) {
      categories.set(line.category, (categories.get(line.category) ?? 0) + parseMoneyLabel(line.revenue));
    }
  }

  const total = Array.from(categories.values()).reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return fallback;
  }

  return Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], index) => ({
      label,
      value: Math.max(1, Math.round((value / total) * 100)),
      color: categoryColors[index % categoryColors.length]
    }));
}

function makeLiveCategoryMix(results: LiveDutchieResult[], period: Period, fallback: CategoryMix[]): CategoryMix[] {
  return makeProductVelocityCategoryMix(makeLiveProducts(results, period), fallback);
}

function makeInventorySignalsFromInventory(inventory: DutchieInventorySummary[], fallback: InventorySignal[]): InventorySignal[] {
  if (inventory.length === 0) {
    return fallback;
  }

  const { total: rows, lowStock, expiring, lowRoi } = inventoryRiskCounts(inventory);
  const noSalesExposure = inventory.filter((item) => item.retailValue > 0 && item.onHand > 0).length;
  const pctOfRows = (count: number) => Math.min(100, Math.max(2, Math.round((count / rows) * 100)));

  return [
    {
      label: "Low stock",
      value: pctOfRows(lowStock),
      detail: `${lowStock.toLocaleString()} live inventory rows have 5 or fewer units on hand.`,
      tone: lowStock / rows > 0.18 ? "risk" : lowStock > 0 ? "warn" : "good"
    },
    {
      label: "Expiration risk",
      value: pctOfRows(expiring),
      detail: `${expiring.toLocaleString()} packages expire within 30 days based on Dutchie inventory dates.`,
      tone: expiring / rows > 0.08 ? "risk" : expiring > 0 ? "warn" : "good"
    },
    {
      label: "ROI watch",
      value: pctOfRows(lowRoi),
      detail: `${lowRoi.toLocaleString()} rows have estimated ROI at or below 15% from Dutchie cost/price fields.`,
      tone: lowRoi / rows > 0.2 ? "risk" : lowRoi > 0 ? "warn" : "good"
    },
    {
      label: "Retail exposure",
      value: pctOfRows(noSalesExposure),
      detail: `${noSalesExposure.toLocaleString()} rows carry active retail value and should be managed by velocity.`,
      tone: "good"
    }
  ];
}

function makeLiveInventorySignals(results: LiveDutchieResult[], fallback: InventorySignal[]): InventorySignal[] {
  return makeInventorySignalsFromInventory(
    results.flatMap((result) => result.analytics.inventory ?? []),
    fallback
  );
}

function makeLiveKpis(
  current: DutchieFinancialPeriod,
  previous: DutchieFinancialPeriod,
  results: LiveDutchieResult[],
  fallback: Kpi[]
): Kpi[] {
  const comparisons = makeLiveComparisonSet(current, previous);
  const inventory = results.flatMap((result) => result.analytics.inventory ?? []);
  const risk = inventoryRiskCounts(inventory);
  const inventoryKpi: Kpi =
    inventory.length > 0
      ? {
          label: "At-risk inventory",
          value: `${risk.atRisk.toLocaleString()} rows`,
          change: `${risk.expiring.toLocaleString()} expiring`,
          direction: risk.atRisk > 0 ? "down" : "flat",
          detail: `Dutchie inventory rows flagged for low stock (${risk.lowStock}), expiry (${risk.expiring}), or low ROI (${risk.lowRoi}).`,
          series: [
            Math.max(8, Math.round((risk.lowStock / Math.max(inventory.length, 1)) * 100)),
            Math.max(8, Math.round((risk.expiring / Math.max(inventory.length, 1)) * 100)),
            Math.max(8, Math.round((risk.lowRoi / Math.max(inventory.length, 1)) * 100)),
            Math.min(94, Math.round((risk.atRisk / Math.max(inventory.length, 1)) * 100))
          ]
        }
      : (fallback.find((kpi) => !["Net sales", "Transactions", "Avg net ticket", "Average ticket"].includes(kpi.label)) ?? {
          label: "Inventory rows",
          value: "Pending",
          change: "Sync needed",
          direction: "flat",
          detail: "Dutchie inventory reporting",
          series: [50, 50, 50, 50]
        });

  return [
    { label: "Net sales", value: comparisons[0].current, change: comparisons[0].delta, direction: comparisons[0].direction, detail: "Dutchie netSales", series: [38, 42, 48, 51, 56, 61, 68] },
    { label: "Transactions", value: comparisons[1].current, change: comparisons[1].percent, direction: comparisons[1].direction, detail: "Dutchie transactionCount", series: [40, 44, 47, 53, 57, 60, 66] },
    { label: "Avg net ticket", value: comparisons[2].current, change: comparisons[2].percent, direction: comparisons[2].direction, detail: "Dutchie averageCartNetSales", series: [47, 49, 48, 50, 51, 52, 53] },
    inventoryKpi
  ];
}

function makeUnavailableStore(store: StoreSnapshot, result: DutchieSyncResult | undefined): StoreSnapshot {
  const reason = result?.errors[0] ?? "No live Dutchie analytics in the latest sync.";
  const unavailable: ComparisonMetric = {
    label: "Net sales",
    current: "Unavailable",
    previous: "Unavailable",
    delta: "n/a",
    percent: "n/a",
    direction: "flat",
    detail: reason
  };

  return {
    ...store,
    priorWeekRevenue: "Unavailable",
    priorWeekGross: "Unavailable",
    priorWeekNet: "Unavailable",
    priorWeekTransactions: "Unavailable",
    averageBasket: "Unavailable",
    monthToDateNet: "Unavailable",
    status: "Action",
    change: "API",
    comparison: {
      netSales: unavailable,
      transactions: { ...unavailable, label: "Transactions" },
      averageTicket: { ...unavailable, label: "Avg net ticket" }
    }
  };
}

function makeLiveStoreSnapshot(store: StoreSnapshot, result: LiveDutchieResult, period: Period): StoreSnapshot {
  const selected = periodFor(result, period);
  const weeklyCurrent = result.analytics.weekly.current;
  const monthlyCurrent = result.analytics.monthly.current;
  const netChange = percentChange(selected.current.netSales, selected.previous.netSales);
  const inventoryRisk = inventoryRiskCounts(result.analytics.inventory ?? []);
  const status: StoreStatus =
    netChange < -2 || inventoryRisk.atRisk / Math.max(inventoryRisk.total, 1) > 0.35
      ? "Action"
      : netChange < 2 || inventoryRisk.atRisk > 0
        ? "Watch"
        : "Healthy";

  return {
    ...store,
    priorWeekRevenue: formatCompactMoney(weeklyCurrent.netSales),
    priorWeekGross: formatCompactMoney(weeklyCurrent.grossSales),
    priorWeekNet: formatCompactMoney(weeklyCurrent.netSales),
    priorWeekTransactions: weeklyCurrent.transactionCount.toLocaleString("en-US"),
    averageBasket: formatTicket(weeklyCurrent.averageNetTicket),
    monthToDateNet: formatCompactMoney(monthlyCurrent.netSales),
    inventory: inventoryHealthLabel(result.analytics.inventory ?? [], store.inventory),
    status,
    change: formatSignedPercent(netChange),
    comparison: {
      netSales: buildLiveMoneyComparison("Net sales", selected.current.netSales, selected.previous.netSales, "Dutchie closing-report netSales"),
      transactions: buildLiveCountComparison("Transactions", selected.current.transactionCount, selected.previous.transactionCount, "Dutchie closing-report transactionCount"),
      averageTicket: buildLiveTicketComparison(selected.current.averageNetTicket, selected.previous.averageNetTicket)
    }
  };
}

function makeLiveStores(fallbackStores: StoreSnapshot[], snapshot: DutchieSyncSnapshot, period: Period) {
  return fallbackStores.map((store) => {
    const result = snapshot.results.find((candidate) => candidate.storeId === store.id);
    return result && isLiveDutchieResult(result) ? makeLiveStoreSnapshot(store, result, period) : makeUnavailableStore(store, result);
  });
}

function makeLiveRevenueSeries(results: LiveDutchieResult[], period: Period): RevenuePoint[] {
  const current = periodFor(results[0], period).current;
  const fromKey = localDateKey(current.from);
  const toKey = localDateKey(current.to);
  const points = new Map<string, RevenuePoint & { date?: string }>();

  for (const result of results) {
    for (const point of result.analytics.dailyNetSales) {
      if (point.date < fromKey || point.date > toKey) {
        continue;
      }

      const key =
        period === "monthly"
          ? `W${Math.floor((new Date(`${point.date}T12:00:00.000Z`).getTime() - new Date(`${fromKey}T12:00:00.000Z`).getTime()) / (7 * 86_400_000)) + 1}`
          : point.date;
      const label = period === "monthly" ? key : point.label;
      const existing = points.get(key) ?? { label, revenue: 0, transactions: 0, date: point.date };
      existing.revenue += point.netSales;
      existing.transactions += point.transactions;
      points.set(key, existing);
    }
  }

  return Array.from(points.values())
    .sort((a, b) => (a.date ?? a.label).localeCompare(b.date ?? b.label))
    .map(({ date, ...point }) => ({
      ...point,
      revenue: Math.round(point.revenue),
      transactions: Math.round(point.transactions)
    }));
}

function makeLiveBudtenderMetric(budtender: LiveDutchieResult["analytics"]["weeklyBudtenders"][number], storeName: string): BudtenderMetric {
  return {
    name: budtender.name,
    store: storeName,
    transactions: budtender.transactions,
    grossSales: formatCompactMoney(budtender.grossSales),
    netSales: formatCompactMoney(budtender.netSales),
    discounts: formatCompactMoney(budtender.discounts),
    averageBasket: formatTicket(budtender.transactions > 0 ? budtender.netSales / budtender.transactions : 0),
    units: Math.round(budtender.units)
  };
}

function makeLiveBudtenders(results: LiveDutchieResult[], period: Period) {
  const metrics = results.flatMap((result) => {
    const source = period === "monthly" ? result.analytics.monthlyBudtenders : result.analytics.weeklyBudtenders;
    return source.map((budtender) => makeLiveBudtenderMetric(budtender, result.storeName));
  });
  const withTickets = metrics.filter((metric) => metric.transactions > 0);

  return {
    top: [...withTickets].sort((a, b) => parseMoneyLabel(b.netSales) - parseMoneyLabel(a.netSales)).slice(0, 3),
    bottom: [...withTickets].sort((a, b) => parseMoneyLabel(a.netSales) - parseMoneyLabel(b.netSales)).slice(0, 3)
  };
}

function productGroupName(product: DutchieProductSummary) {
  if (product.vendor) {
    return product.brand && !product.vendor.toLowerCase().includes(product.brand.toLowerCase())
      ? `${product.brand} / ${product.vendor}`
      : product.vendor;
  }

  return product.brand || product.name;
}

function productGroupKey(product: DutchieProductSummary) {
  return productGroupName(product).toLowerCase().replace(/\s+/g, " ").trim();
}

function makeProductLineItem(product: DutchieProductSummary): ProductVelocityLineItem {
  const units = Math.round(product.units);
  const avgNet = units > 0 ? product.netSales / units : 0;
  const marginDollars = product.unitCost ? (avgNet - product.unitCost) * units : 0;
  const marginPercent = product.unitCost && avgNet > 0 ? (marginDollars / product.netSales) * 100 : 0;

  return {
    productId: product.productId,
    sku: product.sku || product.productId.toString(),
    name: product.name,
    brand: product.brand || "Unassigned brand",
    vendor: product.vendor || "Unassigned vendor",
    category: product.category,
    units,
    revenue: formatCompactMoney(product.netSales),
    avgNetPrice: formatTicket(avgNet),
    margin: product.unitCost ? `${marginPercent.toFixed(1)}%` : "Cost n/a",
    marginDollars: product.unitCost ? formatMoney(marginDollars) : "Cost n/a"
  };
}

function makeLiveProducts(results: LiveDutchieResult[], period: Period): ProductVelocity[] {
  const products = new Map<
    string,
    {
      name: string;
      category: string;
      units: number;
      netSales: number;
      costOfGoods: number;
      lineItems: ProductVelocityLineItem[];
    }
  >();

  for (const result of results) {
    const source = period === "monthly" ? result.analytics.monthlyProducts : result.analytics.weeklyProducts;

    for (const product of source) {
      const key = productGroupKey(product);
      const existing = products.get(key) ?? {
        name: productGroupName(product),
        category: product.category,
        units: 0,
        netSales: 0,
        costOfGoods: 0,
        lineItems: []
      };
      existing.units += product.units;
      existing.netSales += product.netSales;
      existing.costOfGoods += product.unitCost ? product.unitCost * product.units : 0;
      existing.lineItems.push(makeProductLineItem(product));
      existing.lineItems.sort((a, b) => parseMoneyLabel(b.revenue) - parseMoneyLabel(a.revenue));
      existing.category =
        existing.category === product.category ? existing.category : `${existing.lineItems.length} product categories`;
      products.set(key, existing);
    }
  }

  return Array.from(products.values())
    .sort((a, b) => b.netSales - a.netSales)
    .slice(0, 24)
    .map((product): ProductVelocity => {
      const marginDollars = product.costOfGoods > 0 ? product.netSales - product.costOfGoods : 0;
      const margin = product.costOfGoods > 0 && product.netSales > 0 ? `${((marginDollars / product.netSales) * 100).toFixed(1)}%` : "Cost n/a";
      const topLine = product.lineItems[0];

      return {
      name: product.name,
      category: product.category,
      units: Math.round(product.units),
      revenue: formatCompactMoney(product.netSales),
        trend: product.lineItems.length > 1 ? `${product.lineItems.length} SKUs` : "Live net",
        sku: topLine?.sku,
        brand: topLine?.brand,
        vendor: topLine?.vendor,
        avgNetPrice: formatTicket(product.netSales / Math.max(product.units, 1)),
        margin,
        marginDollars: product.costOfGoods > 0 ? formatMoney(marginDollars) : "Cost n/a",
        lineItems: product.lineItems
      };
    });
}

function buildLiveDashboardData(period: Period, fallback: DashboardData, snapshot: DutchieSyncSnapshot): DashboardData {
  const liveResults = getLiveDutchieResults(snapshot);

  if (liveResults.length === 0) {
    return fallback;
  }

  const current = sumFinancialPeriods(liveResults.map((result) => periodFor(result, period).current));
  const previous = sumFinancialPeriods(liveResults.map((result) => periodFor(result, period).previous));
  const revenueSeries = makeLiveRevenueSeries(liveResults, period);
  const unavailableStores = snapshot.results.filter((result) => !isLiveDutchieResult(result)).map((result) => result.storeName);
  const currentPeriod = formatDateRange(current.from, current.to);
  const comparisonPeriod = formatDateRange(previous.from, previous.to);
  const lastSync = formatLastSync(snapshot.syncedAt);

  return {
    ...fallback,
    title: period === "monthly" ? "Live Dutchie completed month" : "Live Dutchie completed week",
    subtitle: `${liveResults.length} connected stores; unavailable stores are excluded from totals`,
    lastSync,
    dateRange: currentPeriod,
    periodContext: {
      currentPeriod,
      comparisonPeriod,
      basis: "Dutchie closing-report netSales, transactionCount, averageCartNetSales, customerCount, and newCustomerCount. Unavailable stores are excluded from live totals.",
      includedStores: `${liveResults.length} of ${snapshot.results.length} Dutchie stores`,
      excludedStores: unavailableStores.length > 0 ? unavailableStores.join(", ") : "None",
      source: period === "monthly" ? "Live Dutchie completed calendar month" : "Live Dutchie completed Monday-Sunday week",
      lastSync
    },
    comparisonTitle: period === "monthly" ? "Completed month vs prior completed month, net basis" : "Completed Monday-Sunday week vs prior week, net basis",
    comparisons: makeLiveComparisonSet(current, previous),
    kpis: makeLiveKpis(current, previous, liveResults, fallback.kpis),
    revenueSeries: revenueSeries.length > 0 ? revenueSeries : fallback.revenueSeries,
    categoryMix: makeLiveCategoryMix(liveResults, period, fallback.categoryMix),
    inventorySignals: makeLiveInventorySignals(liveResults, fallback.inventorySignals),
    stores: makeLiveStores(fallback.stores, snapshot, period),
    products: makeLiveProducts(liveResults, period),
    budtenders: makeLiveBudtenders(liveResults, period),
    alerts: [
      {
        title: "Live Dutchie financials loaded",
        body: "Net sales, transaction count, avg net ticket, returning customers, and new customers are now sourced from Dutchie closing-report fields.",
        tone: "good"
      },
      ...snapshot.results
        .filter((result) => !isLiveDutchieResult(result))
        .slice(0, 2)
        .map((result) => ({
          title: `${result.storeName} needs API attention`,
          body: result.errors[0] ?? "No live analytics were returned in the latest sync.",
          tone: "risk" as const
        })),
      ...fallback.alerts.slice(0, 1)
    ]
  };
}

function scaleMoneyLabel(label: string, multiplier: number) {
  const scaled = parseMoneyLabel(label) * multiplier;

  if (scaled >= 1_000_000) {
    return `$${(scaled / 1_000_000).toFixed(2)}M`;
  }

  return `$${(scaled / 1_000).toFixed(1)}K`;
}

function scaleSeries(series: number[], multiplier: number) {
  return series.map((value) => Math.round(value * multiplier));
}

function scaleStoreKpiValue(kpi: Kpi, store: StoreSnapshot, period: Period, multiplier: number) {
  if (kpi.label === "Net sales") {
    return store.comparison.netSales.current;
  }

  if (kpi.label === "Transactions") {
    return store.comparison.transactions.current;
  }

  if (isAverageTicketLabel(kpi.label)) {
    return store.comparison.averageTicket.current;
  }

  return kpi.value.includes("$") ? scaleMoneyLabel(kpi.value, multiplier / 5.2) : kpi.value;
}

function makeStoreKpis(store: StoreSnapshot, inventory: DutchieInventorySummary[], fallback: Kpi[]): Kpi[] {
  const fallbackInventory =
    fallback.find((kpi) => !["Net sales", "Transactions", "Avg net ticket", "Average ticket"].includes(kpi.label)) ??
    ({
      label: "Inventory rows",
      value: "Pending",
      change: "Sync needed",
      direction: "flat",
      detail: "Dutchie inventory reporting",
      series: [50, 50, 50, 50]
    } satisfies Kpi);

  const risk = inventoryRiskCounts(inventory);
  const inventoryKpi: Kpi =
    inventory.length > 0
      ? {
          label: "At-risk inventory",
          value: `${risk.atRisk.toLocaleString()} rows`,
          change: `${risk.expiring.toLocaleString()} expiring`,
          direction: risk.atRisk > 0 ? "down" : "flat",
          detail: `Store-level Dutchie inventory rows flagged for low stock (${risk.lowStock}), expiry (${risk.expiring}), or low ROI (${risk.lowRoi}).`,
          series: [
            Math.max(8, Math.round((risk.lowStock / Math.max(risk.total, 1)) * 100)),
            Math.max(8, Math.round((risk.expiring / Math.max(risk.total, 1)) * 100)),
            Math.max(8, Math.round((risk.lowRoi / Math.max(risk.total, 1)) * 100)),
            Math.min(94, Math.round((risk.atRisk / Math.max(risk.total, 1)) * 100))
          ]
        }
      : fallbackInventory;

  return [
    {
      label: "Net sales",
      value: store.comparison.netSales.current,
      change: store.comparison.netSales.delta,
      direction: store.comparison.netSales.direction,
      detail: store.comparison.netSales.detail,
      series: [38, 42, 48, 51, 56, 61, 68]
    },
    {
      label: "Transactions",
      value: store.comparison.transactions.current,
      change: store.comparison.transactions.percent,
      direction: store.comparison.transactions.direction,
      detail: store.comparison.transactions.detail,
      series: [40, 44, 47, 53, 57, 60, 66]
    },
    {
      label: "Avg net ticket",
      value: store.comparison.averageTicket.current,
      change: store.comparison.averageTicket.percent,
      direction: store.comparison.averageTicket.direction,
      detail: store.comparison.averageTicket.detail,
      series: [47, 49, 48, 50, 51, 52, 53]
    },
    inventoryKpi
  ];
}

function makeStoreBudtenders(store: StoreSnapshot, period: Period) {
  const source = period === "monthly" ? monthlyBudtenders : weeklyBudtenders;
  const storeName = store.name;
  const own = source.filter((budtender) => budtender.store === storeName);
  const fallbackTop = [
    { name: "Maya R.", store: storeName, transactions: period === "monthly" ? 742 : 188, grossSales: period === "monthly" ? "$51.8K" : "$13.7K", netSales: period === "monthly" ? "$48.9K" : "$12.9K", discounts: period === "monthly" ? "$2.9K" : "$0.8K", averageBasket: "$68.75", units: period === "monthly" ? 2014 : 518 },
    { name: "Chris T.", store: storeName, transactions: period === "monthly" ? 701 : 176, grossSales: period === "monthly" ? "$48.7K" : "$12.4K", netSales: period === "monthly" ? "$45.6K" : "$11.7K", discounts: period === "monthly" ? "$3.1K" : "$0.7K", averageBasket: "$66.48", units: period === "monthly" ? 1906 : 487 },
    { name: "Jordan P.", store: storeName, transactions: period === "monthly" ? 663 : 162, grossSales: period === "monthly" ? "$44.5K" : "$11.2K", netSales: period === "monthly" ? "$41.8K" : "$10.5K", discounts: period === "monthly" ? "$2.7K" : "$0.7K", averageBasket: "$64.81", units: period === "monthly" ? 1772 : 451 }
  ];
  const fallbackBottom = [
    { name: "Sam K.", store: storeName, transactions: period === "monthly" ? 309 : 79, grossSales: period === "monthly" ? "$18.2K" : "$4.8K", netSales: period === "monthly" ? "$16.9K" : "$4.4K", discounts: period === "monthly" ? "$1.3K" : "$0.4K", averageBasket: "$53.90", units: period === "monthly" ? 829 : 207 },
    { name: "Taylor N.", store: storeName, transactions: period === "monthly" ? 287 : 73, grossSales: period === "monthly" ? "$16.6K" : "$4.2K", netSales: period === "monthly" ? "$15.4K" : "$3.8K", discounts: period === "monthly" ? "$1.2K" : "$0.4K", averageBasket: "$52.08", units: period === "monthly" ? 744 : 188 },
    { name: "Avery L.", store: storeName, transactions: period === "monthly" ? 266 : 68, grossSales: period === "monthly" ? "$15.1K" : "$3.7K", netSales: period === "monthly" ? "$13.8K" : "$3.4K", discounts: period === "monthly" ? "$1.3K" : "$0.3K", averageBasket: "$50.61", units: period === "monthly" ? 699 : 171 }
  ];

  if (own.length >= 3) {
    return { top: own.slice(0, 3), bottom: own.slice(-3) };
  }

  return { top: fallbackTop.map(normalizeBudtender), bottom: fallbackBottom.map(normalizeBudtender) };
}

function makeLiveStoreBudtenders(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result || !isLiveDutchieResult(result)) {
    return null;
  }

  const source = period === "monthly" ? result.analytics.monthlyBudtenders : result.analytics.weeklyBudtenders;
  const metrics = source
    .map((budtender) => makeLiveBudtenderMetric(budtender, result.storeName))
    .filter((metric) => metric.transactions > 0);

  return {
    top: [...metrics].sort((a, b) => parseMoneyLabel(b.netSales) - parseMoneyLabel(a.netSales)).slice(0, 3),
    bottom: [...metrics].sort((a, b) => parseMoneyLabel(a.netSales) - parseMoneyLabel(b.netSales)).slice(0, 3)
  };
}

function makeLiveStoreRevenueSeries(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result || !isLiveDutchieResult(result)) {
    return null;
  }

  return makeLiveRevenueSeries([result], period);
}

function makeLiveStoreProducts(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result || !isLiveDutchieResult(result)) {
    return null;
  }

  return makeLiveProducts([result], period);
}

function makeLiveStoreInventory(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result || !isLiveDutchieResult(result)) {
    return [];
  }

  return result.analytics.inventory ?? [];
}

function makeLiveStoreComparisons(
  snapshot: DutchieSyncSnapshot | null | undefined,
  storeId: string,
  period: Period,
  fallback: ComparisonMetric[]
) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result || !isLiveDutchieResult(result)) {
    return fallback;
  }

  const selected = periodFor(result, period);
  return makeLiveComparisonSet(selected.current, selected.previous);
}

export function getDashboardData(period: Period, snapshot?: DutchieSyncSnapshot | null): DashboardData {
  const fallback = normalizeDashboardData(period === "monthly" ? monthly : weekly);
  return snapshot ? buildLiveDashboardData(period, fallback, snapshot) : fallback;
}

export function getPeriod(value: string | string[] | undefined): Period {
  return value === "monthly" ? "monthly" : "weekly";
}

export function getStoreReport(storeId: string, period: Period, snapshot?: DutchieSyncSnapshot | null): StoreReport | null {
  const portfolio = getDashboardData(period, snapshot);
  const store = portfolio.stores.find((candidate) => candidate.id === storeId);

  if (!store) {
    return null;
  }

  const multiplier = storeMultipliers[store.id] ?? 0.84;
  const budtenders = makeLiveStoreBudtenders(snapshot, store.id, period) ?? makeStoreBudtenders(store, period);
  const liveRevenueSeries = makeLiveStoreRevenueSeries(snapshot, store.id, period);
  const liveProducts = makeLiveStoreProducts(snapshot, store.id, period);
  const inventoryItems = makeLiveStoreInventory(snapshot, store.id);
  const products =
    liveProducts && liveProducts.length > 0
      ? liveProducts
      : portfolio.products.map((product) => ({
          ...product,
          units: Math.round(product.units * multiplier * 0.22),
          revenue: formatMoney(parseMoneyLabel(product.revenue) * multiplier * 0.18)
        }));

  return {
    store,
    period,
    title: `${store.name} ${period === "monthly" ? "completed month" : "previous week"} report`,
    subtitle: `${store.market} store performance, budtenders, products, and inventory`,
    dateRange: portfolio.dateRange,
    periodContext: portfolio.periodContext,
    comparisonTitle:
      period === "monthly"
        ? "Completed month vs prior completed month, net basis"
        : "Completed Monday-Sunday week vs prior week, net basis",
    comparisons: makeLiveStoreComparisons(snapshot, store.id, period, [
      store.comparison.netSales,
      store.comparison.transactions,
      store.comparison.averageTicket
    ]),
    kpis: makeStoreKpis(store, inventoryItems, portfolio.kpis),
    revenueSeries:
      liveRevenueSeries && liveRevenueSeries.length > 0
        ? liveRevenueSeries
        : portfolio.revenueSeries.map((point) => ({
            ...point,
            revenue: Math.round(point.revenue * multiplier * 0.18),
            transactions: Math.round(point.transactions * multiplier * 0.18)
          })),
    categoryMix: makeProductVelocityCategoryMix(products, portfolio.categoryMix),
    inventorySignals: makeInventorySignalsFromInventory(inventoryItems, portfolio.inventorySignals),
    inventoryItems,
    products,
    budtenders,
    alerts: [
      { title: `${store.city} snapshot ready`, body: `${store.name} finished the period at ${store.comparison.netSales.current} net sales with ${store.inventory} inventory health.`, tone: store.status === "Action" ? "risk" : store.status === "Watch" ? "warn" : "good" },
      ...portfolio.alerts.slice(0, 2)
    ]
  };
}
