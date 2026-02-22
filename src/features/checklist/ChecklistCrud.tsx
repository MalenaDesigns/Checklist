"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import { getApiUrl } from "@/features/checklist/api/apiUrl";
import { ChecklistMainPanel } from "@/features/checklist/components/ChecklistMainPanel/ChecklistMainPanel";
import { HistoryDayDialog } from "@/features/checklist/components/HistoryDayDialog/HistoryDayDialog";
import { HistoryDrawerPanel } from "@/features/checklist/components/HistoryDrawerPanel/HistoryDrawerPanel";
import { checklistColors } from "@/features/checklist/constants";
import { ChecklistItem, HistorySummary } from "@/features/checklist/types";
import { buildHistorySummary, buildSelectedDay } from "@/features/checklist/utils/history";

type ChecklistCrudProps = {
  initialItems: ChecklistItem[];
  initialHistory: HistorySummary[];
};

export function ChecklistCrud({ initialItems, initialHistory }: ChecklistCrudProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>(() => {
    const output: Record<string, string> = {};
    for (const entry of initialHistory) {
      output[entry.date] = entry.note;
    }
    return output;
  });

  useEffect(() => {
    let isMounted = true;

    async function bootstrapFromApi() {
      try {
        const [itemsResponse, historyResponse] = await Promise.all([
          fetch(getApiUrl("/api/items"), { cache: "no-store" }),
          fetch(getApiUrl("/api/history"), { cache: "no-store" }),
        ]);

        if (!itemsResponse.ok || !historyResponse.ok) {
          return;
        }

        const itemsData = (await itemsResponse.json()) as { items: ChecklistItem[] };
        const historyData = (await historyResponse.json()) as { history: HistorySummary[] };

        if (!isMounted) {
          return;
        }

        setItems(itemsData.items);
        const notes: Record<string, string> = {};
        for (const entry of historyData.history) {
          notes[entry.date] = entry.note;
        }
        setDailyNotes(notes);
      } catch {
        // Keep initial server data when mock/local API is unavailable.
      }
    }

    bootstrapFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  const historyItems = useMemo(() => buildHistorySummary(items, dailyNotes), [dailyNotes, items]);

  const selectedDay = useMemo(
    () => buildSelectedDay(selectedDate, items, dailyNotes),
    [dailyNotes, items, selectedDate],
  );

  async function handleCreateNewItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    const response = await fetch(getApiUrl("/api/items"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      setError("Failed to create item.");
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) => [data.item, ...prev]);
    setNewTitle("");
    setError(null);
  }

  async function handleToggleDone(item: ChecklistItem) {
    const response = await fetch(getApiUrl(`/api/items/${item.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });

    if (!response.ok) {
      setError("Failed to update item.");
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) =>
      prev.map((entry) => (entry.id === data.item.id ? data.item : entry)),
    );
    setError(null);
  }

  async function handleRemoveItem(id: string) {
    const response = await fetch(getApiUrl(`/api/items/${id}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete item.");
      return;
    }

    setItems((prev) => prev.filter((entry) => entry.id !== id));
    setError(null);
  }

  function handleStartEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  async function handleSaveTitle(id: string) {
    const title = editingTitle.trim();
    if (!title) {
      return;
    }

    const response = await fetch(getApiUrl(`/api/items/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      setError("Failed to save changes.");
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) =>
      prev.map((entry) => (entry.id === data.item.id ? data.item : entry)),
    );
    setEditingId(null);
    setEditingTitle("");
    setError(null);
  }

  async function handleSaveDailyNote() {
    if (!selectedDay) {
      return;
    }

    setIsSavingNote(true);
    const response = await fetch(getApiUrl(`/api/history/${selectedDay.date}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteDraft }),
    });

    setIsSavingNote(false);
    if (!response.ok) {
      setError("Failed to save daily note.");
      return;
    }

    const data = (await response.json()) as { date?: string; note?: string };
    const nextDate = data.date ?? selectedDay.date;
    const nextNote = data.note ?? noteDraft;
    setDailyNotes((prev) => ({ ...prev, [nextDate]: nextNote }));
    setError(null);
  }

  function handleSelectDay(entry: HistorySummary) {
    setSelectedDate(entry.date);
    setNoteDraft(entry.note);
  }

  function handleCloseDayDialog() {
    setSelectedDate(null);
  }

  return (
    <Box
      component="main"
      sx={{
        mx: "auto",
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        width: "100%",
        maxWidth: 960,
        px: { xs: 2, sm: 3 },
        py: 5,
      }}
    >
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
        <Button
          type="button"
          variant="contained"
          startIcon={<MenuRoundedIcon />}
          onClick={() => setIsHistoryOpen(true)}
          sx={{
            bgcolor: checklistColors.rose,
            color: "#fff",
            "&:hover": {
              bgcolor: checklistColors.roseDark,
            },
          }}
        >
          Historial
        </Button>
      </Stack>

      <ChecklistMainPanel
        items={items}
        newTitle={newTitle}
        editingId={editingId}
        editingTitle={editingTitle}
        error={error}
        onCreateNewItem={handleCreateNewItem}
        onChangeNewTitle={setNewTitle}
        onToggleDone={handleToggleDone}
        onStartEdit={handleStartEdit}
        onChangeEditingTitle={setEditingTitle}
        onSaveTitle={handleSaveTitle}
        onRemoveItem={handleRemoveItem}
      />

      <HistoryDrawerPanel
        open={isHistoryOpen}
        historyItems={historyItems}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDay={handleSelectDay}
      />

      <HistoryDayDialog
        selectedDay={selectedDay}
        noteDraft={noteDraft}
        isSavingNote={isSavingNote}
        onClose={handleCloseDayDialog}
        onChangeNoteDraft={setNoteDraft}
        onSaveNote={handleSaveDailyNote}
      />
    </Box>
  );
}
