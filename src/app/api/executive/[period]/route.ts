import { NextResponse } from "next/server";
import { readDutchieSyncSnapshot } from "@/lib/dutchie-sync-snapshot";
import {
  buildExecutiveInsightPrompt,
  buildExecutiveIntelligence,
  buildExecutiveVisualPrompt
} from "@/lib/executive-intelligence";
import { getDashboardData, getPeriod } from "@/lib/mock-dutchie";

type ExecutiveRouteProps = {
  params: Promise<{
    period: string;
  }>;
};

export async function GET(_request: Request, { params }: ExecutiveRouteProps) {
  const { period: rawPeriod } = await params;
  const period = getPeriod(rawPeriod);
  const snapshot = await readDutchieSyncSnapshot();
  const dashboard = getDashboardData(period, snapshot);
  const intelligence = buildExecutiveIntelligence(dashboard, period, snapshot);

  return NextResponse.json({
    period,
    generatedAt: new Date().toISOString(),
    dashboard: {
      title: dashboard.title,
      dateRange: dashboard.dateRange,
      periodContext: dashboard.periodContext
    },
    intelligence,
    insights: intelligence.aiInsights,
    reportModules: intelligence.reportModules,
    aiPrompt: buildExecutiveInsightPrompt(intelligence),
    visualPrompt: buildExecutiveVisualPrompt(intelligence)
  });
}
