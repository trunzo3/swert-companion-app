import { cn } from "@/lib/utils";
import { Lock, ChevronRight, Home, MapPin, LogOut } from "lucide-react";
import { SectionWithStatus } from "@workspace/api-client-react";
import { clearSession } from "@/lib/auth";

interface SidebarProps {
  sections: SectionWithStatus[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onNavigateHome?: () => void;
}

const HIDDEN_SECTION_IDS = ["six-ways-worksheet"];

export function Sidebar({ sections, activeSectionId, onSelectSection, onNavigateHome }: SidebarProps) {
  const day1Sections = sections
    .filter(s => s.day === 1 && s.tier === 1 && !HIDDEN_SECTION_IDS.includes(s.id))
    .sort((a, b) => a.order - b.order);
  const day2Sections = sections
    .filter(s => s.day === 2 && s.tier === 1 && !HIDDEN_SECTION_IDS.includes(s.id))
    .sort((a, b) => a.order - b.order);
  const tier2Sections = sections
    .filter(s => s.tier === 2 && !HIDDEN_SECTION_IDS.includes(s.id))
    .sort((a, b) => a.order - b.order);
  const tier3Sections = sections
    .filter(s => s.tier === 3 && !HIDDEN_SECTION_IDS.includes(s.id))
    .sort((a, b) => a.order - b.order);

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
    <div className="w-64 border-r bg-card h-full overflow-y-auto hidden md:flex flex-col flex-shrink-0">
      <div className="flex-1">
        <div className="mb-4 px-2 space-y-1">
          <button
            onClick={onNavigateHome}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              "text-foreground hover:bg-secondary"
            )}
          >
            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onSelectSection("levels")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              activeSectionId === "levels"
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>Where Are You on the Path?</span>
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <SectionList items={day1Sections} title="Day 1" />
          <SectionList items={day2Sections} title="Day 2" />
          {tier2Sections.length > 0 && <SectionList items={tier2Sections} title="Tier 2 (Future)" />}
          {tier3Sections.length > 0 && <SectionList items={tier3Sections} title="Tier 3 (Future)" />}
        </div>
      </div>

      <div className="border-t border-border px-2 pt-3 pb-2">
        <button
          onClick={() => { clearSession(); window.location.href = import.meta.env.BASE_URL || "/"; }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
