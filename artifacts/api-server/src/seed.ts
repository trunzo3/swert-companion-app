/**
 * Idempotent database seed.
 * Called automatically on every server startup (dev and production).
 *
 * Ensures the section_codes table reflects SECTION_CODE_CONFIG exactly.
 * Safe to run multiple times — it upserts, never deletes existing user data.
 */

import { db } from "@workspace/db";
import { sectionCodesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { SECTION_CODE_CONFIG } from "./section-codes-config";
import { logger } from "./lib/logger";

export async function seedDatabase(): Promise<void> {
  logger.info("Running database seed…");

  const existing = await db.select().from(sectionCodesTable);
  const existingMap = new Map(existing.map((r) => [r.sectionId, r]));

  let inserted = 0;
  let updated = 0;

  for (const entry of SECTION_CODE_CONFIG) {
    for (const sectionId of entry.sectionIds) {
      const current = existingMap.get(sectionId);

      if (!current) {
        await db.insert(sectionCodesTable).values({
          sectionId,
          code: entry.code,
          codeActive: true,
        });
        inserted++;
      } else if (current.code !== entry.code || !current.codeActive) {
        await db
          .update(sectionCodesTable)
          .set({ code: entry.code, codeActive: true })
          .where(eq(sectionCodesTable.sectionId, sectionId));
        updated++;
      }
    }
  }

  logger.info({ inserted, updated }, "Database seed complete");
}
