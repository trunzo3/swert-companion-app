import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const safariWorksheetsTable = pgTable("safari_worksheets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const insertSafariWorksheetSchema = createInsertSchema(safariWorksheetsTable).omit({ id: true });
export type InsertSafariWorksheet = z.infer<typeof insertSafariWorksheetSchema>;
export type SafariWorksheet = typeof safariWorksheetsTable.$inferSelect;
