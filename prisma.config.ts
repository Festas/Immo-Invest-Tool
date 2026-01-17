// prisma.config.ts
import { defineConfig } from "prisma/config";

// During Docker build, DATABASE_URL is set via Dockerfile ENV.
// At runtime, DATABASE_URL is provided by docker-compose environment.
// For local development, DATABASE_URL should be set via .env file (loaded by Next.js).
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://build:build@localhost:5432/build?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
