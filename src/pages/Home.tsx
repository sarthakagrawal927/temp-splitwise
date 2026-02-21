import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { setRoomSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [yourName, setYourName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !yourName.trim()) return;

    setLoading(true);
    try {
      const { slug, participantId } = await api.createRoom(
        roomName.trim(),
        yourName.trim()
      );
      setRoomSession(slug, participantId, yourName.trim());
      navigate(`/r/${slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Temp Splitwise</CardTitle>
          <CardDescription>
            Create a room, split expenses, forget about it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                placeholder="Weekend trip"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="yourName">Your Name</Label>
              <Input
                id="yourName"
                placeholder="Alice"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !roomName.trim() || !yourName.trim()}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Room"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
