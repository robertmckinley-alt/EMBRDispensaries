const baseUrl = (process.env.DUTCHIE_API_BASE || "https://api.pos.dutchie.com").replace(/\/$/, "");
const rawStores = process.env.DUTCHIE_STORES;

if (!rawStores) {
  console.error("DUTCHIE_STORES is missing. Copy .env.example to .env.local and configure your six stores.");
  process.exit(1);
}

let stores;

try {
  stores = JSON.parse(rawStores);
} catch (error) {
  console.error(`DUTCHIE_STORES is not valid JSON: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(stores) || stores.length === 0) {
  console.error("DUTCHIE_STORES must be a non-empty JSON array.");
  process.exit(1);
}

function authHeader(apiKey) {
  return `Basic ${Buffer.from(`${apiKey}:`, "utf8").toString("base64")}`;
}

async function verifyStore(store) {
  const apiKey = process.env[store.apiKeyEnv];

  if (!apiKey) {
    return {
      store: store.name,
      ok: false,
      message: `Missing ${store.apiKeyEnv}`
    };
  }

  const response = await fetch(`${baseUrl}/whoami`, {
    headers: {
      Accept: "application/json",
      Authorization: authHeader(apiKey)
    }
  });

  if (!response.ok) {
    return {
      store: store.name,
      ok: false,
      message: `/whoami returned ${response.status}`
    };
  }

  const data = await response.json();

  return {
    store: store.name,
    ok: true,
    message: data.locationName || data.name || "verified"
  };
}

const results = await Promise.all(stores.map(verifyStore));

for (const result of results) {
  const marker = result.ok ? "OK" : "FAIL";
  console.log(`${marker} ${result.store}: ${result.message}`);
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
