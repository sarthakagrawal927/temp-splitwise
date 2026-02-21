import type { Expense, ExpenseSplit, Participant } from "./types";

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface NetBalance {
  participantId: string;
  name: string;
  balance: number;
}

export function calculateBalances(
  participants: Participant[],
  expenses: Expense[],
  splits: ExpenseSplit[]
): { settlements: Settlement[]; balances: NetBalance[] } {
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));

  // Calculate net balance for each participant
  // positive = others owe them, negative = they owe others
  const netMap = new Map<string, number>();
  for (const p of participants) {
    netMap.set(p.id, 0);
  }

  // Add what each person paid
  for (const expense of expenses) {
    const current = netMap.get(expense.paid_by) ?? 0;
    netMap.set(expense.paid_by, current + expense.amount);
  }

  // Subtract what each person owes
  for (const split of splits) {
    const current = netMap.get(split.participant_id) ?? 0;
    netMap.set(split.participant_id, current - split.owed_amount);
  }

  const balances: NetBalance[] = participants.map((p) => ({
    participantId: p.id,
    name: p.name,
    balance: netMap.get(p.id) ?? 0,
  }));

  // Greedy settlement algorithm
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, balance] of netMap) {
    if (balance < -0.01) {
      debtors.push({ id, amount: -balance }); // make positive
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount);
    if (transfer > 0.01) {
      settlements.push({
        from: debtors[i].id,
        fromName: nameMap.get(debtors[i].id) ?? "Unknown",
        to: creditors[j].id,
        toName: nameMap.get(creditors[j].id) ?? "Unknown",
        amount: Math.round(transfer * 100) / 100,
      });
    }
    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return { settlements, balances };
}
