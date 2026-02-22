'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

type HistorySummary = {
  date: string;
  total: number;
  completed: number;
  note: string;
};

type Props = {
  initialItems: ChecklistItem[];
  initialHistory: HistorySummary[];
};

const HISTORY_DRAWER_WIDTH = 360;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
const COLOR_MAUVE = '#7d4f72';
const COLOR_ROSE = '#a86b76';
const COLOR_ROSE_SOFT = '#f4e5e9';
const COLOR_GOLD = '#b78a2e';
const COLOR_GOLD_SOFT = '#f4ecd8';

function apiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function getDateKey(iso: string) {
  return iso.slice(0, 10);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatHistoryTitle(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = capitalize(
    new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date),
  );
  const day = new Intl.DateTimeFormat('es-ES', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('es-ES', { month: '2-digit' }).format(
    date,
  );
  const year = new Intl.DateTimeFormat('es-ES', { year: '2-digit' }).format(
    date,
  );
  return {
    weekday,
    numbers: `${day} / ${month} / ${year}`,
  };
}

export default function ChecklistCrud({ initialItems, initialHistory }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
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
          fetch(apiUrl('/api/items'), { cache: 'no-store' }),
          fetch(apiUrl('/api/history'), { cache: 'no-store' }),
        ]);

        if (!itemsResponse.ok || !historyResponse.ok) {
          return;
        }

        const itemsData = (await itemsResponse.json()) as {
          items: ChecklistItem[];
        };
        const historyData = (await historyResponse.json()) as {
          history: HistorySummary[];
        };

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
        // Keep initial server data if mock/local API is unavailable.
      }
    }

    bootstrapFromApi();
    return () => {
      isMounted = false;
    };
  }, []);

  const historyItems = useMemo(() => {
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
        note: dailyNotes[date] ?? '',
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [dailyNotes, items]);

  const selectedDay = useMemo(() => {
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
      note: dailyNotes[selectedDate] ?? '',
    };
  }, [dailyNotes, items, selectedDate]);
  const selectedDayTitle = selectedDay
    ? formatHistoryTitle(selectedDay.date)
    : null;

  async function createNewItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    const response = await fetch(apiUrl('/api/items'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      setError('Failed to create item.');
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) => [data.item, ...prev]);
    setNewTitle('');
    setError(null);
  }

  async function toggleDone(item: ChecklistItem) {
    const response = await fetch(apiUrl(`/api/items/${item.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done }),
    });

    if (!response.ok) {
      setError('Failed to update item.');
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) =>
      prev.map((entry) => (entry.id === data.item.id ? data.item : entry)),
    );
    setError(null);
  }

  async function removeItem(id: string) {
    const response = await fetch(apiUrl(`/api/items/${id}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      setError('Failed to delete item.');
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

    const response = await fetch(apiUrl(`/api/items/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      setError('Failed to save changes.');
      return;
    }

    const data = (await response.json()) as { item: ChecklistItem };
    setItems((prev) =>
      prev.map((entry) => (entry.id === data.item.id ? data.item : entry)),
    );
    setEditingId(null);
    setEditingTitle('');
    setError(null);
  }

  async function saveDailyNote() {
    if (!selectedDay) {
      return;
    }

    setIsSavingNote(true);
    const response = await fetch(apiUrl(`/api/history/${selectedDay.date}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteDraft }),
    });

    setIsSavingNote(false);
    if (!response.ok) {
      setError('Failed to save daily note.');
      return;
    }

    const data = (await response.json()) as { date: string; note: string };
    setDailyNotes((prev) => ({ ...prev, [data.date]: data.note }));
    setError(null);
  }

  return (
    <Box
      component="main"
      sx={{
        mx: 'auto',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        width: '100%',
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
          onClick={() => setHistoryOpen(true)}
          sx={{
            bgcolor: COLOR_ROSE,
            color: '#fff',
            '&:hover': {
              bgcolor: '#87545e',
            },
          }}
        >
          Historial
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'rgb(255 255 255 / 55%)',
          bgcolor: 'rgb(255 255 255 / 44%)',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 16px 46px rgba(103, 72, 97, 0.2)',
          backdropFilter: 'blur(16px) saturate(135%)',
          WebkitBackdropFilter: 'blur(16px) saturate(135%)',
        }}
      >
        <Stack spacing={0.75}>
          <Typography
            variant="h3"
            fontSize={{ xs: '2.7rem', sm: '3.3rem' }}
            sx={{
              fontFamily: 'var(--font-handwriting)',
              lineHeight: 1.05,
              color: COLOR_MAUVE,
            }}
          >
            Daily Notes
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              borderLeft: '4px solid',
              borderColor: 'warning.main',
              pl: 1.25,
            }}
          >
            You can create, update, complete and delete tasks.
          </Typography>
        </Stack>

        <Stack
          component="form"
          direction={{ xs: 'column', sm: 'row' }}
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
                  color: 'text.primary',
                  '& input::placeholder': {
                    color: '#7d647f',
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
              minWidth: { xs: '100%', sm: 120 },
              bgcolor: COLOR_MAUVE,
              color: '#fff',
              '&:hover': {
                bgcolor: '#643d5b',
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

        <List sx={{ mt: 2, p: 0, display: 'grid', gap: 1.25 }}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              disablePadding
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: '1px solid',
                borderColor: 'rgb(255 255 255 / 52%)',
                bgcolor: 'rgb(255 255 255 / 48%)',
                borderRadius: 3,
                px: 1.75,
                py: 1.1,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
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
                />
              ) : (
                <Typography
                  sx={{
                    flexGrow: 1,
                    textDecoration: item.done ? 'line-through' : 'none',
                    color: item.done ? '#7b687f' : 'text.primary',
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
                    size="small"
                    sx={{
                      bgcolor: COLOR_MAUVE,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#643d5b',
                      },
                    }}
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
                    size="small"
                    sx={{
                      bgcolor: COLOR_ROSE,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#87545e',
                      },
                    }}
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
                    bgcolor: COLOR_GOLD,
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#926d24',
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

      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: HISTORY_DRAWER_WIDTH },
            p: 2,
            bgcolor: 'rgb(255 250 255 / 90%)',
            backdropFilter: 'blur(14px)',
            borderLeft: '1px solid rgb(125 79 114 / 24%)',
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: COLOR_MAUVE,
              fontFamily: 'var(--font-handwriting)',
              fontSize: '2rem',
              lineHeight: 1.05,
            }}
          >
            Historial Diario
          </Typography>
          <IconButton
            onClick={() => setHistoryOpen(false)}
            aria-label="Cerrar historial"
            sx={{ color: COLOR_ROSE }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Stack>

        {historyItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aun no hay historial para mostrar.
          </Typography>
        ) : null}

        <Stack spacing={1.25}>
          {historyItems.map((entry) => {
            const allDone = entry.total > 0 && entry.completed === entry.total;
            const title = formatHistoryTitle(entry.date);
            return (
              <Card
                key={entry.date}
                variant="outlined"
                sx={{
                  borderColor: 'rgb(125 79 114 / 25%)',
                  bgcolor: 'rgb(255 255 255 / 72%)',
                }}
              >
                <CardActionArea
                  onClick={() => {
                    setSelectedDate(entry.date);
                    setNoteDraft(entry.note);
                  }}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgb(168 107 118 / 10%)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          color: COLOR_MAUVE,
                          fontFamily: 'var(--font-handwriting)',
                          fontSize: '1.5rem',
                          lineHeight: 1,
                        }}
                      >
                        {title.weekday}
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.58em',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            color: COLOR_MAUVE,
                          }}
                        >
                          {`- ${title.numbers}`}
                        </Box>
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={`${entry.completed}/${entry.total} completadas`}
                          sx={{
                            bgcolor: COLOR_GOLD_SOFT,
                            color: COLOR_GOLD,
                            border: `1px solid ${COLOR_GOLD}55`,
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          size="small"
                          label={allDone ? 'Cumplido' : 'Pendiente'}
                          sx={
                            allDone
                              ? {
                                  bgcolor: COLOR_MAUVE,
                                  color: '#fff',
                                  fontWeight: 600,
                                }
                              : {
                                  bgcolor: COLOR_ROSE_SOFT,
                                  color: COLOR_ROSE,
                                  border: `1px solid ${COLOR_ROSE}66`,
                                  fontWeight: 600,
                                }
                          }
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </Drawer>

      <Dialog
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDate(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: 'rgb(255 252 255 / 92%)',
            border: '1px solid rgb(125 79 114 / 26%)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: COLOR_MAUVE,
            fontFamily: 'var(--font-handwriting)',
            fontSize: '2.2rem',
            lineHeight: 1.05,
          }}
        >
          {selectedDayTitle ? selectedDayTitle.weekday : 'Detalle del dia'}
          {selectedDayTitle ? (
            <Box
              component="span"
              sx={{
                ml: 0.9,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.52em',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: COLOR_MAUVE,
              }}
            >
              {`- ${selectedDayTitle.numbers}`}
            </Box>
          ) : null}
        </DialogTitle>
        <DialogContent>
          {selectedDay ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Total: ${selectedDay.total}`}
                  sx={{
                    bgcolor: COLOR_GOLD_SOFT,
                    color: COLOR_GOLD,
                    border: `1px solid ${COLOR_GOLD}55`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Completadas: ${selectedDay.completed}`}
                  sx={{
                    bgcolor: COLOR_GOLD_SOFT,
                    color: COLOR_GOLD,
                    border: `1px solid ${COLOR_GOLD}66`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={
                    selectedDay.completed === selectedDay.total &&
                    selectedDay.total > 0
                      ? 'Cumplido'
                      : 'No cumplido'
                  }
                  sx={
                    selectedDay.completed === selectedDay.total &&
                    selectedDay.total > 0
                      ? {
                          bgcolor: COLOR_MAUVE,
                          color: '#fff',
                          fontWeight: 600,
                        }
                      : {
                          bgcolor: COLOR_ROSE_SOFT,
                          color: COLOR_ROSE,
                          border: `1px solid ${COLOR_ROSE}66`,
                          fontWeight: 600,
                        }
                  }
                />
              </Stack>

              <List sx={{ p: 0, display: 'grid', gap: 1 }}>
                {selectedDay.items.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'rgb(125 79 114 / 20%)',
                      borderRadius: 2,
                      bgcolor: 'rgb(255 255 255 / 82%)',
                    }}
                  >
                    <Checkbox
                      checked={item.done}
                      disabled
                      size="small"
                      sx={{
                        color: COLOR_GOLD,
                        '&.Mui-checked': {
                          color: COLOR_GOLD,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? COLOR_ROSE : 'text.primary',
                      }}
                    >
                      {item.title}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <TextField
                label="Nota final del dia"
                multiline
                minRows={3}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Escribe una nota de cierre para este dia..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgb(255 255 255 / 85%)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: COLOR_MAUVE,
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: COLOR_MAUVE,
                    },
                }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedDate(null)}
            sx={{ color: COLOR_ROSE }}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={saveDailyNote}
            disabled={!selectedDay || isSavingNote}
            sx={{
              bgcolor: COLOR_MAUVE,
              color: '#fff',
              '&:hover': {
                bgcolor: '#643d5b',
              },
            }}
          >
            Guardar nota
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
