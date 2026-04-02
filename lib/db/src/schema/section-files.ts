import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sectionFilesTable = pgTable("section_files", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  sectionId: text("section_id").notNull(),
  toolTab: text("tool_tab"),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  fileData: text("file_data").notNull(),
  fileSize: integer("file_size").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertSectionFileSchema = createInsertSchema(sectionFilesTable).omit({ id: true, uploadedAt: true });
export type InsertSectionFile = z.infer<typeof insertSectionFileSchema>;
export type SectionFile = typeof sectionFilesTable.$inferSelect;
