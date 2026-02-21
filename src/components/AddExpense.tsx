import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddExpenseProps {
  slug: string;
  participants: Participant[];
  onUpdate: () => void;
}

export default function AddExpense({ slug, participants, onUpdate }: AddExpenseProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitType("equal");
    setCustomSplits({});
  };

  const customTotal = Object.values(customSplits).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );
  const amountNum = parseFloat(amount) || 0;
  const customValid =
    splitType === "equal" ||
    Math.abs(customTotal - amountNum) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amountNum || !paidBy) return;
    if (!customValid) {
      toast.error("Custom split amounts must sum to the total");
      return;
    }

    setLoading(true);
    try {
      await api.addExpense(slug, {
        description: description.trim(),
        amount: amountNum,
        paidBy,
        splitType,
        customSplits:
          splitType === "custom"
            ? Object.entries(customSplits)
                .filter(([, v]) => parseFloat(v) > 0)
                .map(([participantId, v]) => ({
                  participantId,
                  amount: parseFloat(v),
                }))
            : undefined,
      });
      toast.success("Expense added");
      resetForm();
      setOpen(false);
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for this room.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-desc">Description</Label>
              <Input
                id="exp-desc"
                placeholder="Dinner, taxi, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-paidby">Paid by</Label>
              <select
                id="exp-paidby"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">Select person</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Split type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={splitType === "equal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSplitType("equal")}
                >
                  Equal
                </Button>
                <Button
                  type="button"
                  variant={splitType === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSplitType("custom");
                    // Initialize with equal splits
                    const perPerson = amountNum / participants.length;
                    const initial: Record<string, string> = {};
                    for (const p of participants) {
                      initial[p.id] = perPerson ? perPerson.toFixed(2) : "";
                    }
                    setCustomSplits(initial);
                  }}
                >
                  Custom
                </Button>
              </div>
            </div>

            {splitType === "custom" && (
              <div className="flex flex-col gap-2">
                <Label>Custom amounts</Label>
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-sm w-24 truncate">{p.name}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={customSplits[p.id] ?? ""}
                      onChange={(e) =>
                        setCustomSplits((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      className="h-8"
                    />
                  </div>
                ))}
                <p
                  className={`text-xs ${
                    customValid ? "text-muted-foreground" : "text-destructive"
                  }`}
                >
                  Total: ${customTotal.toFixed(2)} / ${amountNum.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                loading ||
                !description.trim() ||
                !amountNum ||
                !paidBy ||
                !customValid
              }
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
