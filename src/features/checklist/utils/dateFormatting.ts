type HistoryTitleParts = {
  weekday: string;
  numbers: string;
};

export function getDateKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatHistoryTitle(dateKey: string): HistoryTitleParts {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = capitalize(
    new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date),
  );
  const day = new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("es-ES", { month: "2-digit" }).format(
    date,
  );
  const year = new Intl.DateTimeFormat("es-ES", { year: "2-digit" }).format(
    date,
  );
  return {
    weekday,
    numbers: `${day} / ${month} / ${year}`,
  };
}

