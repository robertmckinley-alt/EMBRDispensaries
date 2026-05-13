import { getDashboardData, getPeriod, getStoreReport, type DashboardData, type Period, type StoreReport } from "@/lib/mock-dutchie";
import { readDutchieSyncSnapshot, type DutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";

const defaultReportRecipients = [
  "rmckinley@pandasolutions.co",
  "patrickb@pandasolutions.co",
  "brettd@growopfarms.com",
  "queenpanda@growopfarms.com",
  "bhorrigan@pandasolutions.co",
  "ryanw@embr.us"
];

type EmailAttachment = {
  filename: string;
  content: string;
};

export type EmailReportResult = {
  ok: boolean;
  skipped?: boolean;
  recipients: string[];
  subject?: string;
  reportUrl?: string;
  attachments?: string[];
  providerResponse?: unknown;
  error?: string;
};

export function getReportRecipients() {
  const configuredRecipients = (process.env.REPORT_RECIPIENTS || "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  return configuredRecipients.length > 0 ? configuredRecipients : defaultReportRecipients;
}

function getReportBaseUrl() {
  const configuredUrl =
    process.env.REPORT_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3100";

  return configuredUrl.startsWith("http") ? configuredUrl.replace(/\/$/, "") : `https://${configuredUrl.replace(/\/$/, "")}`;
}

function periodLabel(period: Period) {
  return period === "monthly" ? "Monthly" : "Weekly";
}

function formatReportMoney(value: number) {
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

function formatReportCount(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function livePeriodForStore(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period) {
  const result = snapshot?.results.find((candidate) => candidate.storeId === storeId);

  if (!result?.analytics) {
    return null;
  }

  return period === "monthly" ? result.analytics.monthly.current : result.analytics.weekly.current;
}

function storeGrossForPeriod(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period, fallback: string) {
  const current = livePeriodForStore(snapshot, storeId, period);
  return current ? formatReportMoney(current.grossSales) : fallback;
}

function storeCustomerMixForPeriod(snapshot: DutchieSyncSnapshot | null | undefined, storeId: string, period: Period) {
  const current = livePeriodForStore(snapshot, storeId, period);

  return {
    returningCustomers: current ? formatReportCount(current.returningCustomerCount ?? 0) : "Unavailable",
    newCustomers: current ? formatReportCount(current.newCustomerCount ?? 0) : "Unavailable",
    totalCustomers: current ? formatReportCount(current.customerCount ?? 0) : "Unavailable"
  };
}

function buildReportSubject(period: Period, data: DashboardData) {
  return `EMBR ${periodLabel(period)} Operating Report | ${data.dateRange} | Net Basis`;
}

function dashboardUrl(period: Period) {
  return `${getReportBaseUrl()}/?period=${period}`;
}

function storeReportUrl(storeId: string, period: Period) {
  return `${getReportBaseUrl()}/stores/${storeId}?period=${period}&tab=overview`;
}

function htmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textFromMetric(metric: { label: string; current?: string; value?: string; delta?: string; percent?: string; change?: string }) {
  const value = metric.current ?? metric.value ?? "";
  const movement = metric.delta && metric.percent ? `${metric.delta} / ${metric.percent}` : metric.change ?? "";
  return `${metric.label}: ${value}${movement ? ` (${movement})` : ""}`;
}

function buildExecutiveSummary(data: DashboardData) {
  const comparisonItems = data.comparisons.slice(0, 3).map(textFromMetric);
  const customerItems = data.comparisons
    .filter((comparison) => ["Returning customers", "New customers"].includes(comparison.label))
    .map(textFromMetric);
  const actionStores = data.stores
    .filter((store) => store.status !== "Healthy")
    .slice(0, 3)
    .map((store) => `${store.name}: ${store.status} (${store.inventory})`);

  return {
    comparisonItems,
    customerItems,
    actionStores: actionStores.length > 0 ? actionStores : ["No urgent store status exceptions in this reporting run."]
  };
}

export function buildReportEmailHtml(period: Period, snapshot?: DutchieSyncSnapshot | null) {
  const data = getDashboardData(period, snapshot);
  const reportUrl = dashboardUrl(period);
  const { comparisonItems, customerItems, actionStores } = buildExecutiveSummary(data);
  const storeRows = data.stores
    .map((store) => {
      const customerMix = storeCustomerMixForPeriod(snapshot, store.id, period);

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(store.name)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(store.comparison.netSales.current)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(storeGrossForPeriod(snapshot, store.id, period, store.priorWeekGross))}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(store.comparison.transactions.current)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(store.comparison.averageTicket.current)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(customerMix.returningCustomers)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(customerMix.newCustomers)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(store.status)}</td>
        </tr>
      `;
    })
    .join("");

  const budtenderRows = data.budtenders.top
    .map(
      (budtender) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(budtender.name)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(budtender.store)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(budtender.netSales)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(budtender.grossSales)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(budtender.averageBasket)}</td>
        </tr>
      `
    )
    .join("");
  const comparisonRows = data.comparisons
    .map(
      (comparison) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(comparison.label)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(comparison.current)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(comparison.previous)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(comparison.delta)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(comparison.percent)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f6f7f4;color:#111827;padding:28px;">
      <div style="max-width:900px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#111311;color:#f4f1e8;padding:28px;">
          <p style="margin:0 0 8px;color:#56d68a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">EMBR ${periodLabel(period)} Operating Report</p>
          <h1 style="margin:0 0 10px;font-size:28px;">${htmlEscape(data.dateRange)}</h1>
          <p style="margin:0;color:#cbd5c5;line-height:1.5;">Prepared on a net basis for ownership review. Full dashboard link and PDF reports are included below.</p>
        </div>

        <div style="padding:28px;">
          <p style="margin:0 0 18px;line-height:1.6;">Good morning,</p>
          <p style="margin:0 0 18px;line-height:1.6;">
            Attached is the EMBR ${periodLabel(period).toLowerCase()} operating report for <strong>${htmlEscape(data.periodContext.currentPeriod)}</strong>,
            compared against <strong>${htmlEscape(data.periodContext.comparisonPeriod)}</strong>. Revenue and ticket figures are presented on a net basis using Dutchie closing-report data.
          </p>
          <p style="margin:0 0 24px;line-height:1.6;">
            View the live dashboard here:
            <a href="${reportUrl}" style="color:#047857;font-weight:700;">${reportUrl}</a>
          </p>

          <div style="display:block;background:#f3f8f5;border:1px solid #ccebdd;border-radius:10px;padding:18px;margin-bottom:24px;">
            <h2 style="margin:0 0 12px;font-size:18px;">Executive Summary</h2>
            <ul style="margin:0;padding-left:20px;line-height:1.6;">
              ${comparisonItems.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}
              ${customerItems.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}
              ${actionStores.map((item) => `<li>${htmlEscape(item)}</li>`).join("")}
            </ul>
          </div>

          <div style="display:block;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:18px;margin-bottom:24px;">
            <h2 style="margin:0 0 12px;font-size:18px;">Reporting Basis</h2>
            <p style="margin:0;line-height:1.6;">${htmlEscape(data.periodContext.basis)}</p>
            <p style="margin:8px 0 0;line-height:1.6;">Included stores: ${htmlEscape(data.periodContext.includedStores)}. Excluded stores: ${htmlEscape(data.periodContext.excludedStores)}.</p>
          </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;background:#ffffff;">
        <thead>
          <tr style="color:#047857;text-align:left;background:#f9fafb;">
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Metric</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Value</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Change</th>
          </tr>
        </thead>
        <tbody>
          ${data.kpis
            .map(
              (kpi) => `
                <tr>
                  <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(kpi.label)}</td>
                  <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(kpi.value)}</td>
                  <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${htmlEscape(kpi.change)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <h2>${data.comparisonTitle}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="color:#047857;text-align:left;background:#f9fafb;">
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Metric</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Current</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Previous</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Delta</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Percent</th>
          </tr>
        </thead>
        <tbody>${comparisonRows}</tbody>
      </table>
      <h2>Store Snapshot</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="color:#047857;text-align:left;background:#f9fafb;">
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Store</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Net sales</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Gross sales</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Transactions</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Avg net ticket</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Returning customers</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">New customers</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Status</th>
          </tr>
        </thead>
        <tbody>${storeRows}</tbody>
      </table>
      <h2>Top 3 Budtenders</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="color:#047857;text-align:left;background:#f9fafb;">
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Budtender</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Store</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Net sales</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Gross sales</th>
            <th style="padding:10px;border-bottom:1px solid #d1d5db;">Avg net ticket</th>
          </tr>
        </thead>
        <tbody>${budtenderRows}</tbody>
      </table>
          <p style="margin:28px 0 0;color:#6b7280;line-height:1.6;">
            This report is delivered automatically every Monday for weekly review and on the first day of each month for the monthly review.
          </p>
        </div>
      </div>
    </div>
  `;
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfLine(value: string, maxLength = 92) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if ((line ? `${line} ${word}` : word).length > maxLength) {
      if (line) {
        lines.push(line);
      }
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function chunkLines(lines: string[], size: number) {
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += size) {
    pages.push(lines.slice(index, index + size));
  }

  return pages;
}

function buildPdfBuffer(lines: string[]) {
  const pages = chunkLines(lines.flatMap((line) => wrapPdfLine(line)), 45);
  const objects: string[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const pageIds: number[] = [];
  pages.forEach((pageLines, index) => {
    const contentId = 4 + index * 2;
    const pageId = contentId + 1;
    pageIds.push(pageId);

    const content = [
      "BT",
      "/F1 11 Tf",
      "14 TL",
      "50 760 Td",
      ...pageLines.map((line) => `(${pdfEscape(line)}) Tj T*`),
      "ET"
    ].join("\n");

    objects[contentId] = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(pdf, "utf8");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function sanitizeFilenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function comparisonCurrent(comparisons: DashboardData["comparisons"], label: string) {
  return comparisons.find((comparison) => comparison.label === label)?.current ?? "Unavailable";
}

function buildPortfolioPdfLines(period: Period, data: DashboardData, reportUrl: string, snapshot: DutchieSyncSnapshot | null) {
  const lines = [
    `EMBR ${periodLabel(period)} Operating Report`,
    `Current period: ${data.periodContext.currentPeriod}`,
    `Comparison period: ${data.periodContext.comparisonPeriod}`,
    `Reporting basis: ${data.periodContext.basis}`,
    `Dashboard link: ${reportUrl}`,
    "",
    "Portfolio KPIs",
    ...data.kpis.map((kpi) => `- ${kpi.label}: ${kpi.value}; change ${kpi.change}; ${kpi.detail}`),
    "",
    data.comparisonTitle,
    ...data.comparisons.map((comparison) => `- ${textFromMetric(comparison)}`),
    "",
    "Store Snapshot",
    ...data.stores.map((store) => {
      const customerMix = storeCustomerMixForPeriod(snapshot, store.id, period);

      return `- ${store.name}: ${store.comparison.netSales.current} net sales; ${store.comparison.transactions.current} transactions; ${store.comparison.averageTicket.current} avg net ticket; ${customerMix.returningCustomers} returning customers; ${customerMix.newCustomers} new customers; status ${store.status}.`;
    }),
    "",
    "Top Budtenders",
    ...data.budtenders.top.map(
      (budtender) =>
        `- ${budtender.name}, ${budtender.store}: ${budtender.netSales} net sales; ${budtender.averageBasket} avg net ticket.`
    )
  ];

  return lines;
}

function buildStorePdfLines(period: Period, report: StoreReport) {
  const returningCustomers = comparisonCurrent(report.comparisons, "Returning customers");
  const newCustomers = comparisonCurrent(report.comparisons, "New customers");

  return [
    `${report.store.name} ${periodLabel(period)} Store Report`,
    `Current period: ${report.periodContext.currentPeriod}`,
    `Comparison period: ${report.periodContext.comparisonPeriod}`,
    `Store link: ${storeReportUrl(report.store.id, period)}`,
    "",
    "Owner Summary",
    `- Net sales: ${report.store.comparison.netSales.current}.`,
    `- Transactions: ${report.store.comparison.transactions.current}.`,
    `- Avg net ticket: ${report.store.comparison.averageTicket.current}.`,
    `- Returning customers: ${returningCustomers}.`,
    `- New customers: ${newCustomers}.`,
    `- Status: ${report.store.status}; inventory: ${report.store.inventory}.`,
    "",
    report.comparisonTitle,
    ...report.comparisons.map((comparison) => `- ${textFromMetric(comparison)}`),
    "",
    "Top Products",
    ...report.products.slice(0, 6).map((product) => `- ${product.name}: ${product.revenue} net sales; ${product.units} units; ${product.trend}.`),
    "",
    "Top Budtenders",
    ...report.budtenders.top.map(
      (budtender) =>
        `- ${budtender.name}: ${budtender.netSales} net sales; ${budtender.transactions.toLocaleString()} tickets; ${budtender.averageBasket} avg net ticket.`
    )
  ];
}

function buildReportAttachments(period: Period, snapshot: DutchieSyncSnapshot | null, data: DashboardData): EmailAttachment[] {
  const reportUrl = dashboardUrl(period);
  const label = period === "monthly" ? "monthly" : "weekly";
  const datePart = sanitizeFilenamePart(data.dateRange);
  const portfolioPdf = buildPdfBuffer(buildPortfolioPdfLines(period, data, reportUrl, snapshot)).toString("base64");
  const storePdfs = data.stores
    .map((store) => getStoreReport(store.id, period, snapshot))
    .filter((report): report is StoreReport => Boolean(report))
    .map((report) => ({
      filename: `EMBR-${label}-${sanitizeFilenamePart(report.store.name)}-${datePart}.pdf`,
      content: buildPdfBuffer(buildStorePdfLines(period, report)).toString("base64")
    }));

  return [
    {
      filename: `EMBR-${label}-portfolio-${datePart}.pdf`,
      content: portfolioPdf
    },
    ...storePdfs
  ];
}

export async function sendReportEmail(periodInput: string | undefined): Promise<EmailReportResult> {
  const period = getPeriod(periodInput);
  const recipients = getReportRecipients();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_EMAIL_FROM;

  if (recipients.length === 0) {
    return { ok: false, skipped: true, recipients, error: "REPORT_RECIPIENTS is empty." };
  }

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      recipients,
      error: "RESEND_API_KEY and REPORT_EMAIL_FROM are required before email can send."
    };
  }

  const snapshot = await readDutchieSyncSnapshot();
  const data = getDashboardData(period, snapshot);
  const subject = buildReportSubject(period, data);
  const reportUrl = dashboardUrl(period);
  const attachments = buildReportAttachments(period, snapshot, data);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html: buildReportEmailHtml(period, snapshot),
      attachments
    })
  });

  const providerResponse = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      recipients,
      subject,
      reportUrl,
      attachments: attachments.map((attachment) => attachment.filename),
      providerResponse,
      error: `Resend returned ${response.status}.`
    };
  }

  return {
    ok: true,
    recipients,
    subject,
    reportUrl,
    attachments: attachments.map((attachment) => attachment.filename),
    providerResponse
  };
}
