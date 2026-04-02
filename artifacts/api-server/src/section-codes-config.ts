/**
 * CANONICAL SECTION UNLOCK CODE MAPPING
 *
 * This is the single source of truth for all unlock codes.
 * Edit ONLY this file to change, add, or remove codes.
 * The server seeds the database from this file on every startup,
 * so changes here take effect automatically in all environments.
 *
 * A single code can unlock multiple sections (list them in the same entry).
 */

export interface SectionCodeEntry {
  code: string;
  sectionIds: string[];
}

export const SECTION_CODE_CONFIG: SectionCodeEntry[] = [
  // ── Day 1 ──────────────────────────────────────────────────────────────────
  { code: "VERIFY",     sectionIds: ["verification-test"] },
  { code: "SAFARI",     sectionIds: ["tool-safari"] },
  { code: "RICECO",     sectionIds: ["riceco-framework", "draft-with-riceco"] },
  { code: "PEER",       sectionIds: ["llm-peer-review"] },
  { code: "DISTILL",    sectionIds: ["distill"] },
  { code: "PREPARE",    sectionIds: ["prepare"] },
  { code: "SYNTHESIZE", sectionIds: ["synthesize"] },
  { code: "POWER",      sectionIds: ["power-follow-ups"] },
  { code: "AI",         sectionIds: ["what-ai-is"] },
  { code: "CONTEXT",    sectionIds: ["persistent-context"] },
  { code: "SAFETY",     sectionIds: ["red-yellow-green"] },
  { code: "CAPSTONE",   sectionIds: ["capstone"] },
  { code: "TONIGHT",    sectionIds: ["overnight-assignment", "six-ways-worksheet"] },

  // ── Day 2 ──────────────────────────────────────────────────────────────────
  { code: "HARVEST",    sectionIds: ["overnight-harvest"] },
  { code: "WORKFLOW",   sectionIds: ["workflow-configurator"] },
  { code: "CHANGE",     sectionIds: [
    "status-quo-bias",
    "county-change-framework",
    "county-change-message",
    "closing",
  ]},
];
