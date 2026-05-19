import { supabase } from "@/integrations/supabase/client";

export interface IntegrityEvent {
  event_type: "dedupe";
  duplicate_kind: "group" | "item";
  identifier: string;
  details: Record<string, any>;
}

const sessionLogged = new Set<string>();

export async function logIntegrityEvent(evt: IntegrityEvent) {
  const key = `${evt.duplicate_kind}:${evt.identifier}`;
  if (sessionLogged.has(key)) return;
  sessionLogged.add(key);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("sidebar_integrity_log").insert({
      event_type: evt.event_type,
      duplicate_kind: evt.duplicate_kind,
      identifier: evt.identifier,
      details: evt.details,
      user_id: user?.id ?? null,
    });
  } catch (e) {
    console.warn("[sidebar-integrity] log failed", e);
  }
}

export interface IntegrityResult<T> {
  unique: T[];
  duplicates: Array<{ key: string; entries: T[] }>;
}

export function dedupeBy<T>(items: T[], keyFn: (t: T) => string): IntegrityResult<T> {
  const seen = new Map<string, T>();
  const dups = new Map<string, T[]>();
  for (const it of items) {
    const k = keyFn(it).trim().toLowerCase();
    if (!k) continue;
    if (seen.has(k)) {
      const arr = dups.get(k) ?? [seen.get(k)!];
      arr.push(it);
      dups.set(k, arr);
    } else {
      seen.set(k, it);
    }
  }
  return {
    unique: Array.from(seen.values()),
    duplicates: Array.from(dups.entries()).map(([key, entries]) => ({ key, entries })),
  };
}
