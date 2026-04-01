import { useGetNotesBySection } from "@workspace/api-client-react";
import { SectionHeader, GoalBox, InsightBox, RuleBox, DepthQuote } from "../SectionHeader";
import { NotesField } from "../NotesField";
import { useGetSafariWorksheets } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAutoSave } from "@/hooks/use-auto-save";
import { Label } from "@/components/ui/label";

export function VerificationTest({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Verification Test" type="exercise" />
      <GoalBox text="Catch the errors AI makes — before they catch you." />
      
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-primary mb-4">Steps</h3>
          <ol className="list-decimal list-inside space-y-3 text-foreground ml-2">
            <li>Open your AI tool — <a href="https://headandheartca.com/verify" target="_blank" rel="noreferrer" className="text-accent hover:underline">headandheartca.com/verify</a></li>
            <li>Paste the prompt block and run it</li>
            <li>Compare to the "Correct Information" key</li>
          </ol>
        </div>

        <RuleBox title="Quick Challenge">
          If you finish early, try a second model. Do the results differ?
        </RuleBox>

        <div className="space-y-8 mt-8">
          <NotesField sectionId={sectionId} fieldKey="observations" label="My Observations" />
          <NotesField sectionId={sectionId} fieldKey="caught-errors" label="Did my AI catch the errors?" />
          <NotesField sectionId={sectionId} fieldKey="trust" label="What does this tell me about trust?" />
        </div>

        <InsightBox>
          AI doesn't know when it's wrong. Confident delivery is not the same as accurate content. Your judgment is the quality control layer — not the model's.
        </InsightBox>
      </div>
    </div>
  );
}

export function ToolSafari({ sectionId }: { sectionId: string }) {
  const { data: worksheets = [] } = useGetSafariWorksheets();
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Tool Safari" type="exercise" />
      <GoalBox text="Explore multiple AI tools hands-on. Know which tool fits which task." />
      
      <div className="bg-card p-6 rounded-lg border mb-8">
        <p className="text-foreground">Take 15 minutes to explore different tools using the provided worksheets. Switch tabs below to document your findings for each tool.</p>
      </div>

      {worksheets.length > 0 ? (
        <Tabs defaultValue={worksheets[0]?.id.toString()} className="w-full">
          <TabsList className="flex flex-wrap h-auto justify-start mb-6 bg-secondary/50">
            {worksheets.map(w => (
              <TabsTrigger key={w.id} value={w.id.toString()} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {w.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {worksheets.map(w => (
            <TabsContent key={w.id} value={w.id.toString()} className="space-y-6 bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold text-primary mb-4">{w.name} Exploration</h3>
              <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-surprised`} label="What surprised me" />
              <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-worked`} label="What worked well" />
              <NotesField sectionId={sectionId} fieldKey={`safari-${w.id}-didnt-work`} label="What didn't work" />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="p-8 text-center border rounded-lg bg-secondary/20 text-muted-foreground">
          No worksheets available yet.
        </div>
      )}

      <div className="mt-12 border-t pt-8">
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
          <div key={r.l} className="flex gap-4 p-4 border rounded-lg bg-card items-start">
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
            <NotesField key={r.l} sectionId={sectionId} fieldKey={`riceco-${r.l}`} label={r.name} placeholder={`Enter ${r.name.toLowerCase()}...`} />
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
          {["R", "I", "C", "E", "C", "O"].map(l => (
            <NotesField key={l} sectionId={sectionId} fieldKey={`draft-riceco-${l}`} label={`RICECO: ${l}`} />
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
      
      <div className="flex items-center gap-4 mb-8 text-primary font-bold">
        <span className="bg-secondary px-4 py-2 rounded-full border">Draft</span>
        <span className="text-accent">→</span>
        <span className="bg-secondary px-4 py-2 rounded-full border">Critique</span>
        <span className="text-accent">→</span>
        <span className="bg-secondary px-4 py-2 rounded-full border">Respond</span>
      </div>

      <div className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg font-mono text-sm mb-8 overflow-x-auto border border-border/50 shadow-inner">
        <div className="text-[#569cd6] mb-2">// Critique Scaffold</div>
        <div><span className="text-[#c586c0]">Role:</span> You are an expert editor and critical thinker.</div>
        <div className="mt-2"><span className="text-[#c586c0]">Task:</span> Review the following text and identify:</div>
        <div className="ml-4">- Logical gaps or leaps</div>
        <div className="ml-4">- Unclear phrasing</div>
        <div className="ml-4">- Tone inconsistencies</div>
        <div className="mt-2"><span className="text-[#c586c0]">Format:</span> Provide bulleted feedback, then a revised version.</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <NotesField sectionId={sectionId} fieldKey="model-a" label="Model A used" />
        <NotesField sectionId={sectionId} fieldKey="model-b" label="Model B used" />
      </div>
      
      <div className="space-y-6 mb-8">
        <NotesField sectionId={sectionId} fieldKey="feedback" label="Key feedback from Model B" />
        <NotesField sectionId={sectionId} fieldKey="changes" label="Changes I made after revision" />
        <NotesField sectionId={sectionId} fieldKey="disagreement" label="Did the models disagree? How?" />
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
        <p className="text-foreground">AI predicts the next most likely word based on patterns. It does not "think".</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-primary border-b pb-2">It IS</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✦</span>
              <span><strong>Probabilistic</strong><br/><span className="text-muted-foreground text-sm">It guesses based on math, not facts.</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✦</span>
              <span><strong>Pattern Matching at Scale</strong><br/><span className="text-muted-foreground text-sm">It finds connections humans might miss.</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✦</span>
              <span><strong>A Confident Communicator</strong><br/><span className="text-muted-foreground text-sm">It sounds authoritative, even when wrong.</span></span>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-serif font-bold text-destructive border-b pb-2">It Is NOT</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>Thinking or Knowing</strong><br/><span className="text-muted-foreground text-sm">It has no comprehension of the words it generates.</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>Sentient or Caring</strong><br/><span className="text-muted-foreground text-sm">It does not have feelings or intent.</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✕</span>
              <span><strong>A Reliable Fact Database</strong><br/><span className="text-muted-foreground text-sm">It is a reasoning engine, not a search engine.</span></span>
            </li>
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

      <InsightBox>
        When stakes are high... use RAG (NotebookLM) for highest accuracy with citations you can verify.
      </InsightBox>

      <div className="space-y-6 mt-8">
        <NotesField sectionId={sectionId} fieldKey="first-setup" label="The persistent context tool I'll set up first" />
        <NotesField sectionId={sectionId} fieldKey="notes" label="General notes" />
      </div>
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Capstone" type="exercise" />
      <GoalBox text="Build a complete, AI-assisted work product." />
      
      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm flex items-center justify-between">
        <ol className="list-decimal list-inside space-y-2 text-foreground font-medium">
          <li>Pick real task</li>
          <li>Prime & Prompt</li>
          <li>Draft → Verify → Revise</li>
        </ol>
      </div>

      <div className="border-l-4 border-accent pl-4 py-3 my-8 bg-card rounded-r-lg shadow-sm">
        <h4 className="font-bold text-primary uppercase text-xs tracking-wider mb-1">Level Up</h4>
        <p className="text-foreground">Combine tools. Use one to outline, another to draft, and a third to critique.</p>
      </div>

      <div className="space-y-8">
        <NotesField sectionId={sectionId} fieldKey="real-task" label="My real task" />
        
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-primary uppercase tracking-wider">Which of the 6 Ways?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-card p-6 rounded-lg border">
            {waysList.map(way => (
              <div key={way} className="flex items-center space-x-2">
                <Checkbox 
                  id={`way-${way}`} 
                  checked={checkedArray.includes(way)}
                  onCheckedChange={(checked) => handleCheck(way, checked as boolean)}
                />
                <label htmlFor={`way-${way}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {way}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <NotesField sectionId={sectionId} fieldKey="context-tool" label="Persistent context tool used" />
          <NotesField sectionId={sectionId} fieldKey="verified" label="How I verified the output" />
        </div>
        
        <NotesField sectionId={sectionId} fieldKey="built" label="What I built" />
        <NotesField sectionId={sectionId} fieldKey="surprised" label="What surprised me about the process" />
      </div>

      <DepthQuote>The goal is not to replace the work, but to elevate the starting line.</DepthQuote>
    </div>
  );
}

export function OvernightAssignment({ sectionId }: { sectionId: string }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Overnight Assignment" type="reference" />
      
      <h2 className="text-3xl font-serif font-bold text-primary mb-6">Tonight</h2>
      
      <div className="bg-primary text-white p-6 rounded-lg mb-8 shadow-md">
        <h3 className="font-bold text-accent uppercase text-xs tracking-wider mb-2">The Ask</h3>
        <p className="text-lg">Don't try to use AI for everything tonight. Pick ONE workflow and push it as far as you can.</p>
      </div>

      <div className="bg-card p-6 border rounded-lg mb-8 shadow-sm">
        <h3 className="font-bold text-primary mb-4 text-lg">Think About Your Workflows</h3>
        <ul className="list-disc list-inside space-y-2 text-foreground ml-2">
          <li>What is the most tedious part of your day?</li>
          <li>Where do you spend too much time staring at a blank page?</li>
          <li>What communication feels high-stakes but routine?</li>
        </ul>
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
