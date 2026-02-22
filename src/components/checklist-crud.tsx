"use client";

import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "rgb(255 255 255 / 55%)",
          bgcolor: "rgb(255 255 255 / 44%)",
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: "0 16px 46px rgba(103, 72, 97, 0.2)",
          backdropFilter: "blur(16px) saturate(135%)",
          WebkitBackdropFilter: "blur(16px) saturate(135%)",
        }}
      >
        <Stack spacing={0.75}>
          <Typography variant="h3" fontSize={{ xs: "2rem", sm: "2.5rem" }}>
            Checklist CRUD
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              borderLeft: "4px solid",
              borderColor: "warning.main",
              pl: 1.25,
            }}
          >
            Next.js + API Routes. You can create, update, complete and delete
            tasks.
          </Typography>
        </Stack>

        <Stack
          component="form"
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          onSubmit={createNewItem}
          sx={{ mt: 3 }}
        >
          <TextField
            fullWidth
            size="small"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a new task..."
            slotProps={{
              input: {
                sx: {
                  color: "text.primary",
                  "& input::placeholder": {
                    color: "#7d647f",
                    opacity: 1,
                  },
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ minWidth: { xs: "100%", sm: 120 } }}
          >
            Add
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No tasks yet.
          </Typography>
        ) : null}

        <List sx={{ mt: 2, p: 0, display: "grid", gap: 1.25 }}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                border: "1px solid",
                borderColor: "rgb(255 255 255 / 52%)",
                bgcolor: "rgb(255 255 255 / 48%)",
                borderRadius: 3,
                px: 1.75,
                py: 1.1,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <Checkbox
                checked={item.done}
                onChange={() => toggleDone(item)}
                size="small"
                color="warning"
              />

              {editingId === item.id ? (
                <TextField
                  fullWidth
                  size="small"
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        color: "text.primary",
                        "& input::placeholder": {
                          color: "#7d647f",
                          opacity: 1,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Typography
                  sx={{
                    flexGrow: 1,
                    textDecoration: item.done ? "line-through" : "none",
                    color: item.done ? "#7b687f" : "text.primary",
                  }}
                >
                  {item.title}
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              {editingId === item.id ? (
                <Button
                  type="button"
                  onClick={() => saveTitle(item.id)}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditingTitle(item.title);
                  }}
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  Edit
                </Button>
              )}

              <Button
                type="button"
                onClick={() => removeItem(item.id)}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "error.main",
                  color: "error.contrastText",
                  "&:hover": {
                    bgcolor: "#76243d",
                  },
                }}
              >
                Delete
              </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
