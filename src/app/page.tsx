import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Building2,
  CalendarDays,
  CircleDollarSign,
  DatabaseZap,
  FileText,
  Gauge,
  Landmark,
  Leaf,
  LineChart,
  MapPin,
  PackageCheck,
  Presentation,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { DataPointDrilldown, DrilldownDetails } from "@/components/drilldown";
import { ExecutiveCharts } from "@/components/executive-charts";
import { PeriodContextBar } from "@/components/period-context";
import { ReportActions } from "@/components/report-actions";
import { readDutchieSyncSnapshot, type DutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";
import {
  buildExecutiveInsightPrompt,
  buildExecutiveIntelligence,
  type ExecutiveInsight,
  type ExecutiveIntelligence,
  type ExecutiveMetric
} from "@/lib/executive-intelligence";
import {
  getDashboardData,
  getPeriod,
  type BudtenderMetric,
  type ComparisonMetric,
  type DashboardData,
  type Kpi,
  type Period,
  type StoreSnapshot
} from "@/lib/mock-dutchie";
import { storeIntelligenceById, type StoreIntelligence } from "@/lib/store-intelligence";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function trendNote(direction: "up" | "down" | "flat") {
  if (direction === "up") {
    return "Positive movement versus the comparison period.";
  }

  if (direction === "down") {
    return "Needs review against pricing, traffic, or inventory availability.";
  }

  return "Flat movement; watch for the next sync before acting.";
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
  const icons = [CircleDollarSign, Activity, Gauge, PackageCheck];
  const Icon = icons[index] ?? TrendingUp;
  const isPositive = kpi.direction === "up";
  const isDown = kpi.direction === "down";

  return (
    <DrilldownDetails
      className="metricCard"
      title={`${kpi.label} drilldown`}
      description="Operational context for this portfolio rollup metric."
      items={[
        { label: "Current value", value: kpi.value, note: kpi.detail },
        { label: "Period movement", value: kpi.change, note: trendNote(kpi.direction) },
        { label: "Pacing series", value: kpi.series.join(" / "), note: "Relative daily or weekly movement." }
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
          <span className={`changePill ${isPositive ? "good" : isDown ? "risk" : "neutral"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {kpi.change}
          </span>
        </>
      }
    >
      <div className="drilldownActions">
        <a href="#stores">Store impact</a>
        <a href="#budtenders">Budtenders</a>
        <a href="#inventory">Inventory</a>
      </div>
    </DrilldownDetails>
  );
}

function ComparisonCard({ comparison }: { comparison: ComparisonMetric }) {
  return (
    <DrilldownDetails
      className="comparisonCard"
      title={`${comparison.label} detail`}
      description={comparison.detail}
      items={[
        { label: "Current", value: comparison.current, note: "Selected reporting period." },
        { label: "Previous", value: comparison.previous, note: "Prior comparable period." },
        { label: "Delta", value: comparison.delta, note: comparison.percent },
        { label: "Signal", value: comparison.direction === "down" ? "Risk" : "Positive", note: trendNote(comparison.direction) }
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
      <div className="comparisonGrid">
        {comparisons.map((comparison) => (
          <ComparisonCard key={comparison.label} comparison={comparison} />
        ))}
      </div>
    </section>
  );
}

function RevenueChart({ data }: { data: DashboardData["revenueSeries"] }) {
  const width = 680;
  const height = 286;
  const padding = 32;
  const maxRevenue = Math.max(...data.map((point) => point.revenue));
  const minRevenue = Math.min(...data.map((point) => point.revenue));
  const range = Math.max(maxRevenue - minRevenue, 1);

  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((point.revenue - minRevenue) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <DrilldownDetails
      className="panel chartPanel"
      title="Net sales trend detail"
      description="Daily or weekly net sales points with transaction volume."
      items={data.map((point) => ({
        label: point.label,
        value: currency(point.revenue),
        note: `${point.transactions.toLocaleString()} transactions`
      }))}
      summary={
        <>
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Sales pace</p>
              <h2>Net sales trend</h2>
            </div>
            <span className="softBadge">
              <LineChart size={15} />
              Live after sync
            </span>
          </div>

          <svg className="revenueChart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Net sales chart">
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#56d68a" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#56d68a" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((lineIndex) => {
              const y = padding + lineIndex * ((height - padding * 2) / 3);
              return <line key={lineIndex} x1={padding} x2={width - padding} y1={y} y2={y} className="gridLine" />;
            })}
            <path d={area} fill="url(#revenueGradient)" />
            <path d={line} className="revenueLine" />
            {points.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="4.5" className="dataDot" />
                <text x={point.x} y={height - 8} textAnchor="middle" className="axisText">
                  {point.label}
                </text>
                <text x={point.x} y={point.y - 14} textAnchor="middle" className="pointText">
                  {currency(point.revenue).replace(",000", "K")}
                </text>
              </g>
            ))}
          </svg>
        </>
      }
    />
  );
}

function StoreCard({ store, intelligence }: { store: StoreSnapshot; intelligence: StoreIntelligence | null }) {
  const weeklyHref = `/stores/${store.id}?period=weekly&tab=overview`;
  const monthlyHref = `/stores/${store.id}?period=monthly&tab=overview`;
  const referenceMetrics = intelligence?.metrics ?? [];

  return (
    <article className="storeCard clickableStoreCard">
      <Link className="storeCardOverlay" href={weeklyHref}>
        <span className="srOnly">Open {store.name} weekly report</span>
      </Link>
      <div className="storeCardTop">
        <span className="metricIcon">
          <Store size={18} />
        </span>
        <div>
          <h3>
            <Link className="storeNameLink" href={weeklyHref}>
              {store.name}
            </Link>
          </h3>
          <p>
            {intelligence?.storeNumber ?? store.city} / {store.city} / {intelligence?.statusLabel ?? store.market}
          </p>
        </div>
        <span className={`tableStatus ${store.status.toLowerCase()}`}>{store.status}</span>
      </div>

      <div className="storeStats">
        <DataPointDrilldown
          label="Net sales"
          value={store.priorWeekNet}
          items={[
            { label: "Gross sales", value: store.priorWeekGross, note: "Shown only as source context." },
            { label: "Completed month net", value: store.monthToDateNet, note: "Last completed calendar month." },
            { label: "Market", value: intelligence?.address ?? store.city, note: intelligence?.marketSummary ?? store.market }
          ]}
        />
        <DataPointDrilldown
          label="Month net"
          value={store.monthToDateNet}
          items={[
            { label: "Weekly net", value: store.priorWeekNet, note: "Current reporting period." },
            { label: "WoW delta", value: store.comparison.netSales.delta, note: store.comparison.netSales.percent },
            { label: "Previous", value: store.comparison.netSales.previous, note: "Prior comparable week." },
            { label: "Action", value: store.status, note: store.comparison.netSales.detail }
          ]}
        />
        <DataPointDrilldown
          label="Tickets"
          value={store.priorWeekTransactions}
          items={[
            { label: "WoW delta", value: store.comparison.transactions.delta, note: store.comparison.transactions.percent },
            { label: "Avg net ticket", value: store.averageBasket, note: "Net sales per transaction." },
            referenceMetrics[0] ?? { label: "Store report", value: "Open weekly", note: "Go deeper into the store report." }
          ]}
        />
        <DataPointDrilldown
          label="Avg net ticket"
          value={store.averageBasket}
          items={[
            { label: "WoW delta", value: store.comparison.averageTicket.delta, note: store.comparison.averageTicket.percent },
            { label: "Inventory health", value: store.inventory, note: "Use with reorder and SKU views." },
            referenceMetrics[1] ?? { label: "CRM", value: "Pending", note: "Live customer layer is next." }
          ]}
        />
      </div>

      <div className="storeComparison" aria-label={`${store.name} week over week net comparison`}>
        {[store.comparison.netSales, store.comparison.transactions, store.comparison.averageTicket].map((comparison) => (
          <DataPointDrilldown
            key={comparison.label}
            className="storeComparisonPoint"
            label={comparison.label}
            value={comparison.delta}
            note={comparison.percent}
            items={[
              { label: "Current", value: comparison.current },
              { label: "Previous", value: comparison.previous },
              { label: "Read", value: comparison.direction === "down" ? "Below prior" : "Above prior", note: comparison.detail }
            ]}
          />
        ))}
      </div>

      {intelligence ? (
        <div className="storeIntelStrip">
          {intelligence.metrics.slice(0, 3).map((metric) => (
            <DataPointDrilldown
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              items={[
                { label: "Store", value: intelligence.storeNumber, note: intelligence.statusLabel },
                { label: "Context", value: intelligence.address, note: intelligence.marketSummary }
              ]}
            />
          ))}
        </div>
      ) : null}

      <div className="storeCardFooter">
        <span className={`changePill ${store.change.startsWith("-") ? "risk" : "good"}`}>
          {store.change.startsWith("-") ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {store.change}
        </span>
        <div>
          <Link href={weeklyHref}>Open detail</Link>
          <Link href={weeklyHref}>WKLY</Link>
          <Link href={monthlyHref}>MTHLY</Link>
        </div>
      </div>
      <div className="storeDeepLinks">
        <Link href={`/stores/${store.id}?period=weekly&tab=products`}>Products</Link>
        <Link href={`/stores/${store.id}?period=weekly&tab=inventory`}>Inventory</Link>
        <Link href={`/stores/${store.id}?period=weekly&tab=transactions`}>Transactions</Link>
        <Link href={`/stores/${store.id}?period=weekly&tab=market`}>Market</Link>
      </div>
    </article>
  );
}

function StoreSnapshotGrid({ stores }: { stores: StoreSnapshot[] }) {
  return (
    <section id="stores" className="storeGrid">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} intelligence={storeIntelligenceById[store.id] ?? null} />
      ))}
    </section>
  );
}

function CategoryMix({ data }: { data: DashboardData["categoryMix"] }) {
  const gradient = data
    .reduce(
      (segments, item) => {
        const start = segments.total;
        const end = start + item.value;
        segments.parts.push(`${item.color} ${start}% ${end}%`);
        segments.total = end;
        return segments;
      },
      { total: 0, parts: [] as string[] }
    )
    .parts.join(", ");

  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Mix</p>
          <h2>Category share</h2>
        </div>
      </div>
      <div className="donutLayout">
        <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div>
            <strong>{data[0].value}%</strong>
            <span>{data[0].label}</span>
          </div>
        </div>
        <div className="legend">
          {data.map((item) => (
            <DrilldownDetails
              key={item.label}
              className="legendItem"
              title={`${item.label} category detail`}
              description="Category share from the selected reporting period."
              items={[
                { label: "Share", value: `${item.value}%`, note: "Share of tracked sales mix." },
                { label: "Focus", value: item.value >= 25 ? "Core category" : "Attach opportunity", note: "Use store pages for SKU-level follow-up." }
              ]}
              summary={
                <>
                  <span style={{ background: item.color }} />
                  <p>{item.label}</p>
                  <strong>{item.value}%</strong>
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function InventorySignals({ data }: { data: DashboardData["inventorySignals"] }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Health signals</h2>
        </div>
      </div>
      <div className="signalList">
        {data.map((signal) => (
          <DrilldownDetails
            key={signal.label}
            className="signalRow"
            title={`${signal.label} inventory detail`}
            description={signal.detail}
            items={[
              { label: "Signal value", value: `${signal.value}%`, note: "Relative inventory health indicator." },
              { label: "Tone", value: signal.tone, note: signal.tone === "risk" ? "Review urgently." : "Monitor with store-level SKU detail." }
            ]}
            summary={
              <>
                <div>
                  <span className={`statusDot ${signal.tone}`} />
                  <p>{signal.label}</p>
                  <small>{signal.detail}</small>
                </div>
                <div className="signalTrack">
                  <span className={signal.tone} style={{ width: `${signal.value}%` }} />
                </div>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function BudtenderTable({
  title,
  data,
  tone
}: {
  title: string;
  data: BudtenderMetric[];
  tone: "top" | "bottom";
}) {
  return (
    <section className="panel tablePanel compactTablePanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">{tone === "top" ? "Leaders" : "Coaching"}</p>
          <h2>{title}</h2>
        </div>
        <span className="softBadge">
          <Users size={15} />
          Budtenders
        </span>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Budtender</th>
              <th>Store</th>
              <th>Net sales</th>
              <th>Gross sales</th>
              <th>Discounts</th>
              <th>Avg net ticket</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody>
            {data.map((budtender) => (
              <tr key={`${title}-${budtender.name}-${budtender.store}`}>
                <td>
                  <DataPointDrilldown
                    className="tableDrilldown"
                    label={budtender.name}
                    value={budtender.netSales}
                    note={budtender.store}
                    items={[
                      { label: "Transactions", value: budtender.transactions.toLocaleString(), note: "Handled tickets." },
                      { label: "Gross sales", value: budtender.grossSales },
                      { label: "Discounts", value: budtender.discounts },
                      { label: "Avg net ticket", value: budtender.averageBasket, note: "Net sales divided by tickets." },
                      { label: "Units", value: budtender.units.toLocaleString(), note: "Items sold." }
                    ]}
                  />
                </td>
                <td>{budtender.store}</td>
                <td>{budtender.netSales}</td>
                <td>{budtender.grossSales}</td>
                <td>{budtender.discounts}</td>
                <td>{budtender.averageBasket}</td>
                <td>{budtender.units.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductVelocity({ data }: { data: DashboardData["products"] }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Products</p>
          <h2>Velocity leaders</h2>
        </div>
      </div>
      <div className="productList">
        {data.map((product, index) => (
          <DrilldownDetails
            key={`${product.name}-${index}`}
            className="productRow"
            title={`${product.name} velocity detail`}
            description={`${product.category} product performance for the selected period.`}
            items={[
              { label: "Units", value: product.units.toLocaleString(), note: "Sold during the selected period." },
              { label: "Net sales", value: product.revenue },
              { label: "Trend", value: product.trend, note: product.trend.startsWith("-") ? "Review availability and price." : "Growing versus prior period." }
            ]}
            summary={
              <>
                <span className="rank">{index + 1}</span>
                <div>
                  <strong>{product.name}</strong>
                  <p>{product.category}</p>
                </div>
                <div className="productMeta">
                  <strong>{product.units.toLocaleString()} units</strong>
                  <span>
                    Net {product.revenue} / {product.trend}
                  </span>
                </div>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function AlertFeed({ data }: { data: DashboardData["alerts"] }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Focus</p>
          <h2>Operator notes</h2>
        </div>
      </div>
      <div className="alertList">
        {data.map((alert) => (
          <DrilldownDetails
            key={alert.title}
            className={`alertItem ${alert.tone}`}
            title={alert.title}
            description={alert.body}
            items={[
              { label: "Priority", value: alert.tone === "risk" ? "High" : alert.tone === "warn" ? "Medium" : "Positive" },
              { label: "Owner action", value: alert.tone === "risk" ? "Assign follow-up" : "Monitor next sync" }
            ]}
            summary={
              <>
                <span />
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.body}</p>
                </div>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function formatSyncTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function SyncPanel({ lastSync, snapshot }: { lastSync: string; snapshot: DutchieSyncSnapshot | null }) {
  const verifiedCount = snapshot?.results.filter((result) => result.verified).length ?? 0;
  const totalCount = snapshot?.results.length ?? 0;

  return (
    <section className="syncPanel">
      <div className="syncTop">
        <span className="metricIcon">
          <DatabaseZap size={18} />
        </span>
        <div>
          <strong>Dutchie sync</strong>
          <p>{snapshot ? `Live pull: ${formatSyncTime(snapshot.syncedAt)}` : `Mock refresh: ${lastSync}`}</p>
        </div>
      </div>
      <div className="syncGrid">
        <span>
          <ShieldCheck size={15} />
          Server-only keys
        </span>
        <span>
          <RefreshCw size={15} />
          {snapshot ? `${verifiedCount}/${totalCount} verified` : "Cron ready"}
        </span>
      </div>
    </section>
  );
}

function LiveDutchiePanel({ snapshot }: { snapshot: DutchieSyncSnapshot | null }) {
  if (!snapshot) {
    return (
      <section className="panel liveDutchiePanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Live Dutchie</p>
            <h2>No local sync snapshot yet</h2>
          </div>
          <span className="softBadge">Run Sync Dutchie Data.bat</span>
        </div>
        <p className="panelNote">
          Your keys can be valid but the dashboard still needs a sync run. Double-click
          <strong> Sync Dutchie Data.bat</strong>, then refresh this page.
        </p>
      </section>
    );
  }

  const totals = snapshot.results.reduce(
    (sum, result) => ({
      transactions: sum.transactions + (result.registerTransactionsFetched ?? 0),
      products: sum.products + (result.productsFetched ?? 0),
      inventory: sum.inventory + (result.inventoryFetched ?? 0),
      verified: sum.verified + (result.verified ? 1 : 0)
    }),
    { transactions: 0, products: 0, inventory: 0, verified: 0 }
  );

  return (
    <section className="panel liveDutchiePanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Live Dutchie</p>
          <h2>Latest API pull</h2>
        </div>
        <span className={`softBadge ${snapshot.ok ? "syncOk" : "syncWarn"}`}>
          {totals.verified}/{snapshot.results.length} stores verified
        </span>
      </div>
      <div className="liveSummary">
        <DataPointDrilldown
          label="Transactions pulled"
          value={totals.transactions.toLocaleString()}
          items={[
            { label: "Verified stores", value: `${totals.verified}/${snapshot.results.length}` },
            { label: "Window start", value: formatSyncTime(snapshot.window.from) },
            { label: "Window end", value: formatSyncTime(snapshot.window.to) }
          ]}
        />
        <DataPointDrilldown
          label="Products pulled"
          value={totals.products.toLocaleString()}
          items={[
            { label: "Source", value: "Dutchie /products" },
            { label: "Use", value: "Catalog and SKU audit inputs" }
          ]}
        />
        <DataPointDrilldown
          label="Inventory rows"
          value={totals.inventory.toLocaleString()}
          items={[
            { label: "Source", value: "Dutchie inventory reporting" },
            { label: "Use", value: "Reorder and stockout review" }
          ]}
        />
        <DataPointDrilldown
          label="Last sync"
          value={formatSyncTime(snapshot.syncedAt)}
          items={[
            { label: "Snapshot", value: snapshot.ok ? "Clean" : "Partial", note: snapshot.ok ? "All stores verified." : "At least one store needs attention." }
          ]}
        />
      </div>
      <div className="liveStoreList">
        {snapshot.results.map((result) => {
          const intelligence = storeIntelligenceById[result.storeId];

          return (
            <DrilldownDetails
              key={result.storeId}
              className="liveStoreRow"
              title={`${result.storeName} live sync detail`}
              description={intelligence?.marketSummary ?? (result.verified ? "Connected to Dutchie." : "Store needs API attention.")}
              items={[
                { label: "Status", value: result.verified ? "Connected" : "Check", note: result.errors.join("; ") || "No sync errors." },
                { label: "Transactions", value: result.registerTransactionsFetched?.toLocaleString() ?? "n/a" },
                { label: "Products", value: result.productsFetched?.toLocaleString() ?? "n/a" },
                { label: "Inventory rows", value: result.inventoryFetched?.toLocaleString() ?? "n/a" }
              ]}
              summary={
                <>
                  <div>
                    <span className={`statusDot ${result.verified ? "good" : "risk"}`} />
                    <strong>
                      <Link href={`/stores/${result.storeId}?period=weekly`}>{result.storeName}</Link>
                    </strong>
                    <small>{result.errors.length ? result.errors.join("; ") : "Connected"}</small>
                  </div>
                  <dl>
                    <div>
                      <dt>Tx</dt>
                      <dd>{result.registerTransactionsFetched?.toLocaleString() ?? "n/a"}</dd>
                    </div>
                    <div>
                      <dt>Products</dt>
                      <dd>{result.productsFetched?.toLocaleString() ?? "n/a"}</dd>
                    </div>
                    <div>
                      <dt>Inventory</dt>
                      <dd>{result.inventoryFetched?.toLocaleString() ?? "n/a"}</dd>
                    </div>
                  </dl>
                </>
              }
            >
              {intelligence ? (
                <div className="drilldownActions">
                  <a href={`/stores/${result.storeId}?period=weekly&tab=market`}>Market context</a>
                  <a href={`/stores/${result.storeId}?period=weekly&tab=actions`}>Events</a>
                  <a href={`/stores/${result.storeId}?period=weekly&tab=actions`}>Actions</a>
                </div>
              ) : null}
            </DrilldownDetails>
          );
        })}
      </div>
      <p className="panelNote">
        Live cards now use Dutchie closing-report netSales, transactionCount, and averageCartNetSales when analytics
        are present in the latest sync. Stores without analytics are excluded from portfolio totals.
      </p>
    </section>
  );
}

function PeriodControl({ period }: { period: Period }) {
  return (
    <div className="segmented printHidden" aria-label="Period selector">
      <Link className={period === "weekly" ? "active" : ""} href="/?period=weekly">
        Weekly
      </Link>
      <Link className={period === "monthly" ? "active" : ""} href="/?period=monthly">
        Monthly
      </Link>
    </div>
  );
}

function metricToneClass(status: ExecutiveMetric["status"]) {
  if (status === "positive") {
    return "good";
  }

  if (status === "risk") {
    return "risk";
  }

  if (status === "watch") {
    return "watch";
  }

  return "neutral";
}

function insightToneClass(insight: ExecutiveInsight) {
  if (insight.priority === "High" || insight.type === "Risk") {
    return "risk";
  }

  if (insight.priority === "Medium" || insight.type === "Opportunity") {
    return "watch";
  }

  return "good";
}

function ExecutiveHero({
  intelligence,
  data,
  period
}: {
  intelligence: ExecutiveIntelligence;
  data: DashboardData;
  period: Period;
}) {
  return (
    <section className="executiveHero" id="overview">
      <div className="executiveHeroCopy">
        <p className="eyebrow">Executive intelligence platform</p>
        <h2>{intelligence.narrative.headline}</h2>
        <p>{intelligence.narrative.summary}</p>
        <div className="executiveHeroActions">
          <DataPointDrilldown
            label="Report type"
            value={period === "monthly" ? "Monthly board view" : "Weekly operator view"}
            items={[
              { label: "Current period", value: data.periodContext.currentPeriod },
              { label: "Comparison", value: data.periodContext.comparisonPeriod },
              { label: "Basis", value: "Net revenue, live where connected" }
            ]}
          />
          <DataPointDrilldown
            label="AI prompt"
            value="Audit-safe"
            note="No invented EBITDA/CAC/ROAS"
            items={[
              { label: "Commentary", value: "Generated from supplied metrics only" },
              { label: "Missing data", value: "Marked not connected" },
              { label: "Use", value: "Executive summary, risks, opportunities" }
            ]}
          />
        </div>
      </div>
      <div className="executiveNarrativeCard">
        <div className="executiveCardTop">
          <span className="metricIcon">
            <Brain size={18} />
          </span>
          <div>
            <strong>Board-ready narrative</strong>
            <p>Auto-generated intelligence brief</p>
          </div>
        </div>
        <ul>
          {intelligence.narrative.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExecutiveMetricDeck({
  id,
  eyebrow,
  title,
  metrics
}: {
  id: string;
  eyebrow: string;
  title: string;
  metrics: ExecutiveMetric[];
}) {
  return (
    <section className="panel executiveMetricDeck" id={id}>
      <div className="panelHeader">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span className="softBadge">Executive KPI contract</span>
      </div>
      <div className="executiveMetricGrid">
        {metrics.map((metric) => (
          <DataPointDrilldown
            key={`${id}-${metric.label}`}
            className={`executiveMetric ${metricToneClass(metric.status)}`}
            label={metric.label}
            value={metric.value}
            note={metric.detail}
            items={[
              { label: "Status", value: metric.status },
              { label: "Executive read", value: metric.detail }
            ]}
          />
        ))}
      </div>
    </section>
  );
}

function AiInsightPanel({ intelligence }: { intelligence: ExecutiveIntelligence }) {
  const prompt = buildExecutiveInsightPrompt(intelligence);

  return (
    <section className="dashboardGrid executiveInsightGrid" id="insights">
      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">AI intelligence</p>
            <h2>Executive commentary</h2>
          </div>
          <span className="softBadge">
            <Zap size={15} />
            GPT-ready
          </span>
        </div>
        <div className="insightBoard">
          {intelligence.aiInsights.map((insight) => (
            <DrilldownDetails
              key={`${insight.type}-${insight.title}`}
              className={`executiveInsight ${insightToneClass(insight)}`}
              title={insight.title}
              description={insight.body}
              items={[
                { label: "Type", value: insight.type },
                { label: "Priority", value: insight.priority },
                { label: "Action", value: insight.priority === "High" ? "Assign owner" : "Monitor next report" }
              ]}
              summary={
                <>
                  <span>{insight.type}</span>
                  <div>
                    <strong>{insight.title}</strong>
                    <p>{insight.body}</p>
                  </div>
                  <small>{insight.priority}</small>
                </>
              }
            />
          ))}
        </div>
      </section>

      <section className="panel promptPanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">AI layer</p>
            <h2>Insight prompt contract</h2>
          </div>
          <span className="softBadge">OpenAI-ready</span>
        </div>
        <pre>{prompt}</pre>
      </section>
    </section>
  );
}

function MarketScorecards({ intelligence }: { intelligence: ExecutiveIntelligence }) {
  return (
    <section className="panel marketHeatmapPanel" id="markets">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Location intelligence</p>
          <h2>Market performance heatmap</h2>
        </div>
        <span className="softBadge">
          <Building2 size={15} />
          Location scorecards
        </span>
      </div>
      <div className="marketHeatmap">
        {intelligence.marketScorecards.map((market) => (
          <DrilldownDetails
            key={market.label}
            className={`marketTile ${market.status}`}
            title={`${market.label} market detail`}
            description={market.detail}
            items={[
              { label: "Performance index", value: `${market.value}/100` },
              { label: "Detail", value: market.detail }
            ]}
            summary={
              <>
                <span>{market.label}</span>
                <strong>{market.value}</strong>
                <div className="ownerMeter" aria-hidden="true">
                  <span style={{ width: `${market.value}%` }} />
                </div>
                <p>{market.detail}</p>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

function ReportStudio({ intelligence }: { intelligence: ExecutiveIntelligence }) {
  return (
    <section className="panel reportStudio" id="reports">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Report automation</p>
          <h2>Executive report studio</h2>
        </div>
        <span className="softBadge">
          <Presentation size={15} />
          Board-ready exports
        </span>
      </div>
      <div className="reportModuleGrid">
        {intelligence.reportModules.map((module) => (
          <DrilldownDetails
            key={module.title}
            className={`reportModule ${module.status.toLowerCase()}`}
            title={module.title}
            description={`${module.cadence} / ${module.audience}`}
            items={[
              { label: "Cadence", value: module.cadence },
              { label: "Audience", value: module.audience },
              { label: "Status", value: module.status }
            ]}
            summary={
              <>
                <span className="metricIcon">
                  <FileText size={17} />
                </span>
                <div>
                  <strong>{module.title}</strong>
                  <p>{module.audience}</p>
                </div>
                <small>{module.status}</small>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = getPeriod(params?.period);
  const snapshot = await readDutchieSyncSnapshot();
  const data = getDashboardData(period, snapshot);
  const intelligence = buildExecutiveIntelligence(data, period, snapshot);

  return (
    <main className="appShell">
      <aside className="sidebar printHidden">
        <div className="brand">
          <span>
            <Leaf size={20} />
          </span>
          <div>
            <strong>EMBR Intelligence</strong>
            <p>Dispensary analytics</p>
          </div>
        </div>

        <nav className="navList" aria-label="Dashboard sections">
          <a className="active" href="#overview">
            <Gauge size={17} />
            Overview
          </a>
          <a href="#finance">
            <Landmark size={17} />
            Finance
          </a>
          <a href="#stores">
            <MapPin size={17} />
            Stores
          </a>
          <a href="#markets">
            <Target size={17} />
            Markets
          </a>
          <a href="#inventory">
            <PackageCheck size={17} />
            Inventory
          </a>
          <a href="#reports">
            <Presentation size={17} />
            Reports
          </a>
        </nav>

        <SyncPanel lastSync={data.lastSync} snapshot={snapshot} />
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Six-store command dashboard</p>
            <h1>{data.title}</h1>
            <span>{data.subtitle}</span>
          </div>
          <div className="toolbar">
            <span className="dateBadge">
              <CalendarDays size={16} />
              {data.dateRange}
            </span>
            <PeriodControl period={period} />
            <ReportActions />
            <button className="iconButton printHidden" type="button" aria-label="Filters">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </header>

        <PeriodContextBar context={data.periodContext} />

        <ExecutiveHero intelligence={intelligence} data={data} period={period} />

        <section className="metricGrid">
          {data.kpis.map((kpi, index) => (
            <KpiCard key={kpi.label} kpi={kpi} index={index} />
          ))}
        </section>

        <ExecutiveCharts data={intelligence.chartData} />

        <section className="executiveDeckGrid">
          <ExecutiveMetricDeck id="finance" eyebrow="CFO snapshot" title="Financial intelligence" metrics={intelligence.financial} />
          <ExecutiveMetricDeck id="customers" eyebrow="Customer intelligence" title="Customer and order quality" metrics={intelligence.customer} />
          <ExecutiveMetricDeck id="operations" eyebrow="Operational health" title="Execution readiness" metrics={intelligence.operational} />
        </section>

        <AiInsightPanel intelligence={intelligence} />

        <LiveDutchiePanel snapshot={snapshot} />

        <StoreSnapshotGrid stores={data.stores} />

        <MarketScorecards intelligence={intelligence} />

        <ComparisonPanel title={data.comparisonTitle} comparisons={data.comparisons} />

        <section className="dashboardGrid">
          <RevenueChart data={data.revenueSeries} />
          <div className="stack">
            <CategoryMix data={data.categoryMix} />
            <InventorySignals data={data.inventorySignals} />
          </div>
        </section>

        <section id="budtenders" className="budtenderGrid">
          <BudtenderTable title="Top 3 budtenders" data={data.budtenders.top} tone="top" />
          <BudtenderTable title="Lowest 3 budtenders" data={data.budtenders.bottom} tone="bottom" />
        </section>

        <section className="lowerGrid">
          <div id="products">
            <ProductVelocity data={data.products} />
          </div>
          <div id="inventory">
            <AlertFeed data={data.alerts} />
          </div>
        </section>

        <ReportStudio intelligence={intelligence} />
      </section>
    </main>
  );
}
