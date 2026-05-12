import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  DatabaseZap,
  Gauge,
  Leaf,
  LineChart,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  TrendingUp,
  Users
} from "lucide-react";
import { ReportActions } from "@/components/report-actions";
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
    <article className="metricCard">
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
    </article>
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
          <article key={comparison.label} className="comparisonCard">
            <div>
              <span>{comparison.label}</span>
              <strong>{comparison.current}</strong>
              <small>Prior: {comparison.previous}</small>
            </div>
            <span className={`changePill ${comparison.direction === "down" ? "risk" : "good"}`}>
              {comparison.direction === "down" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {comparison.delta} · {comparison.percent}
            </span>
            <p>{comparison.detail}</p>
          </article>
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
    <section className="panel chartPanel">
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

      <svg className="revenueChart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue chart">
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
    </section>
  );
}

function StoreCard({ store }: { store: StoreSnapshot }) {
  return (
    <article className="storeCard">
      <div className="storeCardTop">
        <span className="metricIcon">
          <Store size={18} />
        </span>
        <div>
          <h3>{store.name}</h3>
          <p>{store.city} · {store.market}</p>
        </div>
        <span className={`tableStatus ${store.status.toLowerCase()}`}>{store.status}</span>
      </div>

      <div className="storeStats">
        <div>
          <span>Gross</span>
          <strong>{store.priorWeekGross}</strong>
        </div>
        <div>
          <span>Net</span>
          <strong>{store.priorWeekNet}</strong>
        </div>
        <div>
          <span>Tickets</span>
          <strong>{store.priorWeekTransactions}</strong>
        </div>
        <div>
          <span>Avg ticket</span>
          <strong>{store.averageBasket}</strong>
        </div>
      </div>

      <div className="storeComparison" aria-label={`${store.name} week over week net comparison`}>
        {[store.comparison.netSales, store.comparison.transactions, store.comparison.averageTicket].map((comparison) => (
          <div key={comparison.label}>
            <span>{comparison.label}</span>
            <strong className={comparison.direction === "down" ? "riskText" : "goodText"}>{comparison.delta}</strong>
          </div>
        ))}
      </div>

      <div className="storeCardFooter">
        <span className={`changePill ${store.change.startsWith("-") ? "risk" : "good"}`}>
          {store.change.startsWith("-") ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {store.change}
        </span>
        <div>
          <Link href={`/stores/${store.id}?period=weekly`}>Past week</Link>
          <Link href={`/stores/${store.id}?period=monthly`}>Current month</Link>
        </div>
      </div>
    </article>
  );
}

function StoreSnapshotGrid({ stores }: { stores: StoreSnapshot[] }) {
  return (
    <section id="stores" className="storeGrid">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
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
            <div key={item.label} className="legendItem">
              <span style={{ background: item.color }} />
              <p>{item.label}</p>
              <strong>{item.value}%</strong>
            </div>
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
          <div key={signal.label} className="signalRow">
            <div>
              <span className={`statusDot ${signal.tone}`} />
              <p>{signal.label}</p>
              <small>{signal.detail}</small>
            </div>
            <div className="signalTrack">
              <span className={signal.tone} style={{ width: `${signal.value}%` }} />
            </div>
          </div>
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
              <th>Gross</th>
              <th>Net</th>
              <th>Discounts</th>
              <th>Avg ticket</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody>
            {data.map((budtender) => (
              <tr key={`${title}-${budtender.name}-${budtender.store}`}>
                <td>
                  <strong>{budtender.name}</strong>
                </td>
                <td>{budtender.store}</td>
                <td>{budtender.grossSales}</td>
                <td>{budtender.netSales}</td>
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
          <div key={product.name} className="productRow">
            <span className="rank">{index + 1}</span>
            <div>
              <strong>{product.name}</strong>
              <p>{product.category}</p>
            </div>
            <div className="productMeta">
              <strong>{product.units.toLocaleString()} units</strong>
              <span>
                {product.revenue} · {product.trend}
              </span>
            </div>
          </div>
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
          <article key={alert.title} className={`alertItem ${alert.tone}`}>
            <span />
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SyncPanel({ lastSync }: { lastSync: string }) {
  return (
    <section className="syncPanel">
      <div className="syncTop">
        <span className="metricIcon">
          <DatabaseZap size={18} />
        </span>
        <div>
          <strong>Dutchie sync</strong>
          <p>Last mock refresh: {lastSync}</p>
        </div>
      </div>
      <div className="syncGrid">
        <span>
          <ShieldCheck size={15} />
          Server-only keys
        </span>
        <span>
          <RefreshCw size={15} />
          Cron ready
        </span>
      </div>
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

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = getPeriod(params?.period);
  const data = getDashboardData(period);

  return (
    <main className="appShell">
      <aside className="sidebar printHidden">
        <div className="brand">
          <span>
            <Leaf size={20} />
          </span>
          <div>
            <strong>EMBR - Intellegence</strong>
            <p>Dispensary analytics</p>
          </div>
        </div>

        <nav className="navList" aria-label="Dashboard sections">
          <a className="active" href="#overview">
            <Gauge size={17} />
            Overview
          </a>
          <a href="#stores">
            <MapPin size={17} />
            Stores
          </a>
          <a href="#budtenders">
            <Users size={17} />
            Budtenders
          </a>
          <a href="#inventory">
            <PackageCheck size={17} />
            Inventory
          </a>
        </nav>

        <SyncPanel lastSync={data.lastSync} />
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

        <section id="overview" className="metricGrid">
          {data.kpis.map((kpi, index) => (
            <KpiCard key={kpi.label} kpi={kpi} index={index} />
          ))}
        </section>

        <StoreSnapshotGrid stores={data.stores} />

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
      </section>
    </main>
  );
}
