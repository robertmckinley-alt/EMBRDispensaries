import type { Period, StoreSnapshot } from "@/lib/mock-dutchie";

export type StoreProductInsight = {
  name: string;
  brand: string;
  category: string;
  units: number;
  netSales: string;
  revenueRank: number;
  margin: string;
  marginDollars: string;
  avgPrice: string;
  trend: string;
};

export type BrandInsight = {
  brand: string;
  category: string;
  netSales: string;
  units: number;
  margin: string;
  share: string;
  trend: string;
};

export type SkuInsight = {
  sku: string;
  product: string;
  brand: string;
  onHand: number;
  daysOfSupply: number;
  weeklyUnits: number;
  netSales: string;
  reorderStatus: "Reorder" | "Watch" | "Healthy";
};

export type ReorderInsight = {
  sku: string;
  product: string;
  vendor: string;
  onHand: number;
  sevenDayVelocity: number;
  suggestedOrder: number;
  reason: string;
  urgency: "High" | "Medium" | "Low";
};

export type TransactionInsight = {
  label: string;
  transactions: number;
  netSales: string;
  avgTicket: string;
  discountRate: string;
};

export type DemographicInsight = {
  segment: string;
  share: string;
  avgTicket: string;
  preferredCategory: string;
  note: string;
};

export type MarketingIdea = {
  title: string;
  audience: string;
  offer: string;
  channel: string;
  expectedLift: string;
};

export type StoreInsightReport = {
  products: StoreProductInsight[];
  brands: BrandInsight[];
  skus: SkuInsight[];
  reorders: ReorderInsight[];
  transactions: TransactionInsight[];
  demographics: DemographicInsight[];
  marketingIdeas: MarketingIdea[];
  daypart: Array<{
    label: string;
    current: number;
    previous: number;
  }>;
  categoryOpportunity: Array<{
    label: string;
    value: string;
    detail: string;
    tone: "good" | "warn" | "risk";
  }>;
};

const brandPool = [
  "Blue River",
  "Wyld",
  "Jeeter",
  "Stiiizy",
  "Camino",
  "Garden Remedies",
  "Kiva",
  "Raw Garden"
];

const productPool = [
  { name: "Blue Dream 3.5g", category: "Flower" },
  { name: "Live Resin Cart 1g", category: "Vapes" },
  { name: "Infused Mini Pre-roll 5pk", category: "Pre-rolls" },
  { name: "Solventless Gummies 100mg", category: "Edibles" },
  { name: "Wedding Cake 1g Pre-roll", category: "Pre-rolls" },
  { name: "Tropical Rosin Disposable", category: "Vapes" },
  { name: "Runtz 3.5g", category: "Flower" },
  { name: "Sleep CBN Gummies", category: "Edibles" }
];

const segments = [
  "Evening loyalists",
  "Weekend stock-up",
  "Value flower buyers",
  "Premium vape buyers",
  "Edible wellness",
  "New customer trial"
];

const storeIndex: Record<string, number> = {
  springfield: 0,
  northampton: 1,
  "fyre-ants": 2,
  "la-mesa": 3,
  "lake-elsinore": 4,
  "hlc-greenfield": 5
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function pct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function storeSeed(store: StoreSnapshot, period: Period) {
  const base = storeIndex[store.id] ?? 0;
  return base + (period === "monthly" ? 5 : 0);
}

export function getStoreInsights(store: StoreSnapshot, period: Period): StoreInsightReport {
  const seed = storeSeed(store, period);
  const periodScale = period === "monthly" ? 3.85 : 1;
  const storeScale = 0.82 + seed * 0.07;

  const products = productPool.slice(0, 6).map((product, index) => {
    const units = Math.round((720 - index * 74 + seed * 18) * periodScale * storeScale);
    const price = 18 + index * 4.5;
    const net = units * price;
    const margin = 42 - index * 1.9 + seed * 0.45;

    return {
      name: product.name,
      brand: brandPool[(index + seed) % brandPool.length],
      category: product.category,
      units,
      netSales: money(net),
      revenueRank: index + 1,
      margin: `${margin.toFixed(1)}%`,
      marginDollars: money(net * (margin / 100)),
      avgPrice: money(price),
      trend: pct(18 - index * 4 + seed * 0.8)
    };
  });

  const brands = brandPool.slice(0, 6).map((brand, index) => {
    const units = Math.round((980 - index * 93 + seed * 22) * periodScale * storeScale);
    const net = units * (15 + index * 3.2);

    return {
      brand,
      category: productPool[(index + 1) % productPool.length].category,
      netSales: money(net),
      units,
      margin: `${(45 - index * 2.4 + seed * 0.35).toFixed(1)}%`,
      share: `${(24 - index * 2.7).toFixed(1)}%`,
      trend: pct(12 - index * 2.1 + seed * 0.6)
    };
  });

  const skus: SkuInsight[] = productPool.map((product, index) => {
    const weeklyUnits = Math.round((210 - index * 18 + seed * 6) * storeScale);
    const onHand = Math.max(8, Math.round((weeklyUnits * (index % 3 === 0 ? 0.8 : 2.7)) - seed * 4));
    const daysOfSupply = Math.max(1, Math.round((onHand / Math.max(weeklyUnits, 1)) * 7));
    const status: SkuInsight["reorderStatus"] =
      daysOfSupply <= 5 ? "Reorder" : daysOfSupply <= 12 ? "Watch" : "Healthy";

    return {
      sku: `${store.id.toUpperCase().slice(0, 3)}-${1000 + index * 37}`,
      product: product.name,
      brand: brandPool[(index + seed) % brandPool.length],
      onHand,
      daysOfSupply,
      weeklyUnits,
      netSales: money(weeklyUnits * (18 + index * 3.8)),
      reorderStatus: status
    };
  });

  const reorders: ReorderInsight[] = skus
    .filter((sku) => sku.reorderStatus !== "Healthy")
    .slice(0, 5)
    .map((sku, index) => ({
      sku: sku.sku,
      product: sku.product,
      vendor: sku.brand,
      onHand: sku.onHand,
      sevenDayVelocity: sku.weeklyUnits,
      suggestedOrder: Math.max(24, Math.round(sku.weeklyUnits * 1.65 - sku.onHand)),
      reason: sku.daysOfSupply <= 5 ? "Top seller below 5 days of supply" : "Velocity rising, tighten reorder timing",
      urgency: sku.daysOfSupply <= 5 ? "High" : index <= 2 ? "Medium" : "Low"
    }));

  const transactions = ["Morning", "Lunch", "Afternoon", "Evening", "Late"].map((label, index) => {
    const transactions = Math.round((290 + index * 84 + seed * 21) * periodScale * storeScale);
    const avgTicket = 54 + index * 3.2 + seed * 0.4;

    return {
      label,
      transactions,
      netSales: money(transactions * avgTicket),
      avgTicket: money(avgTicket),
      discountRate: `${(8.5 + index * 0.8 - seed * 0.15).toFixed(1)}%`
    };
  });

  const demographics = segments.slice(0, 5).map((segment, index) => ({
    segment,
    share: `${(31 - index * 4.4 + seed * 0.3).toFixed(1)}%`,
    avgTicket: money(58 + index * 4.1 + seed * 0.7),
    preferredCategory: productPool[(index + seed) % productPool.length].category,
    note:
      index === 0
        ? "Best response to targeted reorder reminders after 4 PM."
        : index === 1
          ? "Bundles and multi-pack messaging lift units per basket."
          : index === 2
            ? "Price-sensitive segment responds to under-$35 flower offers."
            : index === 3
              ? "High-margin carts and disposables can carry premium offers."
              : "Strong candidate for wellness and low-dose edible education."
  }));

  const marketingIdeas = [
    {
      title: "Win-back high-value lapsed customers",
      audience: "Customers with 30-45 day gap and prior basket over $75",
      offer: "Personalized category reminder with limited-time bonus points",
      channel: "Email + SMS",
      expectedLift: "+4-6% net sales"
    },
    {
      title: "Protect reorder risk on top SKUs",
      audience: "Buyers of SKUs below seven days of supply",
      offer: "Recommend substitute products in the same brand/category",
      channel: "Budtender prompt",
      expectedLift: "Lower stockout leakage"
    },
    {
      title: "Raise average ticket in evening rush",
      audience: "Evening shoppers buying single item baskets",
      offer: "Attach edible or pre-roll bundle at checkout",
      channel: "In-store + POS prompt",
      expectedLift: "+$2.50 avg ticket"
    }
  ];

  const daypart = transactions.map((transaction, index) => ({
    label: transaction.label,
    current: transaction.transactions,
    previous: Math.max(1, Math.round(transaction.transactions * (0.88 + index * 0.025)))
  }));

  const categoryOpportunity = [
    {
      label: "Margin expansion",
      value: products[0].margin,
      detail: `${products[0].brand} and ${products[1].brand} are carrying the strongest contribution.`,
      tone: "good" as const
    },
    {
      label: "Reorder pressure",
      value: `${reorders.length} SKUs`,
      detail: reorders[0]?.reason ?? "No urgent reorder pressure in top movers.",
      tone: reorders.length > 3 ? "risk" as const : "warn" as const
    },
    {
      label: "Basket lift",
      value: transactions[3].avgTicket,
      detail: "Evening baskets are the best attach-rate opportunity.",
      tone: "good" as const
    }
  ];

  return {
    products,
    brands,
    skus,
    reorders,
    transactions,
    demographics,
    marketingIdeas,
    daypart,
    categoryOpportunity
  };
}
