export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
};

const items: ChecklistItem[] = [];

export function listItems() {
  return [...items].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function createItem(title: string) {
  const newItem: ChecklistItem = {
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  return newItem;
}

export function updateItem(
  id: string,
  updates: Partial<Pick<ChecklistItem, "title" | "done">>,
) {
  const target = items.find((item) => item.id === id);
  if (!target) {
    return null;
  }

  if (typeof updates.title === "string") {
    target.title = updates.title;
  }
  if (typeof updates.done === "boolean") {
    target.done = updates.done;
  }

  return target;
}

export function deleteItem(id: string) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}
