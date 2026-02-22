import { NextResponse } from "next/server";

import { createItem, listItems } from "@/features/checklist/server/checklistStore";

export async function GET() {
  return NextResponse.json({ items: listItems() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { message: "Title is required." },
      { status: 400 },
    );
  }

  const item = createItem(title);
  return NextResponse.json({ item }, { status: 201 });
}
