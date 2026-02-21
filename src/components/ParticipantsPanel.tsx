import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Participant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParticipantsPanelProps {
  slug: string;
  participants: Participant[];
  currentParticipantId: string;
  isCreator: boolean;
  onUpdate: () => void;
}

export default function ParticipantsPanel({
  slug,
  participants,
  currentParticipantId,
  isCreator,
  onUpdate,
}: ParticipantsPanelProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setAdding(true);
    try {
      await api.joinRoom(slug, newName.trim());
      setNewName("");
      onUpdate();
      toast.success(`Added ${newName.trim()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (participant: Participant) => {
    setRemovingId(participant.id);
    try {
      await api.removeParticipant(slug, participant.id);
      onUpdate();
      toast.success(`Removed ${participant.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove participant");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {participants.map((p) => (
          <Badge
            key={p.id}
            variant={p.id === currentParticipantId ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {p.name}
            {p.is_creator === 1 && (
              <span className="text-[10px] opacity-70 ml-0.5">(creator)</span>
            )}
            {isCreator && p.is_creator !== 1 && (
              <button
                onClick={() => handleRemove(p)}
                disabled={removingId === p.id}
                className="ml-0.5 hover:opacity-70 disabled:opacity-30"
              >
                {removingId === p.id ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <X className="size-3" />
                )}
              </button>
            )}
          </Badge>
        ))}
      </div>

      {isCreator && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Add someone"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={adding}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" disabled={adding || !newName.trim()}>
            {adding ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
