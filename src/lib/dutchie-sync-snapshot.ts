import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import {
  getDutchieStoreConfigs,
  syncDutchieStore,
  type DutchieStoreConfig,
  type DutchieSyncResult,
  type DutchieSyncWindow
} from "@/lib/dutchie";

export type DutchieSyncSnapshot = {
  ok: boolean;
  syncedAt: string;
  window: {
    from: string;
    to: string;
  };
  results: DutchieSyncResult[];
};

const snapshotPath = path.join(process.cwd(), "data", "dutchie-sync-snapshot.json");
const snapshotId = "latest";

let sqlClient: ReturnType<typeof postgres> | null = null;
let snapshotTableReady = false;
let memorySnapshot: DutchieSyncSnapshot | null = null;

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function getDatabaseUrl() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL)?.trim();
  return url && url.length > 0 ? url : null;
}

export function hasDurableDutchieSnapshotStorage() {
  return !isVercelRuntime() || Boolean(getDatabaseUrl());
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = postgres(databaseUrl, {
      connect_timeout: 10,
      idle_timeout: 20,
      max: 1,
      prepare: false
    });
  }

  return sqlClient;
}

async function ensureSnapshotTable(sql: NonNullable<ReturnType<typeof getSqlClient>>) {
  if (snapshotTableReady) {
    return;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS dutchie_sync_snapshots (
      id text PRIMARY KEY,
      snapshot jsonb NOT NULL,
      synced_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  snapshotTableReady = true;
}

async function saveSnapshotFile(snapshot: DutchieSyncSnapshot) {
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

async function readSnapshotFile() {
  try {
    const raw = await readFile(snapshotPath, "utf8");
    return JSON.parse(raw) as DutchieSyncSnapshot;
  } catch {
    return null;
  }
}

async function saveSnapshotToDatabase(snapshot: DutchieSyncSnapshot) {
  const sql = getSqlClient();

  if (!sql) {
    return false;
  }

  await ensureSnapshotTable(sql);
  await sql`
    INSERT INTO dutchie_sync_snapshots (id, snapshot, synced_at)
    VALUES (${snapshotId}, ${sql.json(snapshot)}, ${snapshot.syncedAt}::timestamptz)
    ON CONFLICT (id) DO UPDATE
      SET snapshot = EXCLUDED.snapshot,
          synced_at = EXCLUDED.synced_at
  `;

  return true;
}

async function readSnapshotFromDatabase() {
  const sql = getSqlClient();

  if (!sql) {
    return null;
  }

  try {
    await ensureSnapshotTable(sql);
    const rows = await sql`
      SELECT snapshot
      FROM dutchie_sync_snapshots
      WHERE id = ${snapshotId}
      LIMIT 1
    `;
    const snapshot = (rows[0] as { snapshot?: unknown } | undefined)?.snapshot;

    if (!snapshot) {
      return null;
    }

    return typeof snapshot === "string" ? (JSON.parse(snapshot) as DutchieSyncSnapshot) : (snapshot as DutchieSyncSnapshot);
  } catch (error) {
    console.error("Dutchie snapshot database read failed.", error);
    return null;
  }
}

export function getDutchieSyncWindow(now = new Date()): DutchieSyncWindow {
  const to = now;
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 32);

  return { from, to };
}

function getDutchieSyncConcurrency(stores: DutchieStoreConfig[]) {
  const configured = Number(process.env.DUTCHIE_SYNC_CONCURRENCY);
  const concurrency = Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 2;
  return Math.max(1, Math.min(concurrency, stores.length));
}

export async function buildDutchieSyncSnapshot(
  stores: DutchieStoreConfig[] = getDutchieStoreConfigs(),
  window: DutchieSyncWindow = getDutchieSyncWindow()
): Promise<DutchieSyncSnapshot> {
  const results = new Array<DutchieSyncResult>(stores.length);
  const concurrency = getDutchieSyncConcurrency(stores);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < stores.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await syncDutchieStore(stores[index], window);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return {
    ok: results.every((result) => result.verified && result.errors.length === 0),
    syncedAt: new Date().toISOString(),
    window: {
      from: window.from.toISOString(),
      to: window.to.toISOString()
    },
    results
  };
}

export async function refreshDutchieSyncSnapshot(stores: DutchieStoreConfig[] = getDutchieStoreConfigs()) {
  const snapshot = await buildDutchieSyncSnapshot(stores);
  await saveDutchieSyncSnapshot(snapshot);
  return snapshot;
}

export async function saveDutchieSyncSnapshot(snapshot: DutchieSyncSnapshot) {
  memorySnapshot = snapshot;

  const databaseConfigured = Boolean(getDatabaseUrl());

  if (databaseConfigured) {
    await saveSnapshotToDatabase(snapshot);
  }

  if (!isVercelRuntime()) {
    await saveSnapshotFile(snapshot);
  }

  if (isVercelRuntime() && !databaseConfigured) {
    console.warn("DATABASE_URL is not configured. Dutchie snapshot is not durable in Vercel production.");
  }
}

export async function readDutchieSyncSnapshot() {
  const primarySnapshot = isVercelRuntime() ? await readSnapshotFromDatabase() : await readSnapshotFile();

  if (primarySnapshot) {
    memorySnapshot = primarySnapshot;
    return primarySnapshot;
  }

  const secondarySnapshot = isVercelRuntime() ? null : await readSnapshotFromDatabase();

  if (secondarySnapshot) {
    memorySnapshot = secondarySnapshot;
    return secondarySnapshot;
  }

  return memorySnapshot;
}
