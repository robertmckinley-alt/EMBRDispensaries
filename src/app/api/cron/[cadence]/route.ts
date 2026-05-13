import { NextResponse } from "next/server";
import { getDutchieStoreConfigs } from "@/lib/dutchie";
import { refreshDutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";
import { sendReportEmail } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{
    cadence: string;
  }>;
};

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export async function GET(request: Request, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cadence } = await context.params;
  const period = cadence === "monthly-report" ? "monthly" : "weekly";
  const stores = getDutchieStoreConfigs();
  const sync =
    stores.length > 0
      ? await refreshDutchieSyncSnapshot(stores)
      : {
          ok: false,
          skipped: true,
          error: "No Dutchie stores configured. Email will use fallback data."
        };
  const result = await sendReportEmail(period);

  return NextResponse.json({ cadence, period, sync, ...result }, { status: result.ok || result.skipped ? 200 : 502 });
}
