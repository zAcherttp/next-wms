# Tasks: Roles & Permissions System

**Input**: User use cases UC01-08, UC01-10, UC01-12, UC01-13, UC01-14  
**Prerequisites**: Better Auth organization plugin with dynamic access control  
**Branch**: `convex-migration`

**Tests**: Tests are NOT explicitly requested - implementation tasks only.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story reference (US1 = UC01-08, US2 = UC01-10, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/web/src/`
- **Backend**: `packages/backend/`
- **Settings Routes**: `apps/web/src/app/(protected)/[workspace]/(settings)/settings/`

---

## Phase 1: Setup & Foundational

**Purpose**: Configure Better Auth dynamic access control and create shared components

- [x] T001 [P] Define comprehensive permission statements in packages/backend/lib/permissions.ts
- [x] T002 [P] Create base roles (owner, admin, member) with permissions in packages/backend/lib/permissions.ts
- [x] T003 Enable dynamic access control in Better Auth config in packages/backend/convex/auth.ts
- [x] T004 [P] Update auth client with dynamic access control enabled in apps/web/src/lib/auth-client.ts
- [ ] T005 Run Better Auth migration for organizationRole table via CLI
- [x] T006 [P] Create permission check hook useHasPermission in apps/web/src/hooks/use-has-permission.ts
- [x] T007 [P] Create PermissionGate component for conditional rendering in apps/web/src/components/permission-gate.tsx

**Checkpoint**: Dynamic access control enabled, permission utilities ready ✅

---

## Phase 2: Settings Navigation & Visibility (UC01-08) [US1]

**Goal**: Users only see settings their role permits

**Independent Test**: Login as different roles (owner/admin/member); verify each sees only permitted settings in sidebar

- [x] T008 [US1] Create permission mapping for settings routes in apps/web/src/lib/settings-permissions.ts
- [x] T009 [US1] Update SettingsSidebar to filter items by permission in apps/web/src/components/settings-sidebar.tsx
- [x] T010 [US1] Add useActiveMemberRole hook usage for role-based filtering in apps/web/src/components/settings-sidebar.tsx
- [x] T011 [US1] Create route guard middleware for settings pages in apps/web/src/app/(protected)/[workspace]/(settings)/settings/layout.tsx

**Checkpoint**: Settings sidebar shows role-appropriate items ✅

---

## Phase 3: Profile Management (UC01-08 continued) [US1]

**Goal**: User can manage their profile from settings/profile route

**Independent Test**: Navigate to profile settings; update name, avatar; verify changes persist

- [x] T012 [P] [US1] Create ProfileForm component with name/image fields in apps/web/src/components/settings/profile-form.tsx
- [x] T013 [P] [US1] Create AvatarUploadField component for profile picture in apps/web/src/components/settings/avatar-upload-field.tsx
- [x] T014 [US1] Implement profile update API integration using Better Auth in apps/web/src/components/settings/profile-form.tsx
- [x] T015 [US1] Build profile page with ProfileForm component in apps/web/src/app/(protected)/[workspace]/(settings)/settings/profile/page.tsx
- [x] T016 [US1] Add workspace membership display section in apps/web/src/app/(protected)/[workspace]/(settings)/settings/profile/page.tsx

**Checkpoint**: Profile management fully functional ✅

---

## Phase 4: Invite Users to Workspace (UC01-10) [US2]

**Goal**: Users with permission can invite members via email, with onboarding flow

**Independent Test**: As admin/owner, invite user by email; check email received; click link; complete onboarding

- [x] T017 [P] [US2] Create InviteUserDialog component in apps/web/src/components/settings/invite-user-dialog.tsx
- [x] T018 [P] [US2] Create InviteUserForm with email and role selection in apps/web/src/components/settings/invite-user-form.tsx
- [x] T019 [US2] Configure sendInvitationEmail in Better Auth config in packages/backend/convex/auth.ts
- [x] T020 [P] [US2] Create invitation email template in packages/backend/email/templates/organization-invite.tsx
- [x] T021 [US2] Create accept-invitation page in apps/web/src/app/auth/accept-invitation/[id]/page.tsx
- [x] T022 [US2] Add invitation handling to onboarding flow in apps/web/src/app/auth/onboarding/page.tsx
- [x] T023 [US2] Add Invite button with PermissionGate to admin page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/page.tsx

**Checkpoint**: Invitation flow complete with email and onboarding ✅

---

## Phase 5: Manage Users (UC01-12) [US3]

**Goal**: Admin/owner can view members, kick users, change roles

**Independent Test**: As owner, view members list; change a member's role; remove a member; verify changes

- [x] T024 [P] [US3] Create MembersTable component with columns in apps/web/src/components/settings/members-table.tsx
- [x] T025 [P] [US3] Create MemberActions dropdown (kick, change role) in apps/web/src/components/settings/member-actions.tsx
- [x] T026 [P] [US3] Create ChangeRoleDialog component in apps/web/src/components/settings/change-role-dialog.tsx
- [x] T027 [P] [US3] Create KickMemberDialog confirmation component in apps/web/src/components/settings/kick-member-dialog.tsx
- [x] T028 [US3] Implement member list fetching with useListMembers in apps/web/src/components/settings/members-table.tsx
- [x] T029 [US3] Implement updateMemberRole API integration in apps/web/src/components/settings/change-role-dialog.tsx
- [x] T030 [US3] Implement removeMember API integration in apps/web/src/components/settings/kick-member-dialog.tsx
- [x] T031 [US3] Create members settings page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/members/page.tsx
- [x] T032 [US3] Add Members section link to admin page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/page.tsx

**Checkpoint**: Member management fully functional ✅

---

## Phase 6: Manage Roles - Dynamic Access Control (UC01-13) [US4]

**Goal**: Admin/owner can create, edit, delete custom roles with permissions (Discord-style UI)

**Independent Test**: Create custom role by copying from existing role; toggle permissions; edit permissions; delete role; verify all changes persist

**UX Pattern**: Discord-style role management

- When creating a new role, user can select an existing role to copy permissions as base
- Permissions displayed as categorized toggle switches (not checkboxes)
- Each category (Organization, Member, etc.) is collapsible
- Some permissions grouped (e.g., "Manage" = create+read+update+delete)

- [x] T033 [P] [US4] Create RolesTable component listing all roles in apps/web/src/components/settings/roles-table.tsx
- [x] T034 [P] [US4] Create CreateRoleDialog with name, base role selector, and permissions in apps/web/src/components/settings/create-role-dialog.tsx
- [x] T035 [P] [US4] Create EditRoleDialog for modifying role permissions in apps/web/src/components/settings/edit-role-dialog.tsx
- [x] T036 [P] [US4] Create DeleteRoleDialog confirmation in apps/web/src/components/settings/delete-role-dialog.tsx
- [x] T037 [P] [US4] Create PermissionToggleGroup component (categorized toggles) in apps/web/src/components/settings/permission-toggle-group.tsx
- [x] T037b [P] [US4] Create RoleBaseSelector dropdown for copying permissions in apps/web/src/components/settings/role-base-selector.tsx
- [x] T038 [US4] Implement listRoles API integration in apps/web/src/components/settings/roles-table.tsx
- [x] T039 [US4] Implement createRole API integration in apps/web/src/components/settings/create-role-dialog.tsx
- [x] T040 [US4] Implement updateRole API integration in apps/web/src/components/settings/edit-role-dialog.tsx
- [x] T041 [US4] Implement deleteRole API integration in apps/web/src/components/settings/delete-role-dialog.tsx
- [x] T042 [US4] Create roles settings page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/roles/page.tsx
- [x] T043 [US4] Add Roles section link to admin page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/page.tsx

**Checkpoint**: Custom role management with dynamic access control ✅

---

## Phase 7: Assign Roles to Users (UC01-14) [US5]

**Goal**: Assign/change roles for workspace members from dedicated screen

**Independent Test**: Navigate to role assignment; assign custom role to member; verify role appears in members list

- [x] T044 [P] [US5] Create RoleAssignmentTable component in apps/web/src/components/settings/role-assignment-table.tsx
- [x] T045 [P] [US5] Create RoleAssignmentDropdown for each member in apps/web/src/components/settings/role-assignment-dropdown.tsx
- [x] T046 [US5] Implement bulk role assignment API integration in apps/web/src/components/settings/role-assignment-table.tsx
- [x] T047 [US5] Create role assignment page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/assignments/page.tsx
- [x] T048 [US5] Add Role Assignments link to admin page in apps/web/src/app/(protected)/[workspace]/(settings)/settings/admin/page.tsx

**Checkpoint**: Role assignment to members complete ✅

---

## Phase 8: Polish & Integration

**Purpose**: Update sidebar navigation, cleanup, and validation

- [x] T049 [P] Update settings-sidebar navigation items with correct URLs in apps/web/src/components/settings-sidebar.tsx
- [x] T050 [P] Add loading states and skeletons to all settings pages
- [x] T051 [P] Add error boundaries to settings pages in apps/web/src/app/(protected)/[workspace]/(settings)/settings/layout.tsx
- [x] T052 Add optimistic updates to member/role operations
- [x] T053 Verify all permission checks work correctly across roles
- [x] T054 Test complete flow: create role → assign to user → user sees appropriate settings

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup) ──────────────────────────────────┐
    │                                              │
    ▼                                              ▼
Phase 2 (Navigation) ◄─────────────────────── Phase 3 (Profile)
    │                                              
    ▼                                              
Phase 4 (Invitations) ─► Phase 5 (Members) ─► Phase 6 (Roles)
                                                   │
                                                   ▼
                                            Phase 7 (Assignments)
                                                   │
                                                   ▼
                                            Phase 8 (Polish)
```

### Parallel Opportunities per Phase

| Phase | Parallel Tasks |
|-------|----------------|
| 1 | T001, T002, T004, T006, T007 |
| 3 | T012, T013 |
| 4 | T017, T018, T020 |
| 5 | T024, T025, T026, T027 |
| 6 | T033, T034, T035, T036, T037, T037b |
| 7 | T044, T045 |
| 8 | T049, T050, T051 |

---

## User Story Mapping

| Use Case | Story | Tasks | Key Files |
|----------|-------|-------|-----------|
| UC01-08 | US1 | T008-T016 | settings-sidebar.tsx, profile/page.tsx |
| UC01-10 | US2 | T017-T023 | invite-user-dialog.tsx, accept-invitation |
| UC01-12 | US3 | T024-T032 | members-table.tsx, member-actions.tsx |
| UC01-13 | US4 | T033-T043 | roles-table.tsx, permission-selector.tsx |
| UC01-14 | US5 | T044-T048 | role-assignment-table.tsx |

---

## Permission Statement Reference

```typescript
// packages/backend/lib/permissions.ts
const statement = {
  // Organization-level permissions
  organization: ["update", "delete"],
  
  // Member management
  member: ["create", "read", "update", "delete", "invite", "kick"],
  
  // Role management (for dynamic access control)
  role: ["create", "read", "update", "delete"],
  
  // Invitation management
  invitation: ["create", "read", "cancel"],
  
  // Settings access
  settings: ["profile", "security", "admin", "members", "roles"],
  
  // Domain-specific (WMS features)
  inventory: ["create", "read", "update", "delete"],
  warehouse: ["create", "read", "update", "delete"],
  reports: ["view", "export"],
} as const;
```

---

## Permission UI Reference (Discord-style)

### Toggle Layout per Category

```text
┌─────────────────────────────────────────────────────────┐
│ ▼ Organization                                          │
├─────────────────────────────────────────────────────────┤
│   Update workspace settings              [====○    ]    │
│   Delete workspace                       [    ○====]    │
├─────────────────────────────────────────────────────────┤
│ ▼ Members                                               │
├─────────────────────────────────────────────────────────┤
│   Manage members (view, add, edit, remove) [====○    ]  │
│   Invite new members                       [====○    ]  │
│   Kick members                             [    ○====]  │
├─────────────────────────────────────────────────────────┤
│ ▼ Roles                                                 │
├─────────────────────────────────────────────────────────┤
│   Manage roles (create, edit, delete)    [====○    ]    │
│   View roles                             [====○    ]    │
├─────────────────────────────────────────────────────────┤
│ ▼ Inventory (WMS)                                       │
├─────────────────────────────────────────────────────────┤
│   Manage inventory                       [====○    ]    │
│   View inventory                         [====○    ]    │
├─────────────────────────────────────────────────────────┤
│ ▼ Reports                                               │
├─────────────────────────────────────────────────────────┤
│   View reports                           [====○    ]    │
│   Export reports                         [    ○====]    │
└─────────────────────────────────────────────────────────┘
```

### Permission Grouping Strategy

| Display Name | Maps to Permissions |
|--------------|---------------------|
| Manage members | `member: ["create", "read", "update", "delete"]` |
| Invite members | `member: ["invite"]` |
| Kick members | `member: ["kick"]` |
| Manage roles | `role: ["create", "update", "delete"]` |
| View roles | `role: ["read"]` |
| Manage inventory | `inventory: ["create", "read", "update", "delete"]` |
| View inventory | `inventory: ["read"]` |

### Create Role Dialog Flow

1. Enter role name
2. (Optional) Select "Copy permissions from" dropdown → lists existing roles
3. Toggle permissions in categorized sections
4. Save

---

## Success Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Role-based nav visibility | 100% | T053: Test each role sees correct items |
| Invitation delivery | <30s | T023: Time from invite to email received |
| Role CRUD operations | All work | T042: Create/update/delete roles |
| Permission enforcement | No bypass | T053: Verify restricted routes return 403 |

---

## Notes

- Better Auth's dynamic access control stores roles in `organizationRole` table
- Custom roles are org-specific (different orgs can have different custom roles)
- Default roles (owner, admin, member) have predefined permissions
- All settings routes are under `[workspace]/(settings)/settings/`
- Use `PermissionGate` component for UI-level permission checks
- Use `hasPermission` API for server-side permission checks
