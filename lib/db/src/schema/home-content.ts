import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const homeContentTable = pgTable("home_content", {
  id: serial("id").primaryKey(),
  content: text("content").notNull().default("Welcome to the SWERT Summit. Enter the codes your facilitator shares to unlock each section. Your notes save automatically."),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
