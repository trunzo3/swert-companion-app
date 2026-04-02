import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSectionsQueryKey } from "@workspace/api-client-react";
import { TopNav } from "@/components/workshop/TopNav";
import { Sidebar } from "@/components/workshop/Sidebar";
import { SectionRenderer } from "@/components/workshop/SectionRenderer";
import { useGetSections } from "@workspace/api-client-react";
import { getSession } from "@/lib/auth";
import { useLocation, useSearch } from "wouter";

export default function Workshop() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      setLocation("/");
    }
  }, [session, setLocation]);

  const queryClient = useQueryClient();
  const { data: sections = [], isLoading } = useGetSections();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: getGetSectionsQueryKey() });
    };
    window.addEventListener('sections-updated', handleUpdate);
    return () => window.removeEventListener('sections-updated', handleUpdate);
  }, [queryClient]);

  const params = new URLSearchParams(searchStr);
  const querySection = params.get("section");

  const firstUnlocked = sections.find(s => s.unlocked && s.tier === 1);
  const defaultId = querySection || firstUnlocked?.id || sections[0]?.id || null;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (querySection && !selectedId) {
      setSelectedId(querySection);
    }
  }, [querySection]);

  const currentId = selectedId || defaultId;
  const currentSection = sections.find(s => s.id === currentId);

  const isLevels = currentId === "levels";

  if (isLoading || !session) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopNav onLogoClick={() => setLocation("/home")} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sections={sections}
          activeSectionId={currentId}
          onSelectSection={setSelectedId}
          onNavigateHome={() => setLocation("/home")}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-16">
          <div className="max-w-4xl mx-auto">
            {isLevels ? (
              <SectionRenderer section={{ id: "levels", title: "Where Are You on the Path?", unlocked: true, tier: 1, description: "" }} />
            ) : currentSection ? (
              <SectionRenderer section={currentSection} />
            ) : (
              <div className="text-center py-20 text-muted-foreground">Select a section to begin.</div>
            )}
          </div>

          <footer className="mt-32 pt-8 border-t flex justify-center text-muted-foreground">
            <button
              onClick={() => setLocation('/admin/login')}
              className="opacity-10 hover:opacity-40 transition-opacity p-2"
              data-testid="footer-brand-icon"
              title=""
              aria-label=""
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect width="24" height="24" rx="4" className="fill-current" />
                <path d="M6 12 Q12 6 18 12 Q12 18 6 12" fill="none" stroke="#C8963E" strokeWidth="2"/>
              </svg>
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
