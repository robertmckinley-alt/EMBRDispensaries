import { NextResponse } from "next/server";
import { getDutchieStoreConfigs } from "@/lib/dutchie";
import { refreshDutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function syncDutchie(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured. Add it to .env.local before enabling sync." },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const stores = getDutchieStoreConfigs();

  if (stores.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "No Dutchie stores configured. Set DUTCHIE_STORES in .env.local.",
        results: []
      },
      { status: 400 }
    );
  }

  const snapshot = await refreshDutchieSyncSnapshot(stores);

  return NextResponse.json(snapshot);
}

export async function GET(request: Request) {
  return syncDutchie(request);
}

export async function POST(request: Request) {
  return syncDutchie(request);
}
