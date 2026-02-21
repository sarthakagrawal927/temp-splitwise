const STORAGE_KEY = "temp-splitwise-rooms";

interface RoomSession {
  participantId: string;
  name: string;
}

type Sessions = Record<string, RoomSession>;

function getSessions(): Sessions {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getRoomSession(slug: string): RoomSession | null {
  return getSessions()[slug] || null;
}

export function setRoomSession(slug: string, participantId: string, name: string): void {
  const sessions = getSessions();
  sessions[slug] = { participantId, name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearRoomSession(slug: string): void {
  const sessions = getSessions();
  delete sessions[slug];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
