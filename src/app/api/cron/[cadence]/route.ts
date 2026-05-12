import { NextResponse } from "next/server";
import { sendReportEmail } from "@/lib/reports";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    cadence: string;
  }>;
};

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  return Boolean((secret && authorization === `Bearer ${secret}`) || isVercelCron);
}

export async function GET(request: Request, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cadence } = await context.params;
  const period = cadence === "monthly-report" ? "monthly" : "weekly";
  const result = await sendReportEmail(period);

  return NextResponse.json({ cadence, period, ...result }, { status: result.ok || result.skipped ? 200 : 502 });
}
