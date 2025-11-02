import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  // Neon の事前定義ロール（authenticated, anonymous）を除外
  entities: {
    roles: {
      provider: "neon",
    },
  },
});
