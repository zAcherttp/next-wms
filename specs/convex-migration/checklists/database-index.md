# Checklist: Database Index Requirements

**Purpose**: Validate requirements quality for the member table compound index fix  
**Created**: 2025-11-30  
**Domain**: Database / Convex Schema

---

## Requirement Completeness

- [x] CHK001 - Is the index field order explicitly specified? [Completeness] `[organizationId, userId]` ✅
- [x] CHK002 - Is the index naming convention documented? [Completeness] `organizationId_userId` follows pattern ✅
- [x] CHK003 - Are the affected query patterns identified? [Completeness] `adapter:findOne` query on member table ✅

---

## Requirement Clarity

- [x] CHK004 - Is the separation between generated and manual schema changes clear? [Clarity] ✅
  - `generatedSchema.ts` - auto-generated, do not edit
  - `schema.ts` - manual extensions, imports and extends tables
- [x] CHK005 - Is the regeneration command documented in generated file? [Clarity] ✅
  - `npx @better-auth/cli generate --output ./convex/betterAuth/generatedSchema.ts -y`

---

## Implementation Verification

- [x] CHK006 - Does the schema file import tables from the correct generated file? [Consistency]
  - Imports from `./generatedSchema` ✅
- [x] CHK007 - Is the compound index correctly extending the base table definition? [Correctness]
  - Uses `tables.member.index(...)` pattern ✅
- [x] CHK008 - Does the schema use proper Convex index syntax? [Correctness]
  - `.index("organizationId_userId", ["organizationId", "userId"])` ✅

---

## Deployment Consideration

- [ ] CHK009 - Is Convex schema deployment required after this change? [Gap]
  - Run `npx convex dev` or `npx convex deploy` to apply index
- [ ] CHK010 - Has the warning been verified as resolved after deployment? [Validation]
  - Check Convex logs for absence of index warning on `member` table

---

## Summary

| Category | Status |
|----------|--------|
| Completeness | ✅ All requirements present |
| Clarity | ✅ Separation documented |
| Implementation | ✅ Correctly implemented |
| Deployment | ⏳ Pending verification |

**Files Changed**:

- `packages/backend/convex/betterAuth/generatedSchema.ts` - Renamed from `schema.ts` (auto-generated)
- `packages/backend/convex/betterAuth/schema.ts` - New manual extension file with compound index
