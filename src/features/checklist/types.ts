export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

export type HistorySummary = {
  date: string;
  total: number;
  completed: number;
  note: string;
};

export type SelectedDayDetails = {
  date: string;
  items: ChecklistItem[];
  completed: number;
  total: number;
  note: string;
};

