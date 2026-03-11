# Profile Intents

**Tagline:** Know Your Why, Find Your Who

Users choose **2–5 intents** during profile setup. These are stored in `users.selected_intents` (JSONB array) in Supabase.

## The 5 intents

| Intent       | Description                          |
|-------------|--------------------------------------|
| **Light chat**  | Casual conversation, social chat     |
| **Brainstorm**  | Ideation, creative thinking          |
| **Motivation**  | Encouragement, goals, mindset        |
| **Collaborate** | Working together on projects         |
| **Networking**  | Professional connections, outreach   |

## Where they are used

- **Frontend:** `frontend/hooks/useProfileSetup.ts` → `INTENTS` array; profile page shows these as selectable chips.
- **Backend:** `backend/services/auth-service/src/server.ts` → `validIntents` in `POST /api/auth/profile-setup` validates submitted intents.
- **Database:** `users.selected_intents` (JSONB). Comment updated via migrations under `backend/supabase/migrations/`.

## Changing intents

To add or rename intents:

1. Update `INTENTS` in `frontend/hooks/useProfileSetup.ts`.
2. Update `validIntents` in `backend/services/auth-service/src/server.ts`.
3. Add an icon mapping in `frontend/app/profile/profile.tsx` → `INTENT_ICONS` (and add new icon component if needed).
4. Update this file and the Supabase column comment (new migration or edit existing comment migration).
