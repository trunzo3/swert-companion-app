import { useState, useEffect, useRef } from "react";
import { useSaveNote, useGetNotesBySection, getGetNotesBySectionQueryKey } from "@workspace/api-client-react";

export function useAutoSave(sectionId: string, fieldKey: string, defaultValue: string = "") {
  const [value, setValue] = useState(defaultValue);
  const { mutate: saveNote } = useSaveNote();
  const lastSavedValue = useRef(defaultValue);
  const initialized = useRef(false);

  const { data: notes, isSuccess } = useGetNotesBySection(sectionId, { 
    query: { enabled: !!sectionId, queryKey: getGetNotesBySectionQueryKey(sectionId) } 
  });

  useEffect(() => {
    if (isSuccess && !initialized.current) {
      const note = notes?.find(n => n.fieldKey === fieldKey);
      const initialVal = note ? note.content : defaultValue;
      setValue(initialVal);
      lastSavedValue.current = initialVal;
      initialized.current = true;
    }
  }, [isSuccess, notes, fieldKey, defaultValue]);

  useEffect(() => {
    if (initialized.current && value !== lastSavedValue.current) {
      const handler = setTimeout(() => {
        saveNote({
          sectionId,
          data: { fieldKey, content: value }
        });
        lastSavedValue.current = value;
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [value, sectionId, fieldKey, saveNote]);

  return [value, setValue] as const;
}
