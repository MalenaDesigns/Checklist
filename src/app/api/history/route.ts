import { NextResponse } from "next/server";

import { listDailyHistorySummary } from "@/features/checklist/server/checklistStore";

export async function GET() {
  return NextResponse.json({ history: listDailyHistorySummary() });
}
