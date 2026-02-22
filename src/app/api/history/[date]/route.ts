import { NextResponse } from "next/server";

import { getDailyNote, listItemsByDate, upsertDailyNote } from "@/lib/checklist-store";

type RouteContext = {
  params: Promise<{ date: string }>;
};

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateKey(date: string) {
  return DATE_KEY_REGEX.test(date);
}

export async function GET(_request: Request, context: RouteContext) {
  const { date } = await context.params;

  if (!isValidDateKey(date)) {
    return NextResponse.json({ message: "Invalid date format." }, { status: 400 });
  }

  const items = listItemsByDate(date);
  const note = getDailyNote(date);

  return NextResponse.json({
    date,
    items,
    note,
    total: items.length,
    completed: items.filter((item) => item.done).length,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { date } = await context.params;

  if (!isValidDateKey(date)) {
    return NextResponse.json({ message: "Invalid date format." }, { status: 400 });
  }

  const body = (await request.json()) as { note?: string };
  const note = body.note?.trim() ?? "";

  upsertDailyNote(date, note);
  return NextResponse.json({ date, note });
}
