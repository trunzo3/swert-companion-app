import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workflowMapsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { CreateWorkflowMapBody, UpdateWorkflowMapBody, GetWorkflowMapParams, UpdateWorkflowMapParams, DeleteWorkflowMapParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workflow-maps", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const maps = await db
    .select()
    .from(workflowMapsTable)
    .where(eq(workflowMapsTable.participantId, participantId));

  res.json(maps);
});

router.post("/workflow-maps", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const bodyResult = CreateWorkflowMapBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, frequency = "", currentSteps = [], redesignedSteps = [], verificationCheckpoints = "", stopConditions = "" } = bodyResult.data;

  const [map] = await db
    .insert(workflowMapsTable)
    .values({ participantId, name, frequency, currentSteps, redesignedSteps, verificationCheckpoints, stopConditions })
    .returning();

  res.status(201).json(map);
});

router.get("/workflow-maps/:id", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const paramsResult = GetWorkflowMapParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const [map] = await db
    .select()
    .from(workflowMapsTable)
    .where(
      and(
        eq(workflowMapsTable.id, paramsResult.data.id),
        eq(workflowMapsTable.participantId, participantId)
      )
    )
    .limit(1);

  if (!map) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(map);
});

router.put("/workflow-maps/:id", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const paramsResult = UpdateWorkflowMapParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const bodyResult = UpdateWorkflowMapBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const body = bodyResult.data;
  if (body.name !== undefined) updateData.name = body.name;
  if (body.frequency !== undefined) updateData.frequency = body.frequency;
  if (body.currentSteps !== undefined) updateData.currentSteps = body.currentSteps;
  if (body.redesignedSteps !== undefined) updateData.redesignedSteps = body.redesignedSteps;
  if (body.verificationCheckpoints !== undefined) updateData.verificationCheckpoints = body.verificationCheckpoints;
  if (body.stopConditions !== undefined) updateData.stopConditions = body.stopConditions;

  const [map] = await db
    .update(workflowMapsTable)
    .set(updateData)
    .where(
      and(
        eq(workflowMapsTable.id, paramsResult.data.id),
        eq(workflowMapsTable.participantId, participantId)
      )
    )
    .returning();

  if (!map) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(map);
});

router.delete("/workflow-maps/:id", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const paramsResult = DeleteWorkflowMapParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  await db
    .delete(workflowMapsTable)
    .where(
      and(
        eq(workflowMapsTable.id, paramsResult.data.id),
        eq(workflowMapsTable.participantId, participantId)
      )
    );

  res.json({ success: true });
});

export default router;
