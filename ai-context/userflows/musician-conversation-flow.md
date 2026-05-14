# PRD: Musician Conversation Request Flow

**Feature:** Instagram-style conversation request system
**Roles affected:** MUSICIAN (initiator), CREATOR (gatekeeper)
**Status:** Planned

---

## Overview

Musicians are able to send a single intro message to a creator via a gig listing. The creator sees it in a dedicated "Conversation Requests" inbox — separate from active conversations — and either starts a full chat or declines. This mirrors Instagram's message request model: the full thread only opens after creator approval.

---

## User Flow

```
[MUSICIAN]
Browse /gigs
    ↓
Click gig → /gigs/[id]
    ↓
"Request Conversation" button (OPEN gigs only, MUSICIAN role only)
    ↓
/gigs/[id]/request — write intro message (max 600 chars)
    ↓
Submit → request status: PENDING
    ↓
/messages/requests — "Request sent" confirmation view

[CREATOR]
Nav badge (pink dot) on "Messages" link
    ↓
/messages/requests — Conversation Requests inbox
    ↓
Click request card → /messages/requests/[requestId]
    Preview: musician profile snapshot, gig context, full intro message
    ↓
         ┌──────────────────────┐
   "Start Conversation"      "Decline"
         ↓                       ↓
  status → APPROVED         status → DECLINED
  conversation row created   /messages/requests (creator returns)
         ↓
  /messages/[conversationId]    [MUSICIAN sees "Not accepted" in their requests view]
         ↓
  Ongoing messaging (Supabase Realtime)
```

---

## Feature Specifications

### 1. Gig Detail Page — Request CTA (`src/app/gigs/[id]/page.tsx`)

**Existing page modified.** Add to the aside panel:

| Condition | UI shown |
|---|---|
| Not signed in | "Sign in to request" link → `/signin?callbackUrl=/gigs/[id]/request` |
| Signed in, role = CREATOR | Nothing (creators can't apply) |
| Signed in, MUSICIAN, gig OPEN, no prior request | "Request Conversation" pill button → `/gigs/[id]/request` |
| Signed in, MUSICIAN, already requested | Static "Request sent" badge (gold chip) |
| Gig CLOSED | Static "Gig filled" badge (neutral chip) |

**Data fetched:** `getCurrentSession()` + `getRequestByMusicianAndGig(session.user.id, gig.id)` (only if MUSICIAN + gig is OPEN).

---

### 2. Request Submission (`/gigs/[id]/request/`)

**Route:** `src/app/gigs/[id]/request/page.tsx`
**Auth:** `requireRole("MUSICIAN", /gigs/[id]/request)` — creators redirected to `/`

**Page layout:**
- `PageShell` with eyebrow = gig project type chip, title = gig title
- Context card: gig description excerpt, creator name, compensation chip
- `_request-form.tsx` (client): textarea for intro message, live character counter, `FormSubmitButton`

**Guards (pre-render):**
- `gig.status === "CLOSED"` → render notice card, no form
- Existing request found → render "Already requested" card, no form

**Server action (`actions.ts`):**
```ts
submitRequestAction(gigId, _state, fd) → ActionState
```
1. `requireRole("MUSICIAN", ...)`
2. `getGig(gigId)` — 404 if missing
3. Guard: `gig.status === "CLOSED"` → return error state
4. `getRequestByMusicianAndGig` — return error if exists (race condition safety)
5. Validate `introMessage`: non-empty, ≤ 600 chars
6. `createConversationRequest({ musicianId, gigId, introMessage })`
7. `redirect("/messages/requests")`

---

### 3. Creator Conversation Requests Inbox (`/messages/requests/`)

**Route:** `src/app/messages/requests/page.tsx`
**Auth:** `requireUser(...)` — role determines which view renders

**Creator view:** Lists all PENDING requests across creator's gigs.
Each `_request-card.tsx` shows:
- Musician avatar (image → initials fallback) + display name
- Gig title + project type chip
- Intro message truncated to ~120 chars
- Time since sent
- "Review →" link

**Musician view:** Lists all their requests (any status).
Each card shows:
- Gig title + creator name
- Status chip: PENDING (gold), APPROVED (blue, links to `/messages/[id]`), DECLINED (neutral, "Not accepted")
- Time since sent

**Empty states:**
- Creator: "No requests yet. Requests from musicians will appear here."
- Musician: "You haven't reached out yet." + "Browse Gigs" CTA

---

### 4. Request Detail View (`/messages/requests/[requestId]/`)

**Route:** `src/app/messages/requests/[requestId]/page.tsx`
**Auth:** `requireRole("CREATOR", ...)` — musicians redirected (they have no per-request detail view)

**Layout (two-column):**

Left panel — Musician snapshot:
- Avatar, display name, location, bio excerpt
- Instruments + genres chips (first 4 + `+N more`)
- "View full profile →" link to `/musicians/[id]`

Right panel — Request detail:
- Gig title + project type + compensation chip
- Full intro message (no truncation)
- Sent timestamp
- `_action-buttons.tsx` (client): "Start Conversation" (primary) + "Decline" (ghost, pink text)

**Already-processed state:** If `request.status !== "PENDING"`, hide action buttons. Show "This request was [approved / declined]." If approved, show "Open conversation →" link.

**Server actions (`actions.ts`):**

```ts
approveRequestAction(requestId): Promise<void>
```
1. `requireRole("CREATOR", ...)`
2. Load request, verify `gig.creatorId === session.user.id`
3. Guard: `request.status !== "PENDING"` → redirect to existing conversation if APPROVED
4. `approveConversationRequest(requestId)` → status = APPROVED
5. `createConversation(requestId, request.musicianId, session.user.id, request.gigId)`
6. `revalidatePath("/messages/requests")`
7. `redirect(`/messages/${conversation.id}`)`

```ts
declineRequestAction(requestId): Promise<void>
```
1–3 same
4. `declineConversationRequest(requestId)` → status = DECLINED
5. `revalidatePath("/messages/requests")`
6. `redirect("/messages/requests")`

---

### 5. Active Conversation Thread (`/messages/[conversationId]/`)

**Route:** `src/app/messages/[conversationId]/page.tsx`
**Auth:** `requireUser(...)`, then assert caller is a participant

**Page layout (two-panel):**

Top bar: other party's name + avatar, gig title chip, back link

Message area (`_message-list.tsx` — client):
- Loads `initialMessages` from server, subscribes to Supabase Realtime on mount
- Own messages: right-aligned, `bg-[#0F172A] text-white rounded-2xl`
- Received: left-aligned, `bg-white border border-[#F1F5F9] text-[#0F172A] rounded-2xl`
- Auto-scrolls to bottom on new message
- De-duplicates via `id` check before appending (server action revalidation races with Realtime)

Compose bar (`_compose-bar.tsx` — client):
- Textarea + send button
- `useActionState(sendMessageAction.bind(null, conversationId), ...)`
- Clears on `state.ok === true`
- Character counter approaching 2000 limit

**Server action:**
```ts
sendMessageAction(conversationId, _state, fd) → ActionState
```
1. `requireUser(...)`
2. Load conversation, assert participant
3. Validate `body`: non-empty, ≤ 2000 chars
4. `createMessage({ conversationId, senderId: session.user.id, body })`
5. `revalidatePath(`/messages/${conversationId}`)` (non-realtime fallback)
6. Return `{ ok: true }`

**Side effect on page load:** `markConversationRead(conversationId, session.user.id)` — sets `read_at` on all messages sent by the other party.

---

### 6. Messages Layout (`/messages/layout.tsx`)

**Auth:** `requireUser(...)` — any signed-in user with a role

Two-column shell at `lg:`:
- Left sidebar: role-conditional tab nav ("Requests" + "Conversations"), conversation/request list
- Right: `{children}`

Fetches `listConversationsForUser` for sidebar list. Sidebar items show last message snippet + unread dot.

---

### 7. Navigation Badge

**File modified:** `src/components/ui/nav-bar.tsx`

"Messages" nav link with a pink `#FF3366` badge:
- CREATOR total = `pendingRequests + unreadMessages`
- MUSICIAN total = `unreadMessages` only (no pending requests to act on)
- Cap at `9+`
- Fetched once in `src/app/layout.tsx` via `getMessagingBadgeCounts(userId, role)`, passed as prop

```tsx
<Link href="/messages/requests" className="relative ...">
  Messages
  {totalCount > 0 && (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3366] text-[9px] font-bold text-white">
      {totalCount > 9 ? "9+" : totalCount}
    </span>
  )}
</Link>
```

---

## Database Schema

### New migration: `supabase/migrations/20260514000000_add_messaging.sql`

```sql
-- conversation_request
CREATE TABLE "conversation_request" (
  id              TEXT PRIMARY KEY,
  musician_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  gig_id          TEXT NOT NULL REFERENCES "gig"(id) ON DELETE CASCADE,
  intro_message   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | DECLINED
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_request_musician_gig UNIQUE (musician_id, gig_id)
);

-- conversation (created only on APPROVED)
CREATE TABLE "conversation" (
  id            TEXT PRIMARY KEY,
  request_id    TEXT NOT NULL UNIQUE REFERENCES "conversation_request"(id) ON DELETE CASCADE,
  musician_id   TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  creator_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  gig_id        TEXT NOT NULL REFERENCES "gig"(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- message
CREATE TABLE "message" (
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL REFERENCES "conversation"(id) ON DELETE CASCADE,
  sender_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  read_at          TIMESTAMPTZ   -- NULL = unread
);

-- Indexes
CREATE INDEX idx_conv_req_musician_id   ON "conversation_request"(musician_id);
CREATE INDEX idx_conv_req_gig_id        ON "conversation_request"(gig_id);
CREATE INDEX idx_conv_req_status        ON "conversation_request"(status);
CREATE INDEX idx_conversation_musician  ON "conversation"(musician_id);
CREATE INDEX idx_conversation_creator   ON "conversation"(creator_id);
CREATE INDEX idx_conversation_updated   ON "conversation"(updated_at DESC);
CREATE INDEX idx_message_conversation   ON "message"(conversation_id);
CREATE INDEX idx_message_created        ON "message"(created_at ASC);
CREATE INDEX idx_message_unread         ON "message"(read_at) WHERE read_at IS NULL;

-- Enable Supabase Realtime for live message delivery
ALTER PUBLICATION supabase_realtime ADD TABLE "message";
```

---

## API Service Layer

### New files in `src/lib/api/`

**`requests.ts`**
```ts
getConversationRequest(id): Promise<ConversationRequest | null>
getRequestByMusicianAndGig(musicianId, gigId): Promise<ConversationRequest | null>
listPendingRequestsForCreator(creatorId): Promise<ConversationRequest[]>  // joins musician + gig
listRequestsByMusician(musicianId): Promise<ConversationRequest[]>        // joins gig
createConversationRequest(input: CreateRequestInput): Promise<ConversationRequest>
approveConversationRequest(requestId): Promise<ConversationRequest>
declineConversationRequest(requestId): Promise<ConversationRequest>
countPendingRequestsForCreator(creatorId): Promise<number>
```

**`conversations.ts`**
```ts
createConversation(requestId, musicianId, creatorId, gigId): Promise<Conversation>
getConversation(id): Promise<Conversation | null>          // joins otherParty + gig
getConversationByRequest(requestId): Promise<Conversation | null>
listConversationsForUser(userId): Promise<Conversation[]>  // lastMessage + unreadCount
countUnreadMessagesForUser(userId): Promise<number>
```

**`messages.ts`**
```ts
listMessages(conversationId): Promise<Message[]>           // oldest-first
createMessage(input: CreateMessageInput): Promise<Message>
markConversationRead(conversationId, readerId): Promise<void>
```

**`messaging-badge.ts`**
```ts
getMessagingBadgeCounts(userId, role): Promise<{ pendingRequests: number; unreadMessages: number }>
```

### New types in `src/lib/api/types.ts`

```ts
type ConversationRequestStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

interface ConversationRequest {
  id: string; musicianId: string; gigId: string;
  introMessage: string; status: ConversationRequestStatus;
  createdAt: string; updatedAt: string;
  musician?: { id: string; name: string | null; email: string; image: string | null };
  musicianProfile?: { displayName: string; bio: string | null; location: string | null; instruments: string[]; genres: string[] } | null;
  gig?: { id: string; title: string; projectType: string; status: string };
}

interface Conversation {
  id: string; requestId: string; musicianId: string; creatorId: string; gigId: string;
  createdAt: string; updatedAt: string;
  otherParty?: { id: string; name: string | null; email: string; image: string | null };
  gig?: { id: string; title: string; projectType: string };
  lastMessage?: { body: string; createdAt: string; senderId: string } | null;
  unreadCount?: number;
}

interface Message {
  id: string; conversationId: string; senderId: string;
  body: string; createdAt: string; readAt: string | null;
}

interface CreateRequestInput { musicianId: string; gigId: string; introMessage: string; }
interface CreateMessageInput { conversationId: string; senderId: string; body: string; }
```

---

## Frontend Route Tree

```
src/app/
├── gigs/
│   └── [id]/
│       ├── page.tsx                    MODIFY — conditional request CTA in aside
│       └── request/
│           ├── page.tsx                Server — requireRole("MUSICIAN"), guard states
│           ├── actions.ts              submitRequestAction
│           └── _request-form.tsx       Client — useActionState, 600-char counter
│
└── messages/
    ├── layout.tsx                      Server — requireUser, two-column shell
    ├── page.tsx                        Server — redirect by role
    ├── requests/
    │   ├── page.tsx                    Server — role-branched view
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── _ui.tsx                     CreatorInboxView + MusicianRequestsView subcomponents
    │   └── [requestId]/
    │       ├── page.tsx                Server — requireRole("CREATOR"), detail view
    │       ├── loading.tsx
    │       ├── error.tsx
    │       ├── actions.ts              approveRequestAction, declineRequestAction
    │       └── _action-buttons.tsx     Client — useFormStatus pending states
    └── [conversationId]/
        ├── page.tsx                    Server — load conversation + messages + markRead
        ├── loading.tsx
        ├── error.tsx
        ├── actions.ts                  sendMessageAction, markReadAction
        ├── _message-list.tsx           Client — Supabase Realtime subscriber
        └── _compose-bar.tsx            Client — useActionState
```

---

## Realtime Architecture

`_message-list.tsx` subscribes via `createSupabaseBrowserClient()`:

```ts
const channel = supabase
  .channel(`messages:${conversationId}`)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "message",
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    const msg = normalizeMessage(payload.new);
    setMessages(prev =>
      prev.find(m => m.id === msg.id) ? prev : [...prev, msg]
    );
  })
  .subscribe();

return () => supabase.removeChannel(channel);
```

De-duplication (`find` before append) handles the race between `revalidatePath` re-render and the Realtime push arriving for the sender's own message.

---

## Edge Cases and Guards

| Case | Handling |
|---|---|
| Duplicate request | DB `UNIQUE(musician_id, gig_id)` + pre-check in action + UI "already requested" state (3 layers) |
| Request on closed gig | Action guard + page renders notice without form |
| Musician requests own gig | Impossible by role model; assert `gig.creatorId !== session.user.id` in action for safety |
| Double-click Approve | `UNIQUE(request_id)` on conversation → catch `23505`, redirect to existing conversation |
| Unauthorized conversation access | Page + `sendMessageAction` both assert participant membership |
| Creator visiting `/gigs/[id]/request` | `requireRole("MUSICIAN")` redirects to `/` |
| MUSICIAN visiting `/messages/requests/[requestId]` | `requireRole("CREATOR")` redirects |
| Request already processed (approve/decline page) | Show read-only state, hide action buttons |

---

## Loading / Empty / Error States

| Route | Loading | Empty | Error |
|---|---|---|---|
| `/gigs/[id]/request` | Skeleton form card | N/A (guards render notice cards) | `error.tsx` |
| `/messages/requests` | 3 skeleton request cards | Role-specific EmptyState with CTA | `error.tsx` |
| `/messages/requests/[id]` | Two-panel skeleton | N/A | `error.tsx` |
| `/messages/[id]` | Message bubble skeletons | "No messages yet. Say hello!" | `error.tsx` |

---

## Implementation Sequence

1. DB migration + new types in `types.ts`
2. Service layer: `requests.ts`, `conversations.ts`, `messages.ts`, `messaging-badge.ts`
3. Modify `gigs/[id]/page.tsx` — conditional CTA
4. `/gigs/[id]/request/` route (musician submission)
5. `/messages/layout.tsx` (shared shell)
6. `/messages/requests/` routes (creator inbox + musician status)
7. `/messages/requests/[requestId]/` route (detail + approve/decline)
8. `/messages/[conversationId]/` route (thread + Realtime)
9. Nav badge: `messaging-badge.ts` → `layout.tsx` → `nav-bar.tsx` + `_user-menu.tsx`
10. All `loading.tsx` + `error.tsx` files
11. `npm run lint && npm run build`

---

## Files to Create

- `supabase/migrations/20260514000000_add_messaging.sql`
- `src/lib/api/requests.ts`
- `src/lib/api/conversations.ts`
- `src/lib/api/messages.ts`
- `src/lib/api/messaging-badge.ts`
- `src/app/gigs/[id]/request/page.tsx`
- `src/app/gigs/[id]/request/actions.ts`
- `src/app/gigs/[id]/request/_request-form.tsx`
- `src/app/messages/layout.tsx`
- `src/app/messages/page.tsx`
- `src/app/messages/requests/page.tsx`
- `src/app/messages/requests/loading.tsx`
- `src/app/messages/requests/error.tsx`
- `src/app/messages/requests/_ui.tsx`
- `src/app/messages/requests/[requestId]/page.tsx`
- `src/app/messages/requests/[requestId]/loading.tsx`
- `src/app/messages/requests/[requestId]/error.tsx`
- `src/app/messages/requests/[requestId]/actions.ts`
- `src/app/messages/requests/[requestId]/_action-buttons.tsx`
- `src/app/messages/[conversationId]/page.tsx`
- `src/app/messages/[conversationId]/loading.tsx`
- `src/app/messages/[conversationId]/error.tsx`
- `src/app/messages/[conversationId]/actions.ts`
- `src/app/messages/[conversationId]/_message-list.tsx`
- `src/app/messages/[conversationId]/_compose-bar.tsx`

## Files to Modify

- `src/lib/api/types.ts` — new interfaces
- `src/app/gigs/[id]/page.tsx` — conditional request CTA
- `src/app/layout.tsx` — fetch badge counts, pass to NavBar
- `src/components/ui/nav-bar.tsx` — Messages link + badge
- `src/components/ui/_user-menu.tsx` — Messages link in mobile dropdown
