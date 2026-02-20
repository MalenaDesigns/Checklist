import { NextResponse } from "next/server";

import { deleteItem, updateItem } from "@/lib/checklist-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { title?: string; done?: boolean };
  const nextTitle = body.title?.trim();

  if (body.title !== undefined && !nextTitle) {
    return NextResponse.json(
      { message: "Title must not be empty." },
      { status: 400 },
    );
  }

  const item = updateItem(id, {
    ...(nextTitle !== undefined ? { title: nextTitle } : {}),
    ...(typeof body.done === "boolean" ? { done: body.done } : {}),
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const removed = deleteItem(id);

  if (!removed) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
