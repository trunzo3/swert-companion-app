import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { participantsTable } from "./participants";

export const unlockedSectionsTable = pgTable("unlocked_sections", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => participantsTable.id),
  sectionId: text("section_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertUnlockedSectionSchema = createInsertSchema(unlockedSectionsTable).omit({ id: true, unlockedAt: true });
export type InsertUnlockedSection = z.infer<typeof insertUnlockedSectionSchema>;
export type UnlockedSection = typeof unlockedSectionsTable.$inferSelect;
