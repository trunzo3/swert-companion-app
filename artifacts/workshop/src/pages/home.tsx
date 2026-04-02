import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetSections } from "@workspace/api-client-react";
import { getSession, clearSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { FeedbackDialog } from "@/components/workshop/TopNav";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const [, setLocation] = useLocation();
  const session = getSession();
  const { data: sections = [] } = useGetSections();
  const [dynamicContent, setDynamicContent] = useState("Welcome to the SWERT Summit. Enter the codes your facilitator shares to unlock each section. Your notes save automatically.");
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [codePending, setCodePending] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!session) { setLocation("/"); return; }
    fetch(`${BASE}/api/home-content`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.content) setDynamicContent(d.content); })
      .catch(() => {});
  }, [session]);

  const tier1Sections = sections.filter(s => s.tier === 1);
  const unlockedCount = tier1Sections.filter(s => s.unlocked).length;
  const totalCount = tier1Sections.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const handleLogout = () => {
    clearSession();
    setLocation("/");
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || codePending) return;
    setCodePending(true);
    setCodeMsg("");
    try {
      const res = await fetch(`${BASE}/api/sections/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeMsg(data.error || "Code not recognized.");
      } else {
        setCodeMsg("Section unlocked! Go to the workshop to access it.");
        setCode("");
        setTimeout(() => setCodeMsg(""), 4000);
      }
    } catch {
      setCodeMsg("Connection error.");
    } finally {
      setCodePending(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="bg-primary text-white px-6 py-3 flex items-center justify-between border-b border-primary/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/home")}>
          <Logo variant="white" className="scale-75 origin-left" />
        </div>
        <form onSubmit={handleUnlock} className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="px-3 py-1.5 bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded text-sm w-36 uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={codePending}
            className="px-3 py-1.5 bg-white/15 text-white border border-white/30 rounded text-sm font-semibold hover:bg-white/25 transition-colors"
          >
            Unlock
          </button>
        </form>
      </header>

      {codeMsg && (
        <div className={`px-6 py-2 text-sm font-medium text-center ${codeMsg.includes("unlocked") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {codeMsg}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center border-b border-border pb-6">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">SWERT Summit 2026</h1>
          <p className="text-muted-foreground text-sm">Your AI workshop companion. Everything you build here is saved and waiting for you.</p>
        </div>

        <div className="bg-secondary/40 rounded-lg p-5 border-l-4 border-accent">
          <div className="text-xs font-bold tracking-widest uppercase text-accent mb-2">From Your Facilitator</div>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{dynamicContent}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-sm font-bold text-primary mb-3">Workshop Progress</div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-xs text-muted-foreground">{unlockedCount} of {totalCount} sections unlocked</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="bg-card border border-border rounded-lg p-5 text-left hover:border-accent transition-colors shadow-sm"
          >
            <h4 className="font-bold text-primary text-sm mb-1">What should we teach next?</h4>
            <p className="text-xs text-muted-foreground">Tell us what you need</p>
          </button>
          <a
            href="https://talkwithanthony.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border rounded-lg p-5 text-left hover:border-accent transition-colors shadow-sm block"
          >
            <h4 className="font-bold text-primary text-sm mb-1">Talk with Anthony</h4>
            <p className="text-xs text-muted-foreground">Book a conversation</p>
          </a>
          <a
            href="https://headandheartca.com/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border rounded-lg p-5 text-left hover:border-accent transition-colors shadow-sm block"
          >
            <h4 className="font-bold text-primary text-sm mb-1">Other Resources</h4>
            <p className="text-xs text-muted-foreground">Additional content to support your journey</p>
          </a>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => setLocation("/workshop")}
            className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Go to Workshop →
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      </main>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
