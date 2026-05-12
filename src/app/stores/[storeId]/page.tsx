import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Download,
  Gauge,
  PackageCheck,
  TrendingUp,
  Users
} from "lucide-react";
import { ReportActions } from "@/components/report-actions";
import {
  getPeriod,
  getStoreReport,
  stores,
  type BudtenderMetric,
  type ComparisonMetric,
  type Kpi,
  type Period
} from "@/lib/mock-dutchie";

type StorePageProps = {
  params: Promise<{
    storeId: string;
  }>;
  searchParams?: Promise<{
    period?: string;
  }>;
};

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
      <span className={`changePill ${kpi.direction === "down" ? "risk" : "good"}`}>{kpi.change}</span>
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
      <div className="comparisonGrid storeReportComparison">
        {comparisons.map((comparison) => (
          <article key={comparison.label} className="comparisonCard">
            <div>
              <span>{comparison.label}</span>
              <strong>{comparison.current}</strong>
              <small>Prior: {comparison.previous}</small>
            </div>
            <span className={`changePill ${comparison.direction === "down" ? "risk" : "good"}`}>
              {comparison.delta} · {comparison.percent}
            </span>
            <p>{comparison.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PeriodControl({ storeId, period }: { storeId: string; period: Period }) {
  return (
    <div className="segmented printHidden" aria-label="Store report period selector">
      <Link className={period === "weekly" ? "active" : ""} href={`/stores/${storeId}?period=weekly`}>
        Weekly
      </Link>
      <Link className={period === "monthly" ? "active" : ""} href={`/stores/${storeId}?period=monthly`}>
        Monthly
      </Link>
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
          Gross and net
        </span>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gross</th>
              <th>Net</th>
              <th>Discounts</th>
              <th>Avg ticket</th>
              <th>Units</th>
              <th>Tickets</th>
            </tr>
          </thead>
          <tbody>
            {data.map((budtender) => (
              <tr key={`${title}-${budtender.name}`}>
                <td>
                  <strong>{budtender.name}</strong>
                </td>
                <td>{budtender.grossSales}</td>
                <td>{budtender.netSales}</td>
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

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { storeId } = await params;
  const resolvedSearchParams = await searchParams;
  const period = getPeriod(resolvedSearchParams?.period);
  const report = getStoreReport(storeId, period);

  if (!report) {
    notFound();
  }

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
          <PeriodControl storeId={storeId} period={period} />
          <ReportActions />
          <span className="softBadge printOnly">
            <Download size={15} />
            PDF export
          </span>
        </div>
      </header>

      <section className="storeHero">
        <div>
          <p className="eyebrow">Snapshot</p>
          <h2>{report.store.priorWeekNet} net sales</h2>
          <p>
            {report.store.priorWeekGross} gross · {report.store.priorWeekTransactions} transactions ·{" "}
            {report.store.averageBasket} average ticket
          </p>
        </div>
        <span className={`tableStatus ${report.store.status.toLowerCase()}`}>{report.store.status}</span>
      </section>

      <ComparisonPanel title={report.comparisonTitle} comparisons={report.comparisons} />

      <section className="metricGrid">
        {report.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} kpi={kpi} index={index} />
        ))}
      </section>

      <section className="budtenderGrid">
        <BudtenderTable title="Top 3 budtenders" data={report.budtenders.top} />
        <BudtenderTable title="Lowest 3 budtenders" data={report.budtenders.bottom} />
      </section>

      <section className="lowerGrid">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Products</p>
              <h2>Velocity leaders</h2>
            </div>
          </div>
          <div className="productList">
            {report.products.map((product, index) => (
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

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Focus</p>
              <h2>Store notes</h2>
            </div>
          </div>
          <div className="alertList">
            {report.alerts.map((alert) => (
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
      </section>
    </main>
  );
}
