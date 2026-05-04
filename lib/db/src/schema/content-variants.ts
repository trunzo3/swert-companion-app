import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const contentVariantsTable = pgTable("content_variants", {
  id: serial("id").primaryKey(),
  slotKey: text("slot_key").notNull().unique(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
