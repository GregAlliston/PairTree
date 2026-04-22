export type Recurrence = "none" | "yearly" | "monthly";

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type EventRecord = {
  id: string;
  title: string;
  categoryId: string | null;
  startDate: string; // YYYY-MM-DD
  recurrence: Recurrence;
  reminderDaysBefore: number[];
  notes: string | null;
  createdAt: string;
};
