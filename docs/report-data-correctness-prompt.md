# EMBR Reporting Data Correctness Prompt

Fix the EMBR dashboard as a data-correct operating report. Do not invent analytics. If Dutchie does not provide a field, show "not available" and explain the missing source.

Weekly reporting must be completed retail weeks only:

- Current weekly report period is the last completed Monday 12:00 AM through Sunday 11:59:59 PM in `America/Los_Angeles`.
- Prior-week comparison is the Monday-Sunday week immediately before that.
- Never use "last 7 days", "trailing 7 days", partial current week, or rolling windows for weekly reports.
- The Monday scheduled email must send the week that ended the day before.

Monthly reporting must be completed calendar months only:

- On the first of the month, send the month that just ended.
- Compare it against the full calendar month before that.
- Never send MTD as the scheduled monthly report.

Revenue and ticket rules:

- Net sales = Dutchie closing-report `netSales`.
- Gross sales is context only and must be labeled gross.
- Transactions = Dutchie closing-report `transactionCount`.
- Average net ticket = Dutchie `averageCartNetSales`, falling back only to `netSales / transactionCount`.
- Every metric must show current period, prior period, delta, percent delta, and source field.

Inventory must be rebuilt from real inventory and product data:

- Persist raw Dutchie inventory rows needed for reporting, including SKU/package/product id, product name, brand/vendor, category, quantity on hand, unit cost, retail price, received date, expiration date, package status, and any batch/package identifiers available.
- Join inventory to completed sales transactions by product/package/SKU where possible.
- Calculate weekly units sold, net sales, gross sales, discount dollars, average selling price, estimated COGS, gross margin dollars, margin percent, ROI, sell-through rate, days of supply, aging, and expiration risk.
- If exact COGS or expiration is not available, the UI must label that column as unavailable instead of using fake values.

Inventory pages must include separate sortable sections:

- What's selling: top SKUs by weekly units, net sales, margin dollars, and ROI, high to low.
- What's not selling: lowest velocity SKUs, low to high, excluding new arrivals unless flagged.
- Expiring soon: products by expiration date ascending, with quantity on hand and dollar exposure.
- Highest ROI: ROI high to low, with margin dollars and units sold.
- Lowest ROI: ROI low to high, with discount rate and recommended action.
- Reorder candidates: high velocity plus low days of supply, sorted by urgency.
- Dead stock: high on-hand units plus low/no sales, sorted by dollar exposure.

Brand and product reporting must be useful to a store owner:

- Brand breakdown by net sales, units sold, gross margin dollars, margin percent, ROI, discount rate, and share of sales.
- Top brands high to low by net sales, units, margin dollars, and ROI.
- Bottom brands low to high by velocity, ROI, and margin contribution.
- Category mix by net sales and margin, with current period vs prior period movement.
- Product tables must support high-to-low and low-to-high rankings, not one static table.

UI requirements:

- Store tabs must be real page states, not anchors down one long page.
- Tables must fit in the viewport with fixed layout, wrapped product names, compact columns, and no clipped data.
- Data point drilldowns must use stable unique keys and never trigger duplicate React key warnings.
- The first visible section must make the reporting period unmistakable.
- Each section should answer: what changed, why it matters, what to do, and which data field supports it.

Acceptance checks:

- A Tuesday weekly view should still show the prior completed Monday-Sunday week, not Monday-Tuesday current week.
- For May 13, 2026, weekly current must be May 4-May 10, 2026 and prior must be Apr 27-May 3, 2026.
- No page may contain "trailing 7 days" or "last 7 days" as the weekly reporting basis.
- Prior-week comparison cards must never be blank when Dutchie closing-report data exists.
- Inventory/brand tables must identify unavailable source fields explicitly rather than silently substituting modeled data.
