import { ArrowRight } from "lucide-react";
import type { Expense, ExpenseSplit, Participant } from "@/lib/types";
import { calculateBalances } from "@/lib/settle";
import { Separator } from "@/components/ui/separator";

interface BalanceViewProps {
  participants: Participant[];
  expenses: Expense[];
  splits: ExpenseSplit[];
}

export default function BalanceView({
  participants,
  expenses,
  splits,
}: BalanceViewProps) {
  const { settlements, balances } = calculateBalances(
    participants,
    expenses,
    splits
  );

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Add expenses to see balances.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Settlements */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Settlements</h3>
        {settlements.length === 0 ? (
          <p className="text-sm text-muted-foreground">All settled up!</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                <span className="font-medium">{s.fromName}</span>
                <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                <span className="font-medium">{s.toName}</span>
                <span className="ml-auto font-semibold">
                  ${s.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Net Balances */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Net Balances</h3>
        <div className="flex flex-col gap-1.5">
          {balances.map((b) => (
            <div
              key={b.participantId}
              className="flex items-center justify-between text-sm"
            >
              <span>{b.name}</span>
              <span
                className={`font-semibold ${
                  b.balance > 0.01
                    ? "text-green-600 dark:text-green-400"
                    : b.balance < -0.01
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {b.balance >= 0 ? "+" : ""}${b.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
