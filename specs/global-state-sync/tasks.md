# Tasks: Global State Synchronization

**Input**: Design documents from `/specs/global-state-sync/`  
**Prerequisites**: plan.md ✅, spec.md ✅

## Phase 1: TanStack + Convex Infrastructure

**Purpose**: Add TanStack Query with Convex adapter without breaking existing code

- [ ] T001 Install @tanstack/react-query and @convex-dev/react-query in apps/web
- [ ] T002 Create TanStack Query provider with Convex adapter in apps/web/src/providers/query-provider.tsx
- [ ] T003 Add QueryProvider to provider tree in apps/web/src/providers/providers.tsx
- [ ] T004 Migrate app/page.tsx from convex/react useQuery to TanStack convexQuery
- [ ] T005 Migrate email-otp.tsx from convex/react useQuery to TanStack convexQuery

**Checkpoint**: TanStack Query working with Convex, existing functionality preserved

---

## Phase 2: GlobalStateProvider & Store Initialization

**Purpose**: Create single fetch point for Better Auth data, sync to Zustand

- [ ] T006 Create GlobalStateProvider component in apps/web/src/providers/global-state-provider.tsx
- [ ] T007 Add Better Auth hook calls (useSession, useListOrganizations, useActiveOrganization, useActiveMemberRole) to GlobalStateProvider
- [ ] T008 Create data mapping functions (session→user, orgs→tenants, memberRole→membership) in GlobalStateProvider
- [ ] T009 Implement sync effect calling store.initialize() when all data ready
- [ ] T010 Handle loading state (set store status to "loading")
- [ ] T011 Handle error state (set store status to "error")
- [ ] T012 Add GlobalStateProvider to provider tree (after ConvexBetterAuthProvider) in apps/web/src/providers/providers.tsx
- [ ] T013 Create stores/index.ts barrel export in apps/web/src/stores/index.ts

**Checkpoint**: Store initializes on app load, DevTools shows populated state

---

## Phase 3: O(1) Permission Hook Migration

**Purpose**: Replace async API permission checks with O(1) store lookups

- [ ] T014 Update useHasPermission to use Zustand hasPermission instead of organization.hasPermission() in apps/web/src/hooks/use-has-permission.ts
- [ ] T015 Remove async logic from useHasPermission (no more await, no checkPermission effect)
- [ ] T016 Update usePermissions (multi-check) to use Zustand in apps/web/src/hooks/use-has-permission.ts
- [ ] T017 Verify permission-gate.tsx works with updated useHasPermission in apps/web/src/components/permission-gate.tsx
- [ ] T018 Verify settings layout route guard works in apps/web/src/app/(protected)/[workspace]/(settings)/settings/layout.tsx

**Checkpoint**: Permission checks are instant (no network calls)

---

## Phase 4: Component Migration - Remove Direct Better Auth Hooks

**Purpose**: Components use Zustand store instead of Better Auth hooks directly

### Core Navigation

- [ ] T019 Migrate nav-user.tsx: Remove useSession, use useGlobalStore(selectUser) in apps/web/src/components/nav-user.tsx
- [ ] T020 Migrate nav-workspace.tsx: Remove useListOrganizations/useActiveOrganization, use useGlobalStore in apps/web/src/components/nav-workspace.tsx
- [ ] T021 Migrate workspace-sync.tsx: Remove useListOrganizations, use useGlobalStore in apps/web/src/components/workspace-sync.tsx
- [ ] T022 Migrate sign-in.tsx: Remove useSession, use useGlobalStore in apps/web/src/components/sign-in.tsx

### Settings Components

- [ ] T023 Migrate settings-sidebar.tsx: Remove useActiveMemberRole, use O(1 permission filtering in apps/web/src/components/settings-sidebar.tsx
- [ ] T024 Migrate profile-form.tsx: Remove useSession, use useGlobalStore in apps/web/src/components/settings/profile-form.tsx
- [ ] T025 Migrate members-table.tsx: Remove useSession, use useGlobalStore in apps/web/src/components/settings/members-table.tsx
- [ ] T026 Migrate workspace-membership.tsx: Remove useActiveMemberRole/useActiveOrganization in apps/web/src/components/settings/workspace-membership.tsx

### Hooks

- [ ] T027 Migrate use-optimistic-organization.ts: Remove useActiveOrganization, use useGlobalStore in apps/web/src/hooks/use-optimistic-organization.ts

**Checkpoint**: No Better Auth hooks called outside GlobalStateProvider

---

## Phase 5: Convex Server-Side Permission Middleware

**Purpose**: Validate permissions server-side before sensitive mutations

- [ ] T028 Create withPermission middleware wrapper in packages/backend/convex/lib/withPermission.ts
- [ ] T029 Implement permission check logic (get session, lookup member role, check permission) in withPermission
- [ ] T030 Create helper function to get user permissions from member record in packages/backend/convex/lib/permissions.ts
- [ ] T031 Apply withPermission to member management mutations (invite, kick, updateRole) in packages/backend/convex/
- [ ] T032 Apply withPermission to role management mutations (create, update, delete role) in packages/backend/convex/
- [ ] T033 Add error handling for permission denied (consistent error format)

**Checkpoint**: Mutations reject unauthorized requests server-side

---

## Phase 6: Refetch & Sync Controls

**Purpose**: Handle org switches, refetch triggers, and state consistency

- [ ] T034 Add refetch trigger on organization switch in GlobalStateProvider
- [ ] T035 Add refetch function to store actions in apps/web/src/stores/global-store.ts
- [ ] T036 Update useOptimisticOrganization to trigger store refetch after switch in apps/web/src/hooks/use-optimistic-organization.ts
- [ ] T037 Add window focus refetch (optional, configurable) in apps/web/src/providers/global-state-provider.tsx
- [ ] T038 Handle logout: call store.reset() on signOut in apps/web/src/components/nav-user.tsx

**Checkpoint**: Store stays in sync with auth state changes

---

## Phase 7: Cleanup & Verification

**Purpose**: Remove dead code, verify no regressions

- [ ] T039 Audit: grep for direct useSession/useListOrganizations/useActiveOrganization/useActiveMemberRole usage
- [ ] T040 Audit: grep for organization.hasPermission() usage (should be 0)
- [ ] T041 Remove unused imports from auth-client.ts exports if possible
- [ ] T042 Add JSDoc documentation to GlobalStateProvider
- [ ] T043 Add JSDoc documentation to updated useHasPermission
- [ ] T044 Test full flow: login → dashboard → switch org → settings → all admin pages → logout
- [ ] T045 Verify DevTools: check Network tab for API call reduction
- [ ] T046 Verify DevTools: check Zustand store populates correctly

**Checkpoint**: Migration complete, no regressions

---

## Dependencies

```text
Phase 1 (TanStack) ─────────────────────────────────────────────────┐
                                                                    │
Phase 2 (GlobalStateProvider) ──────────────────────────────────────┤
         │                                                          │
         ▼                                                          │
Phase 3 (Permission Hooks) ─────────────────────────────────────────┤
         │                                                          │
         ▼                                                          │
Phase 4 (Component Migration) ──────────────────────────────────────┤
                                                                    │
Phase 5 (Convex Middleware) ◄── Can run parallel with Phase 3-4 ───┤
                                                                    │
Phase 6 (Refetch Controls) ◄── After Phase 2, parallel with 4-5 ───┤
                                                                    │
Phase 7 (Cleanup) ◄── After all phases ─────────────────────────────┘
```

## Parallel Opportunities

- **Phase 1 + Phase 5**: Convex middleware has no frontend dependency
- **Phase 3 + Phase 5**: Permission hook update independent of backend
- **Phase 4 tasks**: Component migrations are independent of each other
- **Phase 6**: Can start after Phase 2, runs parallel with component migration

## Notes

- Keep Better Auth hooks available during migration for fallback
- Each component migration should be tested immediately
- Monitor Network tab to verify API call reduction
- Zustand DevTools useful for debugging store initialization
- Convex middleware must be applied to ALL sensitive mutations
