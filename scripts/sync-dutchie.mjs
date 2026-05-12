const secret = process.env.CRON_SECRET;
const baseUrl = process.env.LOCAL_DASHBOARD_URL || "http://localhost:3100";

if (!secret) {
  console.error("CRON_SECRET is missing in .env.local.");
  process.exit(1);
}

let response;

try {
  response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/sync/dutchie`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`
    }
  });
} catch (error) {
  console.error(`Could not reach the dashboard at ${baseUrl}.`);
  console.error("Start the dashboard first, then run this again.");
  console.error(error.message);
  process.exit(1);
}

const payload = await response.json().catch(() => null);

if (!response.ok || !payload) {
  console.error(`Sync failed with HTTP ${response.status}.`);
  if (payload) {
    console.error(JSON.stringify(payload, null, 2));
  }
  process.exit(1);
}

console.log(`Dutchie sync finished at ${payload.syncedAt || "unknown time"}.`);
console.log("");

for (const result of payload.results || []) {
  const status = result.verified && result.errors.length === 0 ? "OK" : "CHECK";
  const transactions = result.registerTransactionsFetched ?? "n/a";
  const products = result.productsFetched ?? "n/a";
  const inventory = result.inventoryFetched ?? "n/a";

  console.log(`${status} ${result.storeName}`);
  console.log(`  Transactions: ${transactions}`);
  console.log(`  Products: ${products}`);
  console.log(`  Inventory rows: ${inventory}`);

  if (result.errors?.length) {
    console.log(`  Errors: ${result.errors.join("; ")}`);
  }
}

console.log("");
console.log("Refresh the dashboard page to see the latest live sync panel.");
