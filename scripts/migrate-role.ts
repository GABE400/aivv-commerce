import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Renaming user_role enum value 'supplier' to 'business' in the database...");
  try {
    // This SQL statement renames the enum value dynamically.
    // In PostgreSQL, ALTER TYPE RENAME VALUE is fully supported and safe.
    await db.execute(sql`ALTER TYPE user_role RENAME VALUE 'supplier' TO 'business'`);
    console.log("Enum renamed successfully in PostgreSQL.");
  } catch (error: any) {
    console.warn("Migration warning (it may have already run or table is not in this state):", error.message);
  }
}

main().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
