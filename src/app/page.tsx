import ChecklistCrud from "@/components/checklist-crud";
import { listItems } from "@/lib/checklist-store";

export default function Home() {
  return <ChecklistCrud initialItems={listItems()} />;
}
