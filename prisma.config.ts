// Prisma 7 Configuration File
// This file is REQUIRED by Prisma 7 - it defines the datasource configuration
// that was previously in schema.prisma's datasource.url property.
// Do NOT remove this file - Prisma 7 CLI commands (migrate, generate, etc.) will fail without it.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
