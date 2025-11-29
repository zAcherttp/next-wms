import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  member: ["invite", "kick"],
} as const;
// as const so typescript can infer the type correctly

export const ac = createAccessControl(statement);
