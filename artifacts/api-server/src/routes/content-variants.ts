import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contentVariantsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const VARIANT_SLOTS: Record<string, string> = {
  "closing-quote": "Small things.\nUnlikely places.\nExtraordinary work.",
  "closing-tagline": "You don't have to be first, but you have to be ready.",
  "closing-survey-url": "https://headandheartca.com/close",
  "closing-survey-label": "Complete Workshop Survey",
};

const router: IRouter = Router();

router.get("/content-variants", async (_req, res) => {
  const rows = await db.select().from(contentVariantsTable);
  const result: Record<string, string> = { ...VARIANT_SLOTS };
  for (const row of rows) {
    result[row.slotKey] = row.content;
  }
  res.json(result);
});

router.put("/admin/content-variants", async (req, res) => {
  if (!req.session?.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { slotKey, content } = req.body || {};
  if (typeof slotKey !== "string" || !(slotKey in VARIANT_SLOTS)) {
    res.status(400).json({ error: "Invalid slot key" });
    return;
  }
  if (typeof content !== "string") {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const existing = await db
    .select()
    .from(contentVariantsTable)
    .where(eq(contentVariantsTable.slotKey, slotKey))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(contentVariantsTable).values({ slotKey, content });
  } else {
    await db
      .update(contentVariantsTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(contentVariantsTable.slotKey, slotKey));
  }

  const rows = await db.select().from(contentVariantsTable);
  const result: Record<string, string> = { ...VARIANT_SLOTS };
  for (const row of rows) {
    result[row.slotKey] = row.content;
  }
  res.json(result);
});

export default router;
