import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Home, Loader2, Share2, Users, Receipt } from "lucide-react";
import { api } from "@/lib/api";
import type { Room, Participant, Expense, ExpenseSplit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ParticipantsPanel from "./ParticipantsPanel";
import AddExpense from "./AddExpense";
import ExpensesList from "./ExpensesList";
import BalanceView from "./BalanceView";

interface RoomViewProps {
  room: Room;
  currentParticipantId: string;
}

export default function RoomView({ room, currentParticipantId }: RoomViewProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);

  const isCreator = room.creator_participant_id === currentParticipantId;

  const loadData = useCallback(async () => {
    try {
      const [participantsData, expensesData] = await Promise.all([
        api.getParticipants(room.slug),
        api.getExpenses(room.slug),
      ]);
      setParticipants(participantsData);
      setExpenses(expensesData.expenses);
      setSplits(expensesData.splits);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [room.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.info(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">{room.name}</h1>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Users className="size-3" />
                {participants.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Receipt className="size-3" />
                {expenses.length}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="size-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantsPanel
              slug={room.slug}
              participants={participants}
              currentParticipantId={currentParticipantId}
              isCreator={isCreator}
              onUpdate={loadData}
            />
          </CardContent>
        </Card>

        {/* Add Expense Button */}
        <div className="flex justify-end">
          <AddExpense
            slug={room.slug}
            participants={participants}
            onUpdate={loadData}
          />
        </div>

        {/* Balance View */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceView
              participants={participants}
              expenses={expenses}
              splits={splits}
            />
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesList
              slug={room.slug}
              expenses={expenses}
              participants={participants}
              isCreator={isCreator}
              onUpdate={loadData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
