import { getDashboardData, getPeriod, type Period } from "@/lib/mock-dutchie";

export type EmailReportResult = {
  ok: boolean;
  skipped?: boolean;
  recipients: string[];
  providerResponse?: unknown;
  error?: string;
};

export function getReportRecipients() {
  return (process.env.REPORT_RECIPIENTS || "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function buildReportEmailHtml(period: Period) {
  const data = getDashboardData(period);
  const storeRows = data.stores
    .map(
      (store) => `
        <tr>
          <td>${store.name}</td>
          <td>${store.priorWeekGross}</td>
          <td>${store.priorWeekNet}</td>
          <td>${store.priorWeekTransactions}</td>
          <td>${store.averageBasket}</td>
          <td>${store.status}</td>
        </tr>
      `
    )
    .join("");

  const budtenderRows = data.budtenders.top
    .map(
      (budtender) => `
        <tr>
          <td>${budtender.name}</td>
          <td>${budtender.store}</td>
          <td>${budtender.grossSales}</td>
          <td>${budtender.netSales}</td>
          <td>${budtender.averageBasket}</td>
        </tr>
      `
    )
    .join("");
  const comparisonRows = data.comparisons
    .map(
      (comparison) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #282d28;">${comparison.label}</td>
          <td style="padding:8px;border-bottom:1px solid #282d28;">${comparison.current}</td>
          <td style="padding:8px;border-bottom:1px solid #282d28;">${comparison.previous}</td>
          <td style="padding:8px;border-bottom:1px solid #282d28;">${comparison.delta}</td>
          <td style="padding:8px;border-bottom:1px solid #282d28;">${comparison.percent}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#111311;color:#f4f1e8;padding:28px;">
      <h1 style="margin:0 0 8px;">EMBR - Intellegence</h1>
      <p style="margin:0 0 24px;color:#aeb4a8;">${data.title} · ${data.dateRange}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="color:#56d68a;text-align:left;">
            <th style="padding:8px;border-bottom:1px solid #343a34;">Metric</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Value</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Change</th>
          </tr>
        </thead>
        <tbody>
          ${data.kpis
            .map(
              (kpi) => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #282d28;">${kpi.label}</td>
                  <td style="padding:8px;border-bottom:1px solid #282d28;">${kpi.value}</td>
                  <td style="padding:8px;border-bottom:1px solid #282d28;">${kpi.change}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <h2>${data.comparisonTitle}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="color:#56d68a;text-align:left;">
            <th style="padding:8px;border-bottom:1px solid #343a34;">Metric</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Current</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Previous</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Delta</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Percent</th>
          </tr>
        </thead>
        <tbody>${comparisonRows}</tbody>
      </table>
      <h2>Store Snapshot</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="color:#56d68a;text-align:left;">
            <th style="padding:8px;border-bottom:1px solid #343a34;">Store</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Gross</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Net</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Transactions</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Avg ticket</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Status</th>
          </tr>
        </thead>
        <tbody>${storeRows}</tbody>
      </table>
      <h2>Top 3 Budtenders</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="color:#56d68a;text-align:left;">
            <th style="padding:8px;border-bottom:1px solid #343a34;">Budtender</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Store</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Gross</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Net</th>
            <th style="padding:8px;border-bottom:1px solid #343a34;">Avg ticket</th>
          </tr>
        </thead>
        <tbody>${budtenderRows}</tbody>
      </table>
    </div>
  `;
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

  const data = getDashboardData(period);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `EMBR - Intellegence ${period} report: ${data.dateRange}`,
      html: buildReportEmailHtml(period)
    })
  });

  const providerResponse = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      recipients,
      providerResponse,
      error: `Resend returned ${response.status}.`
    };
  }

  return { ok: true, recipients, providerResponse };
}
