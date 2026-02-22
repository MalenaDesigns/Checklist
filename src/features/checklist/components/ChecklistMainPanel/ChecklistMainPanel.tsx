"use client";

import { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { checklistColors } from "@/features/checklist/constants";
import { ChecklistItem } from "@/features/checklist/types";

type ChecklistMainPanelProps = {
  items: ChecklistItem[];
  newTitle: string;
  editingId: string | null;
  editingTitle: string;
  error: string | null;
  onCreateNewItem: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onChangeNewTitle: (value: string) => void;
  onToggleDone: (item: ChecklistItem) => Promise<void>;
  onStartEdit: (item: ChecklistItem) => void;
  onChangeEditingTitle: (value: string) => void;
  onSaveTitle: (id: string) => Promise<void>;
  onRemoveItem: (id: string) => Promise<void>;
};

export function ChecklistMainPanel({
  items,
  newTitle,
  editingId,
  editingTitle,
  error,
  onCreateNewItem,
  onChangeNewTitle,
  onToggleDone,
  onStartEdit,
  onChangeEditingTitle,
  onSaveTitle,
  onRemoveItem,
}: ChecklistMainPanelProps) {
  return (
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
        <Typography
          variant="h3"
          fontSize={{ xs: "2.7rem", sm: "3.3rem" }}
          sx={{
            fontFamily: "var(--font-handwriting)",
            lineHeight: 1.05,
            color: checklistColors.mauve,
          }}
        >
          Daily Notes
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
          You can create, update, complete and delete tasks.
        </Typography>
      </Stack>

      <Stack
        component="form"
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        onSubmit={onCreateNewItem}
        sx={{ mt: 3 }}
      >
        <TextField
          fullWidth
          size="small"
          value={newTitle}
          onChange={(event) => onChangeNewTitle(event.target.value)}
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
          sx={{
            minWidth: { xs: "100%", sm: 120 },
            bgcolor: checklistColors.mauve,
            color: "#fff",
            "&:hover": {
              bgcolor: checklistColors.mauveDark,
            },
          }}
        >
          Add
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

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
              onChange={() => onToggleDone(item)}
              size="small"
              color="warning"
            />

            {editingId === item.id ? (
              <TextField
                fullWidth
                size="small"
                value={editingTitle}
                onChange={(event) => onChangeEditingTitle(event.target.value)}
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
                  onClick={() => onSaveTitle(item.id)}
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: checklistColors.mauve,
                    color: "#fff",
                    "&:hover": {
                      bgcolor: checklistColors.mauveDark,
                    },
                  }}
                >
                  Save
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onStartEdit(item)}
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: checklistColors.rose,
                    color: "#fff",
                    "&:hover": {
                      bgcolor: checklistColors.roseDark,
                    },
                  }}
                >
                  Edit
                </Button>
              )}

              <Button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: checklistColors.gold,
                  color: "#fff",
                  "&:hover": {
                    bgcolor: checklistColors.goldDark,
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
  );
}
