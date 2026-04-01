import { pgTable, serial, integer, text, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { participantsTable } from "./participants";

export const workflowMapsTable = pgTable("workflow_maps", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => participantsTable.id),
  name: text("name").notNull(),
  frequency: text("frequency").notNull().default(""),
  currentSteps: json("current_steps").$type<string[]>().notNull().default([]),
  redesignedSteps: json("redesigned_steps").$type<string[]>().notNull().default([]),
  verificationCheckpoints: text("verification_checkpoints").notNull().default(""),
  stopConditions: text("stop_conditions").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkflowMapSchema = createInsertSchema(workflowMapsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkflowMap = z.infer<typeof insertWorkflowMapSchema>;
export type WorkflowMap = typeof workflowMapsTable.$inferSelect;
