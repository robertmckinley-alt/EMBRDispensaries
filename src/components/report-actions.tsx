"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";

type SyncState = "idle" | "syncing" | "success" | "error";

function parseSyncMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    return typeof error === "string" ? error : fallback;
  }

  return fallback;
}

export function ReportActions() {
  const router = useRouter();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncMessage, setSyncMessage] = useState("");

  async function handleManualSync() {
    setSyncState("syncing");
    setSyncMessage("Pulling latest Dutchie data...");

    try {
      const response = await fetch("/api/sync/dutchie", {
        method: "POST",
        headers: {
          "X-Manual-Sync": "dashboard"
        },
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            stores?: { connected?: number; total?: number };
            results?: { verified?: boolean; errors?: string[] }[];
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(parseSyncMessage(payload, `Sync failed with HTTP ${response.status}.`));
      }

      const results = payload?.results ?? [];
      const cleanStores =
        payload?.stores?.connected ??
        results.filter((result) => result.verified && (result.errors?.length ?? 0) === 0).length;
      const totalStores = payload?.stores?.total ?? results.length;
      const storeSummary = totalStores > 0 ? `${cleanStores}/${totalStores} stores synced.` : "Sync finished.";
      setSyncState("success");
      setSyncMessage(`${storeSummary} Refreshing report...`);
      router.refresh();
    } catch (error) {
      setSyncState("error");
      setSyncMessage(error instanceof Error ? error.message : "Sync failed.");
    }
  }

  return (
    <div className="reportActions printHidden">
      <div className="syncActionWrap">
        <button
          className={`iconTextButton syncButton ${syncState === "syncing" ? "syncing" : ""}`}
          type="button"
          onClick={handleManualSync}
          disabled={syncState === "syncing"}
        >
          <RefreshCw size={17} />
          {syncState === "syncing" ? "Syncing" : "Sync data"}
        </button>
        {syncMessage ? (
          <span className={`syncStatus ${syncState}`} role={syncState === "error" ? "alert" : "status"}>
            {syncMessage}
          </span>
        ) : null}
      </div>
      <button className="iconTextButton" type="button" onClick={() => window.print()}>
        <Download size={17} />
        Export PDF
      </button>
    </div>
  );
}
