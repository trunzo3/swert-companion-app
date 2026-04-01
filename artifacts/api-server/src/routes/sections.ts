import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sectionCodesTable, unlockedSectionsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { UnlockSectionBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ALL_SECTIONS = [
  { id: "verification-test", title: "Verification Test", description: "Catch the errors AI makes — before they catch you.", day: 1, order: 1, tier: 1, type: "exercise" as const },
  { id: "tool-safari", title: "Tool Safari", description: "Explore multiple AI tools hands-on. Know which tool fits which task.", day: 1, order: 2, tier: 1, type: "exercise" as const },
  { id: "riceco-framework", title: "The RICECO Framework", description: "Six ingredients for prompts that produce usable output the first time.", day: 1, order: 3, tier: 1, type: "reference" as const },
  { id: "draft-with-riceco", title: "Draft with RICECO", description: "Use your 6 Ways worksheet task to create a real first draft.", day: 1, order: 4, tier: 1, type: "exercise" as const },
  { id: "llm-peer-review", title: "LLM Peer Review", description: "Use a second AI to check the first one's work. Build the verification habit.", day: 1, order: 5, tier: 1, type: "exercise" as const },
  { id: "distill", title: "Distill", description: "Turn something complex into something clear — policy to plain language, long to short.", day: 1, order: 6, tier: 1, type: "exercise" as const },
  { id: "prepare", title: "Prepare", description: "Get ready for a high-stakes conversation before it happens — not after.", day: 1, order: 7, tier: 1, type: "exercise" as const },
  { id: "synthesize", title: "Synthesize", description: "Find patterns across multiple documents that would take hours to read manually.", day: 1, order: 8, tier: 1, type: "exercise" as const },
  { id: "power-follow-ups", title: "Power Follow-Ups", description: "Nine moves to refine, pressure-test, and reshape AI output until it's actually ready to use.", day: 1, order: 9, tier: 1, type: "reference" as const },
  { id: "what-ai-is", title: "What AI Is / Is Not", description: "Pattern matching, not thinking. The same process produces correct answers and hallucinations.", day: 1, order: 10, tier: 1, type: "reference" as const },
  { id: "persistent-context", title: "Persistent Context", description: "Stop re-explaining yourself. Move from one-off chats to persistent, reusable workflows.", day: 1, order: 11, tier: 1, type: "reference" as const },
  { id: "red-yellow-green", title: "Red / Yellow / Green", description: "Build shared judgment about what's safe, context-dependent, and risky to do with AI at work.", day: 1, order: 12, tier: 1, type: "exercise" as const },
  { id: "capstone", title: "Capstone — Your 6 Ways in Action", description: "Build a complete, AI-assisted work product on a real task. Full cycle: prompt, run, verify, revise.", day: 1, order: 13, tier: 1, type: "exercise" as const },
  { id: "overnight-assignment", title: "Overnight Assignment", description: "Use what you built on one safe task. Come to Day 2 ready to report.", day: 1, order: 14, tier: 1, type: "reference" as const },
  { id: "six-ways-worksheet", title: "6 Ways Worksheet", description: "For each use case, write one task you do regularly that AI could help with.", day: 1, order: 15, tier: 1, type: "reference" as const },
  { id: "overnight-harvest", title: "Overnight Harvest — Workflow Ideas", description: "Surface what you learned last night and find the workflow worth mapping today.", day: 2, order: 1, tier: 1, type: "exercise" as const },
  { id: "workflow-configurator", title: "Map Your Workflow", description: "Produce a one-page, deployable workflow document — AI insertion points, human verification, and stop conditions.", day: 2, order: 2, tier: 1, type: "exercise" as const },
  { id: "status-quo-bias", title: "Status Quo Bias", description: "Your director isn't being irrational. They're experiencing the same cognitive patterns that drive most decisions.", day: 2, order: 3, tier: 1, type: "reference" as const },
  { id: "county-change-framework", title: "County Change Framework", description: "A 5-step narrative structure for pitching AI adoption to risk-averse leadership.", day: 2, order: 4, tier: 1, type: "reference" as const },
  { id: "county-change-message", title: "Build Your County Change Message", description: "Draft a change narrative tailored to your county's context.", day: 2, order: 5, tier: 1, type: "exercise" as const },
  { id: "closing", title: "Closing", description: "Reflect and carry forward.", day: 2, order: 6, tier: 1, type: "reference" as const },
  { id: "simulate", title: "Simulate", description: "Practice conversations and scenarios with AI as your counterpart.", day: 2, order: 7, tier: 2, type: "locked" as const },
  { id: "systematize", title: "Systematize", description: "Build reusable AI infrastructure: templates, workspaces, and custom tools.", day: 2, order: 8, tier: 2, type: "locked" as const },
  { id: "build", title: "Build", description: "Create functional tools, apps, and prototypes with AI.", day: 2, order: 9, tier: 3, type: "locked" as const },
  { id: "orchestrate", title: "Orchestrate", description: "Multi-model quality workflows and verification systems.", day: 2, order: 10, tier: 3, type: "locked" as const },
  { id: "analyze", title: "Analyze", description: "Data analysis, pattern recognition, and scenario modeling at scale.", day: 2, order: 11, tier: 3, type: "locked" as const },
];

router.get("/sections", async (req, res) => {
  const participantId = req.session?.participantId;

  const codes = await db.select().from(sectionCodesTable);
  const codeMap = new Map(codes.map((c) => [c.sectionId, c]));

  let unlockedSet = new Set<string>();
  if (participantId) {
    const unlocked = await db
      .select()
      .from(unlockedSectionsTable)
      .where(eq(unlockedSectionsTable.participantId, participantId));
    unlockedSet = new Set(unlocked.map((u) => u.sectionId));
  }

  const sections = ALL_SECTIONS.map((s) => ({
    ...s,
    unlocked: s.tier > 1 ? false : unlockedSet.has(s.id),
    hasCode: codeMap.has(s.id) && (codeMap.get(s.id)?.codeActive ?? false),
  }));

  res.json(sections);
});

router.post("/sections/unlock", async (req, res) => {
  const participantId = req.session?.participantId;
  if (!participantId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const result = UnlockSectionBody.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { code } = result.data;
  const normalizedCode = code.toUpperCase().trim();

  const allCodes = await db
    .select()
    .from(sectionCodesTable)
    .where(eq(sectionCodesTable.codeActive, true));

  const matchingCodes = allCodes.filter((r) => r.code.toUpperCase() === normalizedCode);

  if (matchingCodes.length === 0) {
    res.status(400).json({ error: "Code not recognized" });
    return;
  }

  const firstSection = ALL_SECTIONS.find((s) => s.id === matchingCodes[0].sectionId);
  if (!firstSection) {
    res.status(400).json({ error: "Code not recognized" });
    return;
  }

  // Unlock all sections associated with this code
  const alreadyUnlocked = new Set<string>();
  const existing = await db
    .select()
    .from(unlockedSectionsTable)
    .where(eq(unlockedSectionsTable.participantId, participantId));
  existing.forEach((u) => alreadyUnlocked.add(u.sectionId));

  for (const matchingCode of matchingCodes) {
    if (!alreadyUnlocked.has(matchingCode.sectionId)) {
      await db.insert(unlockedSectionsTable).values({
        participantId,
        sectionId: matchingCode.sectionId,
      });
    }
  }

  const wasAlreadyUnlocked = alreadyUnlocked.has(matchingCodes[0].sectionId);

  res.json({
    sectionId: matchingCodes[0].sectionId,
    sectionTitle: firstSection.title,
    alreadyUnlocked: wasAlreadyUnlocked,
  });
});

export { ALL_SECTIONS };
export default router;
