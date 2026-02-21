import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Expense, Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ExpensesListProps {
  slug: string;
  expenses: Expense[];
  participants: Participant[];
  isCreator: boolean;
  onUpdate: () => void;
}

export default function ExpensesList({
  slug,
  expenses,
  participants,
  isCreator,
  onUpdate,
}: ExpensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));

  const handleDelete = async (expenseId: string) => {
    setDeletingId(expenseId);
    try {
      await api.deleteExpense(slug, expenseId);
      onUpdate();
      toast.success("Expense deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No expenses yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {expenses.map((expense, i) => (
        <div key={expense.id}>
          {i > 0 && <Separator />}
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium truncate">
                {expense.description}
              </span>
              <span className="text-xs text-muted-foreground">
                {nameMap.get(expense.paid_by) ?? "Unknown"} paid
                {" \u00B7 "}
                {format(new Date(expense.created_at), "MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold">
                ${expense.amount.toFixed(2)}
              </span>
              {isCreator && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                >
                  {deletingId === expense.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
