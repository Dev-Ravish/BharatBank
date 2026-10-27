import type { UIState } from "./actions";

export type Client = { send: (event: string, data: unknown) => void };

type LogEntry = { at: string; method: string; headers: Record<string, string>; query: string; body: string; result: unknown };

type Session = { clients: Set<Client>; state: UIState; lastPlanAt: number; lastSeen: number };

type Hub = { sessions: Map<string, Session>; log: LogEntry[] };

const g = globalThis as unknown as { __bharatGuideHub?: Hub };

export const hub: Hub = (g.__bharatGuideHub ??= { sessions: new Map(), log: [] });

const freshState = (): UIState => ({ path: "", controls: [] });

export const cleanSid = (x: unknown): string => (typeof x === "string" ? x.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) : "");

export function getSession(sid: string, create = false): Session | undefined {
  let s = hub.sessions.get(sid);
  if (!s && create) {
    s = { clients: new Set(), state: freshState(), lastPlanAt: 0, lastSeen: Date.now() };
    hub.sessions.set(sid, s);
  }
  if (s) s.lastSeen = Date.now();
  return s;
}

function prune() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [sid, s] of hub.sessions) if (s.clients.size === 0 && s.lastSeen < cutoff) hub.sessions.delete(sid);
}

export function addClient(sid: string, c: Client) {
  prune();
  getSession(sid, true)!.clients.add(c);
}

export function removeClient(sid: string, c: Client) {
  const s = hub.sessions.get(sid);
  if (s) {
    s.clients.delete(c);
    s.lastSeen = Date.now();
  }
}

export function publish(sid: string, event: string, data: unknown): number {
  const s = hub.sessions.get(sid);
  if (!s) return 0;
  for (const c of [...s.clients]) {
    try {
      c.send(event, data);
    } catch {
      s.clients.delete(c);
    }
  }
  return s.clients.size;
}

export const connectedSessions = () => [...hub.sessions.entries()].filter(([, s]) => s.clients.size > 0).map(([sid]) => sid);

export function addLog(entry: LogEntry) {
  hub.log.unshift(entry);
  if (hub.log.length > 30) hub.log.pop();
}
