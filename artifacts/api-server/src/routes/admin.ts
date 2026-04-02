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
  sectionFilesTable,
  homeContentTable,
} from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";
import {
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
  const { email, password } = req.body || {};

  const adminEmail = process.env.ADMIN_EMAIL || "anthony@iqmeeteq.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "95682";

  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  req.session!.isAdmin = true;
  res.json({ success: true });
});

router.post("/admin/logout", (req, res) => {
  req.session!.isAdmin = false;
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

router.get("/home-content", async (req, res) => {
  const rows = await db.select().from(homeContentTable).limit(1);
  if (rows.length === 0) {
    res.json({ content: "Welcome to the SWERT Summit. Enter the codes your facilitator shares to unlock each section. Your notes save automatically." });
  } else {
    res.json({ content: rows[0].content });
  }
});

router.put("/admin/home-content", requireAdmin, async (req, res) => {
  const { content } = req.body || {};
  if (typeof content !== "string") {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const existing = await db.select().from(homeContentTable).limit(1);
  let row;
  if (existing.length === 0) {
    [row] = await db.insert(homeContentTable).values({ content }).returning();
  } else {
    [row] = await db
      .update(homeContentTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(homeContentTable.id, existing[0].id))
      .returning();
  }
  res.json({ content: row.content });
});

router.get("/admin/files", requireAdmin, async (req, res) => {
  const files = await db
    .select({
      id: sectionFilesTable.id,
      displayName: sectionFilesTable.displayName,
      sectionId: sectionFilesTable.sectionId,
      toolTab: sectionFilesTable.toolTab,
      mimeType: sectionFilesTable.mimeType,
      fileSize: sectionFilesTable.fileSize,
      uploadedAt: sectionFilesTable.uploadedAt,
    })
    .from(sectionFilesTable)
    .orderBy(sectionFilesTable.uploadedAt);

  res.json(files);
});

router.post("/admin/files", requireAdmin, async (req, res) => {
  const { displayName, sectionId, toolTab, mimeType, fileData } = req.body || {};

  if (!displayName || !sectionId || !fileData) {
    res.status(400).json({ error: "displayName, sectionId, and fileData are required" });
    return;
  }

  const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
  const fileSize = Math.round((base64Data.length * 3) / 4);

  const [file] = await db
    .insert(sectionFilesTable)
    .values({
      displayName,
      sectionId,
      toolTab: toolTab || null,
      mimeType: mimeType || "application/pdf",
      fileData: base64Data,
      fileSize,
    })
    .returning({
      id: sectionFilesTable.id,
      displayName: sectionFilesTable.displayName,
      sectionId: sectionFilesTable.sectionId,
      toolTab: sectionFilesTable.toolTab,
      mimeType: sectionFilesTable.mimeType,
      fileSize: sectionFilesTable.fileSize,
      uploadedAt: sectionFilesTable.uploadedAt,
    });

  res.status(201).json(file);
});

router.delete("/admin/files/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(sectionFilesTable).where(eq(sectionFilesTable.id, id));
  res.json({ success: true });
});

router.get("/files/:id/download", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [file] = await db
    .select()
    .from(sectionFilesTable)
    .where(eq(sectionFilesTable.id, id))
    .limit(1);

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const buffer = Buffer.from(file.fileData, "base64");
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.displayName}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
});

router.get("/files/by-section/:sectionId", async (req, res) => {
  const { sectionId } = req.params;
  const files = await db
    .select({
      id: sectionFilesTable.id,
      displayName: sectionFilesTable.displayName,
      sectionId: sectionFilesTable.sectionId,
      toolTab: sectionFilesTable.toolTab,
      mimeType: sectionFilesTable.mimeType,
      fileSize: sectionFilesTable.fileSize,
      uploadedAt: sectionFilesTable.uploadedAt,
    })
    .from(sectionFilesTable)
    .where(eq(sectionFilesTable.sectionId, sectionId));

  res.json(files);
});

export default router;
