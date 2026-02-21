import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getRoomSession } from "@/lib/session";
import type { Room as RoomType } from "@/lib/types";
import JoinRoom from "@/components/JoinRoom";
import RoomView from "@/components/RoomView";

export default function Room() {
  const { slug } = useParams<{ slug: string }>();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [validParticipantId, setValidParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const init = async () => {
      try {
        const roomData = await api.getRoom(slug);
        setRoom(roomData);

        const session = getRoomSession(slug);
        if (session) {
          // Verify participant still exists
          const participants = await api.getParticipants(slug);
          const found = participants.find((p) => p.id === session.participantId);
          if (found) {
            setValidParticipantId(session.participantId);
          } else {
            setShowJoin(true);
          }
        } else {
          setShowJoin(true);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!room || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Room not found.</p>
      </div>
    );
  }

  if (showJoin) {
    return <JoinRoom slug={slug} roomName={room.name} />;
  }

  if (validParticipantId) {
    return <RoomView room={room} currentParticipantId={validParticipantId} />;
  }

  return null;
}
