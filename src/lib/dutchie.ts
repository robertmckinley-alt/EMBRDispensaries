export type DutchieStoreConfig = {
  id: string;
  name: string;
  apiKeyEnv: string;
};

export type DutchieSyncWindow = {
  from: Date;
  to: Date;
};

export type DutchieSyncResult = {
  storeId: string;
  storeName: string;
  verified: boolean;
  productsFetched: number | null;
  inventoryFetched: number | null;
  registerTransactionsFetched: number | null;
  errors: string[];
};

const DEFAULT_BASE_URL = "https://api.pos.dutchie.com";

function getBaseUrl() {
  return (process.env.DUTCHIE_API_BASE || DEFAULT_BASE_URL).replace(/\/$/, "");
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
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = ["data", "items", "results", "products", "inventory", "transactions"];

    for (const key of candidates) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.length;
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

export function getDutchieStoreConfigs() {
  return parseDutchieStores();
}

export function createDutchieClient(apiKey: string) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
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
    products: (window: DutchieSyncWindow) => request<unknown>(appendWindowParams("/products", window)),
    inventoryReport: (window: DutchieSyncWindow) =>
      request<unknown>(appendWindowParams("/reporting/inventory", window)),
    registerTransactions: (window: DutchieSyncWindow) =>
      request<unknown>(appendWindowParams("/reporting/register-transactions", window))
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
    result.errors.push(error instanceof Error ? error.message : "Failed /whoami request");
    return result;
  }

  const pulls = [
    ["productsFetched", () => client.products(window)],
    ["inventoryFetched", () => client.inventoryReport(window)],
    ["registerTransactionsFetched", () => client.registerTransactions(window)]
  ] as const;

  for (const [field, pull] of pulls) {
    try {
      result[field] = countPayloadItems(await pull());
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Failed ${field}`);
    }
  }

  return result;
}
