import { useState, useCallback } from "react";
import { SectionHeader, GoalBox, InsightBox, RuleBox, DepthQuote } from "../SectionHeader";
import { NotesField } from "../NotesField";
import { useGetSafariWorksheets } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAutoSave } from "@/hooks/use-auto-save";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const VERIFY_PROMPT = `For each statistic, verify against primary sources. Output: Claim | Correct? | Actual Figure | Source Link.

One table for each bullet. No other commentary.

– Child protective services identified 556,899 victims of child abuse and neglect in federal fiscal year 2022, matching a national rate of 7.7 victims per 1,000 children. Agencies received 4,276,000 total referrals involving about 7.53 million children.

– Among the 47 states reporting both screened-in and screened-out referrals, 50% were screened in and 50.5% screened out.

– In 2022, the U.S. population aged 65 and older reached 57.8 million, or 17.3% of the total population. In 2023, approximately 25% of community-dwelling older adults lived alone.`;

const CRITIQUE_SCAFFOLD = `"Here are the instructions I gave to [Model A]:"
---
[PASTE YOUR ORIGINAL PROMPT]
---
"Below is the response. Critique only. Do not redraft."
---
[PASTE MODEL A'S OUTPUT]`;

const RESPOND_SCAFFOLD = `"Below is GPT's critique. Is it useful?"
---
[PASTE MODEL B'S CRITIQUE]`;

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 bg-accent text-primary px-4 py-2 rounded text-xs font-bold hover:bg-accent/90 transition-colors mt-4"
    >
      {copied ? "✓ Copied!" : `📋 ${label}`}
    </button>
  );
}

export function VerificationTest({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Verification Test" type="exercise" />
      <GoalBox text="Catch the errors AI makes — before they catch you." />

      <div className="space-y-6">
        <div>
          <div className="text-center py-2 text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">Open an LLM</div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "✦ Gemini", url: "https://gemini.google.com" },
              { name: "◎ ChatGPT", url: "https://chatgpt.com" },
              { name: "✻ Claude", url: "https://claude.ai" },
              { name: "● Copilot", url: "https://copilot.microsoft.com" },
            ].map((t) => (
              <a
                key={t.name}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-primary hover:text-accent transition-colors"
              >
                {t.name}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          {[
            { n: 1, title: "Copy the prompt", desc: "Use the button below to copy the full prompt to your clipboard." },
            { n: 2, title: "Paste into your tool", desc: "Open any LLM above and paste. Hit send." },
            { n: 3, title: "Read the output", desc: "What did it catch — and what did it miss?" },
            { n: 4, title: "Scroll past the stop", desc: "Check the answer key only after you've run the test." },
          ].map((s) => (
            <div key={s.n} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
              <div>
                <div className="font-bold text-primary">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-lg p-6 text-white">
          <span className="inline-block bg-accent text-primary text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">Prompt to Copy</span>
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{VERIFY_PROMPT}</p>
          <CopyButton text={VERIFY_PROMPT} label="Copy Prompt" />
        </div>

        <div className="bg-red-600 text-white text-center py-5 rounded-lg">
          <div className="text-2xl font-bold mb-1">🛑 Stop Here</div>
          <div className="text-sm opacity-90">Run your AI test first. Scroll past this point only after you've seen what your tool found.</div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-primary px-5 py-3 flex items-center gap-3">
            <span className="bg-red-600 text-white text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded">Answer Key</span>
            <span className="text-white font-bold text-sm">Correct Information</span>
          </div>
          {[
            {
              label: "Stat 1 — CPS Victims Count",
              error: "556,000 victims",
              correct: "558,899 victims of child abuse and neglect in FFY 2022, at a national rate of 7.7 per 1,000 children. 4,276,000 referrals involving ~7.53 million children.",
            },
            {
              label: "Stat 2 — Screening Rates",
              error: "50% screened in",
              correct: "Among the 47 reporting states, 49.5% were screened in and 50.5% screened out.",
            },
            {
              label: "Stat 3 — Older Adults Living Alone",
              error: "25% of community-dwelling older adults lived alone",
              correct: "U.S. population 65+ reached 57.8 million (17.3%) in 2022. In 2023, approximately 28% of community-dwelling older adults lived alone.",
            },
          ].map((row, i) => (
            <div key={i} className="px-5 py-4 border-b border-border last:border-0">
              <div className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2">{row.label}</div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start text-sm">
                <div className="bg-red-50 px-3 py-2 rounded">
                  <s className="text-red-800">{row.error}</s>
                  <span className="ml-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">ERROR</span>
                </div>
                <div className="text-muted-foreground font-bold pt-2">→</div>
                <div className="bg-green-50 px-3 py-2 rounded text-green-800">✓ {row.correct}</div>
              </div>
            </div>
          ))}
        </div>

        <InsightBox>
          AI doesn't know when it's wrong. Confident delivery is not the same as accurate content. Your judgment is the quality control layer — not the model's.
        </InsightBox>

        <div className="space-y-6">
          <NotesField sectionId={sectionId} fieldKey="observations" label="My Observations" />
          <div className="grid md:grid-cols-2 gap-6">
            <NotesField sectionId={sectionId} fieldKey="caught-errors" label="Did my AI catch the errors?" />
            <NotesField sectionId={sectionId} fieldKey="trust" label="What does this tell me about trust?" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolSafari({ sectionId }: { sectionId: string }) {
  const { data: worksheets = [] } = useGetSafariWorksheets();
  const [tabFiles, setTabFiles] = useState<Record<string, { id: number; displayName: string } | null>>({});

  const loadFileForTab = async (tabName: string) => {
    if (tabName in tabFiles) return;
    try {
      const res = await fetch(`${BASE}/api/files/by-section/tool-safari`, { credentials: "include" });
      if (res.ok) {
        const files: { id: number; displayName: string; toolTab: string | null }[] = await res.json();
        const updated: Record<string, { id: number; displayName: string } | null> = {};
        for (const w of worksheets) {
          const match = files.find(f => f.toolTab === w.name);
          updated[w.name] = match ? { id: match.id, displayName: match.displayName } : null;
        }
        setTabFiles(updated);
      }
    } catch {}
  };

  const handleTabChange = (tabVal: string) => {
    const w = worksheets.find(w => w.id.toString() === tabVal);
    if (w) loadFileForTab(w.name);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Tool Safari" type="exercise" />
      <GoalBox text="Explore multiple AI tools hands-on. Know which tool fits which task." />

      <div className="bg-card p-6 rounded-lg border mb-6">
        <p className="text-foreground">Take 15 minutes to explore different tools using the provided worksheets. Switch tabs below to document your findings for each tool.</p>
      </div>

      {worksheets.length > 0 ? (
        <Tabs defaultValue={worksheets[0]?.id.toString()} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap h-auto justify-start mb-0 bg-secondary/50 rounded-b-none">
            {worksheets.map(w => (
              <TabsTrigger key={w.id} value={w.id.toString()} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {w.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {worksheets.map(w => {
            const file = tabFiles[w.name];
            return (
              <TabsContent key={w.id} value={w.id.toString()} className="space-y-6 bg-card p-6 rounded-b-lg rounded-tr-lg border border-t-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-primary">{w.name} Exploration</h3>
                  {file === undefined ? null : file ? (
                    <a
                      href={`${BASE}/api/files/${file.id}/download`}
                      className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      ⬇ Download Safari Guide (PDF)
                    </a>
                  ) : (
                    <button disabled className="inline-flex items-center gap-2 bg-secondary text-muted-foreground px-3 py-1.5 rounded text-xs font-medium cursor-not-allowed">
                      Guide coming soon
                    </button>
                  )}
                </div>
                <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-surprised`} label="What surprised me" />
                <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-worked`} label="What worked well" />
                <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-didnt-work`} label="What didn't work" />
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="p-8 text-center border rounded-lg bg-secondary/20 text-muted-foreground">
          No worksheets available yet.
        </div>
      )}

      <div className="mt-8 border-t pt-8">
        <NotesField sectionId={sectionId} fieldKey="top-insight" label="My table's top insight for report-out" />
      </div>
    </div>
  );
}

export function RicecoFramework({ sectionId }: { sectionId: string }) {
  const rows = [
    { l: "R", name: "Role", desc: "Who is the AI acting as?" },
    { l: "I", name: "Instruction", desc: "What exactly do you want it to do?" },
    { l: "C", name: "Context", desc: "What background information is needed?" },
    { l: "E", name: "Examples", desc: "What does good look like?" },
    { l: "C", name: "Constraints", desc: "What rules must it follow?" },
    { l: "O", name: "Output", desc: "How should the final result be formatted?" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="RICECO Framework" type="reference" />
      <GoalBox text="Six ingredients for prompts that produce usable output the first time." />

      <div className="grid gap-4 mb-8">
        {rows.map(r => (
          <div key={r.name} className="flex gap-4 p-4 border rounded-lg bg-card items-start">
            <div className="w-10 h-10 rounded-full bg-accent text-primary font-bold flex items-center justify-center flex-shrink-0 text-lg">
              {r.l}
            </div>
            <div>
              <h4 className="font-bold text-primary text-lg">{r.name}</h4>
              <p className="text-foreground mt-1">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-l-4 border-accent pl-6 py-2 my-8 bg-secondary/30 rounded-r-lg p-4">
        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
          <span className="bg-accent text-primary px-2 py-1 rounded text-xs uppercase tracking-wider">80% Shortcut</span>
        </h4>
        <p className="text-foreground">
          You don't need all six every time. For most daily tasks, <strong>I + C + C</strong> — Instruction, Context, Constraints — gets you 80% of the way there.
        </p>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-serif font-bold text-primary mb-6">Practice Prompt Builder</h3>
        <div className="space-y-6 bg-card p-6 rounded-lg border">
          {rows.map(r => (
            <NotesField key={r.name} sectionId={sectionId} fieldKey={`riceco-${r.l}`} label={r.name} placeholder={`Enter ${r.name.toLowerCase()}...`} />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <NotesField sectionId={sectionId} fieldKey="general-notes" label="General Notes" />
      </div>
    </div>
  );
}

export function DraftWithRiceco({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Draft with RICECO" type="exercise" />
      <GoalBox text="Use your 6 Ways worksheet task to create a real first draft." />

      <div className="bg-card p-6 rounded-lg border mb-8">
        <ol className="list-decimal list-inside space-y-2 text-foreground">
          <li>Pick your task from the 6 Ways worksheet</li>
          <li>Build your RICECO prompt — start with I+C+C minimum</li>
          <li>Run it and note what you got</li>
        </ol>
      </div>

      <div className="space-y-6">
        <NotesField sectionId={sectionId} fieldKey="task" label="My task" />
        <NotesField sectionId={sectionId} fieldKey="which-way" label="Which of the 6 Ways?" />

        <div className="p-6 border rounded-lg bg-secondary/10 space-y-6 mt-8">
          <h4 className="font-bold text-primary uppercase tracking-wider text-sm mb-4">Drafting Workspace</h4>
          {(["Role", "Instruction", "Context", "Examples", "Constraints", "Output"] as const).map((name, i) => (
            <NotesField key={name} sectionId={sectionId} fieldKey={`draft-riceco-${i}`} label={`${["R","I","C","E","C","O"][i]}: ${name}`} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <NotesField sectionId={sectionId} fieldKey="reaction" label="My first reaction to the output" />
          <NotesField sectionId={sectionId} fieldKey="changes" label="What I'd change" />
        </div>
      </div>
    </div>
  );
}

export function LlmPeerReview({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="LLM Peer Review" type="exercise" />
      <GoalBox text="Use a second AI to check the first one's work. Build the verification habit." />

      <div className="flex items-center gap-3 mb-8">
        <span className="px-4 py-2 rounded-full border border-border text-primary font-semibold text-sm">Draft</span>
        <span className="text-accent font-bold">→</span>
        <span className="px-4 py-2 rounded-full bg-primary text-white font-semibold text-sm">Critique</span>
        <span className="text-accent font-bold">→</span>
        <span className="px-4 py-2 rounded-full border border-border text-primary font-semibold text-sm">Respond</span>
      </div>

      <div className="bg-card p-6 border rounded-lg mb-6 space-y-4">
        {[
          { n: 1, title: "Draft — Stay in Model A", desc: "Keep your draft from the previous exercise open in Model A (Claude, ChatGPT, or Gemini)." },
          { n: 2, title: "Critique — Open Model B", desc: "Open a second tab with a different AI. Paste the critique scaffold below. Ask it to critique — not redraft." },
          { n: 3, title: "Respond — Return to Model A", desc: "Paste Model B's critique into Model A. Ask: \"Below is GPT's critique. Is it useful?\" Let Model A respond and revise." },
        ].map(s => (
          <div key={s.n} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
            <div>
              <div className="font-bold text-primary">{s.title}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary rounded-lg p-6 text-white mb-4">
        <span className="inline-block bg-accent text-primary text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">Critique Scaffold (for Model B)</span>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{CRITIQUE_SCAFFOLD}</p>
        <CopyButton text={CRITIQUE_SCAFFOLD} label="Copy Scaffold" />
      </div>

      <div className="bg-primary rounded-lg p-6 text-white mb-8">
        <span className="inline-block bg-accent text-primary text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded mb-4">Respond Scaffold (back in Model A)</span>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{RESPOND_SCAFFOLD}</p>
        <CopyButton text={RESPOND_SCAFFOLD} label="Copy Scaffold" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <NotesField sectionId={sectionId} fieldKey="model-a" label="Model A Used" />
        <NotesField sectionId={sectionId} fieldKey="model-b" label="Model B Used" />
      </div>

      <div className="space-y-6 mb-8">
        <NotesField sectionId={sectionId} fieldKey="feedback" label="Key Feedback from Model B" />
        <NotesField sectionId={sectionId} fieldKey="changes" label="Changes I Made After Revision" />
        <NotesField sectionId={sectionId} fieldKey="disagreement" label="Did the Models Disagree? How?" />
      </div>

      <InsightBox>
        Different models catch different errors and carry different biases. Using them to check each other is a structural safeguard — not just a best practice.
      </InsightBox>
    </div>
  );
}

export function Distill({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Distill" type="exercise" />
      <GoalBox text="Turn something complex into something clear." />

      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
        <h3 className="font-bold text-primary mb-3">RICECO Scaffold</h3>
        <p className="text-foreground font-mono text-sm bg-secondary/50 p-4 rounded">
          <strong className="text-primary">I:</strong> Summarize the attached document.<br/>
          <strong className="text-primary">C:</strong> The audience is busy executives who need the bottom line.<br/>
          <strong className="text-primary">C:</strong> Keep it under 300 words. No jargon.<br/>
          <strong className="text-primary">O:</strong> 3 bullet points of key takeaways, 1 paragraph summary.
        </p>
      </div>

      <div className="space-y-6">
        <NotesField sectionId={sectionId} fieldKey="document" label="Document I used" />
        <NotesField sectionId={sectionId} fieldKey="adjusted" label="How I adjusted the scaffold" />
        <div className="grid md:grid-cols-2 gap-6">
          <NotesField sectionId={sectionId} fieldKey="got-right" label="What the output got right" />
          <NotesField sectionId={sectionId} fieldKey="verify-fix" label="What I had to verify or fix" />
        </div>
        <NotesField sectionId={sectionId} fieldKey="notes" label="General notes" />
      </div>
    </div>
  );
}

export function Prepare({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Prepare" type="exercise" />
      <GoalBox text="Get ready for a high-stakes conversation before it happens." />

      <div className="bg-card p-6 border rounded-lg mb-6 shadow-sm">
        <h3 className="font-bold text-primary mb-3">RICECO Scaffold</h3>
        <p className="text-foreground font-mono text-sm bg-secondary/50 p-4 rounded">
          <strong className="text-primary">R:</strong> You are a skeptical community member.<br/>
          <strong className="text-primary">I:</strong> Roleplay a conversation with me about [Topic].<br/>
          <strong className="text-primary">C:</strong> We are at a town hall. I am presenting a new policy.<br/>
          <strong className="text-primary">C:</strong> Push back on my points. Ask one question at a time.<br/>
          <strong className="text-primary">O:</strong> Dialogue format. Wait for my response before replying.
        </p>
      </div>

      <div className="border-l-4 border-accent pl-4 py-3 my-8 bg-card rounded-r-lg">
        <h4 className="font-bold text-primary uppercase text-xs tracking-wider mb-1">Power Move</h4>
        <p className="text-foreground">Don't just ask for objections. Ask for the strongest case against you...</p>
      </div>

      <div className="space-y-6 mb-8">
        <NotesField sectionId={sectionId} fieldKey="scenario" label="The scenario I used" />
        <NotesField sectionId={sectionId} fieldKey="useful" label="Most useful output" />
        <NotesField sectionId={sectionId} fieldKey="objections" label="Objections AI surfaced that I hadn't thought of" />
        <NotesField sectionId={sectionId} fieldKey="fell-short" label="Where the output fell short or felt off" />
      </div>

      <DepthQuote>Preparing for conversations is critical...</DepthQuote>
    </div>
  );
}

export function Synthesize({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Synthesize" type="exercise" />
      <GoalBox text="Find patterns across multiple documents." />

      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
        <h3 className="font-bold text-primary mb-3">Steps & Scaffold</h3>
        <p className="text-foreground font-mono text-sm bg-secondary/50 p-4 rounded">
          <strong className="text-primary">I:</strong> Review the attached reports and identify common themes.<br/>
          <strong className="text-primary">C:</strong> Focus on recurring challenges and proposed solutions.<br/>
          <strong className="text-primary">C:</strong> Cite which document each point comes from.<br/>
          <strong className="text-primary">O:</strong> A thematic summary table.
        </p>
      </div>

      <div className="space-y-6">
        <NotesField sectionId={sectionId} fieldKey="documents" label="Documents I used" />
        <NotesField sectionId={sectionId} fieldKey="patterns" label="Themes / patterns identified" />
        <div className="grid md:grid-cols-2 gap-6">
          <NotesField sectionId={sectionId} fieldKey="surprised" label="What surprised me" />
          <NotesField sectionId={sectionId} fieldKey="missed" label="What the AI missed" />
        </div>
      </div>
    </div>
  );
}

export function PowerFollowUps({ sectionId }: { sectionId: string }) {
  const moves = [
    { name: "Simplify", prompt: "Explain this to a 10-year-old." },
    { name: "Sticky", prompt: "Make this more memorable. Use an analogy." },
    { name: "Test", prompt: "What's the strongest argument against this?" },
    { name: "Push", prompt: "Give me 5 more ideas, crazier this time." },
    { name: "Flip", prompt: "Argue the exact opposite position." },
    { name: "Rank", prompt: "Rank these by feasibility and explain why." },
    { name: "Ground", prompt: "Give me a real-world example of this working." },
    { name: "Tone", prompt: "Rewrite this to be more empathetic and less formal." },
    { name: "Format", prompt: "Turn this into a checklist." }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Power Follow-ups" type="reference" />
      <GoalBox text="Nine moves to refine, pressure-test, and reshape AI output." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {moves.map(m => (
          <div key={m.name} className="bg-card border border-border rounded-lg p-5 hover:border-accent transition-colors shadow-sm">
            <h4 className="font-bold text-primary mb-2 uppercase text-sm tracking-wider">{m.name}</h4>
            <p className="text-foreground italic">"{m.prompt}"</p>
          </div>
        ))}
      </div>

      <div className="bg-primary text-white p-6 rounded-lg mb-8 shadow-md">
        <h4 className="font-bold text-accent uppercase text-xs tracking-wider mb-2">Key Principle</h4>
        <p>The first response is raw material, not a final product. Every follow-up is an editing decision...</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NotesField sectionId={sectionId} fieldKey="used-today" label="Follow-ups I used today" />
        <NotesField sectionId={sectionId} fieldKey="worked-best" label="Which ones worked best for me?" />
      </div>
    </div>
  );
}

export function WhatAiIs({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="What AI Is / Is Not" type="reference" />

      <div className="bg-card border rounded-lg p-6 mb-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-2">Core Concept</h3>
        <p className="text-foreground">Pattern matching, not thinking. The same process produces correct answers and hallucinations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-primary border-b pb-2">It IS</h3>
          <ul className="space-y-3">
            {[
              { icon: "✦", title: "Probabilistic", desc: "Always guessing what comes next. Whether output is true or fabricated, the process is identical." },
              { icon: "✦", title: "Pattern Matching at Scale", desc: "It finds connections humans might miss." },
              { icon: "✦", title: "A Confident Communicator", desc: "It sounds authoritative, even when wrong." },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-accent mt-1">{item.icon}</span>
                <span><strong>{item.title}</strong><br/><span className="text-muted-foreground text-sm">{item.desc}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-destructive border-b pb-2">It Is NOT</h3>
          <ul className="space-y-3">
            {[
              { icon: "✕", title: "Thinking or Knowing", desc: "There is no reasoning. There is prediction." },
              { icon: "✕", title: "Sentient or Caring", desc: "It does not have feelings or intent." },
              { icon: "✕", title: "A Reliable Fact Database", desc: "It is a reasoning engine, not a search engine." },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-destructive mt-1">{item.icon}</span>
                <span><strong>{item.title}</strong><br/><span className="text-muted-foreground text-sm">{item.desc}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-secondary/30 rounded-lg p-6 border mb-12">
        <h4 className="font-bold text-primary uppercase text-sm tracking-wider mb-4 text-center">Always Verify These Areas</h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {["Facts & Citations", "Math", "Self-Knowledge", "Current Events"].map(item => (
            <span key={item} className="bg-background border border-border px-4 py-2 rounded-full text-sm font-medium text-foreground shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-12 border p-8 rounded-lg bg-white flex flex-col items-center justify-center shadow-inner">
        <h4 className="font-bold text-primary uppercase text-sm tracking-wider mb-6">The Hierarchy</h4>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 bg-primary/5 flex items-start justify-center pt-4">
            <span className="text-xs font-bold text-primary/60 uppercase">AI (Rules/Logic)</span>
          </div>
          <div className="absolute inset-4 rounded-full border-2 border-primary/40 bg-primary/10 flex items-start justify-center pt-4">
            <span className="text-xs font-bold text-primary/80 uppercase">Machine Learning</span>
          </div>
          <div className="absolute inset-8 rounded-full border-2 border-accent/60 bg-accent/10 flex items-start justify-center pt-4">
            <span className="text-xs font-bold text-accent uppercase">LLMs</span>
          </div>
          <div className="absolute inset-14 rounded-full bg-primary flex items-center justify-center text-center p-2 shadow-lg">
            <span className="text-xs font-bold text-white uppercase leading-tight">GenAI<br/>Tools</span>
          </div>
        </div>
      </div>

      <NotesField sectionId={sectionId} fieldKey="notes" label="Notes" />
    </div>
  );
}

export function PersistentContext({ sectionId }: { sectionId: string }) {
  const levels = [
    { l: "L1", name: "Custom Instructions", desc: "Basic rules applied to every chat." },
    { l: "L2", name: "Projects / Spaces", desc: "Scoped context for specific workflows." },
    { l: "L3", name: "Custom GPTs", desc: "Shareable, specialized bots with specific knowledge." },
    { l: "RAG", name: "NotebookLM", desc: "Retrieval-Augmented Generation. Highest accuracy on specific docs." }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Persistent Context" type="reference" />

      <div className="bg-card border rounded-lg p-6 mb-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-2">Core Concept</h3>
        <p className="text-foreground font-medium text-lg">Stop re-explaining yourself.</p>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-primary text-white text-left">
              <th className="p-4 font-semibold w-24">Level</th>
              <th className="p-4 font-semibold">Tool Type</th>
              <th className="p-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((lvl, i) => (
              <tr key={lvl.l} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                <td className="p-4 border-b font-bold text-accent">{lvl.l}</td>
                <td className="p-4 border-b font-semibold text-primary">{lvl.name}</td>
                <td className="p-4 border-b text-foreground">{lvl.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-primary text-white p-6 rounded-lg mb-8">
        <h4 className="font-bold text-accent uppercase text-xs tracking-wider mb-2">The Unlock</h4>
        <p>When your AI knows your role, your team, your constraints, and your communication style, every session starts better than the last one ended.</p>
      </div>

      <NotesField sectionId={sectionId} fieldKey="context-notes" label="Notes" />
    </div>
  );
}

export function RedYellowGreen({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Red, Yellow, Green" type="exercise" />
      <GoalBox text="Build shared judgment about what's safe." />

      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
        <ol className="list-decimal list-inside space-y-2 text-foreground font-medium">
          <li>Hold your cards</li>
          <li>Discuss disagreements</li>
        </ol>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border-t-4 border-green-500 p-4 rounded-b-lg shadow-sm">
          <NotesField sectionId={sectionId} fieldKey="safe" label="Relatively Safe" className="mt-0" />
        </div>
        <div className="bg-card border-t-4 border-yellow-500 p-4 rounded-b-lg shadow-sm">
          <NotesField sectionId={sectionId} fieldKey="depends" label="It Depends" className="mt-0" />
        </div>
        <div className="bg-card border-t-4 border-red-500 p-4 rounded-b-lg shadow-sm">
          <NotesField sectionId={sectionId} fieldKey="risky" label="Risky" className="mt-0" />
        </div>
      </div>

      <div className="mb-8">
        <NotesField sectionId={sectionId} fieldKey="condition" label="The condition that moves something from yellow to green for me" />
      </div>

      <DepthQuote>Context dictates risk. What is safe internally may be dangerous externally.</DepthQuote>
    </div>
  );
}

export function Capstone({ sectionId }: { sectionId: string }) {
  const [ways, setWays] = useAutoSave(sectionId, "ways-checked", "");

  const waysList = ["Draft", "Brainstorm", "Prepare", "Synthesize", "Distill", "Critique"];
  const checkedArray = ways ? ways.split(',').filter(Boolean) : [];

  const handleCheck = (way: string, checked: boolean) => {
    let newArray = [...checkedArray];
    if (checked) newArray.push(way);
    else newArray = newArray.filter(w => w !== way);
    setWays(newArray.join(','));
  };

  const sixWaysRows = [
    { name: "Draft", def: "Create something new — email, report, talking points, agenda", example: "Write an email explaining new ACL training requirements", key: "draft" },
    { name: "Brainstorm", def: "Generate options or ideas (approaches, solutions, alternatives)", example: "I'm developing a training on XYZ. What should I think through?", key: "brainstorm" },
    { name: "Prepare", def: "Get ready for a conversation (anticipate objections, plan questions)", example: "Help me prepare for a difficult performance conversation", key: "prepare" },
    { name: "Synthesize", def: "Find patterns across sources (themes in feedback, documents)", example: "Common themes across three staff survey responses", key: "synthesize" },
    { name: "Distill", def: "Make complex things clear (policy to plain language, long to short)", example: "Key points in this 50-page state directive", key: "distill" },
    { name: "Critique", def: "Evaluate and find weaknesses (check a draft, identify gaps)", example: "Review my draft budget narrative — what's missing?", key: "critique" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Capstone — Your 6 Ways in Action" type="exercise" />
      <GoalBox text="Build a complete, AI-assisted work product on a real task. Full cycle: prompt, run, verify, revise." />

      <div className="mb-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">The 6 Ways to Use AI</div>
      <p className="text-sm text-muted-foreground mb-4">For each use case, write one task you do regularly that AI could help with. Then pick one to build below.</p>

      <div className="overflow-x-auto mb-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-left p-3 text-xs font-bold tracking-wider uppercase w-28">Use Case</th>
              <th className="text-left p-3 text-xs font-bold tracking-wider uppercase">Definition</th>
              <th className="text-left p-3 text-xs font-bold tracking-wider uppercase hidden md:table-cell">Example</th>
              <th className="text-left p-3 text-xs font-bold tracking-wider uppercase w-48">A Task I Could Use AI For</th>
            </tr>
          </thead>
          <tbody>
            {sixWaysRows.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                <td className="p-3 font-bold text-accent align-top">{row.name}</td>
                <td className="p-3 text-muted-foreground align-top">{row.def}</td>
                <td className="p-3 text-muted-foreground italic text-xs align-top hidden md:table-cell">{row.example}</td>
                <td className="p-3 align-top">
                  <NotesField
                    sectionId={sectionId}
                    fieldKey={`6ways-${row.key}`}
                    label=""
                    placeholder="My task..."
                    className="mt-0 [&_label]:hidden"
                    minHeight="min-h-[36px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground text-center italic mb-6">And there are many more.</div>

      <div className="border-t border-border my-8 pt-6">
        <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-6">Now Build It</div>

        <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
          {[
            { n: 1, title: "Pick a Real Task", desc: "Choose one from the table above. Genuine work, not invented scenarios." },
            { n: 2, title: "Prime & Prompt", desc: "Use RICECO. Set up persistent context if you're building something reusable." },
            { n: 3, title: "Draft → Verify → Revise", desc: "Run the LLM Council. Verify facts, logic, tone. Apply Power Follow-Ups." },
          ].map(s => (
            <div key={s.n} className="flex gap-3 items-start mb-4 last:mb-0">
              <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
              <div>
                <div className="font-bold text-primary">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-l-4 border-accent pl-4 py-3 mb-8 bg-card rounded-r-lg shadow-sm">
          <h4 className="font-bold text-primary uppercase text-xs tracking-wider mb-1">Level Up</h4>
          <p className="text-foreground">Build inside a Project, Custom GPT, or NotebookLM so you can reopen it Monday.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <NotesField sectionId={sectionId} fieldKey="real-task" label="My Real Task" />

            <div className="mt-6 space-y-3">
              <Label className="text-sm font-semibold text-primary uppercase tracking-wider">Which of the 6 Ways?</Label>
              <div className="grid grid-cols-2 gap-3 bg-card p-4 rounded-lg border">
                {waysList.map(way => (
                  <div key={way} className="flex items-center space-x-2">
                    <Checkbox
                      id={`way-${way}`}
                      checked={checkedArray.includes(way)}
                      onCheckedChange={(checked) => handleCheck(way, checked as boolean)}
                    />
                    <label htmlFor={`way-${way}`} className="text-sm font-medium leading-none">
                      {way}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <NotesField sectionId={sectionId} fieldKey="context-tool" label="Persistent Context Tool Used" />
              <NotesField sectionId={sectionId} fieldKey="verified" label="How I Verified the Output" />
            </div>
          </div>
          <div className="space-y-4">
            <NotesField sectionId={sectionId} fieldKey="built" label="What I Built" minHeight="min-h-[160px]" />
            <NotesField sectionId={sectionId} fieldKey="surprised" label="What Surprised Me About the Process" />
          </div>
        </div>
      </div>

      <DepthQuote>Building something once is a skill. Building something you can reuse and hand to your team is a system.</DepthQuote>
    </div>
  );
}

export function OvernightAssignment({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Overnight Assignment" type="reference" />
      <GoalBox text="Use what you built on one safe task. Come to Day 2 ready to report." />

      <div className="bg-primary text-white p-6 rounded-lg mb-6 shadow-md">
        <h3 className="font-bold text-accent uppercase text-xs tracking-wider mb-2">The Ask</h3>
        <p className="text-white/90">
          Don't try to use AI for everything tonight. Pick <strong className="text-accent">one task</strong> — the one from today that felt most promising — and actually use your AI workspace on it before tomorrow.
        </p>
      </div>

      <div className="mb-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">Example — Find Your AI Workflows</div>

      <div className="bg-card border border-border rounded-lg p-5 mb-8">
        <h4 className="text-lg font-serif font-bold text-primary mb-5">Quarterly Data Summary for Leadership</h4>

        <div className="flex items-start gap-3 mb-4 flex-wrap">
          <div className="bg-primary text-white text-xs font-bold tracking-wider uppercase px-3 py-2 rounded text-center w-16 flex-shrink-0">Today</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              "Export data from system",
              "Build tables manually",
              "Write narrative",
              "Format for presentation",
              "Review & finalize",
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="border-2 border-primary rounded-lg p-2 text-center min-w-[80px]">
                  <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{i+1}</div>
                  <div className="text-xs text-primary font-semibold leading-tight">{step}</div>
                </div>
                {i < arr.length - 1 && <span className="text-muted-foreground">›</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 flex-wrap">
          <div className="bg-accent text-primary text-xs font-bold tracking-wider uppercase px-3 py-2 rounded text-center w-16 flex-shrink-0">With AI</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full">AI finds trends & drafts</span>
            <span className="text-muted-foreground">›</span>
            <div className="border-2 border-red-500 rounded-lg p-2 text-center min-w-[80px]">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">1</div>
              <div className="text-xs text-red-700 font-semibold leading-tight">Verify the numbers</div>
            </div>
            <span className="text-muted-foreground">›</span>
            <span className="bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full">AI formats</span>
            <span className="text-muted-foreground">›</span>
            <div className="border-2 border-red-500 rounded-lg p-2 text-center min-w-[80px]">
              <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">2</div>
              <div className="text-xs text-red-700 font-semibold leading-tight">Present to leadership</div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <h4 className="text-xs font-bold tracking-wider uppercase text-primary mb-3">Ask Yourself Tonight</h4>
          <ul className="space-y-1.5">
            {[
              "Where do you spend time on something a machine could draft first?",
              "Where do you repeat the same process weekly or monthly?",
              "Where does your team bottleneck waiting on someone to write, summarize, or translate?",
            ].map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-accent mt-1 flex-shrink-0 text-xs">●</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <NotesField sectionId={sectionId} fieldKey="helped" label="Where did AI help tonight?" />
        <NotesField sectionId={sectionId} fieldKey="judgment" label="Where was judgment or checking still required?" />
        <NotesField sectionId={sectionId} fieldKey="routine" label="What would need to be true for me or my team to use this routinely?" />
      </div>
    </div>
  );
}

export function SixWaysWorksheet({ sectionId }: { sectionId: string }) {
  const ways = [
    { name: "DRAFT", example: "First pass at a tricky email" },
    { name: "BRAINSTORM", example: "10 ideas for team offsite" },
    { name: "PREPARE", example: "Roleplay a difficult conversation" },
    { name: "SYNTHESIZE", example: "Find themes in 50 survey responses" },
    { name: "DISTILL", example: "Turn a 20-page report into a 1-pager" },
    { name: "CRITIQUE", example: "Find holes in my project plan" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="6 Ways Worksheet" type="reference" />

      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
        <p className="text-foreground font-medium">For each use case, write one task you do regularly that AI could help with.</p>
      </div>

      <div className="space-y-6">
        {ways.map(way => (
          <div key={way.name} className="bg-card p-6 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-accent text-primary font-bold px-3 py-1 rounded text-sm uppercase tracking-wider">{way.name}</span>
              <span className="text-muted-foreground text-sm italic">Ex: {way.example}</span>
            </div>
            <NotesField sectionId={sectionId} fieldKey={`sixways-${way.name.toLowerCase()}`} label="My Task" />
          </div>
        ))}
      </div>
    </div>
  );
}
