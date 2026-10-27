import { connection } from "next/server";
import type { SnapControl } from "@/lib/guide/actions";
import { normalizePath } from "@/lib/guide/catalog";
import { allowBrowserRoute, forbidden } from "@/lib/guide/guard";
import { cleanSid, getSession } from "@/lib/guide/hub";

export async function POST(req: Request) {
  await connection();
  if (!allowBrowserRoute(req)) return forbidden();
  const body = (await req.json().catch(() => null)) as {
    sid?: string;
    path?: string;
    controls?: SnapControl[];
  } | null;
  if (!body || typeof body.path !== "string") return new Response("bad request", { status: 400 });

  const session = getSession(cleanSid(body.sid));
  if (!session) return new Response(null, { status: 204 });

  const path = normalizePath(body.path);
  // Ignore a report from the page we just left; accept the page we navigated to.
  if (Date.now() - session.lastPlanAt < 4000 && session.state.path && path !== session.state.path) {
    return new Response(null, { status: 204 });
  }
  const controls = Array.isArray(body.controls)
    ? body.controls
        .filter((c) => c && typeof c.id === "string")
        .slice(0, 40)
        .map((c) => ({
          id: String(c.id).slice(0, 80),
          label: String(c.label ?? "").slice(0, 80),
          value: String(c.value ?? "").slice(0, 120),
          text: String(c.text ?? "").replace(/\s+/g, " ").trim().slice(0, 280),
        }))
    : [];
  session.state = { path, controls };
  return new Response(null, { status: 204 });
}
