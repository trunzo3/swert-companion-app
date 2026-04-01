import { SectionWithStatus } from "@workspace/api-client-react";
import { VerificationTest, ToolSafari, RicecoFramework, DraftWithRiceco, LlmPeerReview, Distill, Prepare, Synthesize, PowerFollowUps, WhatAiIs, PersistentContext, RedYellowGreen, Capstone, OvernightAssignment, SixWaysWorksheet } from "./sections/Day1";
import { OvernightHarvest, StatusQuoBias, CountyChangeFramework, CountyChangeMessage, Closing } from "./sections/Day2";
import { WorkflowConfigurator } from "./sections/WorkflowConfigurator";
import { Lock } from "lucide-react";

function LockedSection({ title, description, isFuture }: { title: string, description: string, isFuture: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 text-muted-foreground">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-4">{title}</h2>
      {isFuture ? (
        <p className="text-muted-foreground max-w-md">This content is available in future workshops.</p>
      ) : (
        <p className="text-muted-foreground max-w-md">{description}<br/><br/>Enter the access code above when instructed by the facilitator.</p>
      )}
    </div>
  );
}

export function SectionRenderer({ section }: { section: SectionWithStatus }) {
  // If locked, show locked state
  if (!section.unlocked) {
    return <LockedSection title={section.title} description={section.description} isFuture={section.tier > 1} />;
  }

  // Render component based on ID
  switch (section.id) {
    case "verification-test": return <VerificationTest sectionId={section.id} />;
    case "tool-safari": return <ToolSafari sectionId={section.id} />;
    case "riceco-framework": return <RicecoFramework sectionId={section.id} />;
    case "draft-with-riceco": return <DraftWithRiceco sectionId={section.id} />;
    case "llm-peer-review": return <LlmPeerReview sectionId={section.id} />;
    case "distill": return <Distill sectionId={section.id} />;
    case "prepare": return <Prepare sectionId={section.id} />;
    case "synthesize": return <Synthesize sectionId={section.id} />;
    case "power-follow-ups": return <PowerFollowUps sectionId={section.id} />;
    case "what-ai-is": return <WhatAiIs sectionId={section.id} />;
    case "persistent-context": return <PersistentContext sectionId={section.id} />;
    case "red-yellow-green": return <RedYellowGreen sectionId={section.id} />;
    case "capstone": return <Capstone sectionId={section.id} />;
    case "overnight-assignment": return <OvernightAssignment sectionId={section.id} />;
    case "six-ways-worksheet": return <SixWaysWorksheet sectionId={section.id} />;
    
    // Day 2
    case "overnight-harvest": return <OvernightHarvest sectionId={section.id} />;
    case "workflow-configurator": return <WorkflowConfigurator sectionId={section.id} />;
    case "status-quo-bias": return <StatusQuoBias sectionId={section.id} />;
    case "county-change-framework": return <CountyChangeFramework sectionId={section.id} />;
    case "county-change-message": return <CountyChangeMessage sectionId={section.id} />;
    case "closing": return <Closing sectionId={section.id} />;
    
    default:
      return (
        <div className="p-10 border-2 border-dashed rounded-lg text-center">
          <h2 className="text-xl font-bold">{section.title}</h2>
          <p className="text-muted-foreground mt-2">Content coming soon...</p>
        </div>
      );
  }
}
