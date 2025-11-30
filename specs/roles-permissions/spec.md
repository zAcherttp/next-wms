# Feature Specification: Roles & Permissions System

**Date**: 2025-11-30  
**Branch**: `convex-migration`  
**Status**: Draft

## Summary

Implement a comprehensive roles and permissions system for the workspace management application. This includes role-based settings visibility, user invitations, member management, custom role creation using Better Auth's dynamic access control, and role assignment capabilities.

## Use Cases

### UC01-08: Manage User Profile

**Priority**: P1  
**Route**: `settings/profile`

Users can view and edit their personal profile within the workspace. The settings navigation shows only items their role permits access to.

**Acceptance Criteria**:

- User can update their name and avatar
- User sees only settings items permitted by their role
- Profile changes persist across sessions
- Workspace membership information is displayed

### UC01-10: Invite User to Workspace

**Priority**: P1  
**Route**: `settings/admin`

Users with sufficient permissions (admin/owner) can invite new members to the workspace via email. Invited users receive an email with a link that, when clicked, accepts the invitation and opens the onboarding screen.

**Acceptance Criteria**:

- Admin/owner can open invite dialog
- Email field with validation
- Role selection for new member (member, admin)
- Invitation email is sent within 30 seconds
- Clicking link in email accepts invitation
- User is redirected to onboarding flow
- Member role cannot invite users

### UC01-12: Manage Users

**Priority**: P1  
**Route**: `settings/admin/members`

Admin/owner roles can view all workspace members, change their roles, and remove members from the workspace.

**Acceptance Criteria**:

- List all members with name, email, role, join date
- Admin/owner can change member roles
- Admin/owner can remove (kick) members
- Owner cannot be kicked
- Confirmation dialogs for destructive actions
- Member role cannot access this page

### UC01-13: Manage Roles

**Priority**: P2  
**Route**: `settings/admin/roles`

Implement Better Auth dynamic access control to allow admin/owner roles to create, edit, and delete custom roles with specific permissions.

**Acceptance Criteria**:

- List all roles (default + custom)
- Create new role with name and permissions
- Edit existing custom role permissions
- Delete custom roles (not default roles)
- Permission selector shows all available permissions
- Roles are organization-specific

### UC01-14: Assign Roles to Users

**Priority**: P2  
**Route**: `settings/admin/assignments`

Provide a dedicated screen for assigning roles to workspace members.

**Acceptance Criteria**:

- List all members with current role(s)
- Dropdown to select role for each member
- Support for multiple roles per user
- Changes take effect immediately
- Audit trail of role changes (future enhancement)

## Technical Requirements

### Backend Requirements

1. **Better Auth Dynamic Access Control**
   - Enable `dynamicAccessControl: { enabled: true }` in organization plugin
   - Define comprehensive permission statements
   - Create base roles with default permissions
   - Run migrations for `organizationRole` table

2. **Invitation Email**
   - Configure `sendInvitationEmail` in Better Auth
   - Create email template for organization invites
   - Include invitation link with ID

3. **Permission Enforcement**
   - Server-side permission checks on all admin routes
   - API-level validation using `hasPermission`

### Frontend Requirements

1. **Permission Utilities**
   - `useHasPermission` hook for client-side checks
   - `PermissionGate` component for conditional rendering
   - Integration with `useActiveMemberRole`

2. **Settings Navigation**
   - Dynamic filtering based on user permissions
   - Route guards for unauthorized access

3. **UI Components**
   - Profile management form
   - Invite user dialog
   - Members table with actions
   - Roles table with CRUD
   - Permission selector grid
   - Role assignment interface

## Routes Structure

```text
settings/
├── page.tsx                    # Settings home (redirects to profile)
├── profile/
│   └── page.tsx               # UC01-08: Profile management
├── preferences/
│   └── page.tsx               # User preferences
├── security/
│   └── page.tsx               # Security settings
└── admin/
    ├── page.tsx               # Admin overview
    ├── members/
    │   └── page.tsx           # UC01-12: Member management
    ├── roles/
    │   └── page.tsx           # UC01-13: Role management
    └── assignments/
        └── page.tsx           # UC01-14: Role assignment
```

## Data Model

### Permission Statement

```typescript
const statement = {
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete", "invite", "kick"],
  role: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
  settings: ["profile", "security", "admin", "members", "roles"],
} as const;
```

### Default Roles

| Role | Permissions |
|------|-------------|
| owner | All permissions |
| admin | All except organization.delete, member.kick (owner) |
| member | settings.profile, settings.security, member.read |

## Dependencies

- Better Auth organization plugin
- Better Auth dynamic access control
- @convex-dev/better-auth
- Convex for data storage
- React Email for templates
- Resend for email delivery

## Success Metrics

| Metric | Target |
|--------|--------|
| Role-based visibility | 100% accurate |
| Invitation delivery | < 30 seconds |
| Permission enforcement | No unauthorized access |
| Custom role operations | Full CRUD support |

## Out of Scope

- Team management (future enhancement)
- Permission audit logging (future enhancement)
- Bulk member import
- SSO/SAML integration
