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
  comparisonTitle: string;
  comparisons: ComparisonMetric[];
  kpis: Kpi[];
  revenueSeries: RevenuePoint[];
  categoryMix: CategoryMix[];
  inventorySignals: InventorySignal[];
  products: ProductVelocity[];
  budtenders: {
    top: BudtenderMetric[];
    bottom: BudtenderMetric[];
  };
  alerts: Alert[];
};

export const stores: StoreSnapshot[] = [
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
      averageTicket: { label: "Average ticket", current: "$63.08", previous: "$61.75", delta: "+$1.33", percent: "+2.2%", direction: "up", detail: "net per ticket" }
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
      averageTicket: { label: "Average ticket", current: "$63.60", previous: "$62.43", delta: "+$1.17", percent: "+1.9%", direction: "up", detail: "net per ticket" }
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
      averageTicket: { label: "Average ticket", current: "$62.20", previous: "$61.73", delta: "+$0.47", percent: "+0.8%", direction: "up", detail: "net per ticket" }
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
      averageTicket: { label: "Average ticket", current: "$62.59", previous: "$62.80", delta: "-$0.21", percent: "-0.3%", direction: "down", detail: "net per ticket" }
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
      averageTicket: { label: "Average ticket", current: "$61.09", previous: "$61.05", delta: "+$0.04", percent: "+0.1%", direction: "up", detail: "net per ticket" }
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
      averageTicket: { label: "Average ticket", current: "$63.35", previous: "$64.13", delta: "-$0.78", percent: "-1.2%", direction: "down", detail: "net per ticket" }
    }
  }
];

const weeklyBudtenders: BudtenderMetric[] = [
  { name: "Maya R.", store: "EMBR Springfield", transactions: 248, grossSales: "$18.9K", netSales: "$17.6K", discounts: "$1.3K", averageBasket: "$70.96", units: 721 },
  { name: "Chris T.", store: "EMBR La Mesa", transactions: 226, grossSales: "$16.8K", netSales: "$15.9K", discounts: "$0.9K", averageBasket: "$70.35", units: 664 },
  { name: "Jordan P.", store: "EMBR Northampton", transactions: 219, grossSales: "$15.7K", netSales: "$14.8K", discounts: "$0.9K", averageBasket: "$67.58", units: 619 },
  { name: "Sam K.", store: "HLC Greenfield", transactions: 107, grossSales: "$6.3K", netSales: "$5.7K", discounts: "$0.6K", averageBasket: "$53.27", units: 284 },
  { name: "Taylor N.", store: "EMBR Lake Elsinore", transactions: 98, grossSales: "$5.8K", netSales: "$5.1K", discounts: "$0.7K", averageBasket: "$52.04", units: 251 },
  { name: "Avery L.", store: "FYRE ANTS", transactions: 91, grossSales: "$5.2K", netSales: "$4.7K", discounts: "$0.5K", averageBasket: "$51.65", units: 229 }
];

const monthlyBudtenders: BudtenderMetric[] = [
  { name: "Maya R.", store: "EMBR Springfield", transactions: 934, grossSales: "$72.4K", netSales: "$67.8K", discounts: "$4.6K", averageBasket: "$72.59", units: 2761 },
  { name: "Chris T.", store: "EMBR La Mesa", transactions: 891, grossSales: "$65.1K", netSales: "$61.0K", discounts: "$4.1K", averageBasket: "$68.46", units: 2527 },
  { name: "Jordan P.", store: "EMBR Northampton", transactions: 846, grossSales: "$61.8K", netSales: "$57.9K", discounts: "$3.9K", averageBasket: "$68.44", units: 2408 },
  { name: "Sam K.", store: "HLC Greenfield", transactions: 406, grossSales: "$24.3K", netSales: "$22.0K", discounts: "$2.3K", averageBasket: "$54.19", units: 1102 },
  { name: "Taylor N.", store: "EMBR Lake Elsinore", transactions: 378, grossSales: "$21.9K", netSales: "$19.4K", discounts: "$2.5K", averageBasket: "$51.32", units: 978 },
  { name: "Avery L.", store: "FYRE ANTS", transactions: 351, grossSales: "$19.8K", netSales: "$17.8K", discounts: "$2.0K", averageBasket: "$50.71", units: 905 }
];

const weekly: DashboardData = {
  period: "weekly",
  title: "Previous week snapshot",
  subtitle: "Six-store owner view with store report links",
  lastSync: "Today, 6:12 AM",
  dateRange: "May 6 - May 12",
  comparisonTitle: "Week over week, net basis",
  comparisons: [
    { label: "Net sales", current: "$499.8K", previous: "$462.4K", delta: "+$37.4K", percent: "+8.1%", direction: "up", detail: "current week vs previous week" },
    { label: "Transactions", current: "7,966", previous: "7,529", delta: "+437", percent: "+5.8%", direction: "up", detail: "ticket count change" },
    { label: "Average ticket", current: "$62.74", previous: "$61.41", delta: "+$1.33", percent: "+2.2%", direction: "up", detail: "net sales per ticket" },
    { label: "Net sales / day", current: "$71.4K", previous: "$66.1K", delta: "+$5.3K", percent: "+8.1%", direction: "up", detail: "daily net run-rate" }
  ],
  kpis: [
    { label: "Net sales", value: "$499.8K", change: "+$37.4K", direction: "up", detail: "week over week", series: [36, 43, 40, 48, 55, 62, 67] },
    { label: "Transactions", value: "7,966", change: "+5.8%", direction: "up", detail: "avg 1,138 per day", series: [52, 58, 49, 61, 64, 70, 73] },
    { label: "Average ticket", value: "$62.74", change: "+2.7%", direction: "up", detail: "net sales per ticket", series: [46, 44, 47, 52, 54, 57, 60] },
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
  title: "Current monthly report",
  subtitle: "Month-to-date ownership summary",
  lastSync: "Today, 6:12 AM",
  dateRange: "May 1 - May 31",
  comparisonTitle: "MTD vs previous month, net basis",
  comparisons: [
    { label: "Net sales", current: "$2.01M", previous: "$1.80M", delta: "+$205K", percent: "+11.4%", direction: "up", detail: "same elapsed days" },
    { label: "Transactions", current: "31,994", previous: "29,252", delta: "+2,742", percent: "+9.4%", direction: "up", detail: "ticket count change" },
    { label: "Average ticket", current: "$62.83", previous: "$61.70", delta: "+$1.13", percent: "+1.8%", direction: "up", detail: "net sales per ticket" },
    { label: "Net sales / day", current: "$64.9K", previous: "$58.3K", delta: "+$6.6K", percent: "+11.4%", direction: "up", detail: "daily net run-rate" }
  ],
  kpis: [
    { label: "Net sales", value: "$2.01M", change: "+$205K", direction: "up", detail: "MTD net basis", series: [41, 45, 48, 54, 52, 61, 69] },
    { label: "Transactions", value: "31,994", change: "+9.4%", direction: "up", detail: "steady weekend lift", series: [50, 52, 55, 58, 61, 64, 71] },
    { label: "Average ticket", value: "$62.83", change: "+1.8%", direction: "up", detail: "net sales per ticket", series: [47, 47, 49, 50, 53, 54, 57] },
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
    { title: "Premium flower is gaining share", body: "Top-shelf 3.5g SKUs now account for 22% of flower revenue.", tone: "good" },
    { title: "Lake Elsinore average ticket erosion", body: "EMBR Lake Elsinore average ticket is down 4.1% from last month.", tone: "risk" },
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

function scaleMoneyLabel(label: string, multiplier: number) {
  const normalized = label.replace(/[$,]/g, "");
  const suffix = normalized.endsWith("M") ? "M" : normalized.endsWith("K") ? "K" : "";
  const number = Number(normalized.replace(/[MK]/g, ""));
  const dollars = suffix === "M" ? number * 1_000_000 : suffix === "K" ? number * 1_000 : number;
  const scaled = dollars * multiplier;

  if (scaled >= 1_000_000) {
    return `$${(scaled / 1_000_000).toFixed(2)}M`;
  }

  return `$${(scaled / 1_000).toFixed(1)}K`;
}

function scaleSeries(series: number[], multiplier: number) {
  return series.map((value) => Math.round(value * multiplier));
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

  return { top: fallbackTop, bottom: fallbackBottom };
}

export function getDashboardData(period: Period): DashboardData {
  return period === "monthly" ? monthly : weekly;
}

export function getPeriod(value: string | string[] | undefined): Period {
  return value === "monthly" ? "monthly" : "weekly";
}

export function getStoreReport(storeId: string, period: Period): StoreReport | null {
  const store = stores.find((candidate) => candidate.id === storeId);

  if (!store) {
    return null;
  }

  const portfolio = getDashboardData(period);
  const multiplier = storeMultipliers[store.id] ?? 0.84;
  const budtenders = makeStoreBudtenders(store, period);

  return {
    store,
    period,
    title: `${store.name} ${period === "monthly" ? "current month" : "previous week"} report`,
    subtitle: `${store.market} store performance, budtenders, products, and inventory`,
    dateRange: portfolio.dateRange,
    comparisonTitle:
      period === "monthly"
        ? "Latest week over week, net basis"
        : "Week over week, net basis",
    comparisons: [store.comparison.netSales, store.comparison.transactions, store.comparison.averageTicket],
    kpis: portfolio.kpis.map((kpi) => ({
      ...kpi,
      value: kpi.value.includes("$") ? scaleMoneyLabel(kpi.value, multiplier / 5.2) : kpi.value,
      series: scaleSeries(kpi.series, multiplier)
    })),
    revenueSeries: portfolio.revenueSeries.map((point) => ({
      ...point,
      revenue: Math.round(point.revenue * multiplier * 0.18),
      transactions: Math.round(point.transactions * multiplier * 0.18)
    })),
    categoryMix: portfolio.categoryMix,
    inventorySignals: portfolio.inventorySignals,
    products: portfolio.products.map((product) => ({
      ...product,
      units: Math.round(product.units * multiplier * 0.22),
      revenue: formatMoney(Number(product.revenue.replace(/[$K]/g, "")) * 1000 * multiplier * 0.18)
    })),
    budtenders,
    alerts: [
      { title: `${store.city} snapshot ready`, body: `${store.name} finished the period at ${store.priorWeekNet} net sales with ${store.inventory} inventory health.`, tone: store.status === "Action" ? "risk" : store.status === "Watch" ? "warn" : "good" },
      ...portfolio.alerts.slice(0, 2)
    ]
  };
}
