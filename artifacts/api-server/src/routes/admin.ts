import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  participantsTable,
  sectionCodesTable,
  unlockedSectionsTable,
  notesTable,
  workflowMapsTable,
  feedbackTable,
  safariWorksheetsTable,
} from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";
import {
  AdminLoginBody,
  UpdateSectionCodeBody,
  CreateSafariWorksheetBody,
  UpdateSafariWorksheetBody,
  UpdateSafariWorksheetParams,
  DeleteSafariWorksheetParams,
} from "@workspace/api-zod";
import { ALL_SECTIONS } from "./sections";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.isAdmin) {
    res.status(401).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.post("/admin/login", async (req, res) => {
  const bodyResult = AdminLoginBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "iqmeeteq2026";
  if (bodyResult.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  req.session!.isAdmin = true;
  res.json({ success: true });
});

router.get("/admin/participants", requireAdmin, async (req, res) => {
  const participants = await db.select().from(participantsTable);

  const engagementData = await Promise.all(
    participants.map(async (p) => {
      const [sectionsRow] = await db
        .select({ cnt: count() })
        .from(unlockedSectionsTable)
        .where(eq(unlockedSectionsTable.participantId, p.id));

      const [notesRow] = await db
        .select({ cnt: count() })
        .from(notesTable)
        .where(eq(notesTable.participantId, p.id));

      const [workflowRow] = await db
        .select({ cnt: count() })
        .from(workflowMapsTable)
        .where(eq(workflowMapsTable.participantId, p.id));

      const [feedbackRow] = await db
        .select({ cnt: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.participantId, p.id));

      return {
        id: p.id,
        email: p.email,
        lastLoginAt: p.lastLoginAt,
        createdAt: p.createdAt,
        sectionsOpened: Number(sectionsRow.cnt),
        hasNotes: Number(notesRow.cnt) > 0,
        hasWorkflowMaps: Number(workflowRow.cnt) > 0,
        hasFeedback: Number(feedbackRow.cnt) > 0,
      };
    })
  );

  res.json(engagementData);
});

router.get("/admin/sections", requireAdmin, async (req, res) => {
  const codes = await db.select().from(sectionCodesTable);
  const codeMap = new Map(codes.map((c) => [c.sectionId, c]));

  const sections = ALL_SECTIONS.filter((s) => s.tier === 1).map((s) => {
    const code = codeMap.get(s.id);
    return {
      id: s.id,
      title: s.title,
      code: code?.code ?? "",
      codeActive: code?.codeActive ?? false,
      cohort: code?.cohort ?? null,
      tier: s.tier,
    };
  });

  res.json(sections);
});

router.put("/admin/sections", requireAdmin, async (req, res) => {
  const bodyResult = UpdateSectionCodeBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sectionId, code, codeActive, cohort } = bodyResult.data;

  const existing = await db
    .select()
    .from(sectionCodesTable)
    .where(eq(sectionCodesTable.sectionId, sectionId))
    .limit(1);

  let sectionCode;
  if (existing.length > 0) {
    [sectionCode] = await db
      .update(sectionCodesTable)
      .set({ code: code.toUpperCase(), codeActive, cohort: cohort ?? null })
      .where(eq(sectionCodesTable.sectionId, sectionId))
      .returning();
  } else {
    [sectionCode] = await db
      .insert(sectionCodesTable)
      .values({ sectionId, code: code.toUpperCase(), codeActive, cohort: cohort ?? null })
      .returning();
  }

  const section = ALL_SECTIONS.find((s) => s.id === sectionId);

  res.json({
    id: sectionCode.sectionId,
    title: section?.title ?? sectionCode.sectionId,
    code: sectionCode.code,
    codeActive: sectionCode.codeActive,
    cohort: sectionCode.cohort ?? null,
    tier: section?.tier ?? 1,
  });
});

router.get("/admin/safari-worksheets", async (req, res) => {
  const worksheets = await db
    .select()
    .from(safariWorksheetsTable)
    .orderBy(safariWorksheetsTable.sortOrder);

  res.json(worksheets);
});

router.post("/admin/safari-worksheets", requireAdmin, async (req, res) => {
  const bodyResult = CreateSafariWorksheetBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, sortOrder = 0 } = bodyResult.data;

  const [worksheet] = await db
    .insert(safariWorksheetsTable)
    .values({ name, sortOrder })
    .returning();

  res.status(201).json(worksheet);
});

router.put("/admin/safari-worksheets/:id", requireAdmin, async (req, res) => {
  const paramsResult = UpdateSafariWorksheetParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const bodyResult = UpdateSafariWorksheetBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  const body = bodyResult.data;
  if (body.name !== undefined) updateData.name = body.name;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
  if (body.active !== undefined) updateData.active = body.active;

  const [worksheet] = await db
    .update(safariWorksheetsTable)
    .set(updateData)
    .where(eq(safariWorksheetsTable.id, paramsResult.data.id))
    .returning();

  if (!worksheet) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(worksheet);
});

router.delete("/admin/safari-worksheets/:id", requireAdmin, async (req, res) => {
  const paramsResult = DeleteSafariWorksheetParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  await db
    .delete(safariWorksheetsTable)
    .where(eq(safariWorksheetsTable.id, paramsResult.data.id));

  res.json({ success: true });
});

router.get("/admin/feedback", requireAdmin, async (req, res) => {
  const results = await db
    .select({
      id: feedbackTable.id,
      participantEmail: participantsTable.email,
      content: feedbackTable.content,
      updatedAt: feedbackTable.updatedAt,
    })
    .from(feedbackTable)
    .innerJoin(participantsTable, eq(feedbackTable.participantId, participantsTable.id))
    .where(sql`${feedbackTable.content} != ''`);

  res.json(results);
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [participantsRow] = await db.select({ cnt: count() }).from(participantsTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeTodayResult = await db
    .select()
    .from(participantsTable)
    .where(sql`${participantsTable.lastLoginAt} >= ${today}`);

  const [sectionsRow] = await db.select({ cnt: count() }).from(unlockedSectionsTable);
  const [workflowRow] = await db.select({ cnt: count() }).from(workflowMapsTable);
  const [feedbackRow] = await db
    .select({ cnt: count() })
    .from(feedbackTable)
    .where(sql`${feedbackTable.content} != ''`);

  res.json({
    totalParticipants: Number(participantsRow.cnt),
    activeToday: activeTodayResult.length,
    sectionsUnlocked: Number(sectionsRow.cnt),
    totalWorkflowMaps: Number(workflowRow.cnt),
    feedbackSubmissions: Number(feedbackRow.cnt),
  });
});

export default router;
