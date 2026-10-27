// Mints a short-lived Bolna web-call session. The API key stays on the server.
// Docs: https://www.bolna.ai/docs/developer-resources/sdks/web-call

import { connection } from "next/server";
import { checkCallLimits } from "@/lib/guide/callLimit";
import { allowBrowserRoute, clientIp, forbidden, isPublicDeploy } from "@/lib/guide/guard";

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });

export async function POST(req: Request) {
  await connection();
  if (!allowBrowserRoute(req)) return forbidden();

  const apiKey = process.env.BOLNA_API_KEY?.trim();
  const agentId = process.env.BOLNA_AGENT_ID?.trim();

  if (!apiKey || !agentId) {
    return json(
      {
        error: "missing_env",
        message: "BOLNA_API_KEY and/or BOLNA_AGENT_ID are not set. Add them to .env.local and restart. See VOICE_AGENT.md.",
      },
      500
    );
  }

  if (isPublicDeploy()) {
    const limit = checkCallLimits(clientIp(req));
    if (!limit.ok) {
      return json({ error: "rate_limited", message: limit.reason }, 429, { "Retry-After": String(limit.retryAfterSec) });
    }
  }

  const { user_data } = (await req.json().catch(() => ({}))) as { user_data?: Record<string, unknown> };

  try {
    const r = await fetch("https://api.bolna.ai/web-call/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, user_data }),
    });
    return new Response(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return json({ error: "upstream_unreachable", message: String(e) }, 502);
  }
}
