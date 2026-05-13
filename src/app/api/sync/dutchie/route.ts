import { NextResponse } from "next/server";
import { getDutchieStoreConfigs } from "@/lib/dutchie";
import {
  hasDurableDutchieSnapshotStorage,
  refreshDutchieSyncSnapshot,
  type DutchieSyncSnapshot
} from "@/lib/dutchie-sync-snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function sameOriginManualRequest(request: Request) {
  if (request.method !== "POST" || request.headers.get("x-manual-sync") !== "dashboard") {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "same-origin" || fetchSite === "same-site") {
    return true;
  }

  const requestHost = new URL(request.url).host;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    if (origin && new URL(origin).host === requestHost) {
      return true;
    }

    if (referer && new URL(referer).host === requestHost) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function getSyncAccess(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const cronAuthorized = Boolean(secret && authorization === `Bearer ${secret}`);

  if (cronAuthorized) {
    return { ok: true, mode: "cron" as const };
  }

  if (sameOriginManualRequest(request)) {
    return { ok: true, mode: "manual" as const };
  }

  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "CRON_SECRET is not configured. Add it to Vercel environment variables before enabling scheduled cron sync." },
        { status: 500 }
      )
    };
  }

  return { ok: false, response: unauthorized() };
}

function summarizeSnapshot(snapshot: DutchieSyncSnapshot) {
  const connectedStores = snapshot.results.filter((result) => result.verified && result.analytics).length;
  const storeErrors = snapshot.results
    .filter((result) => result.errors.length > 0)
    .map((result) => ({
      storeName: result.storeName,
      errors: result.errors
    }));

  return {
    ok: snapshot.ok,
    syncedAt: snapshot.syncedAt,
    window: snapshot.window,
    stores: {
      connected: connectedStores,
      total: snapshot.results.length
    },
    errors: storeErrors
  };
}

async function syncDutchie(request: Request) {
  const access = getSyncAccess(request);

  if (!access.ok) {
    return access.response;
  }

  if (!hasDurableDutchieSnapshotStorage()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Manual sync cannot update the live dashboard until DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL is configured in Vercel."
      },
      { status: 500 }
    );
  }

  const stores = getDutchieStoreConfigs();

  if (stores.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "No Dutchie stores configured. Set DUTCHIE_STORES in .env.local or Vercel environment variables.",
        results: []
      },
      { status: 400 }
    );
  }

  const snapshot = await refreshDutchieSyncSnapshot(stores);

  return NextResponse.json(access.mode === "manual" ? summarizeSnapshot(snapshot) : snapshot);
}

export async function GET(request: Request) {
  return syncDutchie(request);
}

export async function POST(request: Request) {
  return syncDutchie(request);
}
