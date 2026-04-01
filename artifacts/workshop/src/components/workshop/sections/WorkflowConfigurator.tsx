import { useState, useEffect, useRef } from "react";
import { useGetWorkflowMaps, useCreateWorkflowMap, useUpdateWorkflowMap, useDeleteWorkflowMap } from "@workspace/api-client-react";
import { SectionHeader, GoalBox, DepthQuote } from "../SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowMap } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

// We'll use a simpler array reordering approach instead of dnd-kit to ensure stability
// since dnd-kit can be complex to setup correctly in a single file without full context.

function StepList({ 
  steps, 
  title, 
  onChange 
}: { 
  steps: string[], 
  title: string, 
  onChange: (steps: string[]) => void 
}) {
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    onChange(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      onChange(newSteps);
    } else if (direction === 'down' && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
      onChange(newSteps);
    }
  };

  const addStep = () => {
    onChange([...steps, ""]);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-primary uppercase text-sm tracking-wider border-b pb-2">{title}</h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2 bg-secondary/20 p-2 rounded border">
            <div className="flex flex-col gap-1 mt-1">
              <button 
                onClick={() => moveStep(index, 'up')} 
                disabled={index === 0}
                className="text-muted-foreground hover:text-primary disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveStep(index, 'down')} 
                disabled={index === steps.length - 1}
                className="text-muted-foreground hover:text-primary disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <Textarea 
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="min-h-[60px] resize-none"
              />
            </div>
            <button 
              onClick={() => removeStep(index)}
              className="text-muted-foreground hover:text-destructive mt-2 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addStep} className="w-full mt-2">
        <Plus className="w-4 h-4 mr-2" /> Add Step
      </Button>
    </div>
  );
}

function WorkflowEditor({ 
  map, 
  onSave, 
  onDelete 
}: { 
  map: WorkflowMap, 
  onSave: (id: number, data: Partial<WorkflowMap>) => void,
  onDelete: (id: number) => void
}) {
  const [data, setData] = useState<Partial<WorkflowMap>>({
    name: map.name,
    frequency: map.frequency,
    currentSteps: map.currentSteps || [],
    redesignedSteps: map.redesignedSteps || [],
    verificationCheckpoints: map.verificationCheckpoints || "",
    stopConditions: map.stopConditions || ""
  });

  const lastSavedData = useRef(data);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateField = (field: keyof WorkflowMap, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      
      saveTimeout.current = setTimeout(() => {
        onSave(map.id, data);
        lastSavedData.current = data;
      }, 1000);
    }
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [data, map.id, onSave]);

  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <Card className="mb-8 border-primary/20 shadow-md">
      <CardHeader className="bg-secondary/30 border-b flex flex-row items-center justify-between pb-4">
        <div className="flex-1 mr-4 space-y-4">
          <div>
            <Label className="text-xs uppercase font-bold text-muted-foreground">Workflow Name</Label>
            <Input 
              value={data.name} 
              onChange={(e) => updateField('name', e.target.value)}
              className="text-lg font-bold bg-transparent border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              placeholder="Untitled Workflow"
            />
          </div>
          <div>
            <Label className="text-xs uppercase font-bold text-muted-foreground">Frequency</Label>
            <Input 
              value={data.frequency} 
              onChange={(e) => updateField('frequency', e.target.value)}
              className="bg-background"
              placeholder="e.g., Daily, Weekly, Monthly"
            />
          </div>
        </div>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workflow?</DialogTitle>
            </DialogHeader>
            <p className="py-4">Are you sure you want to delete this workflow map? This cannot be undone.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={() => { onDelete(map.id); setDeleteOpen(false); }}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <StepList 
            title="Today — How It Works" 
            steps={data.currentSteps || []} 
            onChange={(steps) => updateField('currentSteps', steps)} 
          />
          <StepList 
            title="With AI — Redesigned" 
            steps={data.redesignedSteps || []} 
            onChange={(steps) => updateField('redesignedSteps', steps)} 
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 border-t pt-6 mt-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-primary uppercase tracking-wider">Human Verification Checkpoints</Label>
            <Textarea 
              value={data.verificationCheckpoints}
              onChange={(e) => updateField('verificationCheckpoints', e.target.value)}
              placeholder="Where must a human review the output?"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-primary uppercase tracking-wider">Stop Conditions</Label>
            <Textarea 
              value={data.stopConditions}
              onChange={(e) => updateField('stopConditions', e.target.value)}
              placeholder="When should we abandon the AI approach for this task?"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkflowConfigurator({ sectionId }: { sectionId: string }) {
  const { data: maps = [], refetch } = useGetWorkflowMaps();
  const createMutation = useCreateWorkflowMap();
  const updateMutation = useUpdateWorkflowMap();
  const deleteMutation = useDeleteWorkflowMap();

  const handleCreate = () => {
    createMutation.mutate(
      { data: { name: "New Workflow" } },
      { onSuccess: () => refetch() }
    );
  };

  const handleUpdate = (id: number, data: Partial<WorkflowMap>) => {
    updateMutation.mutate({ id, data });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-primary pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-accent/10 text-accent border border-accent px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Flagship Exercise
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Workflow Configurator</h1>
        </div>
        <Button onClick={handleCreate} disabled={createMutation.isPending} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> New Workflow Map
        </Button>
      </div>
      
      <GoalBox text="Produce a one-page, deployable workflow document." />
      
      {maps.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-secondary/10">
          <p className="text-muted-foreground mb-4">No workflow maps yet.</p>
          <Button onClick={handleCreate} variant="outline">Create your first map</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {maps.map(map => (
            <WorkflowEditor 
              key={map.id} 
              map={map} 
              onSave={handleUpdate} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      <DepthQuote>A good workflow removes the need for brilliant execution every time.</DepthQuote>
    </div>
  );
}
