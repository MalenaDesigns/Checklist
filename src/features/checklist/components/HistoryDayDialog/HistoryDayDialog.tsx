"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { checklistColors } from "@/features/checklist/constants";
import { SelectedDayDetails } from "@/features/checklist/types";
import { formatHistoryTitle } from "@/features/checklist/utils/dateFormatting";

type HistoryDayDialogProps = {
  selectedDay: SelectedDayDetails | null;
  noteDraft: string;
  isSavingNote: boolean;
  onClose: () => void;
  onChangeNoteDraft: (value: string) => void;
  onSaveNote: () => Promise<void>;
};

export function HistoryDayDialog({
  selectedDay,
  noteDraft,
  isSavingNote,
  onClose,
  onChangeNoteDraft,
  onSaveNote,
}: HistoryDayDialogProps) {
  const title = selectedDay ? formatHistoryTitle(selectedDay.date) : null;
  const isFulfilled =
    selectedDay !== null && selectedDay.total > 0 && selectedDay.completed === selectedDay.total;

  return (
    <Dialog
      open={Boolean(selectedDay)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: "rgb(255 252 255 / 92%)",
          border: "1px solid rgb(125 79 114 / 26%)",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: checklistColors.mauve,
          fontFamily: "var(--font-handwriting)",
          fontSize: "2.2rem",
          lineHeight: 1.05,
        }}
      >
        {title ? title.weekday : "Detalle del dia"}
        {title ? (
          <Box
            component="span"
            sx={{
              ml: 0.9,
              fontFamily: "var(--font-sans)",
              fontSize: "0.52em",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: checklistColors.mauve,
            }}
          >
            {`- ${title.numbers}`}
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
                  bgcolor: checklistColors.goldSoft,
                  color: checklistColors.gold,
                  border: `1px solid ${checklistColors.gold}55`,
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Completadas: ${selectedDay.completed}`}
                sx={{
                  bgcolor: checklistColors.goldSoft,
                  color: checklistColors.gold,
                  border: `1px solid ${checklistColors.gold}66`,
                  fontWeight: 600,
                }}
              />
              <Chip
                label={isFulfilled ? "Cumplido" : "No cumplido"}
                sx={
                  isFulfilled
                    ? {
                        bgcolor: checklistColors.mauve,
                        color: "#fff",
                        fontWeight: 600,
                      }
                    : {
                        bgcolor: checklistColors.roseSoft,
                        color: checklistColors.rose,
                        border: `1px solid ${checklistColors.rose}66`,
                        fontWeight: 600,
                      }
                }
              />
            </Stack>

            <List sx={{ p: 0, display: "grid", gap: 1 }}>
              {selectedDay.items.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "rgb(125 79 114 / 20%)",
                    borderRadius: 2,
                    bgcolor: "rgb(255 255 255 / 82%)",
                  }}
                >
                  <Checkbox
                    checked={item.done}
                    disabled
                    size="small"
                    sx={{
                      color: checklistColors.gold,
                      "&.Mui-checked": {
                        color: checklistColors.gold,
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      textDecoration: item.done ? "line-through" : "none",
                      color: item.done ? checklistColors.rose : "text.primary",
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
              onChange={(event) => onChangeNoteDraft(event.target.value)}
              placeholder="Escribe una nota de cierre para este dia..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgb(255 255 255 / 85%)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: checklistColors.mauve,
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: checklistColors.mauve,
                  },
              }}
            />
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: checklistColors.rose }}>
          Cerrar
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={onSaveNote}
          disabled={!selectedDay || isSavingNote}
          sx={{
            bgcolor: checklistColors.mauve,
            color: "#fff",
            "&:hover": {
              bgcolor: checklistColors.mauveDark,
            },
          }}
        >
          Guardar nota
        </Button>
      </DialogActions>
    </Dialog>
  );
}

