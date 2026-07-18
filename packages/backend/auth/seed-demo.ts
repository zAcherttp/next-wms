import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
config({ path: "../../apps/web/.env.local", quiet: true });

const { db } = await import("./db");
const { account, member, organization, user } = await import("./schema");

const DEMO_ORGANIZATION = {
  id: "seed_org_test_warehouse_001",
  name: "Test Warehouse Corp",
  slug: "test-warehouse-corp",
} as const;

const DEMO_USERS = [
  {
    id: "seed_user_admin_002",
    name: "Admin User",
    email: "admin@testwarehouse.com",
    role: "owner",
    wmsRole: "Administrator",
  },
  {
    id: "seed_user_manager_003",
    name: "Warehouse Manager",
    email: "manager@testwarehouse.com",
    role: "admin",
    wmsRole: "Warehouse Manager",
  },
  {
    id: "seed_user_testuser_001",
    name: "Test User",
    email: "testuser@testwarehouse.com",
    role: "member",
    wmsRole: "Viewer",
  },
] as const;

function requireDemoPassword() {
  const password = process.env.DEMO_ACCOUNT_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "DEMO_ACCOUNT_PASSWORD must be set and contain at least 12 characters.",
    );
  }
  return password;
}

async function assertIdentitySlotsAreSafe() {
  const [organizationBySlug] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, DEMO_ORGANIZATION.slug))
    .limit(1);

  if (organizationBySlug && organizationBySlug.id !== DEMO_ORGANIZATION.id) {
    throw new Error(
      `Organization slug ${DEMO_ORGANIZATION.slug} already belongs to another record.`,
    );
  }

  for (const demoUser of DEMO_USERS) {
    const [userByEmail] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, demoUser.email))
      .limit(1);

    if (userByEmail && userByEmail.id !== demoUser.id) {
      throw new Error(
        `Email ${demoUser.email} already belongs to another account.`,
      );
    }
  }
}

async function seedDemoAuth() {
  const passwordHash = await hashPassword(requireDemoPassword());
  const now = new Date();

  await assertIdentitySlotsAreSafe();

  await db
    .insert(organization)
    .values({
      ...DEMO_ORGANIZATION,
      createdAt: now,
      metadata: JSON.stringify({ demo: true, immutable: true }),
    })
    .onConflictDoUpdate({
      target: organization.id,
      set: {
        name: DEMO_ORGANIZATION.name,
        slug: DEMO_ORGANIZATION.slug,
        metadata: JSON.stringify({ demo: true, immutable: true }),
      },
    });

  for (const demoUser of DEMO_USERS) {
    await db
      .insert(user)
      .values({
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: demoUser.name,
          email: demoUser.email,
          emailVerified: true,
          updatedAt: now,
        },
      });

    const [credentialAccount] = await db
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.userId, demoUser.id),
          eq(account.providerId, "credential"),
        ),
      )
      .limit(1);

    if (credentialAccount) {
      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: now })
        .where(eq(account.id, credentialAccount.id));
    } else {
      await db.insert(account).values({
        id: `demo-credential-${demoUser.id}`,
        accountId: demoUser.id,
        providerId: "credential",
        userId: demoUser.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [existingMembership] = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.organizationId, DEMO_ORGANIZATION.id),
          eq(member.userId, demoUser.id),
        ),
      )
      .limit(1);

    if (existingMembership) {
      await db
        .update(member)
        .set({ role: demoUser.role })
        .where(eq(member.id, existingMembership.id));
    } else {
      await db.insert(member).values({
        id: `demo-member-${demoUser.id}`,
        organizationId: DEMO_ORGANIZATION.id,
        userId: demoUser.id,
        role: demoUser.role,
        createdAt: now,
      });
    }
  }

  console.table(
    DEMO_USERS.map(({ email, role, wmsRole }) => ({ email, role, wmsRole })),
  );
  console.log("Demo auth initialized. Password value was not printed.");
}

seedDemoAuth().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
