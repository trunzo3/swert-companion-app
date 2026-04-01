import { cn } from "@/lib/utils";
import { Lock, Unlock, ChevronRight } from "lucide-react";
import { SectionWithStatus } from "@workspace/api-client-react";

interface SidebarProps {
  sections: SectionWithStatus[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export function Sidebar({ sections, activeSectionId, onSelectSection }: SidebarProps) {
  const day1Sections = sections.filter(s => s.day === 1 && s.tier === 1).sort((a, b) => a.order - b.order);
  const day2Sections = sections.filter(s => s.day === 2 && s.tier === 1).sort((a, b) => a.order - b.order);
  const tier2Sections = sections.filter(s => s.tier === 2).sort((a, b) => a.order - b.order);
  const tier3Sections = sections.filter(s => s.tier === 3).sort((a, b) => a.order - b.order);

  const SectionList = ({ items, title }: { items: SectionWithStatus[], title: string }) => (
    <div className="mb-6">
      <h3 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            data-testid={`sidebar-item-${section.id}`}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors text-left",
              activeSectionId === section.id 
                ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
                : "text-foreground hover:bg-secondary",
              !section.unlocked && "opacity-70"
            )}
          >
            <span className="truncate pr-2">{section.title}</span>
            {section.tier > 1 ? (
              <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            ) : section.unlocked ? (
              <ChevronRight className={cn("w-4 h-4 flex-shrink-0", activeSectionId === section.id ? "text-primary" : "text-transparent")} />
            ) : (
              <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] py-6 overflow-y-auto hidden md:block">
      <SectionList items={day1Sections} title="Day 1" />
      <SectionList items={day2Sections} title="Day 2" />
      <SectionList items={tier2Sections} title="Tier 2 (Future)" />
      <SectionList items={tier3Sections} title="Tier 3 (Future)" />
    </div>
  );
}
