import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DutchieSyncResult } from "@/lib/dutchie";

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

export async function saveDutchieSyncSnapshot(snapshot: DutchieSyncSnapshot) {
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

export async function readDutchieSyncSnapshot() {
  try {
    const raw = await readFile(snapshotPath, "utf8");
    return JSON.parse(raw) as DutchieSyncSnapshot;
  } catch {
    return null;
  }
}
