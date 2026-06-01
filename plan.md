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
- [ ] 🎨 Workspace list / switcher (post-auth landing)
- [ ] 🎨 Create workspace (modal)
- [ ] 🎨 Workspace overview/detail page
- [ ] 🎨 Workspace settings: rename, delete, restore, transfer ownership

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

---

## Open / needs Figma
All 🎨 items above need a screenshot. See screenshot request list shared separately.
