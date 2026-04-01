import { useState } from "react";
import { useAutoSave } from "@/hooks/use-auto-save";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldProps {
  sectionId: string;
  fieldKey: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export function NotesField({ sectionId, fieldKey, label, placeholder, initialValue = "", className = "" }: NotesFieldProps) {
  const [value, setValue] = useAutoSave(sectionId, fieldKey, initialValue);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={fieldKey} className="text-sm font-semibold text-primary uppercase tracking-wider">{label}</Label>
      <Textarea
        id={fieldKey}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Add your notes here..."}
        className="min-h-[100px] resize-y bg-white border-border focus:border-ring"
        data-testid={`notes-${sectionId}-${fieldKey}`}
      />
    </div>
  );
}
