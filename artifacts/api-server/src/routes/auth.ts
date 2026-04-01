import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { participantsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const result = LoginBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { email } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const existing = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    const [participant] = await db
      .update(participantsTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(participantsTable.id, existing[0].id))
      .returning();

    req.session!.participantId = participant.id;
    res.json({ participant, isNew: false });
    return;
  }

  const [participant] = await db
    .insert(participantsTable)
    .values({ email: normalizedEmail })
    .returning();

  req.session!.participantId = participant.id;
  res.json({ participant, isNew: true });
});

router.get("/auth/me", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [participant] = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.id, participantId))
    .limit(1);

  if (!participant) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(participant);
});

router.post("/auth/logout", (req, res) => {
  req.session = null;
  res.json({ success: true });
});

export default router;
