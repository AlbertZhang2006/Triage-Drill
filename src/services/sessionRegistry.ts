const REGISTRY_KEY = 'mci-triage-sessions';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SessionEntry {
  joinCode: string;
  incidentName: string;
  createdAt: number;
}

function readRegistry(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SessionEntry[];
  } catch {
    return [];
  }
}

function writeRegistry(entries: SessionEntry[]): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
}

function pruneStale(entries: SessionEntry[]): SessionEntry[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  return entries.filter((e) => e.createdAt > cutoff);
}

export function registerSession(joinCode: string, incidentName: string): void {
  const entries = pruneStale(readRegistry());
  // Avoid duplicates
  const existing = entries.findIndex((e) => e.joinCode === joinCode);
  if (existing !== -1) {
    entries[existing].incidentName = incidentName;
  } else {
    entries.push({ joinCode, incidentName, createdAt: Date.now() });
  }
  writeRegistry(entries);
}

export function unregisterSession(joinCode: string): void {
  const entries = readRegistry().filter((e) => e.joinCode !== joinCode);
  writeRegistry(entries);
}

export function findSession(joinCode: string): SessionEntry | null {
  const entries = pruneStale(readRegistry());
  return entries.find((e) => e.joinCode === joinCode) ?? null;
}

export function listActiveSessions(): SessionEntry[] {
  const entries = pruneStale(readRegistry());
  writeRegistry(entries); // persist the pruned list
  return entries;
}
