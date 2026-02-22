import { ChecklistItem, HistorySummary, SelectedDayDetails } from "@/features/checklist/types";
import { getDateKey } from "@/features/checklist/utils/dateFormatting";

export function buildHistorySummary(
  items: ChecklistItem[],
  dailyNotes: Record<string, string>,
): HistorySummary[] {
  const grouped = new Map<string, { total: number; completed: number }>();

  for (const item of items) {
    const date = getDateKey(item.createdAt);
    const current = grouped.get(date) ?? { total: 0, completed: 0 };
    grouped.set(date, {
      total: current.total + 1,
      completed: current.completed + (item.done ? 1 : 0),
    });
  }

  for (const date of Object.keys(dailyNotes)) {
    if (!grouped.has(date)) {
      grouped.set(date, { total: 0, completed: 0 });
    }
  }

  return [...grouped.entries()]
    .map(([date, value]) => ({
      date,
      total: value.total,
      completed: value.completed,
      note: dailyNotes[date] ?? "",
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function buildSelectedDay(
  selectedDate: string | null,
  items: ChecklistItem[],
  dailyNotes: Record<string, string>,
): SelectedDayDetails | null {
  if (!selectedDate) {
    return null;
  }

  const dayItems = items.filter(
    (item) => getDateKey(item.createdAt) === selectedDate,
  );
  const completed = dayItems.filter((item) => item.done).length;

  return {
    date: selectedDate,
    items: dayItems,
    completed,
    total: dayItems.length,
    note: dailyNotes[selectedDate] ?? "",
  };
}

