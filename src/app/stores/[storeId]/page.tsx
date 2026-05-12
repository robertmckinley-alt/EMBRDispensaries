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
import { ReportActions } from "@/components/report-actions";
import { getStoreInsights, type StoreProductInsight } from "@/lib/store-insights";
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

const navItems = [
  ["overview", "Overview"],
  ["products", "Products"],
  ["brands", "Brands"],
  ["skus", "SKUs"],
  ["reorder", "Reorder"],
  ["transactions", "Transactions"],
  ["budtenders", "Budtenders"],
  ["demographics", "Demographics"],
  ["marketing", "Marketing"]
] as const;

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

function SectionNav() {
  return (
    <nav className="storeSectionNav printHidden" aria-label="Store report sections">
      {navItems.map(([id, label]) => (
        <a key={id} href={`#${id}`}>
          {label}
        </a>
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
          <article key={comparison.label} className="comparisonCard">
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
          </article>
        ))}
      </div>
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
          <div key={point.label} className="barCompareRow">
            <strong>{point.label}</strong>
            <div>
              <span style={{ width: `${(point.current / max) * 100}%` }} />
              <small>{point.current.toLocaleString()} current</small>
            </div>
            <div>
              <span style={{ width: `${(point.previous / max) * 100}%` }} />
              <small>{point.previous.toLocaleString()} prior</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: StoreProductInsight }) {
  return (
    <article className="insightCard">
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
    </article>
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

  const insights = getStoreInsights(report.store, period);

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

      <SectionNav />

      <section className="storeHero" id="overview">
        <div>
          <p className="eyebrow">Store cockpit</p>
          <h2>{report.store.priorWeekNet} net sales</h2>
          <p>
            {report.store.priorWeekGross} gross / {report.store.priorWeekTransactions} transactions /{" "}
            {report.store.averageBasket} average ticket
          </p>
        </div>
        <div className="storeHeroActions">
          <span className={`tableStatus ${report.store.status.toLowerCase()}`}>{report.store.status}</span>
          <a href="#reorder">Reorder queue</a>
          <a href="#marketing">Marketing ideas</a>
        </div>
      </section>

      <ComparisonPanel title={report.comparisonTitle} comparisons={report.comparisons} />

      <section className="metricGrid">
        {report.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} kpi={kpi} index={index} />
        ))}
      </section>

      <section className="storeInsightGrid">
        {insights.categoryOpportunity.map((item) => (
          <article key={item.label} className={`alertItem ${item.tone}`}>
            <span />
            <div>
              <strong>{item.label}: {item.value}</strong>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="panel" id="products">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Products</p>
            <h2>Top products by revenue and margin</h2>
          </div>
          <span className="softBadge">
            <ShoppingBasket size={15} />
            Highest revenue
          </span>
        </div>
        <div className="insightCardGrid">
          {insights.products.slice(0, 4).map((product) => (
            <ProductCard key={product.name} product={product} />
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
                  <th>Category</th>
                  <th>Net sales</th>
                  <th>Units</th>
                  <th>Margin</th>
                  <th>Share</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {insights.brands.map((brand) => (
                  <tr key={brand.brand}>
                    <td>
                      <strong>{brand.brand}</strong>
                    </td>
                    <td>{brand.category}</td>
                    <td>{brand.netSales}</td>
                    <td>{brand.units.toLocaleString()}</td>
                    <td>{brand.margin}</td>
                    <td>{brand.share}</td>
                    <td className={brand.trend.startsWith("-") ? "riskText" : "goodText"}>{brand.trend}</td>
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
                      <strong>{sku.sku}</strong>
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

      <section className="lowerGrid">
        <section className="panel tablePanel" id="reorder">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Reorder</p>
              <h2>Suggested reorder queue</h2>
            </div>
            <span className="softBadge">Clickable from store nav</span>
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
                      <span className={`tableStatus ${item.urgency === "High" ? "action" : item.urgency === "Medium" ? "watch" : "healthy"}`}>
                        {item.urgency}
                      </span>
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

        <DaypartGraph data={insights.daypart} />
      </section>

      <section className="budtenderGrid" id="budtenders">
        <BudtenderTable title="Top 3 budtenders" data={report.budtenders.top} />
        <BudtenderTable title="Lowest 3 budtenders" data={report.budtenders.bottom} />
      </section>

      <section className="lowerGrid">
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
                  <th>Avg ticket</th>
                  <th>Discount rate</th>
                </tr>
              </thead>
              <tbody>
                {insights.transactions.map((transaction) => (
                  <tr key={transaction.label}>
                    <td>
                      <strong>{transaction.label}</strong>
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
              <article key={segment.segment} className="segmentCard">
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
                    <dt>Avg ticket</dt>
                    <dd>{segment.avgTicket}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{segment.preferredCategory}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>

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
            <article key={idea.title} className="marketingCard">
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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
