import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface Options<T> {
  /** Persist function — called with the latest value. */
  save: (value: T) => Promise<void>;
  /** Debounce window in ms. */
  delay?: number;
}

/**
 * Debounced autosave helper. Pass a value (typically your form state); when
 * it changes the hook waits `delay` ms then calls `save`. While saves are in
 * flight the latest value is queued so we never miss an edit. Returns a
 * status pill string and a `flush` function for unmount.
 */
export function useAutosaveDraft<T>(value: T, { save, delay = 600 }: Options<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightRef = useRef(false);
  const queuedRef = useRef<T | null>(null);
  const initialRef = useRef(true);

  const runSave = useCallback(
    async (val: T) => {
      if (inflightRef.current) {
        queuedRef.current = val;
        return;
      }
      inflightRef.current = true;
      setStatus("saving");
      try {
        await save(val);
        setStatus("saved");
        setSavedAt(new Date());
      } catch (e) {
        console.error("autosave failed", e);
        setStatus("error");
      } finally {
        inflightRef.current = false;
        if (queuedRef.current !== null) {
          const next = queuedRef.current;
          queuedRef.current = null;
          await runSave(next);
        }
      }
    },
    [save],
  );

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    setStatus("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSave(value), delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay, runSave]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (status === "dirty" || status === "saving") {
      await runSave(value);
    }
  }, [status, value, runSave]);

  // flush on unmount
  useEffect(() => () => void flush(), [flush]);

  return { status, savedAt, flush };
}
