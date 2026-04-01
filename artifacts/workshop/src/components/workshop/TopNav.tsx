import { useState } from "react";
import { useUnlockSection } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSaveFeedback } from "@workspace/api-client-react";

export function TopNav() {
  const [code, setCode] = useState("");
  const unlockMutation = useUnlockSection();
  const { toast } = useToast();
  
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const feedbackMutation = useSaveFeedback();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    unlockMutation.mutate(
      { data: { code: code.trim().toUpperCase() } },
      {
        onSuccess: (data) => {
          toast({
            title: "Section Unlocked",
            description: `You now have access to: ${data.sectionTitle}`,
          });
          setCode("");
          // Note: In a real app we'd probably trigger a refetch of sections here.
          // Since we might not have the refetch function passed down, we rely on the parent or query cache invalidation.
          // Or we can just let it be if the sections list updates.
          window.dispatchEvent(new Event('sections-updated'));
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Code not recognized",
            description: "Please check the code and try again.",
          });
        }
      }
    );
  };

  const submitFeedback = () => {
    if (!feedbackText.trim()) return;
    feedbackMutation.mutate(
      { data: { content: feedbackText } },
      {
        onSuccess: () => {
          toast({ title: "Feedback Submitted", description: "Thank you for your thoughts!" });
          setFeedbackOpen(false);
          setFeedbackText("");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Could not submit feedback." });
        }
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo />
        
        <div className="flex items-center gap-6">
          <form onSubmit={handleUnlock} className="hidden md:flex items-center gap-2">
            <Input 
              placeholder="Enter Code" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-32 uppercase"
              data-testid="input-unlock-code"
            />
            <Button type="submit" variant="secondary" disabled={unlockMutation.isPending} data-testid="button-unlock">
              Unlock
            </Button>
          </form>

          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="https://headandheartca.com/resources" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Resources
            </a>
            <a href="https://headandheartca.com/connect" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Talk with Anthony
            </a>
            
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <button className="hover:text-primary transition-colors" data-testid="link-feedback">
                  What Would You Like to Learn Next?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>What Would You Like to Learn Next?</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps us design future workshops and materials.
                  </p>
                  <Textarea 
                    placeholder="Tell us what topics you'd like us to cover..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="input-feedback"
                  />
                  <Button onClick={submitFeedback} disabled={feedbackMutation.isPending} data-testid="button-submit-feedback">
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </nav>
        </div>
      </div>
    </header>
  );
}
