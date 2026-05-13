import type { DutchieInventorySummary } from "@/lib/dutchie";
import type { ProductVelocity, ProductVelocityLineItem, StoreReport } from "@/lib/mock-dutchie";

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

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function parseMoneyLabel(label: string | undefined) {
  if (!label) {
    return 0;
  }

  const normalized = label.replace(/[$,+]/g, "").trim().toUpperCase();
  const multiplier = normalized.endsWith("M") ? 1_000_000 : normalized.endsWith("K") ? 1_000 : 1;
  const value = Number.parseFloat(normalized.replace(/[KM]/g, ""));
  return Number.isFinite(value) ? value * multiplier : 0;
}

function parseCountLabel(label: string | undefined) {
  const value = Number.parseFloat((label ?? "").replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function parsePercentLabel(label: string | undefined) {
  const value = Number.parseFloat((label ?? "").replace("%", ""));
  return Number.isFinite(value) ? value : 0;
}

function pct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function share(count: number, total: number) {
  if (total <= 0) {
    return "0.0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

function comparison(report: StoreReport, label: string) {
  return report.comparisons.find((item) => item.label === label);
}

function productFallbackLine(product: ProductVelocity, index: number): ProductVelocityLineItem {
  const units = Math.max(product.units, 0);
  const sales = parseMoneyLabel(product.revenue);

  return {
    productId: -index,
    sku: product.sku ?? `${product.name}-${index}`,
    name: product.name,
    brand: product.brand ?? product.vendor ?? product.name,
    vendor: product.vendor ?? product.brand ?? "Dutchie product rollup",
    category: product.category,
    units,
    revenue: product.revenue,
    avgNetPrice: product.avgNetPrice ?? money(sales / Math.max(units, 1)),
    margin: product.margin ?? "Cost n/a",
    marginDollars: product.marginDollars ?? "Cost n/a"
  };
}

function productLines(products: ProductVelocity[]) {
  return products.flatMap((product, index) =>
    product.lineItems && product.lineItems.length > 0 ? product.lineItems : [productFallbackLine(product, index)]
  );
}

function buildProducts(lines: ProductVelocityLineItem[], report: StoreReport): StoreProductInsight[] {
  const storeTrend = report.store.comparison.netSales.percent;

  return [...lines]
    .sort((a, b) => parseMoneyLabel(b.revenue) - parseMoneyLabel(a.revenue))
    .slice(0, 12)
    .map((line, index) => ({
      name: line.name,
      brand: line.brand,
      category: line.category,
      units: line.units,
      netSales: line.revenue,
      revenueRank: index + 1,
      margin: line.margin,
      marginDollars: line.marginDollars,
      avgPrice: line.avgNetPrice,
      trend: storeTrend
    }));
}

function buildBrands(lines: ProductVelocityLineItem[], report: StoreReport): BrandInsight[] {
  const brands = new Map<
    string,
    {
      brand: string;
      category: string;
      categories: Set<string>;
      netSales: number;
      units: number;
      profit: number;
    }
  >();

  for (const line of lines) {
    const existing =
      brands.get(line.brand) ??
      ({
        brand: line.brand,
        category: line.category,
        categories: new Set<string>(),
        netSales: 0,
        units: 0,
        profit: 0
      } satisfies {
        brand: string;
        category: string;
        categories: Set<string>;
        netSales: number;
        units: number;
        profit: number;
      });

    existing.netSales += parseMoneyLabel(line.revenue);
    existing.units += line.units;
    existing.profit += line.marginDollars === "Cost n/a" ? 0 : parseMoneyLabel(line.marginDollars);
    existing.categories.add(line.category);
    existing.category = existing.categories.size === 1 ? line.category : `${existing.categories.size} categories`;
    brands.set(line.brand, existing);
  }

  const totalSales = Array.from(brands.values()).reduce((sum, brand) => sum + brand.netSales, 0);

  return Array.from(brands.values())
    .sort((a, b) => b.netSales - a.netSales)
    .slice(0, 12)
    .map((brand) => ({
      brand: brand.brand,
      category: brand.category,
      netSales: money(brand.netSales),
      units: brand.units,
      margin: brand.profit > 0 && brand.netSales > 0 ? `${((brand.profit / brand.netSales) * 100).toFixed(1)}%` : "Cost n/a",
      share: share(brand.netSales, totalSales),
      trend: report.store.comparison.netSales.percent
    }));
}

function buildSalesMaps(lines: ProductVelocityLineItem[]) {
  const bySku = new Map<string, { units: number; sales: number }>();
  const byProductId = new Map<number, { units: number; sales: number }>();

  for (const line of lines) {
    const sales = parseMoneyLabel(line.revenue);
    const sku = bySku.get(line.sku) ?? { units: 0, sales: 0 };
    sku.units += line.units;
    sku.sales += sales;
    bySku.set(line.sku, sku);

    const product = byProductId.get(line.productId) ?? { units: 0, sales: 0 };
    product.units += line.units;
    product.sales += sales;
    byProductId.set(line.productId, product);
  }

  return { bySku, byProductId };
}

function buildInventorySkuRows(inventory: DutchieInventorySummary[], lines: ProductVelocityLineItem[], report: StoreReport): SkuInsight[] {
  const periodDays = report.period === "monthly" ? 30 : 7;
  const salesMaps = buildSalesMaps(lines);
  const grouped = new Map<
    string,
    {
      item: DutchieInventorySummary;
      onHand: number;
      retailValue: number;
      salesUnits: number;
      sales: number;
    }
  >();

  for (const item of inventory) {
    const sales = salesMaps.byProductId.get(item.productId) ?? salesMaps.bySku.get(item.sku) ?? { units: 0, sales: 0 };
    const key = `${item.productId}-${item.sku}`;
    const existing = grouped.get(key) ?? { item, onHand: 0, retailValue: 0, salesUnits: sales.units, sales: sales.sales };
    existing.onHand += item.onHand;
    existing.retailValue += item.retailValue;
    existing.salesUnits = Math.max(existing.salesUnits, sales.units);
    existing.sales = Math.max(existing.sales, sales.sales);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values())
    .map(({ item, onHand, salesUnits, sales }) => {
      const dailyVelocity = salesUnits / periodDays;
      const daysOfSupply = dailyVelocity > 0 ? Math.max(1, Math.round(onHand / dailyVelocity)) : 999;
      const reorderStatus: SkuInsight["reorderStatus"] =
        salesUnits <= 0 && onHand > 0 ? "Watch" : daysOfSupply <= 5 ? "Reorder" : daysOfSupply <= 14 ? "Watch" : "Healthy";

      return {
        sku: item.sku,
        product: item.productName,
        brand: item.brand,
        onHand,
        daysOfSupply,
        weeklyUnits: report.period === "monthly" ? Math.round(salesUnits / 4.3) : salesUnits,
        netSales: money(sales),
        reorderStatus
      };
    })
    .sort((a, b) => {
      const statusWeight = { Reorder: 0, Watch: 1, Healthy: 2 };
      return statusWeight[a.reorderStatus] - statusWeight[b.reorderStatus] || a.daysOfSupply - b.daysOfSupply || b.weeklyUnits - a.weeklyUnits;
    })
    .slice(0, 30);
}

function buildProductSkuRows(lines: ProductVelocityLineItem[], report: StoreReport): SkuInsight[] {
  return [...lines]
    .sort((a, b) => parseMoneyLabel(b.revenue) - parseMoneyLabel(a.revenue))
    .slice(0, 20)
    .map((line) => ({
      sku: line.sku,
      product: line.name,
      brand: line.brand,
      onHand: 0,
      daysOfSupply: 0,
      weeklyUnits: report.period === "monthly" ? Math.round(line.units / 4.3) : line.units,
      netSales: line.revenue,
      reorderStatus: "Healthy" as const
    }));
}

function buildReorders(skus: SkuInsight[]): ReorderInsight[] {
  return skus
    .filter((sku) => sku.reorderStatus !== "Healthy")
    .slice(0, 12)
    .map((sku) => {
      const noSales = sku.weeklyUnits <= 0;
      const suggestedOrder = noSales ? 0 : Math.max(0, Math.round(sku.weeklyUnits * 1.65 - sku.onHand));

      return {
        sku: sku.sku,
        product: sku.product,
        vendor: sku.brand,
        onHand: sku.onHand,
        sevenDayVelocity: sku.weeklyUnits,
        suggestedOrder,
        reason: noSales
          ? "On-hand inventory has no sales in the selected Dutchie period; review markdown, transfer, or menu placement."
          : sku.daysOfSupply <= 5
            ? "Top seller below 5 days of supply."
            : "Velocity and on-hand balance need reorder review.",
        urgency: sku.reorderStatus === "Reorder" ? "High" : noSales ? "Low" : "Medium"
      };
    });
}

function buildTransactions(report: StoreReport): TransactionInsight[] {
  return report.revenueSeries.map((point) => ({
    label: point.label,
    transactions: point.transactions,
    netSales: money(point.revenue),
    avgTicket: money(point.revenue / Math.max(point.transactions, 1)),
    discountRate: "Not itemized"
  }));
}

function buildDaypart(report: StoreReport) {
  const transactions = report.revenueSeries.map((point) => point.transactions);
  const baseline = Math.round(transactions.reduce((sum, value) => sum + value, 0) / Math.max(transactions.length, 1));

  return report.revenueSeries.map((point) => ({
    label: point.label,
    current: point.transactions,
    previous: baseline
  }));
}

function buildDemographics(report: StoreReport, topCategory: string): DemographicInsight[] {
  const returning = comparison(report, "Returning customers");
  const newlyAcquired = comparison(report, "New customers");
  const returningCount = parseCountLabel(returning?.current);
  const newCount = parseCountLabel(newlyAcquired?.current);
  const totalCustomers = returningCount + newCount;
  const avgTicket = report.store.comparison.averageTicket.current;

  return [
    {
      segment: "Returning customers",
      share: share(returningCount, totalCustomers),
      avgTicket,
      preferredCategory: topCategory,
      note: returning
        ? `${returning.current} returning customers from Dutchie customerCount minus newCustomerCount.`
        : "Returning customer data is unavailable for this store sync."
    },
    {
      segment: "New customers",
      share: share(newCount, totalCustomers),
      avgTicket,
      preferredCategory: topCategory,
      note: newlyAcquired
        ? `${newlyAcquired.current} new customers from Dutchie newCustomerCount.`
        : "New customer data is unavailable for this store sync."
    },
    {
      segment: "Completed transactions",
      share: "100.0%",
      avgTicket,
      preferredCategory: topCategory,
      note: `${report.store.comparison.transactions.current} completed Dutchie transactions in the selected period.`
    }
  ];
}

function buildMarketingIdeas(report: StoreReport, products: StoreProductInsight[], reorders: ReorderInsight[], demographics: DemographicInsight[]): MarketingIdea[] {
  const topProduct = products[0];
  const topReorder = reorders[0];
  const newCustomers = demographics.find((segment) => segment.segment === "New customers");

  return [
    {
      title: "Protect top product velocity",
      audience: topProduct ? `Buyers of ${topProduct.brand} / ${topProduct.category}` : "Current-period buyers",
      offer: topProduct ? `Keep ${topProduct.name} visible and stocked before substitution leakage starts.` : "Use the live top-products list for merchandising focus.",
      channel: "Menu placement + budtender prompt",
      expectedLift: "Reduce lost sales from availability gaps"
    },
    {
      title: topReorder ? "Resolve reorder pressure" : "Maintain inventory discipline",
      audience: topReorder ? `Customers seeking ${topReorder.product}` : "Top SKU shoppers",
      offer: topReorder ? `Order or substitute ${topReorder.sku}; current suggested order is ${topReorder.suggestedOrder}.` : "Keep top movers above reorder threshold.",
      channel: "Purchasing queue",
      expectedLift: "Lower stockout risk"
    },
    {
      title: "Convert first-period customers",
      audience: newCustomers?.note ?? "New customers from Dutchie",
      offer: "Follow-up message tied to the category they bought, not a generic discount.",
      channel: "CRM / SMS when connected",
      expectedLift: "Improve second-purchase rate"
    }
  ];
}

export function getStoreInsights(report: StoreReport): StoreInsightReport {
  const lines = productLines(report.products);
  const products = buildProducts(lines, report);
  const brands = buildBrands(lines, report);
  const skus =
    report.inventoryItems.length > 0 ? buildInventorySkuRows(report.inventoryItems, lines, report) : buildProductSkuRows(lines, report);
  const reorders = buildReorders(skus);
  const transactions = buildTransactions(report);
  const topCategory = brands[0]?.category ?? products[0]?.category ?? "Live Dutchie category";
  const demographics = buildDemographics(report, topCategory);
  const newCustomerShare = parsePercentLabel(demographics.find((segment) => segment.segment === "New customers")?.share);

  return {
    products,
    brands,
    skus,
    reorders,
    transactions,
    demographics,
    marketingIdeas: buildMarketingIdeas(report, products, reorders, demographics),
    daypart: buildDaypart(report),
    categoryOpportunity: [
      {
        label: "Margin expansion",
        value: products[0]?.margin ?? "Cost n/a",
        detail: products[0]
          ? `${products[0].name} is the leading live SKU by net sales with ${products[0].margin} estimated margin.`
          : "No live product rows are available for this store.",
        tone: products[0]?.margin === "Cost n/a" ? "warn" : "good"
      },
      {
        label: "Reorder pressure",
        value: `${reorders.length} SKUs`,
        detail: reorders[0]?.reason ?? "No urgent reorder pressure in the live Dutchie inventory rows.",
        tone: reorders.some((item) => item.urgency === "High") ? "risk" : reorders.length > 0 ? "warn" : "good"
      },
      {
        label: "New customer mix",
        value: demographics.find((segment) => segment.segment === "New customers")?.share ?? "0.0%",
        detail: `${demographics.find((segment) => segment.segment === "New customers")?.note ?? "Dutchie customer mix is unavailable."}`,
        tone: newCustomerShare >= 15 ? "good" : newCustomerShare >= 8 ? "warn" : "risk"
      },
      {
        label: "Transaction quality",
        value: report.store.comparison.averageTicket.current,
        detail: `${report.store.comparison.transactions.current} transactions at ${report.store.comparison.averageTicket.current} average net ticket.`,
        tone: report.store.comparison.averageTicket.direction === "down" ? "warn" : "good"
      }
    ]
  };
}
