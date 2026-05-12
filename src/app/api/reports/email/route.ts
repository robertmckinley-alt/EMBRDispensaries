import { NextResponse } from "next/server";
import { sendReportEmail } from "@/lib/reports";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { period?: string };
  const result = await sendReportEmail(body.period);

  return NextResponse.json(result, { status: result.ok || result.skipped ? 200 : 502 });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const result = await sendReportEmail(searchParams.get("period") || "weekly");

  return NextResponse.json(result, { status: result.ok || result.skipped ? 200 : 502 });
}
