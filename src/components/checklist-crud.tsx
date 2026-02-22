"use client";

import { FormEvent, useState } from "react";

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

type Props = {
  initialItems: ChecklistItem[];
};

export default function ChecklistCrud({ initialItems }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function createNewItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    const response = await fetch("/api/items", {
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

  async function toggleDone(item: ChecklistItem) {
    const response = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });

    if (!response.ok) {
      setError("Failed to update item.");
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) => prev.map((entry) => (entry.id === data.item.id ? data.item : entry)));
    setError(null);
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete item.");
      return;
    }

    setItems((prev) => prev.filter((entry) => entry.id !== id));
    setError(null);
  }

  async function saveTitle(id: string) {
    const title = editingTitle.trim();
    if (!title) {
      return;
    }

    const response = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      setError("Failed to save changes.");
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) => prev.map((entry) => (entry.id === data.item.id ? data.item : entry)));
    setEditingId(null);
    setEditingTitle("");
    setError(null);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Checklist CRUD</h1>
        <p className="text-sm text-gray-600">
          Next.js + API Routes. You can create, update, complete and delete tasks.
        </p>
      </header>

      <form className="flex gap-3" onSubmit={createNewItem}>
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add a new task..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
        >
          Add
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {items.length === 0 ? <p className="text-sm text-gray-600">No tasks yet.</p> : null}

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleDone(item)}
              className="h-4 w-4"
            />

            {editingId === item.id ? (
              <input
                value={editingTitle}
                onChange={(event) => setEditingTitle(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1"
              />
            ) : (
              <span
                className={`w-full ${
                  item.done ? "text-gray-400 line-through" : "text-gray-900"
                }`}
              >
                {item.title}
              </span>
            )}

            {editingId === item.id ? (
              <button
                type="button"
                onClick={() => saveTitle(item.id)}
                className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
              >
                Save
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
