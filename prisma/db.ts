import type { Contract } from "./schema";
import mysql from "@prisma/orm-mysql/runtime";
import { contractFromJson } from "@prisma/orm-mysql/static";
import contractJson from "./schema.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);
export const db = mysql({ contract, url: process.env["DATABASE_URL"]! });
