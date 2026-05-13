# Executive Intelligence Reporting Platform Architecture

## Product Contract

This app is now structured as an executive intelligence platform, not a single dashboard prototype. The live Dutchie sync remains the first production data connector, while the reporting layer is designed to accept additional POS, ecommerce, ERP, marketing, labor, and finance sources.

Primary outputs:

- Weekly Executive Intelligence Snapshot
- Monthly Executive Performance Report
- Location and Market Intelligence Reports
- CFO Financial Snapshot
- SKU Performance Intelligence Report
- Board-ready PDF export and scheduled email delivery
- Executive JSON API for AI narrative generation and downstream exports

## Runtime Architecture

- `src/lib/dutchie.ts`: connector and live data normalization.
- `src/lib/mock-dutchie.ts`: reporting view model and fallback data.
- `src/lib/executive-intelligence.ts`: executive KPI, insight, chart, and report-module contract.
- `src/app/page.tsx`: portfolio executive command center.
- `src/app/stores/[storeId]/page.tsx`: location-specific intelligence reports.
- `src/app/api/executive/[period]/route.ts`: API-driven executive intelligence payload and GPT prompt.
- `src/lib/reports.ts`: scheduled email, HTML report body, and PDF attachment generation.

## Data Model Roadmap

Production PostgreSQL tables should map to these domains:

- `tenants`: business account, branding, timezone, report recipients.
- `locations`: store metadata, market, region, state, status.
- `report_periods`: weekly Monday-Sunday windows and completed calendar months.
- `financial_snapshots`: net revenue, gross revenue, discounts, taxes, payments, returns, voids.
- `transactions`: order count, items, tender, channel, employee, customer references.
- `product_sales`: product ID, SKU, brand, category, units, net sales, gross sales, margin fields.
- `inventory_positions`: on hand, cost, retail value, package ID, expiry, days of supply.
- `labor_metrics`: hours, labor cost, sales per employee, labor efficiency.
- `marketing_metrics`: CAC, ROAS, spend, channel, campaign, conversion.
- `ai_insights`: generated commentary, risk flags, recommendations, model metadata, prompt version.
- `report_exports`: PDF/deck paths, cadence, recipients, delivery status.

## AI Layer

AI commentary must be audit-safe:

- Use only supplied metrics.
- Mark missing CFO/customer/marketing data as `Not connected`.
- Do not invent EBITDA, CAC, ROAS, operating costs, retention, or LTV.
- Store prompt version, source metric IDs, model name, output, and generation timestamp.

Current prompt contract lives in `buildExecutiveInsightPrompt`.

Future OpenAI pipeline:

1. Build `ExecutiveIntelligence` from normalized report data.
2. Pass prompt and structured metrics to OpenAI.
3. Validate output against a JSON schema.
4. Store generated insight rows.
5. Render summaries in dashboard, PDFs, emails, and future slide decks.

GPT image generation prompt scaffolding is exposed through the executive API as `visualPrompt`. It is intended for branded report hero graphics, board-summary visual cards, and presentation backgrounds without embedding invented KPI values in generated imagery.

## Export Roadmap

Current:

- Browser print export.
- Scheduled weekly/monthly email.
- Text-based PDF attachments.

Next production upgrade:

- HTML-to-PDF rendering using a server-side browser worker.
- Branded cover pages.
- High-resolution chart capture.
- Appendix data tables.
- PowerPoint-ready export with one slide per report section.

## Auth And Multi-Tenant Roadmap

The Next.js app should add:

- Tenant-aware auth provider.
- Server-side authorization checks in pages and route handlers.
- Role model: Owner, CFO, Operator, Store Manager, Analyst.
- Tenant-scoped data connector credentials.
- Audit log for report generation, email delivery, and AI insight generation.

Proxy/middleware should never be the sole auth guard; authorization must be rechecked in Server Components and Route Handlers.
