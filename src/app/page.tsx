import { ChecklistCrud } from "@/features/checklist/ChecklistCrud";
import { listDailyHistorySummary, listItems } from "@/features/checklist/server/checklistStore";

export default function Home() {
  return (
    <ChecklistCrud
      initialItems={listItems()}
      initialHistory={listDailyHistorySummary()}
    />
  );
}
