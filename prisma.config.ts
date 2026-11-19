import { definePrismaConfig } from "prisma/config";
import { defineConfig as mysqlConfig } from "@prisma/orm-mysql/config";

export default definePrismaConfig({
  orm: mysqlConfig({
    contract: "prisma/schema.prisma",
    db: {
      connection: process.env["DATABASE_URL"]!,
    },
    migrations: {
      dir: "prisma/migrations",
    },
  }),
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
