# Temp Splitwise

Disposable expense-splitting app -- create a room, share the link, split costs, forget about it. No auth required.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite 7, React Router 7 (SPA)
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style, Radix primitives, Lucide icons)
- **Database**: Turso (libsql) -- SQLite over HTTP
- **Backend/API**: Vercel Serverless Functions (TypeScript, `@vercel/node`)
- **Deployment**: Vercel
- **Analytics/Feedback**: SaaS Maker SDK (feedback widget, page view tracking)
- **Other**: nanoid (IDs), date-fns, sonner (toasts), class-variance-authority, tailwind-merge

## Architecture

```
/                        # Vite SPA root
├── api/                 # Vercel serverless functions (the actual backend)
│   ├── _db.ts           # Turso client singleton
│   ├── init.ts          # POST /api/init -- creates DB tables
│   ├── health.ts        # GET /api/health
│   ├── rooms.ts         # POST /api/rooms -- create room + creator participant
│   └── rooms/
│       ├── [slug].ts    # GET /api/rooms/:slug -- fetch room
│       └── [slug]/
│           ├── participants.ts  # GET/POST/DELETE participants
│           └── expenses.ts      # GET/POST/DELETE expenses + splits
├── backend/             # LEGACY -- original FastAPI + PostgreSQL backend (unused)
├── src/
│   ├── main.tsx         # Entry -- BrowserRouter, routes: / and /r/:slug
│   ├── pages/
│   │   ├── Home.tsx     # Create room form
│   │   └── Room.tsx     # Room loader -- checks session, shows JoinRoom or RoomView
│   ├── components/
│   │   ├── RoomView.tsx          # Main room UI (participants, expenses, balances)
│   │   ├── AddExpense.tsx        # Dialog to add expense (equal or custom split)
│   │   ├── BalanceView.tsx       # Shows net balances + settlement suggestions
│   │   ├── ExpensesList.tsx      # Expense list with delete (creator only)
│   │   ├── JoinRoom.tsx          # Join room form for new visitors
│   │   ├── ParticipantsPanel.tsx # Participant badges + add/remove (creator only)
│   │   └── ui/                   # shadcn/ui primitives
│   └── lib/
│       ├── api.ts       # Frontend API client (fetch wrapper for /api/*)
│       ├── types.ts     # Room, Participant, Expense, ExpenseSplit interfaces
│       ├── session.ts   # localStorage-based session (participantId per room slug)
│       ├── settle.ts    # Greedy settlement algorithm (client-side balance calculation)
│       └── utils.ts     # cn() helper
```

### Data flow

1. No auth -- identity is a name stored in localStorage per room slug
2. Creator makes a room -> gets a short slug -> shares URL `/r/:slug`
3. Others visit the link, enter their name to join
4. Expenses stored in Turso, settlement calculated client-side in `settle.ts`
5. Creator can add/remove participants and delete expenses; all participants can add expenses

### DB Schema (Turso/SQLite)

4 tables: `rooms`, `participants`, `expenses`, `expense_splits`. IDs are nanoid strings.

## Key Conventions

- **Path alias**: `@/` maps to `src/`
- **No auth**: Session is localStorage only -- `temp-splitwise-rooms` key
- **Creator permissions**: Only room creator can add/remove participants and delete expenses

## Commands

```bash
pnpm dev          # Vite dev server (localhost:5173)
pnpm build        # tsc -b && vite build
pnpm preview      # Preview production build
```

## Environment Variables

```bash
TURSO_DATABASE_URL=       # Turso database URL
TURSO_AUTH_TOKEN=         # Turso auth token
VITE_SAASMAKER_API_KEY=   # SaaS Maker project API key
```

## Current State

**Done:**
- Room creation with shareable slug URLs
- Join room by name (no auth)
- Add expenses with equal or custom splits
- Delete expenses (creator only)
- Add/remove participants (creator only)
- Client-side balance calculation with greedy settlement algorithm
- SaaS Maker feedback widget + page view analytics
- Deployed on Vercel with Turso DB

**Not done (from README todos):**
- Invite codes for joining rooms
- Handle settlements (mark as paid)
- Edit expenses
- Different settlement views (1-1 vs minimum transactions)
- Rate limiting, logging
- Auto-clear/archive old rooms
