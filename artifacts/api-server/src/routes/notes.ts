import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { SaveNoteBody, SaveNoteParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notes", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.participantId, participantId));

  res.json(notes);
});

router.get("/notes/:sectionId", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const paramsResult = SaveNoteParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(
      and(
        eq(notesTable.participantId, participantId),
        eq(notesTable.sectionId, paramsResult.data.sectionId)
      )
    );

  res.json(notes);
});

router.put("/notes/:sectionId", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const paramsResult = SaveNoteParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const bodyResult = SaveNoteBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sectionId } = paramsResult.data;
  const { fieldKey, content } = bodyResult.data;

  const existing = await db
    .select()
    .from(notesTable)
    .where(
      and(
        eq(notesTable.participantId, participantId),
        eq(notesTable.sectionId, sectionId),
        eq(notesTable.fieldKey, fieldKey)
      )
    )
    .limit(1);

  let note;
  if (existing.length > 0) {
    [note] = await db
      .update(notesTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(notesTable.id, existing[0].id))
      .returning();
  } else {
    [note] = await db
      .insert(notesTable)
      .values({ participantId, sectionId, fieldKey, content })
      .returning();
  }

  res.json(note);
});

export default router;
