import type { DutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";
import type { DashboardData, Period, ProductVelocity, StoreSnapshot } from "@/lib/mock-dutchie";

export type ExecutiveMetric = {
  label: string;
  value: string;
  detail: string;
  status: "positive" | "watch" | "risk" | "neutral";
};

export type ExecutiveInsight = {
  title: string;
  body: string;
  priority: "High" | "Medium" | "Low";
  type: "Performance" | "Risk" | "Opportunity" | "Data";
};

export type ReportModule = {
  title: string;
  cadence: string;
  audience: string;
  status: "Live" | "Ready" | "Planned";
};

export type ExecutiveIntelligence = {
  narrative: {
    headline: string;
    summary: string;
    bullets: string[];
  };
  financial: ExecutiveMetric[];
  customer: ExecutiveMetric[];
  operational: ExecutiveMetric[];
  aiInsights: ExecutiveInsight[];
  reportModules: ReportModule[];
  marketScorecards: Array<{
    label: string;
    value: number;
    detail: string;
    status: ExecutiveMetric["status"];
  }>;
  chartData: {
    revenue: Array<{ label: string; netRevenue: number; transactions: number }>;
    locations: Array<{ name: string; netRevenue: number; transactions: number; avgTicket: number; status: string }>;
    products: Array<{ name: string; netRevenue: number; units: number; margin: number }>;
    waterfall: Array<{ label: string; value: number; type: "positive" | "negative" | "neutral" }>;
  };
};

function parseMoney(value: string) {
  const text = value.replace(/[$,+]/g, "").trim().toUpperCase();
  const multiplier = text.endsWith("M") ? 1_000_000 : text.endsWith("K") ? 1_000 : 1;
  const parsed = Number.parseFloat(text.replace(/[KM]/g, ""));
  return Number.isFinite(parsed) ? parsed * multiplier : 0;
}

function parseCount(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function pct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function periodName(period: Period) {
  return period === "monthly" ? "completed calendar month" : "completed Monday-Sunday week";
}

function currentMetric(data: DashboardData, label: string) {
  return data.comparisons.find((comparison) => comparison.label === label);
}

function periodForResult(result: NonNullable<DutchieSyncSnapshot>["results"][number], period: Period) {
  return period === "monthly" ? result.analytics?.monthly.current : result.analytics?.weekly.current;
}

function buildFinancialMetrics(data: DashboardData, period: Period, snapshot: DutchieSyncSnapshot | null): ExecutiveMetric[] {
  const liveResults = snapshot?.results.filter((result) => result.analytics) ?? [];
  const grossRevenue = liveResults.reduce((sum, result) => sum + (periodForResult(result, period)?.grossSales ?? 0), 0);
  const discounts = liveResults.reduce((sum, result) => sum + (periodForResult(result, period)?.discounts ?? 0), 0);
  const netRevenue = parseMoney(currentMetric(data, "Net sales")?.current ?? data.kpis[0]?.value ?? "0");
  const marginProxy =
    grossRevenue > 0 ? ((grossRevenue - discounts - Math.max(grossRevenue - netRevenue - discounts, 0)) / grossRevenue) * 100 : 0;

  return [
    {
      label: "Net revenue",
      value: compactMoney(netRevenue),
      detail: `Dutchie closing-report netSales for the ${periodName(period)}.`,
      status: currentMetric(data, "Net sales")?.direction === "down" ? "risk" : "positive"
    },
    {
      label: "Gross revenue",
      value: grossRevenue > 0 ? compactMoney(grossRevenue) : "Not connected",
      detail: "Gross sales before discounts from connected Dutchie stores.",
      status: grossRevenue > 0 ? "neutral" : "watch"
    },
    {
      label: "Discount impact",
      value: discounts > 0 ? compactMoney(discounts) : "Not connected",
      detail: grossRevenue > 0 ? `${pct(-(discounts / grossRevenue) * 100)} of gross revenue.` : "Requires live gross and discount fields.",
      status: discounts / Math.max(grossRevenue, 1) > 0.18 ? "risk" : "watch"
    },
    {
      label: "Net profit / EBITDA",
      value: "Not connected",
      detail: "Needs operating expense, payroll, rent, and COGS ledger integration before showing as fact.",
      status: "watch"
    },
    {
      label: "Margin indicator",
      value: marginProxy > 0 ? `${marginProxy.toFixed(1)}%` : "Pending",
      detail: "Revenue-side margin proxy; not a replacement for financial statement margin.",
      status: marginProxy > 55 ? "positive" : "neutral"
    },
    {
      label: "CAC / ROAS",
      value: "Not connected",
      detail: "Ready for marketing platform integration once ad spend and customer acquisition data are connected.",
      status: "watch"
    }
  ];
}

function buildCustomerMetrics(data: DashboardData): ExecutiveMetric[] {
  const transactions = currentMetric(data, "Transactions");
  const avgTicket = currentMetric(data, "Avg net ticket");
  const returningCustomers = currentMetric(data, "Returning customers");
  const newCustomers = currentMetric(data, "New customers");

  return [
    {
      label: "Orders",
      value: transactions?.current ?? "Not connected",
      detail: "Dutchie transactionCount for the current reporting period.",
      status: transactions?.direction === "down" ? "risk" : "positive"
    },
    {
      label: "Net AOV",
      value: avgTicket?.current ?? "Not connected",
      detail: "Net sales divided by completed transaction count.",
      status: avgTicket?.direction === "down" ? "watch" : "positive"
    },
    {
      label: "Returning customers",
      value: returningCustomers?.current ?? "Not connected",
      detail: returningCustomers?.detail ?? "Dutchie closing-report customerCount minus newCustomerCount.",
      status: returningCustomers ? (returningCustomers.direction === "down" ? "watch" : "positive") : "watch"
    },
    {
      label: "New customers",
      value: newCustomers?.current ?? "Not connected",
      detail: newCustomers?.detail ?? "Dutchie closing-report newCustomerCount.",
      status: newCustomers ? (newCustomers.direction === "down" ? "watch" : "positive") : "watch"
    }
  ];
}

function buildOperationalMetrics(data: DashboardData, snapshot: DutchieSyncSnapshot | null): ExecutiveMetric[] {
  const connectedStores = snapshot?.results.filter((result) => result.verified).length ?? data.stores.length;
  const totalStores = snapshot?.results.length ?? data.stores.length;
  const actionStores = data.stores.filter((store) => store.status !== "Healthy");
  const inventoryRows = snapshot?.results.reduce((sum, result) => sum + (result.inventoryFetched ?? 0), 0) ?? 0;

  return [
    {
      label: "Store productivity",
      value: `${connectedStores}/${totalStores}`,
      detail: "Verified locations contributing live data to the reporting engine.",
      status: connectedStores === totalStores ? "positive" : "watch"
    },
    {
      label: "Exception stores",
      value: actionStores.length.toString(),
      detail: actionStores.length > 0 ? actionStores.map((store) => store.name).join(", ") : "No stores outside healthy status.",
      status: actionStores.length > 0 ? "risk" : "positive"
    },
    {
      label: "Inventory coverage",
      value: inventoryRows > 0 ? inventoryRows.toLocaleString() : "Pending",
      detail: "Live inventory rows available for stockout, expiry, and ROI analysis.",
      status: inventoryRows > 0 ? "positive" : "watch"
    },
    {
      label: "Fulfillment / labor",
      value: "Not connected",
      detail: "Ready for ecommerce, labor, and fulfillment platform data.",
      status: "watch"
    }
  ];
}

function storeNet(store: StoreSnapshot, period: Period) {
  return parseMoney(period === "monthly" ? store.comparison.netSales.current : store.priorWeekNet);
}

function buildLocationChart(data: DashboardData, period: Period) {
  return data.stores.map((store) => ({
    name: store.name.replace("EMBR ", ""),
    netRevenue: storeNet(store, period),
    transactions: parseCount(store.comparison.transactions.current),
    avgTicket: parseMoney(store.comparison.averageTicket.current),
    status: store.status
  }));
}

function productMargin(product: ProductVelocity) {
  const lines = product.lineItems ?? [];
  const margins = lines
    .map((line) => Number.parseFloat(line.margin.replace("%", "")))
    .filter((value) => Number.isFinite(value));

  if (margins.length === 0) {
    return 0;
  }

  return margins.reduce((sum, value) => sum + value, 0) / margins.length;
}

function buildProductChart(data: DashboardData) {
  return data.products.slice(0, 10).map((product) => ({
    name: product.name.length > 28 ? `${product.name.slice(0, 26)}...` : product.name,
    netRevenue: parseMoney(product.revenue),
    units: product.units,
    margin: productMargin(product)
  }));
}

function buildWaterfall(data: DashboardData, snapshot: DutchieSyncSnapshot | null, period: Period) {
  const liveResults = snapshot?.results.filter((result) => result.analytics) ?? [];
  const grossRevenue = liveResults.reduce((sum, result) => sum + (periodForResult(result, period)?.grossSales ?? 0), 0);
  const discounts = liveResults.reduce((sum, result) => sum + (periodForResult(result, period)?.discounts ?? 0), 0);
  const taxes = liveResults.reduce((sum, result) => sum + (periodForResult(result, period)?.taxes ?? 0), 0);
  const netRevenue = parseMoney(currentMetric(data, "Net sales")?.current ?? "0");

  return [
    { label: "Gross", value: grossRevenue, type: "positive" as const },
    { label: "Discounts", value: -discounts, type: "negative" as const },
    { label: "Net sales", value: netRevenue, type: "neutral" as const },
    { label: "Taxes", value: taxes, type: "positive" as const }
  ];
}

function buildInsights(data: DashboardData, period: Period, snapshot: DutchieSyncSnapshot | null): ExecutiveInsight[] {
  const netSales = currentMetric(data, "Net sales");
  const avgTicket = currentMetric(data, "Avg net ticket");
  const returningCustomers = currentMetric(data, "Returning customers");
  const newCustomers = currentMetric(data, "New customers");
  const topStore = [...data.stores].sort((a, b) => storeNet(b, period) - storeNet(a, period))[0];
  const riskStores = data.stores.filter((store) => store.status !== "Healthy");
  const disconnected = snapshot?.results.filter((result) => !result.verified) ?? [];
  const topProduct = data.products[0];

  return [
    {
      title: netSales?.direction === "down" ? "Revenue requires operator review" : "Revenue trend is favorable",
      body:
        netSales?.direction === "down"
          ? `Net revenue is ${netSales.delta} (${netSales.percent}) versus the comparable period. Review traffic, discounting, and product availability by location.`
          : `Net revenue is ${netSales?.delta ?? "up"} (${netSales?.percent ?? "positive"}) versus the comparable period, led by ${topStore?.name ?? "connected stores"}.`,
      priority: netSales?.direction === "down" ? "High" : "Medium",
      type: netSales?.direction === "down" ? "Risk" : "Performance"
    },
    {
      title: "Product velocity is now SKU-auditable",
      body: topProduct
        ? `${topProduct.name} leads the product view at ${topProduct.revenue}. Expanded cards expose the product/SKU mix behind vendor rollups.`
        : "SKU velocity will populate after live product and transaction rollups are available.",
      priority: "Medium",
      type: "Opportunity"
    },
    {
      title: avgTicket?.direction === "down" ? "AOV pressure emerging" : "AOV is holding",
      body:
        avgTicket?.direction === "down"
          ? `Average net ticket is down ${avgTicket.delta}; isolate discounting and basket composition in store reports.`
          : `Average net ticket is ${avgTicket?.current ?? "available"} and ${avgTicket?.percent ?? "stable"} versus prior period.`,
      priority: avgTicket?.direction === "down" ? "High" : "Low",
      type: avgTicket?.direction === "down" ? "Risk" : "Performance"
    },
    {
      title: "Customer mix is now visible",
      body:
        returningCustomers && newCustomers
          ? `Returning customers are ${returningCustomers.current} (${returningCustomers.percent}) and new customers are ${newCustomers.current} (${newCustomers.percent}) for the selected period.`
          : "Customer mix will populate after the next Dutchie sync includes customerCount and newCustomerCount.",
      priority: returningCustomers && newCustomers ? "Medium" : "Low",
      type: "Performance"
    },
    {
      title: riskStores.length > 0 ? "Store exceptions need assignment" : "No major store exceptions",
      body:
        riskStores.length > 0
          ? `${riskStores.map((store) => store.name).join(", ")} need owner review based on status, inventory health, or sales movement.`
          : "All connected stores are currently inside the healthy/watch threshold for the dashboard status model.",
      priority: riskStores.length > 0 ? "High" : "Low",
      type: riskStores.length > 0 ? "Risk" : "Performance"
    },
    {
      title: disconnected.length > 0 ? "Data reliability exception" : "Data reliability is acceptable",
      body:
        disconnected.length > 0
          ? `${disconnected.map((result) => result.storeName).join(", ")} is not verified in the latest sync and is excluded from live totals.`
          : "All synced stores are verified and included in the executive rollup.",
      priority: disconnected.length > 0 ? "High" : "Low",
      type: "Data"
    }
  ];
}

function buildMarketScorecards(data: DashboardData, period: Period) {
  const locations = buildLocationChart(data, period);
  const maxRevenue = Math.max(...locations.map((location) => location.netRevenue), 1);

  return locations.slice(0, 6).map((location) => ({
    label: location.name,
    value: Math.round((location.netRevenue / maxRevenue) * 100),
    detail: `${compactMoney(location.netRevenue)} net revenue / ${location.transactions.toLocaleString()} orders`,
    status:
      location.status === "Action"
        ? ("risk" as const)
        : location.status === "Watch"
          ? ("watch" as const)
          : ("positive" as const)
  }));
}

export function buildExecutiveIntelligence(
  data: DashboardData,
  period: Period,
  snapshot: DutchieSyncSnapshot | null
): ExecutiveIntelligence {
  const netSales = currentMetric(data, "Net sales");
  const transactions = currentMetric(data, "Transactions");
  const topStore = [...data.stores].sort((a, b) => storeNet(b, period) - storeNet(a, period))[0];
  const riskCount = data.stores.filter((store) => store.status !== "Healthy").length;

  return {
    narrative: {
      headline: `${period === "monthly" ? "Monthly" : "Weekly"} Executive Intelligence`,
      summary: `${data.periodContext.currentPeriod} performance is presented on a net basis with live Dutchie financials where connected.`,
      bullets: [
        `${netSales?.label ?? "Net revenue"}: ${netSales?.current ?? "n/a"} (${netSales?.delta ?? "n/a"} / ${netSales?.percent ?? "n/a"}).`,
        `${transactions?.label ?? "Orders"}: ${transactions?.current ?? "n/a"} for the ${periodName(period)}.`,
        `Top location: ${topStore?.name ?? "n/a"} at ${topStore ? compactMoney(storeNet(topStore, period)) : "n/a"}.`,
        `${riskCount} location${riskCount === 1 ? "" : "s"} currently require operator review.`
      ]
    },
    financial: buildFinancialMetrics(data, period, snapshot),
    customer: buildCustomerMetrics(data),
    operational: buildOperationalMetrics(data, snapshot),
    aiInsights: buildInsights(data, period, snapshot),
    reportModules: [
      { title: "Weekly Intelligence Snapshot", cadence: "Every Monday", audience: "Operators / Executives", status: "Live" },
      { title: "Monthly Executive Performance Report", cadence: "First of month", audience: "Ownership / Board", status: "Live" },
      { title: "Location Market Intelligence", cadence: "On demand", audience: "Regional operators", status: "Live" },
      { title: "CFO Financial Snapshot", cadence: "Monthly close", audience: "CFO / Finance", status: "Ready" },
      { title: "SKU Performance Intelligence", cadence: "Weekly", audience: "Merchandising", status: "Live" },
      { title: "AI Visual Summary Graphics", cadence: "Per export", audience: "Executives / Board", status: "Ready" },
      { title: "Board Presentation Deck", cadence: "Monthly", audience: "Board / Investors", status: "Planned" }
    ],
    marketScorecards: buildMarketScorecards(data, period),
    chartData: {
      revenue: data.revenueSeries.map((point) => ({
        label: point.label,
        netRevenue: point.revenue,
        transactions: point.transactions
      })),
      locations: buildLocationChart(data, period),
      products: buildProductChart(data),
      waterfall: buildWaterfall(data, snapshot, period)
    }
  };
}

export function buildExecutiveInsightPrompt(intelligence: ExecutiveIntelligence) {
  return [
    "You are an executive retail intelligence analyst. Write concise board-ready commentary.",
    "Use only the supplied metrics. Do not invent unavailable EBITDA, CAC, ROAS, LTV, or operating cost data.",
    "Output: executive summary, risks, opportunities, product insights, location insights, and recommended actions.",
    "",
    `Headline: ${intelligence.narrative.headline}`,
    `Summary: ${intelligence.narrative.summary}`,
    ...intelligence.narrative.bullets.map((bullet) => `Metric: ${bullet}`),
    ...intelligence.aiInsights.map((insight) => `${insight.type}: ${insight.title} - ${insight.body}`)
  ].join("\n");
}

export function buildExecutiveVisualPrompt(intelligence: ExecutiveIntelligence) {
  return [
    "Create a premium executive report hero graphic for a retail intelligence platform.",
    "Style: modern finance-tech, dark neutral background, emerald and muted blue accents, clean grid, boardroom-ready.",
    "Do not include fake numbers. Use abstract chart forms, location tiles, SKU bars, and executive summary motifs.",
    `Theme: ${intelligence.narrative.headline}.`,
    `Key narrative: ${intelligence.narrative.bullets.slice(0, 2).join(" ")}`
  ].join(" ");
}
