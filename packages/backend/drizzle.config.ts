import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
config({ path: "../../apps/web/.env.local", quiet: true });

export default defineConfig({
  out: "./auth/migrations",
  schema: "./auth/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL || "",
  },
});
