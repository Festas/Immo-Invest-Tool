// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

// During Docker build, DATABASE_URL is not available.
// prisma generate only needs to know the provider (postgresql) to generate the client.
// The actual connection URL is provided at runtime via docker-compose environment.
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
