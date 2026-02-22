import { NextResponse } from "next/server";

import { listDailyHistorySummary } from "@/lib/checklist-store";

export async function GET() {
  return NextResponse.json({ history: listDailyHistorySummary() });
}
