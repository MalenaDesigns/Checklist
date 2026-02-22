"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Box from "@mui/material/Box";

import { HISTORY_DRAWER_WIDTH, checklistColors } from "@/features/checklist/constants";
import { HistorySummary } from "@/features/checklist/types";
import { formatHistoryTitle } from "@/features/checklist/utils/dateFormatting";

type HistoryDrawerPanelProps = {
  open: boolean;
  historyItems: HistorySummary[];
  onClose: () => void;
  onSelectDay: (entry: HistorySummary) => void;
};

export function HistoryDrawerPanel({
  open,
  historyItems,
  onClose,
  onSelectDay,
}: HistoryDrawerPanelProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: HISTORY_DRAWER_WIDTH },
          p: 2,
          bgcolor: "rgb(255 250 255 / 90%)",
          backdropFilter: "blur(14px)",
          borderLeft: "1px solid rgb(125 79 114 / 24%)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: checklistColors.mauve,
            fontFamily: "var(--font-handwriting)",
            fontSize: "2rem",
            lineHeight: 1.05,
          }}
        >
          Historial Diario
        </Typography>
        <IconButton onClick={onClose} aria-label="Cerrar historial" sx={{ color: checklistColors.rose }}>
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
                borderColor: "rgb(125 79 114 / 25%)",
                bgcolor: "rgb(255 255 255 / 72%)",
              }}
            >
              <CardActionArea
                onClick={() => onSelectDay(entry)}
                sx={{
                  "&:hover": {
                    bgcolor: "rgb(168 107 118 / 10%)",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        color: checklistColors.mauve,
                        fontFamily: "var(--font-handwriting)",
                        fontSize: "1.5rem",
                        lineHeight: 1,
                      }}
                    >
                      {title.weekday}
                      <Box
                        component="span"
                        sx={{
                          ml: 0.75,
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.58em",
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                          color: checklistColors.mauve,
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
                          bgcolor: checklistColors.goldSoft,
                          color: checklistColors.gold,
                          border: `1px solid ${checklistColors.gold}55`,
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        size="small"
                        label={allDone ? "Cumplido" : "Pendiente"}
                        sx={
                          allDone
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
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Drawer>
  );
}

