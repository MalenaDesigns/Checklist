import { ChecklistItem } from "@/features/checklist/types";

export type DailyHistorySummary = {
  date: string;
  total: number;
  completed: number;
  note: string;
};

const items: ChecklistItem[] = [];
const dailyNotes = new Map<string, string>();

function getDateKeyFromIso(isoDate: string) {
  return isoDate.slice(0, 10);
}

export function listItems() {
  return [...items].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function createItem(title: string) {
  const newItem: ChecklistItem = {
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  return newItem;
}

export function updateItem(
  id: string,
  updates: Partial<Pick<ChecklistItem, "title" | "done">>,
) {
  const target = items.find((item) => item.id === id);
  if (!target) {
    return null;
  }

  if (typeof updates.title === "string") {
    target.title = updates.title;
  }
  if (typeof updates.done === "boolean") {
    target.done = updates.done;
  }

  return target;
}

export function deleteItem(id: string) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}

export function upsertDailyNote(date: string, note: string) {
  dailyNotes.set(date, note);
  return note;
}

export function getDailyNote(date: string) {
  return dailyNotes.get(date) ?? "";
}

export function listDailyHistorySummary(): DailyHistorySummary[] {
  const grouped = new Map<string, { total: number; completed: number }>();

  for (const item of items) {
    const date = getDateKeyFromIso(item.createdAt);
    const current = grouped.get(date) ?? { total: 0, completed: 0 };
    grouped.set(date, {
      total: current.total + 1,
      completed: current.completed + (item.done ? 1 : 0),
    });
  }

  for (const date of dailyNotes.keys()) {
    if (!grouped.has(date)) {
      grouped.set(date, { total: 0, completed: 0 });
    }
  }

  return [...grouped.entries()]
    .map(([date, value]) => ({
      date,
      total: value.total,
      completed: value.completed,
      note: getDailyNote(date),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function listItemsByDate(date: string) {
  return listItems().filter((item) => getDateKeyFromIso(item.createdAt) === date);
}

