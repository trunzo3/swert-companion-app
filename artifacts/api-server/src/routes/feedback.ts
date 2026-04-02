import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { feedbackTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { SaveFeedbackBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feedback", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const rows = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.participantId, participantId))
    .orderBy(desc(feedbackTable.updatedAt))
    .limit(1);

  if (rows.length === 0) {
    res.json({ id: 0, content: "", updatedAt: new Date().toISOString() });
    return;
  }

  res.json(rows[0]);
});

router.put("/feedback", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const bodyResult = SaveFeedbackBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { content } = bodyResult.data;

  const [feedback] = await db
    .insert(feedbackTable)
    .values({ participantId, content })
    .returning();

  res.json(feedback);
});

export default router;
