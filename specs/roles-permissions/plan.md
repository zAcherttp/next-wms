# Implementation Plan: Roles & Permissions System

**Branch**: `convex-migration` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a comprehensive roles and permissions system using Better Auth's organization plugin with dynamic access control. The system enables role-based settings visibility, member invitation flow, user management, custom role creation, and role assignment.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18/19  
**Primary Dependencies**: Better Auth, @convex-dev/better-auth, Convex  
**Storage**: Convex (organizationRole table for dynamic roles)  
**Testing**: Manual testing (E2E recommended for future)  
**Target Platform**: Next.js 16 App Router  
**Project Type**: Monorepo (apps/web, packages/backend)

## Project Structure

### Documentation

```text
specs/roles-permissions/
├── spec.md              # Feature specification
├── plan.md              # This file
└── tasks.md             # Task breakdown
```

### Source Code (affected files)

```text
packages/backend/
├── lib/
│   └── permissions.ts           # Permission statements & roles
├── convex/
│   └── auth.ts                  # Better Auth config with DAC
└── email/
    └── templates/
        └── organization-invite.tsx  # Invitation email template

apps/web/src/
├── lib/
│   ├── auth-client.ts           # Updated with DAC
│   └── settings-permissions.ts  # Permission mapping for settings
├── hooks/
│   └── use-has-permission.ts    # Permission check hook
├── components/
│   ├── permission-gate.tsx      # Conditional render by permission
│   ├── settings-sidebar.tsx     # Updated with filtering
│   └── settings/
│       ├── profile-form.tsx
│       ├── avatar-upload-field.tsx
│       ├── invite-user-dialog.tsx
│       ├── invite-user-form.tsx
│       ├── members-table.tsx
│       ├── member-actions.tsx
│       ├── change-role-dialog.tsx
│       ├── kick-member-dialog.tsx
│       ├── roles-table.tsx
│       ├── create-role-dialog.tsx
│       ├── edit-role-dialog.tsx
│       ├── delete-role-dialog.tsx
│       ├── permission-selector.tsx
│       ├── role-assignment-table.tsx
│       └── role-assignment-dropdown.tsx
└── app/(protected)/[workspace]/(settings)/settings/
    ├── layout.tsx               # Route guards
    ├── profile/page.tsx
    └── admin/
        ├── page.tsx
        ├── members/page.tsx
        ├── roles/page.tsx
        └── assignments/page.tsx
```

## Key Integration Points

### 1. Better Auth Dynamic Access Control

```typescript
// packages/backend/convex/auth.ts
organization({
  ac,  // Access control instance
  dynamicAccessControl: {
    enabled: true,
  },
  roles: {
    owner,
    admin,
    member,
  },
})
```

### 2. Client Configuration

```typescript
// apps/web/src/lib/auth-client.ts
organizationClient({
  dynamicAccessControl: {
    enabled: true,
  },
})
```

### 3. Permission Check Hook

```typescript
// Usage example
const { hasPermission, isLoading } = useHasPermission({
  member: ["invite"],
});

if (hasPermission) {
  // Show invite button
}
```

### 4. Permission Gate Component

```typescript
// Usage example
<PermissionGate permissions={{ member: ["invite"] }}>
  <InviteButton />
</PermissionGate>
```

## API Endpoints Used

| Endpoint | Use Case |
|----------|----------|
| `organization.inviteMember` | UC01-10: Send invitation |
| `organization.acceptInvitation` | UC01-10: Accept invite |
| `organization.listMembers` | UC01-12: List members |
| `organization.updateMemberRole` | UC01-12, UC01-14: Change role |
| `organization.removeMember` | UC01-12: Kick member |
| `organization.createRole` | UC01-13: Create custom role |
| `organization.listRoles` | UC01-13: List all roles |
| `organization.updateRole` | UC01-13: Edit role |
| `organization.deleteRole` | UC01-13: Delete role |
| `organization.hasPermission` | Permission checks |

## Implementation Strategy

### Phase 1: Foundation (T001-T007)

1. Define permission statements covering all use cases
2. Create base roles with appropriate permissions
3. Enable dynamic access control on server and client
4. Run migration for `organizationRole` table
5. Create reusable permission utilities

### Phase 2-3: Settings & Profile (T008-T016)

1. Map settings routes to required permissions
2. Filter sidebar navigation by user role
3. Implement profile management UI

### Phase 4-5: Invitations & Members (T017-T032)

1. Implement invitation flow with email
2. Create member management UI
3. Handle role changes and member removal

### Phase 6-7: Roles & Assignment (T033-T048)

1. Implement dynamic role CRUD
2. Create permission selector UI
3. Build role assignment interface

### Phase 8: Polish (T049-T054)

1. Update navigation with correct URLs
2. Add loading states and error handling
3. Comprehensive testing

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Permission bypass | Server-side checks on all protected routes |
| Stale role data | Real-time updates via Convex subscriptions |
| Breaking changes | Incremental rollout by phase |
| Email delivery | Retry logic in email service |

## Success Criteria

1. Role-based settings visibility works correctly
2. Invitation flow completes end-to-end
3. Member management operations succeed
4. Custom roles can be created/edited/deleted
5. No unauthorized access to protected routes
