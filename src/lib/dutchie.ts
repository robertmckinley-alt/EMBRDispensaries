export type DutchieStoreConfig = {
  id: string;
  name: string;
  apiKeyEnv: string;
};

export type DutchieSyncWindow = {
  from: Date;
  to: Date;
};

export type DutchieFinancialPeriod = {
  from: string;
  to: string;
  grossSales: number;
  discounts: number;
  netSales: number;
  taxes: number;
  totalPayments: number;
  transactionCount: number;
  customerCount: number;
  newCustomerCount: number;
  returningCustomerCount: number;
  itemCount: number;
  averageNetTicket: number;
  returnTotal: number;
  voidTotal: number;
};

export type DutchieDailyPoint = {
  date: string;
  label: string;
  netSales: number;
  transactions: number;
};

export type DutchieBudtenderSummary = {
  name: string;
  transactions: number;
  grossSales: number;
  netSales: number;
  discounts: number;
  units: number;
};

export type DutchieProductSummary = {
  productId: number;
  name: string;
  category: string;
  sku?: string;
  brand?: string;
  vendor?: string;
  price?: number;
  unitCost?: number;
  units: number;
  netSales: number;
};

export type DutchieInventorySummary = {
  inventoryId: number;
  productId: number;
  sku: string;
  productName: string;
  brand: string;
  vendor: string;
  category: string;
  onHand: number;
  unitCost: number;
  unitPrice: number;
  costValue: number;
  retailValue: number;
  estimatedGrossProfit: number;
  estimatedRoi: number;
  expirationDate: string | null;
  daysToExpire: number | null;
  packageId: string;
  packageCount: number;
};

export type DutchieStoreAnalytics = {
  weekly: {
    current: DutchieFinancialPeriod;
    previous: DutchieFinancialPeriod;
  };
  monthly: {
    current: DutchieFinancialPeriod;
    previous: DutchieFinancialPeriod;
  };
  dailyNetSales: DutchieDailyPoint[];
  weeklyBudtenders: DutchieBudtenderSummary[];
  monthlyBudtenders: DutchieBudtenderSummary[];
  weeklyProducts: DutchieProductSummary[];
  monthlyProducts: DutchieProductSummary[];
  inventory: DutchieInventorySummary[];
};

export type DutchieSyncResult = {
  storeId: string;
  storeName: string;
  verified: boolean;
  productsFetched: number | null;
  inventoryFetched: number | null;
  registerTransactionsFetched: number | null;
  analytics: DutchieStoreAnalytics | null;
  errors: string[];
};

type DutchieClosingReport = {
  grossSales?: number | null;
  discount?: number | null;
  loyalty?: number | null;
  coupons?: number | null;
  totalTax?: number | null;
  transactionCount?: number | null;
  customerCount?: number | null;
  newCustomerCount?: number | null;
  returningCustomerCount?: number | null;
  returnCustomerCount?: number | null;
  repeatCustomerCount?: number | null;
  existingCustomerCount?: number | null;
  itemCount?: number | null;
  voidTotal?: number | null;
  returnTotal?: number | null;
  totalPayments?: number | null;
  itemTotal?: number | null;
  netSales?: number | null;
  averageCartNetSales?: number | null;
};

type DutchieTransactionItem = {
  productId?: number | null;
  vendor?: string | null;
  sku?: string | null;
  quantity?: number | null;
  totalPrice?: number | null;
  unitPrice?: number | null;
  totalDiscount?: number | null;
  productName?: string | null;
  category?: string | null;
  isCoupon?: boolean | null;
  isReturned?: boolean | null;
};

type DutchieTransaction = {
  transactionDate?: string | null;
  transactionDateLocalTime?: string | null;
  isVoid?: boolean | null;
  isReturn?: boolean | null;
  returnOnTransactionId?: number | null;
  subtotal?: number | null;
  totalDiscount?: number | null;
  totalBeforeTax?: number | null;
  totalItems?: number | null;
  transactionType?: string | null;
  completedByUser?: string | null;
  transactionBy?: string | null;
  items?: DutchieTransactionItem[] | null;
};

type DutchieCatalogProduct = {
  productId?: number | null;
  productName?: string | null;
  internalName?: string | null;
  onlineTitle?: string | null;
  sku?: string | null;
  brandName?: string | null;
  vendorName?: string | null;
  category?: string | null;
  masterCategory?: string | null;
  price?: number | null;
  unitCost?: number | null;
};

type DutchieInventoryRow = {
  inventoryId?: number | null;
  productId?: number | null;
  sku?: string | null;
  productName?: string | null;
  brandName?: string | null;
  vendor?: string | null;
  category?: string | null;
  masterCategory?: string | null;
  quantityAvailable?: number | null;
  unitCost?: number | null;
  unitPrice?: number | null;
  expirationDate?: string | null;
  packageId?: string | null;
  externalPackageId?: string | null;
};

type ProductCatalogEntry = {
  productId: number;
  name: string;
  sku?: string;
  brand?: string;
  vendor?: string;
  category?: string;
  price?: number;
  unitCost?: number;
};

const DEFAULT_BASE_URL = "https://api.pos.dutchie.com";
const REPORT_TIME_ZONE = "America/Los_Angeles";

function getBaseUrl() {
  return (process.env.DUTCHIE_API_BASE || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function getRequestTimeoutMs() {
  const configured = Number(process.env.DUTCHIE_REQUEST_TIMEOUT_MS);
  return Number.isFinite(configured) && configured >= 5_000 ? configured : 25_000;
}

function shouldSyncDetailPayloads() {
  const configured = process.env.DUTCHIE_SYNC_DETAIL_LEVEL?.trim().toLowerCase();

  if (configured) {
    return configured !== "core";
  }

  return !process.env.VERCEL;
}

function getBasicAuthHeader(apiKey: string) {
  return `Basic ${Buffer.from(`${apiKey}:`, "utf8").toString("base64")}`;
}

function parseDutchieStores(): DutchieStoreConfig[] {
  const raw = process.env.DUTCHIE_STORES;

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as DutchieStoreConfig[];

    if (!Array.isArray(parsed)) {
      throw new Error("DUTCHIE_STORES must be a JSON array.");
    }

    return parsed.filter((store) => store.id && store.name && store.apiKeyEnv);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown parse error";
    throw new Error(`Invalid DUTCHIE_STORES JSON: ${message}`);
  }
}

function countPayloadItems(payload: unknown): number | null {
  const items = payloadArray(payload);

  if (items) {
    return items.length;
  }

  return null;
}

function payloadArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = ["data", "items", "results", "products", "inventory", "transactions"];

    for (const key of candidates) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return null;
}

function appendWindowParams(path: string, window: DutchieSyncWindow) {
  const params = new URLSearchParams({
    fromLastModifiedDateUTC: window.from.toISOString(),
    toLastModifiedDateUTC: window.to.toISOString()
  });

  return `${path}?${params.toString()}`;
}

function appendReportDateParams(path: string, window: DutchieSyncWindow) {
  const params = new URLSearchParams({
    fromDateUTC: window.from.toISOString(),
    toDateUTC: window.to.toISOString()
  });

  return `${path}?${params.toString()}`;
}

function appendTransactionDateParams(path: string, window: DutchieSyncWindow) {
  const params = new URLSearchParams({
    FromDateUTC: window.from.toISOString(),
    ToDateUTC: window.to.toISOString(),
    IncludeDetail: "true",
    IncludeTaxes: "true",
    IncludeFeesAndDonations: "true"
  });

  return `${path}?${params.toString()}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMilliseconds(date: Date, milliseconds: number) {
  return new Date(date.getTime() + milliseconds);
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset"
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = timeZoneName?.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);

  if (!match?.[1]) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * (hours * 60 + minutes);
}

function zonedDateTimeToUtc(year: number, month: number, day: number, timeZone: string) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60_000);
}

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const weekdayIndex: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    weekday: weekdayIndex[part("weekday")] ?? 0
  };
}

function normalizeYearMonth(year: number, month: number) {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1
  };
}

function startOfZonedMonth(year: number, month: number, timeZone: string) {
  const normalized = normalizeYearMonth(year, month);
  return zonedDateTimeToUtc(normalized.year, normalized.month, 1, timeZone);
}

function getAnalyticsWindows(now = new Date()) {
  const localToday = getZonedDateParts(now, REPORT_TIME_ZONE);
  const localTodayStart = zonedDateTimeToUtc(localToday.year, localToday.month, localToday.day, REPORT_TIME_ZONE);
  const daysSinceMonday = (localToday.weekday + 6) % 7;
  const currentWeekStart = addDays(localTodayStart, -daysSinceMonday);
  const weekly = { from: addDays(currentWeekStart, -7), to: addMilliseconds(currentWeekStart, -1) };
  const previousWeeklyStart = addDays(currentWeekStart, -14);
  const previousWeeklyEnd = addDays(currentWeekStart, -7);
  const previousWeekly = { from: previousWeeklyStart, to: addMilliseconds(previousWeeklyEnd, -1) };
  const currentMonthStart = startOfZonedMonth(localToday.year, localToday.month, REPORT_TIME_ZONE);
  const monthlyStart = startOfZonedMonth(localToday.year, localToday.month - 1, REPORT_TIME_ZONE);
  const previousMonthlyStart = startOfZonedMonth(localToday.year, localToday.month - 2, REPORT_TIME_ZONE);
  const monthly = { from: monthlyStart, to: addMilliseconds(currentMonthStart, -1) };
  const previousMonthly = { from: previousMonthlyStart, to: addMilliseconds(monthlyStart, -1) };
  const transactionRollup = {
    from: new Date(Math.min(weekly.from.getTime(), monthly.from.getTime())),
    to: new Date(Math.max(weekly.to.getTime(), monthly.to.getTime()))
  };

  return {
    weekly,
    previousWeekly,
    monthly,
    previousMonthly,
    transactionRollup
  };
}

function numberValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function optionalNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function textValue(value: string | null | undefined) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : undefined;
}

function zonedDateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function transactionLocalDateKey(transaction: DutchieTransaction, date: Date) {
  const localDate = textValue(transaction.transactionDateLocalTime)?.slice(0, 10);

  if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return localDate;
  }

  return zonedDateKey(date, REPORT_TIME_ZONE);
}

function buildProductCatalog(payload: unknown) {
  const products = new Map<number, ProductCatalogEntry>();
  const rows = payloadArray(payload) ?? [];

  for (const row of rows) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const product = row as DutchieCatalogProduct;
    const productId = numberValue(product.productId);

    if (!productId) {
      continue;
    }

    const name =
      textValue(product.productName) ??
      textValue(product.internalName) ??
      textValue(product.onlineTitle) ??
      `Product ${productId}`;

    products.set(productId, {
      productId,
      name,
      sku: textValue(product.sku),
      brand: textValue(product.brandName),
      vendor: textValue(product.vendorName),
      category: textValue(product.category) ?? textValue(product.masterCategory),
      price: optionalNumber(product.price),
      unitCost: optionalNumber(product.unitCost)
    });
  }

  return products;
}

function daysUntil(dateText: string | null | undefined) {
  const date = dateText ? new Date(dateText) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function earliestDate(a: string | null, b: string | null) {
  if (!a) {
    return b;
  }

  if (!b) {
    return a;
  }

  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

function buildInventorySummaries(payload: unknown): DutchieInventorySummary[] {
  const inventory = new Map<string, DutchieInventorySummary>();
  const rows = payloadArray(payload) ?? [];

  for (const row of rows) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const item = row as DutchieInventoryRow;
    const productId = numberValue(item.productId);
    const onHand = numberValue(item.quantityAvailable);

    if (!productId || onHand <= 0) {
      continue;
    }

    const sku = textValue(item.sku) ?? productId.toString();
    const key = `${productId}-${sku}`;
    const unitCost = numberValue(item.unitCost);
    const unitPrice = numberValue(item.unitPrice);
    const costValue = unitCost * onHand;
    const retailValue = unitPrice * onHand;
    const packageId = textValue(item.packageId) ?? textValue(item.externalPackageId) ?? "No package";
    const existing = inventory.get(key);

    if (existing) {
      existing.onHand += onHand;
      existing.costValue += costValue;
      existing.retailValue += retailValue;
      existing.estimatedGrossProfit = existing.retailValue - existing.costValue;
      existing.estimatedRoi = existing.costValue > 0 ? (existing.estimatedGrossProfit / existing.costValue) * 100 : 0;
      existing.expirationDate = earliestDate(existing.expirationDate, textValue(item.expirationDate) ?? null);
      existing.daysToExpire = daysUntil(existing.expirationDate);
      existing.packageCount += 1;
      continue;
    }

    inventory.set(key, {
      inventoryId: Math.round(numberValue(item.inventoryId)),
      productId,
      sku,
      productName: textValue(item.productName) ?? `Product ${productId}`,
      brand: textValue(item.brandName) ?? "Unassigned brand",
      vendor: textValue(item.vendor) ?? "Unassigned vendor",
      category: textValue(item.category) ?? textValue(item.masterCategory) ?? "Uncategorized",
      onHand,
      unitCost,
      unitPrice,
      costValue,
      retailValue,
      estimatedGrossProfit: retailValue - costValue,
      estimatedRoi: costValue > 0 ? ((retailValue - costValue) / costValue) * 100 : 0,
      expirationDate: textValue(item.expirationDate) ?? null,
      daysToExpire: daysUntil(item.expirationDate),
      packageId,
      packageCount: 1
    });
  }

  return Array.from(inventory.values()).sort((a, b) => b.retailValue - a.retailValue);
}

function buildInventoryCostCatalog(inventory: DutchieInventorySummary[]) {
  const byProductId = new Map<number, { costValue: number; onHand: number }>();
  const bySku = new Map<string, { costValue: number; onHand: number }>();

  for (const item of inventory) {
    if (item.unitCost <= 0 || item.onHand <= 0) {
      continue;
    }

    const product = byProductId.get(item.productId) ?? { costValue: 0, onHand: 0 };
    product.costValue += item.costValue;
    product.onHand += item.onHand;
    byProductId.set(item.productId, product);

    const sku = bySku.get(item.sku) ?? { costValue: 0, onHand: 0 };
    sku.costValue += item.costValue;
    sku.onHand += item.onHand;
    bySku.set(item.sku, sku);
  }

  return {
    byProductId: new Map(
      Array.from(byProductId.entries()).map(([productId, value]) => [
        productId,
        value.onHand > 0 ? value.costValue / value.onHand : 0
      ])
    ),
    bySku: new Map(
      Array.from(bySku.entries()).map(([sku, value]) => [sku, value.onHand > 0 ? value.costValue / value.onHand : 0])
    )
  };
}

function summarizeClosingReport(report: DutchieClosingReport, window: DutchieSyncWindow): DutchieFinancialPeriod {
  const grossSales = numberValue(report.grossSales);
  const netSales = numberValue(report.netSales ?? report.itemTotal);
  const transactionCount = Math.max(0, Math.round(numberValue(report.transactionCount)));
  const customerCount = Math.max(0, Math.round(numberValue(report.customerCount)));
  const rawNewCustomerCount = Math.max(0, Math.round(numberValue(report.newCustomerCount)));
  const newCustomerCount = customerCount > 0 ? Math.min(rawNewCustomerCount, customerCount) : rawNewCustomerCount;
  const explicitReturningCustomerCount = optionalNumber(
    report.returningCustomerCount ?? report.returnCustomerCount ?? report.repeatCustomerCount ?? report.existingCustomerCount
  );
  const returningCustomerCount =
    explicitReturningCustomerCount !== undefined
      ? Math.max(0, Math.round(explicitReturningCustomerCount))
      : Math.max(0, customerCount - newCustomerCount);
  const averageNetTicket = numberValue(report.averageCartNetSales) || (transactionCount > 0 ? netSales / transactionCount : 0);
  const reportedDiscounts =
    numberValue(report.discount) + numberValue(report.loyalty) + numberValue(report.coupons);

  return {
    from: window.from.toISOString(),
    to: window.to.toISOString(),
    grossSales,
    discounts: reportedDiscounts || Math.max(0, grossSales - netSales),
    netSales,
    taxes: numberValue(report.totalTax),
    totalPayments: numberValue(report.totalPayments),
    transactionCount,
    customerCount,
    newCustomerCount,
    returningCustomerCount,
    itemCount: Math.max(0, Math.round(numberValue(report.itemCount))),
    averageNetTicket,
    returnTotal: numberValue(report.returnTotal),
    voidTotal: numberValue(report.voidTotal)
  };
}

function getTransactionDate(transaction: DutchieTransaction) {
  const raw = transaction.transactionDateLocalTime || transaction.transactionDate;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function isReturnTransaction(transaction: DutchieTransaction) {
  return Boolean(transaction.isReturn || transaction.returnOnTransactionId);
}

function transactionNetSales(transaction: DutchieTransaction) {
  const base = numberValue(transaction.totalBeforeTax ?? (numberValue(transaction.subtotal) - numberValue(transaction.totalDiscount)));
  return isReturnTransaction(transaction) ? -Math.abs(base) : base;
}

function transactionGrossSales(transaction: DutchieTransaction) {
  const base = numberValue(transaction.subtotal);
  return isReturnTransaction(transaction) ? -Math.abs(base) : base;
}

function transactionUnits(transaction: DutchieTransaction) {
  if (Array.isArray(transaction.items) && transaction.items.length > 0) {
    return transaction.items
      .filter((item) => !item.isCoupon && !item.isReturned)
      .reduce((total, item) => total + numberValue(item.quantity), 0);
  }

  return numberValue(transaction.totalItems);
}

function transactionEmployee(transaction: DutchieTransaction) {
  return transaction.completedByUser || transaction.transactionBy || "Unassigned";
}

function isInWindow(date: Date, window: DutchieSyncWindow) {
  return date >= window.from && date <= window.to;
}

function buildTransactionRollups(
  transactions: DutchieTransaction[],
  weeklyWindow: DutchieSyncWindow,
  monthlyWindow: DutchieSyncWindow,
  productCatalog: Map<number, ProductCatalogEntry>,
  inventoryCostCatalog: ReturnType<typeof buildInventoryCostCatalog>
) {
  const daily = new Map<string, DutchieDailyPoint>();
  const weeklyBudtenders = new Map<string, DutchieBudtenderSummary>();
  const monthlyBudtenders = new Map<string, DutchieBudtenderSummary>();
  const weeklyProducts = new Map<number, DutchieProductSummary>();
  const monthlyProducts = new Map<number, DutchieProductSummary>();

  for (const transaction of transactions) {
    if (transaction.isVoid) {
      continue;
    }

    const date = getTransactionDate(transaction);
    if (!date) {
      continue;
    }

    const netSales = transactionNetSales(transaction);
    const grossSales = transactionGrossSales(transaction);
    const discounts = numberValue(transaction.totalDiscount);
    const units = transactionUnits(transaction);
    const isReturn = isReturnTransaction(transaction);
    const ticketCount = isReturn ? 0 : 1;
    const inWeeklyWindow = isInWindow(date, weeklyWindow);
    const inMonthlyWindow = isInWindow(date, monthlyWindow);
    const dailyKey = transactionLocalDateKey(transaction, date);
    const label = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: REPORT_TIME_ZONE }).format(
      new Date(`${dailyKey}T12:00:00.000Z`)
    );
    const point = daily.get(dailyKey) ?? { date: dailyKey, label, netSales: 0, transactions: 0 };
    point.netSales += netSales;
    point.transactions += ticketCount;
    daily.set(dailyKey, point);

    if (inMonthlyWindow) {
      const monthlyName = transactionEmployee(transaction);
      const monthlyBudtender = monthlyBudtenders.get(monthlyName) ?? {
        name: monthlyName,
        transactions: 0,
        grossSales: 0,
        netSales: 0,
        discounts: 0,
        units: 0
      };
      monthlyBudtender.transactions += ticketCount;
      monthlyBudtender.grossSales += grossSales;
      monthlyBudtender.netSales += netSales;
      monthlyBudtender.discounts += discounts;
      monthlyBudtender.units += units;
      monthlyBudtenders.set(monthlyName, monthlyBudtender);
    }

    for (const item of transaction.items ?? []) {
      if (item.isCoupon || item.isReturned || !item.productId) {
        continue;
      }

      const itemUnits = numberValue(item.quantity);
      const itemGross = numberValue(item.unitPrice) * itemUnits || numberValue(item.totalPrice);
      const itemNet = isReturn ? -Math.abs(itemGross - numberValue(item.totalDiscount)) : itemGross - numberValue(item.totalDiscount);
      const catalogProduct = productCatalog.get(item.productId);
      const name =
        catalogProduct?.name ??
        textValue(item.productName) ??
        (textValue(item.vendor) ? `${textValue(item.vendor)} product ${item.productId}` : `Product ${item.productId}`);
      const category = catalogProduct?.category ?? textValue(item.category) ?? "Uncategorized";
      const sku = catalogProduct?.sku ?? textValue(item.sku);
      const brand = catalogProduct?.brand;
      const vendor = catalogProduct?.vendor ?? textValue(item.vendor);
      const unitCost =
        inventoryCostCatalog.byProductId.get(item.productId) ??
        (sku ? inventoryCostCatalog.bySku.get(sku) : undefined) ??
        catalogProduct?.unitCost;
      if (inMonthlyWindow) {
        const monthlyProduct = monthlyProducts.get(item.productId) ?? {
          productId: item.productId,
          name,
          category,
          sku,
          brand,
          vendor,
          price: catalogProduct?.price,
          unitCost,
          units: 0,
          netSales: 0
        };
        monthlyProduct.units += itemUnits;
        monthlyProduct.netSales += itemNet;
        monthlyProducts.set(item.productId, monthlyProduct);
      }

      if (inWeeklyWindow) {
        const weeklyProduct = weeklyProducts.get(item.productId) ?? {
          productId: item.productId,
          name,
          category,
          sku,
          brand,
          vendor,
          price: catalogProduct?.price,
          unitCost,
          units: 0,
          netSales: 0
        };
        weeklyProduct.units += itemUnits;
        weeklyProduct.netSales += itemNet;
        weeklyProducts.set(item.productId, weeklyProduct);
      }
    }

    if (inWeeklyWindow) {
      const name = transactionEmployee(transaction);
      const budtender = weeklyBudtenders.get(name) ?? {
        name,
        transactions: 0,
        grossSales: 0,
        netSales: 0,
        discounts: 0,
        units: 0
      };
      budtender.transactions += ticketCount;
      budtender.grossSales += grossSales;
      budtender.netSales += netSales;
      budtender.discounts += discounts;
      budtender.units += units;
      weeklyBudtenders.set(name, budtender);
    }
  }

  return {
    dailyNetSales: Array.from(daily.values()).sort((a, b) => a.date.localeCompare(b.date)),
    weeklyBudtenders: Array.from(weeklyBudtenders.values()).sort((a, b) => b.netSales - a.netSales),
    monthlyBudtenders: Array.from(monthlyBudtenders.values()).sort((a, b) => b.netSales - a.netSales),
    weeklyProducts: Array.from(weeklyProducts.values()).sort((a, b) => b.netSales - a.netSales),
    monthlyProducts: Array.from(monthlyProducts.values()).sort((a, b) => b.netSales - a.netSales)
  };
}

export function getDutchieStoreConfigs() {
  return parseDutchieStores();
}

export function createDutchieClient(apiKey: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(getRequestTimeoutMs()),
      headers: {
        Authorization: getBasicAuthHeader(apiKey),
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Dutchie ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
    }

    return (await response.json()) as T;
  }

  return {
    whoami: () => request<unknown>("/whoami"),
    allProducts: () => request<unknown>("/products"),
    products: (window: DutchieSyncWindow) => request<unknown>(appendWindowParams("/products", window)),
    inventoryReport: (window: DutchieSyncWindow) =>
      request<unknown>(appendWindowParams("/reporting/inventory", window)),
    registerTransactions: (window: DutchieSyncWindow) =>
      request<unknown>(appendWindowParams("/reporting/register-transactions", window)),
    closingReport: (window: DutchieSyncWindow) =>
      request<DutchieClosingReport>(appendReportDateParams("/reporting/closing-report", window)),
    transactions: (window: DutchieSyncWindow) =>
      request<DutchieTransaction[]>(appendTransactionDateParams("/reporting/transactions", window))
  };
}

function dutchieErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Dutchie request failure";
}

async function requiredDutchiePull<T>(label: string, pull: () => Promise<T>) {
  try {
    return await pull();
  } catch (error) {
    throw new Error(`${label}: ${dutchieErrorMessage(error)}`);
  }
}

async function optionalDutchiePull<T>(label: string, pull: () => Promise<T>, fallback: T, errors: string[]) {
  try {
    return await pull();
  } catch (error) {
    errors.push(`${label}: ${dutchieErrorMessage(error)}`);
    return fallback;
  }
}

async function getDutchieStoreAnalytics(
  client: ReturnType<typeof createDutchieClient>,
  errors: string[],
  includeDetailPayloads: boolean
) {
  const windows = getAnalyticsWindows();
  const weeklyCurrent = await requiredDutchiePull("weekly closing report", () => client.closingReport(windows.weekly));
  const weeklyPrevious = await requiredDutchiePull("prior weekly closing report", () =>
    client.closingReport(windows.previousWeekly)
  );
  const monthlyCurrent = await requiredDutchiePull("monthly closing report", () => client.closingReport(windows.monthly));
  const monthlyPrevious = await requiredDutchiePull("prior monthly closing report", () =>
    client.closingReport(windows.previousMonthly)
  );
  const transactions = includeDetailPayloads
    ? await optionalDutchiePull(
        "transaction detail rollup",
        () => client.transactions(windows.transactionRollup),
        [] as DutchieTransaction[],
        errors
      )
    : [];
  const products = includeDetailPayloads
    ? await optionalDutchiePull("product catalog", () => client.allProducts(), [] as unknown[], errors)
    : [];
  const inventory = includeDetailPayloads
    ? await optionalDutchiePull("inventory analytics", () => client.inventoryReport(windows.transactionRollup), [] as unknown[], errors)
    : [];
  const inventorySummaries = buildInventorySummaries(inventory);
  const rollups = buildTransactionRollups(
    Array.isArray(transactions) ? transactions : [],
    windows.weekly,
    windows.monthly,
    buildProductCatalog(products),
    buildInventoryCostCatalog(inventorySummaries)
  );

  return {
    weekly: {
      current: summarizeClosingReport(weeklyCurrent, windows.weekly),
      previous: summarizeClosingReport(weeklyPrevious, windows.previousWeekly)
    },
    monthly: {
      current: summarizeClosingReport(monthlyCurrent, windows.monthly),
      previous: summarizeClosingReport(monthlyPrevious, windows.previousMonthly)
    },
    ...rollups,
    inventory: inventorySummaries
  };
}

export async function syncDutchieStore(
  store: DutchieStoreConfig,
  window: DutchieSyncWindow
): Promise<DutchieSyncResult> {
  const apiKey = process.env[store.apiKeyEnv];
  const result: DutchieSyncResult = {
    storeId: store.id,
    storeName: store.name,
    verified: false,
    productsFetched: null,
    inventoryFetched: null,
    registerTransactionsFetched: null,
    analytics: null,
    errors: []
  };

  if (!apiKey) {
    result.errors.push(`Missing env var ${store.apiKeyEnv}`);
    return result;
  }

  const client = createDutchieClient(apiKey);

  try {
    await client.whoami();
    result.verified = true;
  } catch (error) {
    result.errors.push(`whoami: ${dutchieErrorMessage(error)}`);
    return result;
  }

  const pulls = [
    ["productsFetched", () => client.products(window)],
    ["inventoryFetched", () => client.inventoryReport(window)],
    ["registerTransactionsFetched", () => client.registerTransactions(window)]
  ] as const;

  if (shouldSyncDetailPayloads()) {
    for (const [field, pull] of pulls) {
      try {
        result[field] = countPayloadItems(await pull());
      } catch (error) {
        result.errors.push(`${field}: ${dutchieErrorMessage(error)}`);
      }
    }
  }

  try {
    result.analytics = await getDutchieStoreAnalytics(client, result.errors, shouldSyncDetailPayloads());
  } catch (error) {
    result.errors.push(`financial analytics: ${dutchieErrorMessage(error)}`);
  }

  return result;
}
