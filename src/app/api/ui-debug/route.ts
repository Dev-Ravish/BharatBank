import { connection } from "next/server";
import { allowDebugRoute, forbidden } from "@/lib/guide/guard";
import { hub } from "@/lib/guide/hub";

export async function GET(req: Request) {
  await connection();
  if (!allowDebugRoute(req)) return forbidden();
  const sessions = [...hub.sessions.entries()].map(([sid, s]) => ({
    sid,
    connected_tabs: s.clients.size,
    path: s.state.path,
    controls: s.state.controls.length,
  }));
  return new Response(JSON.stringify({ sessions, recent: hub.log }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
