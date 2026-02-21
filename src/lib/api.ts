const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  createRoom: (name: string, creatorName: string) =>
    request<{ roomId: string; slug: string; participantId: string }>("/rooms", {
      method: "POST",
      body: JSON.stringify({ name, creatorName }),
    }),

  getRoom: (slug: string) =>
    request<import("./types").Room>(`/rooms/${slug}`),

  getParticipants: (slug: string) =>
    request<import("./types").Participant[]>(`/rooms/${slug}/participants`),

  joinRoom: (slug: string, name: string) =>
    request<{ id: string; name: string }>(`/rooms/${slug}/participants`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  removeParticipant: (slug: string, participantId: string) =>
    request<{ ok: boolean }>(`/rooms/${slug}/participants`, {
      method: "DELETE",
      body: JSON.stringify({ participantId }),
    }),

  getExpenses: (slug: string) =>
    request<{ expenses: import("./types").Expense[]; splits: import("./types").ExpenseSplit[] }>(
      `/rooms/${slug}/expenses`
    ),

  addExpense: (
    slug: string,
    data: {
      description: string;
      amount: number;
      paidBy: string;
      splitType: "equal" | "custom";
      customSplits?: { participantId: string; amount: number }[];
    }
  ) =>
    request<{ id: string }>(`/rooms/${slug}/expenses`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteExpense: (slug: string, expenseId: string) =>
    request<{ ok: boolean }>(`/rooms/${slug}/expenses`, {
      method: "DELETE",
      body: JSON.stringify({ expenseId }),
    }),
};
