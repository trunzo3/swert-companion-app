import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { feedbackTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { SaveFeedbackBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feedback", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [existing] = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.participantId, participantId))
    .limit(1);

  if (!existing) {
    res.json({ id: 0, content: "", updatedAt: new Date().toISOString() });
    return;
  }

  res.json(existing);
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

  const existing = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.participantId, participantId))
    .limit(1);

  let feedback;
  if (existing.length > 0) {
    [feedback] = await db
      .update(feedbackTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(feedbackTable.participantId, participantId))
      .returning();
  } else {
    [feedback] = await db
      .insert(feedbackTable)
      .values({ participantId, content })
      .returning();
  }

  res.json(feedback);
});

export default router;
