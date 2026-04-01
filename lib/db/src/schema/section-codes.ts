import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sectionCodesTable = pgTable("section_codes", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull().unique(),
  code: text("code").notNull(),
  codeActive: boolean("code_active").default(true).notNull(),
  cohort: text("cohort"),
});

export const insertSectionCodeSchema = createInsertSchema(sectionCodesTable).omit({ id: true });
export type InsertSectionCode = z.infer<typeof insertSectionCodeSchema>;
export type SectionCode = typeof sectionCodesTable.$inferSelect;
