import { useState } from "react";
import { SectionHeader } from "../SectionHeader";

const levels = [
  {
    num: 1,
    name: "Question Asker",
    tagline: "Using AI like a fancier search engine",
    bullets: [
      "One-off questions, no thought about framing",
      "Occasionally useful, not transformative",
      "Unaware that how you ask changes results",
    ],
  },
  {
    num: 2,
    name: "Prompt Crafter",
    tagline: "Realizing the prompt is the lever",
    bullets: [
      "Adds context, constraints, and examples",
      "Lets AI ask clarifying questions first",
      "Saves prompts that worked",
    ],
  },
  {
    num: 3,
    name: "Power User",
    tagline: "Context baked in — no more starting from scratch",
    bullets: [
      "Uses Projects with persistent instructions",
      "Files and tone carry across conversations",
      "Chooses deliberately between models",
    ],
  },
  {
    num: 4,
    name: "Workflow Weaver",
    tagline: "Right tool for each job, not one tool for all",
    bullets: [
      "Pulls in NotebookLM, image gen, meeting tools",
      "Prototypes interactive tools without code",
      "Combines tools in ways previously impossible",
    ],
  },
  {
    num: 5,
    name: "Builder",
    tagline: "Build something that does this for me",
    bullets: [
      "Automations that run without touching them",
      "Dashboards, apps, and portals for real use",
      "Sees repetitive tasks as systems to build",
    ],
  },
  {
    num: 6,
    name: "Architect",
    tagline: "Every slow process is a system waiting to be designed",
    bullets: [
      "Builds production software from descriptions",
      "Multi-agent workflows that orchestrate other agents",
      "Doesn't see problems anymore — sees systems",
    ],
  },
];

export function WhereAreYouOnThePath() {
  const [activeLevel, setActiveLevel] = useState(1);
  const level = levels[activeLevel - 1];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Where Are You on the Path?" type="reference" />

      <div className="flex border-b border-border mb-6">
        {levels.map((l) => (
          <button
            key={l.num}
            onClick={() => setActiveLevel(l.num)}
            className={`flex-1 text-center py-3 px-1 border-b-2 transition-colors ${
              activeLevel === l.num
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 mx-auto mb-1 flex items-center justify-center text-sm font-bold transition-colors ${
                activeLevel === l.num
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {l.num}
            </div>
            <div className="text-xs leading-tight hidden sm:block">{l.name.split(" ").slice(0, 1).join(" ")}<br/>{l.name.split(" ").slice(1).join(" ")}</div>
          </button>
        ))}
      </div>

      <div className="bg-secondary/30 rounded-lg p-6 border">
        <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-1">Level {level.num}</div>
        <h3 className="text-2xl font-serif font-bold text-primary mb-1">{level.name}</h3>
        <div className="text-sm text-accent italic font-medium mb-4">{level.tagline}</div>
        <ul className="space-y-2">
          {level.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-accent mt-0.5 flex-shrink-0">◦</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
