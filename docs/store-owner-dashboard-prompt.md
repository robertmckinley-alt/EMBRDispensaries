# Store Owner Dashboard Prompt

Build EMBR as a store-owner command center, not a generic analytics page.

The first screen must answer four questions before anything else: what period is selected, what period it is compared against, which stores are included, and whether every revenue/ticket figure is on a net basis. Net sales must come from Dutchie closing-report `netSales`; transactions must come from `transactionCount`; average net ticket must come from `averageCartNetSales` or `netSales / transactionCount`. Gross sales can appear only as context inside drilldowns and must be clearly labeled gross.

Every metric should be clickable and explain its source, current value, prior value, movement, and owner interpretation. A store owner should never have to guess whether a number is weekly, monthly, trailing, current, prior, gross, or net.

Use page-level tabs for store details. Tabs should change the URL and render one focused view at a time:

- Owner view: KPI readout, trend, comparison, and the top three things to investigate today.
- Market: address, competitive notes, demand signals, and local event timing.
- Products: top products, brand mix, margin or discount opportunities, and SKU-level winners/drains.
- Inventory: reorder queue, low-stock winners, expiring or dead-stock exposure, and days-of-supply actions.
- Transactions: daypart patterns, budtenders, discounting, and average net ticket signals.
- Customers: retention, customer segments, campaign timing, and loyalty ideas.
- Actions: prioritized playbook with owner, impact, timing, and expected dollar effect.

Tables must fit inside the page. Use short column names, fixed table layout, wrapped text, compact rows, and horizontal scrolling only when the table truly needs it. Long product names, reasons, and campaign notes should wrap instead of clipping.

Favor useful visual inputs over decorative cards: meters for movement, sparklines for trend, ranked action cards, margin/opportunity maps, and compact comparison bars. The visual language should help a busy operator decide what to do next.

Borrow the strategy-deck style from the EMBR strategy reference for the thinking: margin math, category mix shifts, pricing actions, campaign calendars, and clear priority labels. Keep the application itself practical and dense enough for repeated weekly use.
