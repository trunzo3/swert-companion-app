import { useState, useEffect, useRef, useCallback } from "react";
import { useSaveNote, useGetNotesBySection, getGetNotesBySectionQueryKey } from "@workspace/api-client-react";

const BASE = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";

// Module-level cache: survives component unmount/remount during tab switches.
// Shape: Map<sectionId, Map<fieldKey, content>>
const pendingNotes = new Map<string, Map<string, string>>();

function setCached(sectionId: string, fieldKey: string, content: string) {
  if (!pendingNotes.has(sectionId)) pendingNotes.set(sectionId, new Map());
  pendingNotes.get(sectionId)!.set(fieldKey, content);
}

function getCached(sectionId: string, fieldKey: string): string | undefined {
  return pendingNotes.get(sectionId)?.get(fieldKey);
}

function clearCached(sectionId: string, fieldKey: string) {
  pendingNotes.get(sectionId)?.delete(fieldKey);
}

// keepalive: true ensures the request completes even if the page navigates away immediately.
function saveNoteDirectly(sectionId: string, fieldKey: string, content: string) {
  fetch(`${BASE}/api/notes/${sectionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    keepalive: true,
    body: JSON.stringify({ fieldKey, content }),
  }).catch(() => {});
}

export function useAutoSave(sectionId: string, fieldKey: string, defaultValue: string = "") {
  const [value, setValue] = useState<string>(() => {
    // Immediately restore from module-level cache when remounting after a tab switch
    return getCached(sectionId, fieldKey) ?? defaultValue;
  });

  const { mutate: saveNote } = useSaveNote();

  const lastSavedRef = useRef<string>("");
  const currentValueRef = useRef<string>(value);
  const initialized = useRef(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionIdRef = useRef(sectionId);
  const fieldKeyRef = useRef(fieldKey);
  useEffect(() => {
    sectionIdRef.current = sectionId;
    fieldKeyRef.current = fieldKey;
  }, [sectionId, fieldKey]);

  const { data: notes, isSuccess } = useGetNotesBySection(sectionId, {
    query: {
      enabled: !!sectionId,
      queryKey: getGetNotesBySectionQueryKey(sectionId),
      // Always refetch on mount so we pick up server data after tab switches
      refetchOnMount: true,
      staleTime: 0,
    }
  });

  // Hydrate from server — but only if local cache doesn't have something newer
  useEffect(() => {
    if (!isSuccess) return;
    const serverNote = notes?.find(n => n.fieldKey === fieldKey);
    const serverContent = serverNote ? serverNote.content : defaultValue;

    if (!initialized.current) {
      // On first mount: prefer local cache (tab switch) over server (may lag behind keepalive save)
      const localContent = getCached(sectionId, fieldKey);
      const initial = localContent ?? serverContent;
      setValue(initial);
      currentValueRef.current = initial;
      lastSavedRef.current = initial;
      initialized.current = true;
      // Once server confirmed the data, clear the local cache entry
      if (localContent !== undefined && localContent === serverContent) {
        clearCached(sectionId, fieldKey);
      }
    } else {
      // On subsequent refetches: only update if we don't have unsaved local changes
      if (currentValueRef.current === lastSavedRef.current) {
        setValue(serverContent);
        currentValueRef.current = serverContent;
        lastSavedRef.current = serverContent;
        clearCached(sectionId, fieldKey);
      }
    }
  }, [isSuccess, notes, fieldKey, sectionId, defaultValue]);

  // Keep currentValueRef in sync
  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  // (a) Debounce: save 1.5s after last keystroke
  useEffect(() => {
    if (!initialized.current) return;
    if (value === lastSavedRef.current) return;
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      saveNote({ sectionId, data: { fieldKey, content: value } });
      lastSavedRef.current = value;
      clearCached(sectionId, fieldKey);
      pendingTimerRef.current = null;
    }, 1500);
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, [value, sectionId, fieldKey, saveNote]);

  // (c) Unmount: flush unsaved data. Cache it locally AND fire keepalive fetch.
  useEffect(() => {
    return () => {
      if (!initialized.current) return;
      const curr = currentValueRef.current;
      if (curr === lastSavedRef.current) return;
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
      // Store in local cache so remounting tab sees it immediately
      setCached(sectionIdRef.current, fieldKeyRef.current, curr);
      // Also persist to server (survives page reload)
      saveNoteDirectly(sectionIdRef.current, fieldKeyRef.current, curr);
      lastSavedRef.current = curr;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (b) Blur: immediate save via keepalive fetch + update local cache
  const flushSave = useCallback(() => {
    if (!initialized.current) return;
    const curr = currentValueRef.current;
    if (curr === lastSavedRef.current) return;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    setCached(sectionIdRef.current, fieldKeyRef.current, curr);
    saveNoteDirectly(sectionIdRef.current, fieldKeyRef.current, curr);
    lastSavedRef.current = curr;
  }, []);

  return [value, setValue, flushSave] as const;
}
