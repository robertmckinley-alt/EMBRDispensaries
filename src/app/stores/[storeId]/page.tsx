import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  Gauge,
  Lightbulb,
  PackageCheck,
  ReceiptText,
  ShoppingBasket,
  Tags,
  TrendingUp,
  Users
} from "lucide-react";
import { DataPointDrilldown, DrilldownDetails } from "@/components/drilldown";
import { PeriodContextBar } from "@/components/period-context";
import { ReportActions } from "@/components/report-actions";
import type { DutchieInventorySummary } from "@/lib/dutchie";
import { readDutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";
import { getStoreInsights, type StoreInsightReport, type StoreProductInsight } from "@/lib/store-insights";
import {
  getPeriod,
  getStoreReport,
  stores,
  type BudtenderMetric,
  type ComparisonMetric,
  type Kpi,
  type Period,
  type ProductVelocity,
  type StoreReport
} from "@/lib/mock-dutchie";
import { getStoreIntelligence, type StoreIntelligence, type StoreIntelligenceItem } from "@/lib/store-intelligence";

type StorePageProps = {
  params: Promise<{
    storeId: string;
  }>;
  searchParams?: Promise<{
    period?: string;
    tab?: string;
  }>;
};

const storeTabs = [
  { id: "overview", label: "Owner view", Icon: Gauge },
  { id: "market", label: "Market", Icon: BarChart3 },
  { id: "products", label: "Products", Icon: ShoppingBasket },
  { id: "inventory", label: "Inventory", Icon: PackageCheck },
  { id: "transactions", label: "Transactions", Icon: ReceiptText },
  { id: "customers", label: "Customers", Icon: Users },
  { id: "actions", label: "Actions", Icon: Lightbulb }
] as const;

type StoreTab = (typeof storeTabs)[number]["id"];

function getStoreTab(value: string | string[] | undefined): StoreTab {
  return storeTabs.some((tab) => tab.id === value) ? (value as StoreTab) : "overview";
}

function storeTabHref(storeId: string, period: Period, tab: StoreTab) {
  return `/stores/${storeId}?period=${period}&tab=${tab}`;
}

function trendNote(direction: "up" | "down" | "flat") {
  if (direction === "up") {
    return "Above the comparison period.";
  }

  if (direction === "down") {
    return "Below the comparison period; investigate traffic, pricing, or inventory.";
  }

  return "Flat against the comparison period.";
}

function priorityTone(item: StoreIntelligenceItem) {
  if (item.impact === "Critical") {
    return "risk";
  }

  if (item.impact === "High") {
    return "warn";
  }

  return "good";
}

export function generateStaticParams() {
  return stores.map((store) => ({ storeId: store.id }));
}

function Sparkline({ points }: { points: number[] }) {
  const width = 112;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const d = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={`${d} L ${width} ${height} L 0 ${height} Z`} className="sparklineFill" />
      <path d={d} className="sparklineLine" />
    </svg>
  );
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const icons = [CircleDollarSign, TrendingUp, Gauge, PackageCheck];
  const Icon = icons[index] ?? TrendingUp;

  return (
    <DrilldownDetails
      className="metricCard"
      title={`${kpi.label} store drilldown`}
      description={kpi.detail}
      items={[
        { label: "Current", value: kpi.value },
        { label: "Movement", value: kpi.change, note: trendNote(kpi.direction) },
        { label: "Pacing", value: kpi.series.join(" / "), note: "Relative points used by the sparkline." }
      ]}
      summary={
        <>
          <div className="metricHeader">
            <span className="metricIcon">
              <Icon size={18} />
            </span>
            <span className="metricLabel">{kpi.label}</span>
          </div>
          <div className="metricBody">
            <div>
              <strong>{kpi.value}</strong>
              <span className="metricDetail">{kpi.detail}</span>
            </div>
            <Sparkline points={kpi.series} />
          </div>
          <span className={`changePill ${kpi.direction === "down" ? "risk" : "good"}`}>{kpi.change}</span>
        </>
      }
    />
  );
}

function PeriodControl({ storeId, period, activeTab }: { storeId: string; period: Period; activeTab: StoreTab }) {
  return (
    <div className="segmented printHidden" aria-label="Store report period selector">
      <Link className={period === "weekly" ? "active" : ""} href={storeTabHref(storeId, "weekly", activeTab)}>
        Weekly
      </Link>
      <Link className={period === "monthly" ? "active" : ""} href={storeTabHref(storeId, "monthly", activeTab)}>
        Monthly
      </Link>
    </div>
  );
}

function SectionNav({ storeId, period, activeTab }: { storeId: string; period: Period; activeTab: StoreTab }) {
  return (
    <nav className="storeSectionNav printHidden" aria-label="Store report pages">
      {storeTabs.map(({ id, label, Icon }) => (
        <Link key={id} className={activeTab === id ? "active" : ""} href={storeTabHref(storeId, period, id)}>
          <Icon size={15} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function ComparisonPanel({ title, comparisons }: { title: string; comparisons: ComparisonMetric[] }) {
  return (
    <section className="panel comparisonPanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Comparison</p>
          <h2>{title}</h2>
        </div>
        <span className="softBadge">Net numbers only</span>
      </div>
      <div className="comparisonGrid storeReportComparison">
        {comparisons.map((comparison) => (
          <DrilldownDetails
            key={comparison.label}
            className="comparisonCard"
            title={`${comparison.label} detail`}
            description={comparison.detail}
            items={[
              { label: "Current", value: comparison.current },
              { label: "Previous", value: comparison.previous },
              { label: "Delta", value: comparison.delta, note: comparison.percent },
              { label: "Read", value: comparison.direction === "down" ? "Below prior" : "Above prior", note: trendNote(comparison.direction) }
            ]}
            summary={
              <>
                <div>
                  <span>{comparison.label}</span>
                  <strong>{comparison.current}</strong>
                  <small>Prior: {comparison.previous}</small>
                </div>
                <span className={`changePill ${comparison.direction === "down" ? "risk" : "good"}`}>
                  {comparison.direction === "down" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  {comparison.delta} / {comparison.percent}
                </span>
                <p>{comparison.detail}</p>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function OwnerReadout({
  report,
  intelligence
}: {
  report: StoreReport;
  intelligence: StoreIntelligence | null;
}) {
  const cards = report.comparisons.map((comparison, index) => ({
    comparison,
    width: comparison.direction === "down" ? 38 + index * 9 : 64 + index * 7
  }));

  return (
    <section className="ownerReadoutGrid" aria-label="Owner action readout">
      {cards.map(({ comparison, width }) => (
        <DrilldownDetails
          key={`owner-${comparison.label}`}
          className={`ownerReadoutCard ${comparison.direction === "down" ? "risk" : "good"}`}
          title={`${comparison.label} owner read`}
          description={comparison.detail}
          items={[
            { label: "Current", value: comparison.current, note: report.periodContext.currentPeriod },
            { label: "Prior", value: comparison.previous, note: report.periodContext.comparisonPeriod },
            { label: "Movement", value: comparison.delta, note: comparison.percent },
            {
              label: "Operator read",
              value: comparison.direction === "down" ? "Needs attention" : "Working",
              note: trendNote(comparison.direction)
            }
          ]}
          summary={
            <>
              <div>
                <span>{comparison.label}</span>
                <strong>{comparison.current}</strong>
              </div>
              <div className="ownerMeter" aria-hidden="true">
                <span style={{ width: `${Math.min(width, 92)}%` }} />
              </div>
              <p>{comparison.delta} / {comparison.percent}</p>
            </>
          }
        />
      ))}
      {intelligence ? (
        <DrilldownDetails
          className="ownerReadoutCard priority"
          title="Highest priority owner action"
          description={intelligence.priorityActions[0]?.detail ?? intelligence.marketSummary}
          items={[
            {
              label: "Priority",
              value: intelligence.priorityActions[0]?.title ?? "Review market context",
              note: intelligence.priorityActions[0]?.detail ?? intelligence.marketSummary
            },
            { label: "Store", value: intelligence.storeNumber, note: intelligence.address }
          ]}
          summary={
            <>
              <div>
                <span>Owner action</span>
                <strong>{intelligence.priorityActions[0]?.title ?? "Review market context"}</strong>
              </div>
              <div className="ownerMeter amber" aria-hidden="true">
                <span style={{ width: "76%" }} />
              </div>
              <p>{intelligence.priorityActions[0]?.impact ?? "High"} impact</p>
            </>
          }
        />
      ) : null}
    </section>
  );
}

function ProductOpportunityPanel({ insights }: { insights: StoreInsightReport }) {
  const bars = insights.brands.slice(0, 5).map((brand, index) => ({
    brand,
    width: Math.max(28, 88 - index * 11)
  }));

  return (
    <section className="panel visualMapPanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Opportunity map</p>
          <h2>Brand mix and margin levers</h2>
        </div>
        <span className="softBadge">Scale / protect / prune</span>
      </div>
      <div className="opportunityBars">
        {bars.map(({ brand, width }) => (
          <DataPointDrilldown
            key={brand.brand}
            className="opportunityBar"
            label={brand.brand}
            value={brand.margin}
            note={`${brand.share} share / ${brand.netSales} net`}
            items={[
              { label: "Category", value: brand.category },
              { label: "Net sales", value: brand.netSales },
              { label: "Units", value: brand.units.toLocaleString() },
              { label: "Trend", value: brand.trend }
            ]}
          >
            <div className="ownerMeter" aria-hidden="true">
              <span style={{ width: `${width}%` }} />
            </div>
          </DataPointDrilldown>
        ))}
      </div>
    </section>
  );
}

function InventoryActionPanel({ insights }: { insights: StoreInsightReport }) {
  const reorderCount = insights.skus.filter((sku) => sku.reorderStatus === "Reorder").length;
  const watchCount = insights.skus.filter((sku) => sku.reorderStatus === "Watch").length;
  const topReorder = insights.reorders[0];

  return (
    <section className="ownerReadoutGrid">
      <DrilldownDetails
        className="ownerReadoutCard risk"
        title="Reorder pressure"
        description={topReorder?.reason ?? "No urgent reorder pressure in the current top movers."}
        items={[
          { label: "Reorder SKUs", value: reorderCount.toString() },
          { label: "Watch SKUs", value: watchCount.toString() },
          topReorder
            ? { label: "Top reorder", value: topReorder.product, note: `${topReorder.suggestedOrder} suggested units` }
            : { label: "Top reorder", value: "None" }
        ]}
        summary={
          <>
            <div>
              <span>Reorder pressure</span>
              <strong>{reorderCount} SKUs</strong>
            </div>
            <div className="ownerMeter" aria-hidden="true">
              <span style={{ width: `${Math.min(92, reorderCount * 18 + 24)}%` }} />
            </div>
            <p>{watchCount} more on watch</p>
          </>
        }
      />
      <DrilldownDetails
        className="ownerReadoutCard priority"
        title="Next inventory action"
        description={topReorder?.reason ?? "Maintain the current reorder cadence."}
        items={[
          { label: "SKU", value: topReorder?.sku ?? "None" },
          { label: "Vendor", value: topReorder?.vendor ?? "None" },
          { label: "On hand", value: topReorder ? topReorder.onHand.toLocaleString() : "0" },
          { label: "7-day velocity", value: topReorder ? topReorder.sevenDayVelocity.toLocaleString() : "0" }
        ]}
        summary={
          <>
            <div>
              <span>Next action</span>
              <strong>{topReorder?.product ?? "No urgent reorder"}</strong>
            </div>
            <div className="ownerMeter amber" aria-hidden="true">
              <span style={{ width: "72%" }} />
            </div>
            <p>{topReorder?.reason ?? "Inventory is balanced."}</p>
          </>
        }
      />
    </section>
  );
}

function DaypartGraph({
  data
}: {
  data: Array<{
    label: string;
    current: number;
    previous: number;
  }>;
}) {
  const max = Math.max(...data.flatMap((point) => [point.current, point.previous]));

  return (
    <section className="panel" id="transactions">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2>Daypart comparison</h2>
        </div>
        <span className="softBadge">
          <BarChart3 size={15} />
          Current vs prior week
        </span>
      </div>
      <div className="barCompareList">
        {data.map((point) => (
          <DrilldownDetails
            key={point.label}
            className="barCompareRow"
            title={`${point.label} transaction detail`}
            description="Current versus prior period transaction pattern."
            items={[
              { label: "Current", value: point.current.toLocaleString() },
              { label: "Prior", value: point.previous.toLocaleString() },
              { label: "Delta", value: (point.current - point.previous).toLocaleString() }
            ]}
            summary={
              <>
                <strong>{point.label}</strong>
                <div>
                  <span style={{ width: `${(point.current / max) * 100}%` }} />
                  <small>{point.current.toLocaleString()} current</small>
                </div>
                <div>
                  <span style={{ width: `${(point.previous / max) * 100}%` }} />
                  <small>{point.previous.toLocaleString()} prior</small>
                </div>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: StoreProductInsight }) {
  return (
    <DrilldownDetails
      className="insightCard"
      title={`${product.name} product detail`}
      description={`${product.brand} / ${product.category}`}
      items={[
        { label: "Net sales rank", value: product.revenueRank.toString() },
        { label: "Net sales", value: product.netSales },
        { label: "Margin", value: product.margin, note: product.marginDollars },
        { label: "Average price", value: product.avgPrice },
        { label: "Trend", value: product.trend, note: product.trend.startsWith("-") ? "Investigate slow-down." : "Momentum product." }
      ]}
      summary={
        <>
          <div className="insightCardTop">
            <span className="rank">{product.revenueRank}</span>
            <div>
              <strong>{product.name}</strong>
              <p>{product.brand} / {product.category}</p>
            </div>
          </div>
          <dl className="insightStats">
            <div>
              <dt>Net sales</dt>
              <dd>{product.netSales}</dd>
            </div>
            <div>
              <dt>Margin</dt>
              <dd>{product.margin}</dd>
            </div>
            <div>
              <dt>Units</dt>
              <dd>{product.units.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Trend</dt>
              <dd className={product.trend.startsWith("-") ? "riskText" : "goodText"}>{product.trend}</dd>
            </div>
          </dl>
        </>
      }
    />
  );
}

function ProductVelocityCard({ product, index }: { product: ProductVelocity; index: number }) {
  const lineItems = product.lineItems ?? [];
  const topLine = lineItems[0];

  return (
    <DrilldownDetails
      key={`${product.name}-${index}`}
      className="insightCard"
      title={`${product.name} product/SKU detail`}
      description={topLine ? `Top seller: ${topLine.name}` : product.category}
      items={[
        { label: "Net sales rank", value: (index + 1).toString() },
        { label: "Net sales", value: product.revenue },
        { label: "Units", value: product.units.toLocaleString() },
        { label: "SKU count", value: lineItems.length > 0 ? lineItems.length.toString() : "1" },
        { label: "Avg net price", value: product.avgNetPrice ?? "n/a" },
        { label: "Margin", value: product.margin ?? "Cost n/a", note: product.marginDollars }
      ]}
      summary={
        <>
          <div className="insightCardTop">
            <span className="rank">{index + 1}</span>
            <div>
              <strong>{product.name}</strong>
              <p>{topLine ? `${topLine.name} / SKU ${topLine.sku}` : product.category}</p>
            </div>
          </div>
          <dl className="insightStats">
            <div>
              <dt>Net sales</dt>
              <dd>{product.revenue}</dd>
            </div>
            <div>
              <dt>Units</dt>
              <dd>{product.units.toLocaleString()}</dd>
            </div>
            <div>
              <dt>SKUs</dt>
              <dd>{lineItems.length > 0 ? lineItems.length : 1}</dd>
            </div>
            <div>
              <dt>Margin</dt>
              <dd>{product.margin ?? "Cost n/a"}</dd>
            </div>
          </dl>
        </>
      }
    >
      {lineItems.length > 0 ? (
        <div className="miniTableWrap">
          <table className="miniTable">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Units</th>
                <th>Net sales</th>
                <th>Avg net</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line) => (
                <tr key={`${line.productId}-${line.sku}`}>
                  <td>{line.name}</td>
                  <td>{line.sku}</td>
                  <td>{line.brand}</td>
                  <td>{line.category}</td>
                  <td>{line.units.toLocaleString()}</td>
                  <td>{line.revenue}</td>
                  <td>{line.avgNetPrice}</td>
                  <td>{line.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DrilldownDetails>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function parseMoney(label: string) {
  const normalized = label.replace(/[$,+]/g, "").trim().toUpperCase();
  const multiplier = normalized.endsWith("M") ? 1_000_000 : normalized.endsWith("K") ? 1_000 : 1;
  const value = Number.parseFloat(normalized.replace(/[KM]/g, ""));
  return Number.isFinite(value) ? value * multiplier : 0;
}

function expiryLabel(item: DutchieInventorySummary) {
  if (item.daysToExpire === null) {
    return "No date";
  }

  if (item.daysToExpire < 0) {
    return `${Math.abs(item.daysToExpire)} days expired`;
  }

  return `${item.daysToExpire} days`;
}

function shortDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

type InventoryRow = DutchieInventorySummary & {
  periodUnits: number;
  periodSales: number;
  daysSupply: number | null;
  velocityStatus: "Reorder" | "Watch" | "Healthy" | "No sales";
};

type ProductBrandRow = {
  brand: string;
  vendor: string;
  category: string;
  units: number;
  sales: number;
  profit: number;
  skuCount: number;
};

function buildProductBrandRows(products: ProductVelocity[]): ProductBrandRow[] {
  const rows = new Map<string, ProductBrandRow & { skus: Set<string>; categories: Set<string> }>();

  for (const product of products) {
    for (const line of product.lineItems ?? []) {
      const key = line.brand;
      const existing =
        rows.get(key) ??
        ({
          brand: line.brand,
          vendor: line.vendor,
          category: line.category,
          units: 0,
          sales: 0,
          profit: 0,
          skuCount: 0,
          skus: new Set<string>(),
          categories: new Set<string>()
        } satisfies ProductBrandRow & { skus: Set<string>; categories: Set<string> });

      existing.units += line.units;
      existing.sales += parseMoney(line.revenue);
      existing.profit += line.marginDollars === "Cost n/a" ? 0 : parseMoney(line.marginDollars);
      existing.skus.add(line.sku);
      existing.categories.add(line.category);
      existing.skuCount = existing.skus.size;
      existing.category = existing.categories.size === 1 ? line.category : `${existing.categories.size} categories`;
      rows.set(key, existing);
    }
  }

  return Array.from(rows.values()).sort((a, b) => b.sales - a.sales);
}

function buildInventoryRows(inventory: DutchieInventorySummary[], products: ProductVelocity[], period: Period): InventoryRow[] {
  const periodDays = period === "monthly" ? 30 : 7;
  const salesByProductId = new Map<number, { units: number; sales: number }>();
  const salesBySku = new Map<string, { units: number; sales: number }>();

  for (const product of products) {
    for (const line of product.lineItems ?? []) {
      const sales = parseMoney(line.revenue);
      const byProduct = salesByProductId.get(line.productId) ?? { units: 0, sales: 0 };
      byProduct.units += line.units;
      byProduct.sales += sales;
      salesByProductId.set(line.productId, byProduct);

      const bySku = salesBySku.get(line.sku) ?? { units: 0, sales: 0 };
      bySku.units += line.units;
      bySku.sales += sales;
      salesBySku.set(line.sku, bySku);
    }
  }

  return inventory.map((item) => {
    const sales = salesByProductId.get(item.productId) ?? salesBySku.get(item.sku) ?? { units: 0, sales: 0 };
    const dailyVelocity = sales.units / periodDays;
    const daysSupply = dailyVelocity > 0 ? Math.round(item.onHand / dailyVelocity) : null;
    const velocityStatus: InventoryRow["velocityStatus"] =
      sales.units <= 0 ? "No sales" : daysSupply !== null && daysSupply <= 5 ? "Reorder" : daysSupply !== null && daysSupply <= 14 ? "Watch" : "Healthy";

    return {
      ...item,
      periodUnits: sales.units,
      periodSales: sales.sales,
      daysSupply,
      velocityStatus
    };
  });
}

function InventoryExpandedTables({
  inventory,
  products,
  period
}: {
  inventory: DutchieInventorySummary[];
  products: ProductVelocity[];
  period: Period;
}) {
  const rows = buildInventoryRows(inventory, products, period);
  const fast = [...rows].filter((item) => item.periodUnits > 0).sort((a, b) => b.periodUnits - a.periodUnits).slice(0, 12);
  const slow = [...rows]
    .filter((item) => item.periodUnits === 0 || item.daysSupply === null || item.daysSupply > 45)
    .sort((a, b) => a.periodUnits - b.periodUnits || b.retailValue - a.retailValue)
    .slice(0, 12);
  const expiring = [...rows]
    .filter((item) => item.expirationDate)
    .sort((a, b) => (a.daysToExpire ?? 9999) - (b.daysToExpire ?? 9999))
    .slice(0, 12);
  const highRoi = [...rows].filter((item) => item.estimatedRoi > 0).sort((a, b) => b.estimatedRoi - a.estimatedRoi).slice(0, 10);
  const lowRoi = [...rows].filter((item) => item.estimatedRoi > 0).sort((a, b) => a.estimatedRoi - b.estimatedRoi).slice(0, 10);
  const brandRows = Array.from(
    rows.reduce((brands, item) => {
      const existing = brands.get(item.brand) ?? { brand: item.brand, units: 0, onHand: 0, retail: 0, sales: 0, profit: 0 };
      existing.units += item.periodUnits;
      existing.onHand += item.onHand;
      existing.retail += item.retailValue;
      existing.sales += item.periodSales;
      existing.profit += item.estimatedGrossProfit;
      brands.set(item.brand, existing);
      return brands;
    }, new Map<string, { brand: string; units: number; onHand: number; retail: number; sales: number; profit: number }>())
  )
    .map(([, brand]) => brand)
    .sort((a, b) => b.sales - a.sales || b.retail - a.retail)
    .slice(0, 12);

  if (rows.length === 0) {
    return (
      <section className="panel emptyState">
        <p className="eyebrow">Inventory</p>
        <h2>No live inventory rows are stored in this sync yet.</h2>
        <p>Run the Dutchie sync to populate product, SKU, on-hand, cost, retail, and expiration detail.</p>
      </section>
    );
  }

  return (
    <section className="inventoryTableStack">
      <section className="panel tablePanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Selling now</p>
            <h2>Fast sellers, high to low</h2>
          </div>
          <span className="softBadge">Sales + on hand</span>
        </div>
        <InventoryTable rows={fast} mode="fast" />
      </section>

      <section className="panel tablePanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Slow movers</p>
            <h2>No/low movement, high exposure first</h2>
          </div>
          <span className="softBadge">Low to high sales</span>
        </div>
        <InventoryTable rows={slow} mode="slow" />
      </section>

      <section className="lowerGrid">
        <section className="panel tablePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Expiration</p>
              <h2>Packages expiring soonest</h2>
            </div>
            <span className="softBadge">Package dates</span>
          </div>
          <InventoryTable rows={expiring} mode="expiry" />
        </section>

        <section className="panel tablePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Brands</p>
              <h2>Brand inventory and sales view</h2>
            </div>
            <span className="softBadge">Brand breakdown</span>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Period units</th>
                  <th>Period net</th>
                  <th>On hand</th>
                  <th>Retail exposure</th>
                  <th>Est. profit</th>
                </tr>
              </thead>
              <tbody>
                {brandRows.map((brand) => (
                  <tr key={brand.brand}>
                    <td>{brand.brand}</td>
                    <td>{brand.units.toLocaleString()}</td>
                    <td>{money(brand.sales)}</td>
                    <td>{brand.onHand.toLocaleString()}</td>
                    <td>{money(brand.retail)}</td>
                    <td>{money(brand.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="lowerGrid">
        <section className="panel tablePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">ROI</p>
              <h2>Highest estimated ROI</h2>
            </div>
            <span className="softBadge">High to low</span>
          </div>
          <InventoryTable rows={highRoi} mode="roi" />
        </section>

        <section className="panel tablePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">ROI</p>
              <h2>Lowest estimated ROI</h2>
            </div>
            <span className="softBadge">Low to high</span>
          </div>
          <InventoryTable rows={lowRoi} mode="roi" />
        </section>
      </section>
    </section>
  );
}

function InventoryTable({ rows, mode }: { rows: InventoryRow[]; mode: "fast" | "slow" | "expiry" | "roi" }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Product / SKU</th>
            <th>Brand</th>
            <th>Category</th>
            <th>On hand</th>
            <th>Period units</th>
            <th>Days supply</th>
            <th>{mode === "expiry" ? "Expiration" : "Retail exposure"}</th>
            <th>{mode === "roi" ? "Est. ROI" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={`${item.inventoryId}-${item.sku}-${item.packageId}`}>
              <td>
                <DataPointDrilldown
                  className="tableDrilldown"
                  label={item.productName}
                  value={item.sku}
                  note={`${item.vendor} / ${item.packageCount} package${item.packageCount === 1 ? "" : "s"}`}
                  items={[
                    { label: "Product ID", value: item.productId.toString() },
                    { label: "SKU", value: item.sku },
                    { label: "Package", value: item.packageId },
                    { label: "On hand", value: item.onHand.toLocaleString() },
                    { label: "Unit price", value: money(item.unitPrice) },
                    { label: "Unit cost", value: money(item.unitCost) },
                    { label: "Expiration", value: shortDate(item.expirationDate), note: expiryLabel(item) }
                  ]}
                />
              </td>
              <td>{item.brand}</td>
              <td>{item.category}</td>
              <td>{item.onHand.toLocaleString()}</td>
              <td>{item.periodUnits.toLocaleString()}</td>
              <td>{item.daysSupply === null ? "No sales" : item.daysSupply}</td>
              <td>{mode === "expiry" ? shortDate(item.expirationDate) : money(item.retailValue)}</td>
              <td>
                {mode === "roi" ? (
                  `${item.estimatedRoi.toFixed(0)}%`
                ) : (
                  <span className={`tableStatus ${item.velocityStatus === "Reorder" ? "action" : item.velocityStatus === "Watch" ? "watch" : "healthy"}`}>
                    {mode === "expiry" ? expiryLabel(item) : item.velocityStatus}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BudtenderTable({ title, data }: { title: string; data: BudtenderMetric[] }) {
  return (
    <section className="panel tablePanel compactTablePanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Budtenders</p>
          <h2>{title}</h2>
        </div>
        <span className="softBadge">
          <Users size={15} />
          Net ticket basis
        </span>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Net sales</th>
              <th>Gross sales</th>
              <th>Discounts</th>
              <th>Avg net ticket</th>
              <th>Units</th>
              <th>Tickets</th>
            </tr>
          </thead>
          <tbody>
            {data.map((budtender) => (
              <tr key={`${title}-${budtender.name}`}>
                <td>
                  <DataPointDrilldown
                    className="tableDrilldown"
                    label={budtender.name}
                    value={budtender.netSales}
                    note={`${budtender.transactions.toLocaleString()} tickets`}
                    items={[
                      { label: "Gross sales", value: budtender.grossSales },
                      { label: "Discounts", value: budtender.discounts },
                      { label: "Avg net ticket", value: budtender.averageBasket },
                      { label: "Units", value: budtender.units.toLocaleString() }
                    ]}
                  />
                </td>
                <td>{budtender.netSales}</td>
                <td>{budtender.grossSales}</td>
                <td>{budtender.discounts}</td>
                <td>{budtender.averageBasket}</td>
                <td>{budtender.units.toLocaleString()}</td>
                <td>{budtender.transactions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StoreIntelligencePanel({ intelligence }: { intelligence: StoreIntelligence }) {
  return (
    <>
      <section className="panel marketPanel" id="market">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">{intelligence.storeNumber} / {intelligence.statusLabel}</p>
            <h2>Market and source report context</h2>
          </div>
          <span className="softBadge">{intelligence.address}</span>
        </div>
        <p className="panelNote">{intelligence.marketSummary}</p>
        <div className="marketMetricGrid">
          {intelligence.metrics.map((metric) => (
            <DataPointDrilldown
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              items={[
                { label: "Store", value: intelligence.storeNumber, note: intelligence.statusLabel },
                { label: "Location", value: intelligence.address }
              ]}
            />
          ))}
        </div>
      </section>

      <section className="lowerGrid">
        <section className="panel" id="events">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Demand signals</p>
              <h2>Events and seasonal drivers</h2>
            </div>
            <span className="softBadge">Report calendar</span>
          </div>
          <div className="eventSignalList">
            {intelligence.eventSignals.map((event) => (
              <DataPointDrilldown
                key={`${event.date}-${event.title}`}
                label={event.date}
                value={event.title}
                note={event.detail}
                items={[
                  { label: "Timing", value: event.date },
                  { label: "Opportunity", value: event.title, note: event.detail }
                ]}
              />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Competitors</p>
              <h2>Competitive signals</h2>
            </div>
            <span className="softBadge">Market watch</span>
          </div>
          <div className="alertList">
            {intelligence.competitorSignals.map((signal) => (
              <DrilldownDetails
                key={signal.title}
                className={`alertItem ${priorityTone(signal)}`}
                title={signal.title}
                description={signal.detail}
                items={[
                  { label: "Impact", value: signal.impact },
                  { label: "Context", value: intelligence.address, note: intelligence.marketSummary }
                ]}
                summary={
                  <>
                    <span />
                    <div>
                      <strong>{signal.title}</strong>
                      <p>{signal.detail}</p>
                    </div>
                  </>
                }
              />
            ))}
          </div>
        </section>
      </section>

      <section className="panel" id="actions">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Priorities</p>
            <h2>Priority actions</h2>
          </div>
          <span className="softBadge">Store report follow-up</span>
        </div>
        <div className="storeInsightGrid">
          {intelligence.priorityActions.map((action) => (
            <DrilldownDetails
              key={action.title}
              className={`alertItem ${priorityTone(action)}`}
              title={action.title}
              description={action.detail}
              items={[
                { label: "Impact", value: action.impact },
                { label: "Store", value: intelligence.storeNumber, note: intelligence.statusLabel }
              ]}
              summary={
                <>
                  <span />
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.detail}</p>
                  </div>
                </>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { storeId } = await params;
  const resolvedSearchParams = await searchParams;
  const period = getPeriod(resolvedSearchParams?.period);
  const activeTab = getStoreTab(resolvedSearchParams?.tab);
  const snapshot = await readDutchieSyncSnapshot();
  const report = getStoreReport(storeId, period, snapshot);

  if (!report) {
    notFound();
  }

  const insights = getStoreInsights(report.store, period);
  const intelligence = getStoreIntelligence(storeId);
  const heroNetSales = report.store.comparison.netSales.current;
  const heroTransactions = report.store.comparison.transactions.current;
  const heroAvgNetTicket = report.store.comparison.averageTicket.current;
  const movementLabel = period === "monthly" ? "MoM delta" : "WoW delta";
  const periodLabel = period === "monthly" ? "Completed month" : "Completed week";
  const productBrandRows = buildProductBrandRows(report.products);

  return (
    <main className="singleReport">
      <header className="topbar">
        <div>
          <Link className="backLink printHidden" href="/">
            <ArrowLeft size={16} />
            Main dashboard
          </Link>
          <p className="eyebrow">{report.store.name}</p>
          <h1>{report.title}</h1>
          <span>{report.subtitle}</span>
        </div>
        <div className="toolbar">
          <span className="dateBadge">
            <CalendarDays size={16} />
            {report.dateRange}
          </span>
          <PeriodControl storeId={storeId} period={period} activeTab={activeTab} />
          <ReportActions />
          <span className="softBadge printOnly">
            <Download size={15} />
            PDF export
          </span>
        </div>
      </header>

      <PeriodContextBar context={report.periodContext} />

      <SectionNav storeId={storeId} period={period} activeTab={activeTab} />

      <section className="storeHero" id="overview">
        <div>
          <p className="eyebrow">Store cockpit</p>
          <h2>{heroNetSales} net sales</h2>
          <div className="storeHeroMetrics">
            <DataPointDrilldown
              label="Net sales"
              value={heroNetSales}
              items={[
                { label: periodLabel, value: heroNetSales, note: report.periodContext.currentPeriod },
                { label: "Prior period", value: report.store.comparison.netSales.previous, note: report.periodContext.comparisonPeriod },
                { label: movementLabel, value: report.store.comparison.netSales.delta, note: report.store.comparison.netSales.percent },
                { label: "Inventory", value: report.store.inventory }
              ]}
            />
            <DataPointDrilldown
              label="Transactions"
              value={heroTransactions}
              items={[
                { label: periodLabel, value: heroTransactions, note: report.periodContext.currentPeriod },
                { label: "Prior period", value: report.store.comparison.transactions.previous, note: report.periodContext.comparisonPeriod },
                { label: movementLabel, value: report.store.comparison.transactions.delta, note: report.store.comparison.transactions.percent }
              ]}
            />
            <DataPointDrilldown
              label="Avg net ticket"
              value={heroAvgNetTicket}
              items={[
                { label: periodLabel, value: heroAvgNetTicket, note: "Net sales divided by transaction count" },
                { label: "Prior period", value: report.store.comparison.averageTicket.previous },
                { label: movementLabel, value: report.store.comparison.averageTicket.delta, note: report.store.comparison.averageTicket.percent },
                { label: "Net basis", value: heroNetSales }
              ]}
            />
          </div>
        </div>
        <div className="storeHeroActions">
          <span className={`tableStatus ${report.store.status.toLowerCase()}`}>{report.store.status}</span>
          <Link href={storeTabHref(storeId, period, "market")}>Market context</Link>
          <Link href={storeTabHref(storeId, period, "inventory")}>Reorder queue</Link>
          <Link href={storeTabHref(storeId, period, "actions")}>Action plan</Link>
        </div>
      </section>

      {activeTab === "overview" ? (
        <>
          <OwnerReadout report={report} intelligence={intelligence} />

          <ComparisonPanel title={report.comparisonTitle} comparisons={report.comparisons} />

      <section className="metricGrid storeMetricGrid">
        {report.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} kpi={kpi} index={index} />
        ))}
      </section>

      <section className="storeInsightGrid">
        {insights.categoryOpportunity.map((item) => (
          <DrilldownDetails
            key={item.label}
            className={`alertItem ${item.tone}`}
            title={item.label}
            description={item.detail}
            items={[
              { label: "Value", value: item.value },
              { label: "Tone", value: item.tone }
            ]}
            summary={
              <>
                <span />
                <div>
                  <strong>{item.label}: {item.value}</strong>
                  <p>{item.detail}</p>
                </div>
              </>
            }
          />
        ))}
      </section>
        </>
      ) : null}

      {activeTab === "market" ? (
        intelligence ? (
          <StoreIntelligencePanel intelligence={intelligence} />
        ) : (
          <section className="panel emptyState">
            <p className="eyebrow">Market</p>
            <h2>Market context is not configured for this store yet.</h2>
          </section>
        )
      ) : null}

      {activeTab === "products" ? (
        <>
      <ProductOpportunityPanel insights={insights} />

      <section className="panel" id="products">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Products</p>
            <h2>Top selling product groups with SKU drilldowns</h2>
          </div>
          <span className="softBadge">
            <ShoppingBasket size={15} />
            Live product/SKU
          </span>
        </div>
        <div className="insightCardGrid">
          {report.products.slice(0, 4).map((product, index) => (
            <ProductVelocityCard key={`${product.name}-${index}`} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="lowerGrid">
        <section className="panel tablePanel" id="brands">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Brands</p>
              <h2>Top brands</h2>
            </div>
            <span className="softBadge">
              <Tags size={15} />
              Share and margin
            </span>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Net sales</th>
                  <th>Units</th>
                  <th>SKUs</th>
                  <th>Category</th>
                  <th>Est. profit</th>
                  <th>Vendor</th>
                </tr>
              </thead>
              <tbody>
                {productBrandRows.map((brand) => (
                  <tr key={brand.brand}>
                    <td>
                      <DataPointDrilldown
                        className="tableDrilldown"
                        label={brand.brand}
                        value={money(brand.sales)}
                        note={brand.category}
                        items={[
                          { label: "Units", value: brand.units.toLocaleString() },
                          { label: "SKUs", value: brand.skuCount.toString() },
                          { label: "Vendor", value: brand.vendor },
                          { label: "Estimated profit", value: money(brand.profit) }
                        ]}
                      />
                    </td>
                    <td>{money(brand.sales)}</td>
                    <td>{brand.units.toLocaleString()}</td>
                    <td>{brand.skuCount}</td>
                    <td>{brand.category}</td>
                    <td>{money(brand.profit)}</td>
                    <td>{brand.vendor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel tablePanel" id="skus">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">SKUs</p>
              <h2>SKU performance</h2>
            </div>
            <span className="softBadge">
              <PackageCheck size={15} />
              Stock health
            </span>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>On hand</th>
                  <th>Days</th>
                  <th>Weekly units</th>
                  <th>Net sales</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insights.skus.map((sku) => (
                  <tr key={sku.sku}>
                    <td>
                      <DataPointDrilldown
                        className="tableDrilldown"
                        label={sku.sku}
                        value={sku.reorderStatus}
                        note={sku.product}
                        items={[
                          { label: "Brand", value: sku.brand },
                          { label: "On hand", value: sku.onHand.toLocaleString() },
                          { label: "Days of supply", value: sku.daysOfSupply.toString() },
                          { label: "Weekly units", value: sku.weeklyUnits.toLocaleString() },
                          { label: "Net sales", value: sku.netSales }
                        ]}
                      />
                    </td>
                    <td>{sku.product}</td>
                    <td>{sku.brand}</td>
                    <td>{sku.onHand.toLocaleString()}</td>
                    <td>{sku.daysOfSupply}</td>
                    <td>{sku.weeklyUnits.toLocaleString()}</td>
                    <td>{sku.netSales}</td>
                    <td>
                      <span className={`tableStatus ${sku.reorderStatus === "Reorder" ? "action" : sku.reorderStatus === "Watch" ? "watch" : "healthy"}`}>
                        {sku.reorderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
        </>
      ) : null}

      {activeTab === "inventory" ? (
        <>
        <InventoryActionPanel insights={insights} />

        <InventoryExpandedTables inventory={report.inventoryItems} products={report.products} period={period} />

        <section className="lowerGrid">
        <section className="panel tablePanel" id="reorder">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Reorder</p>
              <h2>Suggested reorder queue</h2>
            </div>
            <span className="softBadge">Inventory action</span>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Urgency</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>On hand</th>
                  <th>7-day velocity</th>
                  <th>Suggested order</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {insights.reorders.map((item) => (
                  <tr key={item.sku}>
                    <td>
                      <DataPointDrilldown
                        className="tableDrilldown"
                        label={item.urgency}
                        value={item.suggestedOrder.toLocaleString()}
                        note={item.reason}
                        items={[
                          { label: "SKU", value: item.sku },
                          { label: "Product", value: item.product },
                          { label: "Vendor", value: item.vendor },
                          { label: "On hand", value: item.onHand.toLocaleString() },
                          { label: "7-day velocity", value: item.sevenDayVelocity.toLocaleString() }
                        ]}
                      />
                    </td>
                    <td>
                      <strong>{item.sku}</strong>
                    </td>
                    <td>{item.product}</td>
                    <td>{item.vendor}</td>
                    <td>{item.onHand.toLocaleString()}</td>
                    <td>{item.sevenDayVelocity.toLocaleString()}</td>
                    <td>{item.suggestedOrder.toLocaleString()}</td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
        </>
      ) : null}

      {activeTab === "transactions" ? (
        <>
      <DaypartGraph data={insights.daypart} />

      <section className="budtenderGrid" id="budtenders">
        <BudtenderTable title="Top 3 budtenders" data={report.budtenders.top} />
        <BudtenderTable title="Lowest 3 budtenders" data={report.budtenders.bottom} />
      </section>

      <section className="lowerGrid singleColumnWide">
        <section className="panel tablePanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Transactions</p>
              <h2>Transaction timing and discounting</h2>
            </div>
            <span className="softBadge">
              <ReceiptText size={15} />
              Daypart detail
            </span>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Daypart</th>
                  <th>Transactions</th>
                  <th>Net sales</th>
                  <th>Avg net ticket</th>
                  <th>Discount rate</th>
                </tr>
              </thead>
              <tbody>
                {insights.transactions.map((transaction) => (
                  <tr key={transaction.label}>
                    <td>
                      <DataPointDrilldown
                        className="tableDrilldown"
                        label={transaction.label}
                        value={transaction.netSales}
                        note={`${transaction.transactions.toLocaleString()} transactions`}
                        items={[
                          { label: "Avg net ticket", value: transaction.avgTicket },
                          { label: "Discount rate", value: transaction.discountRate },
                          { label: "Transactions", value: transaction.transactions.toLocaleString() }
                        ]}
                      />
                    </td>
                    <td>{transaction.transactions.toLocaleString()}</td>
                    <td>{transaction.netSales}</td>
                    <td>{transaction.avgTicket}</td>
                    <td>{transaction.discountRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
        </>
      ) : null}

      {activeTab === "customers" ? (
      <section className="lowerGrid customerTabGrid">
        <section className="panel" id="demographics">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Demographics</p>
              <h2>Customer segments</h2>
            </div>
            <span className="softBadge">
              <Users size={15} />
              Marketing ready
            </span>
          </div>
          <div className="segmentList">
            {insights.demographics.map((segment) => (
              <DrilldownDetails
                key={segment.segment}
                className="segmentCard"
                title={`${segment.segment} segment detail`}
                description={segment.note}
                items={[
                  { label: "Share", value: segment.share },
                  { label: "Avg net ticket", value: segment.avgTicket },
                  { label: "Preferred category", value: segment.preferredCategory }
                ]}
                summary={
                  <>
                    <div>
                      <strong>{segment.segment}</strong>
                      <p>{segment.note}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Share</dt>
                        <dd>{segment.share}</dd>
                      </div>
                      <div>
                        <dt>Avg net ticket</dt>
                        <dd>{segment.avgTicket}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{segment.preferredCategory}</dd>
                      </div>
                    </dl>
                  </>
                }
              />
            ))}
          </div>
        </section>
      </section>
      ) : null}

      {activeTab === "actions" ? (
        <>
          {intelligence ? (
            <section className="panel" id="actions">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Owner priorities</p>
                  <h2>What to do next</h2>
                </div>
                <span className="softBadge">Highest leverage</span>
              </div>
              <div className="storeInsightGrid">
                {intelligence.priorityActions.map((action) => (
                  <DrilldownDetails
                    key={action.title}
                    className={`alertItem ${priorityTone(action)}`}
                    title={action.title}
                    description={action.detail}
                    items={[
                      { label: "Impact", value: action.impact },
                      { label: "Store", value: intelligence.storeNumber, note: intelligence.statusLabel },
                      { label: "Market", value: intelligence.address }
                    ]}
                    summary={
                      <>
                        <span />
                        <div>
                          <strong>{action.title}</strong>
                          <p>{action.detail}</p>
                        </div>
                      </>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
          {intelligence ? (
            <section className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Calendar</p>
                  <h2>Demand signals to plan around</h2>
                </div>
                <span className="softBadge">Campaign timing</span>
              </div>
              <div className="eventSignalList">
                {intelligence.eventSignals.map((event) => (
                  <DataPointDrilldown
                    key={`action-${event.date}-${event.title}`}
                    label={event.date}
                    value={event.title}
                    note={event.detail}
                    items={[
                      { label: "Timing", value: event.date },
                      { label: "Action", value: event.title, note: event.detail }
                    ]}
                  />
                ))}
              </div>
            </section>
          ) : null}

      <section className="panel" id="marketing">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Marketing</p>
            <h2>Potential marketing ideas</h2>
          </div>
          <span className="softBadge">
            <Lightbulb size={15} />
            Store-specific actions
          </span>
        </div>
        <div className="marketingGrid">
          {insights.marketingIdeas.map((idea) => (
            <DrilldownDetails
              key={idea.title}
              className="marketingCard"
              title={idea.title}
              description={`${idea.audience} / ${idea.channel}`}
              items={[
                { label: "Audience", value: idea.audience },
                { label: "Offer", value: idea.offer },
                { label: "Channel", value: idea.channel },
                { label: "Expected lift", value: idea.expectedLift }
              ]}
              summary={
                <>
                  <strong>{idea.title}</strong>
                  <dl>
                    <div>
                      <dt>Audience</dt>
                      <dd>{idea.audience}</dd>
                    </div>
                    <div>
                      <dt>Offer</dt>
                      <dd>{idea.offer}</dd>
                    </div>
                    <div>
                      <dt>Channel</dt>
                      <dd>{idea.channel}</dd>
                    </div>
                    <div>
                      <dt>Expected lift</dt>
                      <dd>{idea.expectedLift}</dd>
                    </div>
                  </dl>
                </>
              }
            />
          ))}
        </div>
      </section>
        </>
      ) : null}
    </main>
  );
}
