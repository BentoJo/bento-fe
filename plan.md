# ManeJo Frontend — Build Plan

Kanban/workspace app. Frontend = Next.js 16.2.4, React 19, Tailwind v4, shadcn (radix-vega),
zustand, react-hook-form, zod, next-auth, axios. Auth = OTP / passwordless.

FE talks **only** to `bento-be-gateway` (REST). Gateway fans out to IAM / authz / ws over gRPC.

**Working mode:** one swarm fan-out per phase. Check items as done.
**Scope:** frontend only. Backend needs are logged under "Backend Team Notes".

> ⚠️ Next.js 16 here has breaking changes — read `node_modules/next/dist/docs/` before writing FE code (per `AGENTS.md`).

---

## Legend
- [ ] todo  ·  [x] done  ·  🔒 blocked  ·  🎨 needs Figma screenshot

## Folder conventions (enforce in every phase)
```
app/                         # routes ONLY (thin pages that import feature components)
features/<feature>/
  api/         # server actions / axios calls to the gateway
  validation/  # zod schemas
  types/       # feature-local types
  hooks/       # feature hooks
  components/  # feature UI
  store/       # zustand (if needed)
  utils/
shared/
  components/ui/   # shadcn primitives
  components/      # cross-feature composed components (e.g. form/)
  layout/          # sidebars, topbars, app shells
  lib/             # api client/server, device, auth plumbing, utils
  hooks/           # cross-feature hooks (use-auth)
  types/           # api, auth core, shared
```
Imports use `@/features/...` and `@/shared/...` (`@/*` → repo root). Auth feature UI/actions live in `features/auth`; auth *plumbing* (next-auth config, refresh, server/session, token types) lives in `shared/lib/auth` + `shared/types`.

## Progress log
- **P0 done (verified `next build`):** repo migrated to features/shared; brand tokens; `proxy.ts` (Next 16); env scaffold; resend-otp bug fixed.
- **P1 done:** auth flow extracted into `features/auth/components` (login/register/otp-slots) + `useResendTimer`; routes are thin.
- **P2 mostly done (3-agent fan-out, verified `next build`):** workspace api/types, global home, create modal, workspace dashboard, app shells. Remaining: settings UI + wiring the workspace switcher.
- **Env correction:** gateway global prefix is `api/v1` (not `v1`) and default PORT is 5000 → `NEXT_PUBLIC_API_URL` must be `http://<host>/api`. Gateway wraps responses as `{success,message,data}` → API layer unwraps `.data.data`.
- **P3/P4/settings/teams done (4-agent fan-out, verified `next build`):** roles mgmt, users/members + invite, teams, workspace settings (tabbed), sidebar grouped. Gateway gained a `teams` controller.
- **Stack brought up:** Docker (4 services + 3 db + redis), drizzle push + seed, gateway on :5050.
- **All remaining designed screens are backend-blocked** (boards/kanban/tasks, calendar, profile, sessions, notifications) — gateway exposes none of these yet.

---

## Phase 0 — Foundations *(blocks everything)*
- [x] Migrate to `features/<feat>/{api,validation,types,store,components,hooks}` + `shared/{components,layout,lib,hooks,types}` — all imports rewritten, `tsc --noEmit` + `next build` green
- [x] Update `components.json` shadcn aliases → `@/shared/*`
- [x] Fix dead middleware → Next 16 `proxy.ts` at root (Node runtime, `getToken` guard) ; deleted `proxy/main.proxy.ts`
- [x] Fix `resend-otp` endpoint bug (`/auth/...` → `/v1/auth/...`)
- [x] `.env.local` scaffold (API URL, NEXTAUTH_*, device storage keys)
- [x] 🎨 Brand design tokens in `app/globals.css` (blue scale, dark navy shell, success/warning, blue chart colors, light app theme)
- [ ] Route groups: `app/(auth)/...` and `app/(app)/...` *(deferred — fold in with Phase 2 shell)*
- [ ] 🎨 App shell layout (sidebar + topbar) — two shells: global-home + workspace *(build in Phase 2)*
- [ ] shadcn primitives (dialog, dropdown-menu, avatar, sonner, tabs, card, badge, tooltip, select, switch, scroll-area) *(add just-in-time per feature)*
- [ ] Extend `shared/lib/api/{client,server}` with workspace/member/role wrappers
- [ ] `shared/types` models for workspace, member, role, board, column
- [ ] Global error boundary + loading skeletons + not-found

## Phase 1 — Auth completion *(gate to app)*
Endpoints: `register, login, verify-otp, resend-otp, refresh-token, logout, logout-all`
- [ ] 🎨 **OTP verify page** `app/(auth)/auth/verify-otp` — MISSING (uses `input-otp`)
- [ ] Resend-OTP countdown + rate-limit/error states
- [ ] 🎨 Polish login page to Figma
- [ ] 🎨 Polish register page to Figma
- [ ] Logout-all wired in account menu

## Phase 2 — Workspaces *(core entity)*
Endpoints: `create, :id/overview, :id (get/put/delete), restore, transfer-ownership, :me/workspaces`
- [x] Foundation: `shared/types/workspace.ts`, `ApiEnvelope`, `features/workspace/api/workspace.ts` (unwraps gateway envelope), shadcn primitives
- [x] App shell: `shared/layout/{brand-logo,app-topbar,global-sidebar,global-shell}` + post-auth routing to `/home`
- [x] 🎨 Global home `/home` — Your Workspaces (real), Favorites + Pending Invitations (empty states)
- [x] 🎨 Create workspace modal — name + logo wired; slug/icon/invite disabled ("soon")
- [x] 🎨 Workspace dashboard `/w/[workspaceId]` — real stats + boards preview; progress/schedule/members empty
- [ ] Workspace switcher — currently static (wire to listUserWorkspaces)
- [ ] 🎨 Workspace settings: rename, delete, restore, transfer ownership (API exists, no UI yet)

## Local stack (running)
- 4 backends in Docker on `backend-network` + 3 Postgres + redis. Gateway HTTP on **:5050** (5000 taken by macOS AirPlay). Schemas via `drizzle-kit push`; authz+ws seeded.
- FE: `cd bento-fe && npm run dev` → http://localhost:3001 (NEXT_PUBLIC_API_URL=http://localhost:5050/api).
- Connectable now: workspaces, members, roles, teams, auth. NOT on gateway: boards/columns/cards, calendar, IAM user/profile, sessions/devices, notifications.

## Phase 3 — Members & invites
Endpoints: `members/invite, invites/accept, invites/reject, members, members/:id, members/:id/role, members/:id (del), members/validate`
- [ ] 🎨 Members list page
- [ ] 🎨 Invite member flow + pending invites
- [ ] 🎨 Accept/reject invite page (deep-link target)
- [ ] 🎨 Change member role / remove member

## Phase 4 — Roles & permissions
Endpoints: `roles, roles/from-authz/:id, roles/:id/permissions, roles/:id (del), members/:userId/role, check-permission`
- [ ] 🎨 Roles list + permissions viewer
- [ ] 🎨 Assign role to member
- [ ] Client-side permission gating helper (`useCan` via check-permission)

## Phase 5 — Boards + Columns (Kanban) 🔒
Board/column logic exists in `bento-be-ws` but **NOT exposed in gateway** — no REST yet.
- [ ] 🔒 BLOCKER: gateway must add board + column REST routes (see Backend Notes)
- [ ] 🎨 Board list within workspace
- [ ] 🎨 Kanban board view (columns + cards)
- [ ] Drag-drop columns + cards (create/edit/move/delete)
- [ ] 🎨 Card detail panel
- [ ] 🎨 Board members

## Phase 6 — Dashboard & polish *(last)*
IAM exposes devices + sessions.
- [ ] 🎨 Real dashboard (workspace/board overview, replace placeholder)
- [ ] 🎨 Profile / account settings
- [ ] 🎨 Sessions & devices page
- [ ] Empty states, responsive pass, a11y pass, final polish

---

## Critical path
`P0 → P1 (verify-otp) → P2 → P3/P4 → P5 (after gateway unblock) → P6`

---

## Backend Team Notes (tell BE team)
1. **Boards/columns not on gateway.** `bento-be-ws` has board, board-members, columns gRPC,
   but `bento-be-gateway` exposes only auth + workspace + members + roles. Need REST controllers
   in gateway for: list/create/get/update/delete board, board members, list/create/reorder columns,
   cards CRUD + move. **Phase 5 is blocked until this lands.**
2. Confirm card/task entity — proto shows board + columns; is there a `card`/`task` proto? If not,
   FE kanban cards have no backend.
3. Confirm OTP flow contract: does `login`/`register` return a challenge id for `verify-otp`,
   or is it email-keyed? FE needs the exact request/response shape.
4. Invite accept/reject: confirm whether invite token comes via email deep-link query param.

### Phase 2 gaps found (workspace)
5. `listUserWorkspaces` lacks: **favorite flag**, **member count**, "last active" — home design shows them.
6. No **"list my pending invitations"** endpoint — home invitations rail can't be wired.
7. No **workspace logo upload** endpoint — create modal only takes a `logoUrl` string.
8. `WorkspaceListItem.roleId` is an id; FE needs a **role name** (or include it) to show role badges.
9. `getWorkspaceOverview` has no **ownerId**/role name, and no **weekly-progress / day-schedule / active-members** data — dashboard panels are empty until provided.
10. Gateway global prefix is `api/v1` and default PORT 5000 (FE assumed `/v1` + 3000) — align envs.

---

## Open / needs Figma
All 🎨 items above need a screenshot. See screenshot request list shared separately.
