import { NextResponse } from "next/server";
import { getDutchieStoreConfigs, syncDutchieStore } from "@/lib/dutchie";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getSyncWindow() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 32);

  return { from, to };
}

export async function POST(request: Request) {
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

  const window = getSyncWindow();
  const results = await Promise.all(stores.map((store) => syncDutchieStore(store, window)));

  return NextResponse.json({
    ok: results.every((result) => result.verified && result.errors.length === 0),
    window: {
      from: window.from.toISOString(),
      to: window.to.toISOString()
    },
    results
  });
}
