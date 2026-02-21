export interface Room {
  id: string;
  slug: string;
  name: string;
  creator_participant_id: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  is_creator: number; // SQLite uses 0/1 for boolean
  created_at: string;
}

export interface Expense {
  id: string;
  room_id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_type: "equal" | "custom";
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  participant_id: string;
  owed_amount: number;
}
