# Tasks: Convex API Call Optimization

**Input**: Design documents from `/specs/convex-migration/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are NOT explicitly requested - implementation tasks only.

**Organization**: Tasks grouped by optimization area (middleware caching, optimistic updates, prefetching) since this is an optimization feature rather than user-story-driven.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which optimization area this task belongs to (MW = Middleware, OPT = Optimistic, PRE = Prefetch)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/web/src/`
- **Backend**: `packages/backend/convex/`

---

## Phase 1: Setup

**Purpose**: Create new files and utilities needed for optimizations

- [x] T001 [P] Create middleware cache utility file in apps/web/src/lib/middleware-cache.ts
- [x] T002 [P] Create optimistic organization hook file in apps/web/src/hooks/use-optimistic-organization.ts

---

## Phase 2: Foundational (Cache Utilities)

**Purpose**: Implement core caching logic that other tasks depend on

**⚠️ CRITICAL**: Middleware caching tasks depend on T001 completion

- [x] T003 [MW] Implement cache payload encoding/decoding functions in apps/web/src/lib/middleware-cache.ts
- [x] T004 [MW] Implement getCachedVerification function to read cache from cookies in apps/web/src/lib/middleware-cache.ts
- [x] T005 [MW] Implement createCachePayload function to generate cache data in apps/web/src/lib/middleware-cache.ts
- [x] T006 [MW] Implement isCacheValid function to check TTL expiry in apps/web/src/lib/middleware-cache.ts

**Checkpoint**: Cache utility functions ready for integration ✅

---

## Phase 3: Middleware Caching (Priority: P1) 🎯 MVP

**Goal**: Reduce HTTP action calls by ~80% for repeat page views via cookie-based caching

**Independent Test**: Navigate between protected routes multiple times; verify only first navigation triggers Convex HTTP action, subsequent navigations use cache

### Implementation for Middleware Caching

- [x] T007 [MW] Update verifyAccess HTTP action to include cache headers in response in packages/backend/convex/middleware.ts
- [x] T008 [MW] Add cache hit detection at start of proxy function in apps/web/src/proxy.ts
- [x] T009 [MW] Integrate getCachedVerification call before HTTP fetch in apps/web/src/proxy.ts
- [x] T010 [MW] Add Set-Cookie header with cache payload on successful verification in apps/web/src/proxy.ts
- [x] T011 [MW] Handle cache invalidation on auth errors (clear cache cookie) in apps/web/src/proxy.ts

**Checkpoint**: Middleware caching fully functional - HTTP calls reduced for repeat navigations ✅

---

## Phase 4: Optimistic Organization Switching (Priority: P2)

**Goal**: Instant UI feedback when switching workspaces, with rollback on error

**Independent Test**: Switch workspaces; verify UI updates immediately without waiting for API response; verify rollback on simulated error

### Implementation for Optimistic Updates

- [x] T012 [OPT] Implement useOptimisticOrganization hook state management in apps/web/src/hooks/use-optimistic-organization.ts
- [x] T013 [OPT] Implement switchOrganization function with optimistic update in apps/web/src/hooks/use-optimistic-organization.ts
- [x] T014 [OPT] Implement rollback function for error handling in apps/web/src/hooks/use-optimistic-organization.ts
- [x] T015 [OPT] Integrate useActiveOrganization from Better Auth as fallback in apps/web/src/hooks/use-optimistic-organization.ts
- [x] T016 [OPT] Update WorkspaceSync component to use useOptimisticOrganization in apps/web/src/components/workspace-sync.tsx
- [x] T017 [OPT] Remove loading toast, replace with optimistic UI update in apps/web/src/components/workspace-sync.tsx
- [x] T018 [OPT] Add error toast with rollback on failed org switch in apps/web/src/components/workspace-sync.tsx

**Checkpoint**: Organization switching feels instant with proper error handling ✅

---

## Phase 5: Prefetching Strategy (Priority: P3)

**Goal**: Prefetch workspace data on hover to reduce perceived load time

**Independent Test**: Hover over workspace in switcher; verify data is prefetched; click workspace and observe faster transition

### Implementation for Prefetching

- [x] T019 [PRE] Create prefetchWorkspaceData utility function in apps/web/src/lib/prefetch.ts
- [x] T020 [PRE] Add onMouseEnter handler to workspace items in nav-workspace.tsx in apps/web/src/components/nav-workspace.tsx
- [x] T021 [PRE] Implement debounced prefetch call on hover in apps/web/src/components/nav-workspace.tsx
- [x] T022 [PRE] Add prefetch priority handling (high/low) in apps/web/src/lib/prefetch.ts

**Checkpoint**: Workspace hover prefetching functional ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, documentation, and validation

- [x] T023 [P] Add JSDoc comments to middleware-cache.ts exports in apps/web/src/lib/middleware-cache.ts
- [x] T024 [P] Add JSDoc comments to use-optimistic-organization.ts exports in apps/web/src/hooks/use-optimistic-organization.ts
- [x] T025 [P] Update quickstart.md with actual implementation details in specs/convex-migration/quickstart.md
- [x] T026 Verify cache invalidation works on logout in apps/web/src/components/nav-user.tsx
- [x] T027 Run full application test: login → navigate → switch org → logout flow
- [x] T028 Measure API call reduction using browser DevTools Network tab

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 (middleware-cache.ts file creation)
- **Middleware Caching (Phase 3)**: Depends on Phase 2 completion (cache utilities)
- **Optimistic Updates (Phase 4)**: Depends on T002 (hook file creation), independent of Phase 3
- **Prefetching (Phase 5)**: Independent of Phases 3-4, can run in parallel
- **Polish (Phase 6)**: Depends on Phases 3-5 completion

### Optimization Area Dependencies

- **Middleware (MW)**: T001 → T003-T006 → T007-T011
- **Optimistic (OPT)**: T002 → T012-T015 → T016-T018
- **Prefetch (PRE)**: T019 → T020-T022 (independent track)

### Parallel Opportunities

After Phase 1 (Setup) completes:

- Phase 3 (Middleware) and Phase 4 (Optimistic) can run in parallel
- Phase 5 (Prefetching) can start independently

---

## Parallel Example: After Setup

```bash
# Launch setup tasks together:
Task: "Create middleware cache utility file in apps/web/src/lib/middleware-cache.ts"
Task: "Create optimistic organization hook file in apps/web/src/hooks/use-optimistic-organization.ts"

# After setup, launch in parallel:
# Track A: Middleware Caching (T003-T011)
# Track B: Optimistic Updates (T012-T018)
# Track C: Prefetching (T019-T022)
```

---

## Implementation Strategy

### MVP First (Middleware Caching Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006)
3. Complete Phase 3: Middleware Caching (T007-T011)
4. **STOP and VALIDATE**: Verify HTTP call reduction
5. Deploy if metrics meet 40% reduction goal

### Full Implementation

1. Complete Setup + Foundational → Foundation ready
2. Complete Middleware Caching → Validate 40%+ reduction (MVP!)
3. Complete Optimistic Updates → Validate instant org switching
4. Complete Prefetching → Validate hover prefetch works
5. Complete Polish → Full validation and documentation

### Incremental Delivery

Each optimization area delivers independent value:

- **Middleware Caching**: Reduces server load, faster repeat navigation
- **Optimistic Updates**: Better perceived performance for org switching
- **Prefetching**: Faster workspace transitions

---

## Success Metrics Validation

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| API call reduction | 40%+ | T028: DevTools Network tab comparison |
| Perceived org switch time | <100ms | T027: Manual testing |
| Bundle size impact | <10KB | Check build output after all tasks |
| Breaking changes | 0 | T027: Full flow test |

---

## Notes

- [P] tasks = different files, no dependencies
- [MW/OPT/PRE] labels map tasks to optimization areas
- Each optimization area should be independently completable
- Commit after each task or logical group
- Stop at any checkpoint to validate optimization area independently
- All changes are additive - existing functionality preserved
