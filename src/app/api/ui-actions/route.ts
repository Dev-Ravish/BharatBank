// Webhook Bolna calls when the voice agent uses the ui_action tool.
// Protected by UI_ACTION_TOKEN. The agent passes the screen session code
// (prompt variable {{session_id}}) so the action reaches the right browser tab.

import { connection } from "next/server";
import { describeState, plan } from "@/lib/guide/actions";
import { addLog, cleanSid, connectedSessions, getSession, publish } from "@/lib/guide/hub";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function authorized(req: Request): boolean | "no_token" {
  const token = process.env.UI_ACTION_TOKEN?.trim();
  if (!token) return "no_token";
  const header = (req.headers.get("authorization") ?? "").trim();
  return header === `Bearer ${token}` || header === token;
}

async function readParams(req: Request): Promise<{ raw: string; params: Record<string, string> }> {
  const url = new URL(req.url);
  const params: Record<string, string> = Object.fromEntries(url.searchParams.entries());
  let raw = "";
  if (req.method !== "GET") {
    raw = await req.text().catch(() => "");
    if (raw.trim()) {
      try {
        const body = JSON.parse(raw);
        if (body && typeof body === "object") {
          for (const [k, v] of Object.entries(body)) params[k] = v === null || v === undefined ? "" : String(v);
        }
      } catch {
        for (const [k, v] of new URLSearchParams(raw).entries()) params[k] = v;
      }
    }
  }
  return { raw, params };
}

function pickSession(rawSid: string | undefined): { sid: string } | { error: string } {
  const wanted = cleanSid(rawSid);
  const noneWord = !wanted || wanted === "none" || wanted === "null";
  const connected = connectedSessions();

  if (!noneWord) {
    return connected.includes(wanted)
      ? { sid: wanted }
      : { error: "That customer's screen is not connected. Ask them to refresh Bharat Bank and try again." };
  }
  if (connected.length === 1) return { sid: connected[0] };
  if (connected.length === 0) return { error: "The customer's screen is not connected. Ask them to refresh the Bharat Bank page." };
  return { error: "Several customers are online. Pass the session code from your prompt." };
}

async function handle(req: Request) {
  await connection();
  const auth = authorized(req);
  if (auth === "no_token") return json({ ok: false, error: "Server is missing UI_ACTION_TOKEN." }, 500);
  if (!auth) return json({ ok: false, error: "Unauthorized" }, 401);

  const { raw, params } = await readParams(req);
  const url = new URL(req.url);

  let result: Record<string, unknown>;
  const picked = pickSession(params.session);
  if ("error" in picked) {
    result = { ok: false, error: picked.error };
  } else {
    const session = getSession(picked.sid)!;
    const p = plan({ action: params.action, target: params.target, value: params.value }, session.state);
    if (!p.ok) {
      result = { ok: false, error: p.error, ...(p.hint ? { hint: p.hint } : {}), ...describeState(session.state) };
    } else {
      session.state = p.state;
      session.lastPlanAt = Date.now();
      if (p.steps.length) publish(picked.sid, "action", { steps: p.steps });
      result = {
        ok: true,
        note: p.steps.length
          ? "The screen is animating this now. Describe what you asked it to do. Do not claim money has moved until a later result shows a receipt or success message."
          : "Nothing moved. Here is what is on screen.",
        ...(p.stepUp
          ? { mpin: "An MPIN sheet will appear. Tell the customer to type their 6-digit MPIN and tap Confirm. Never ask them to say the MPIN, and never type it." }
          : {}),
        ...(p.warnings.length ? { warnings: p.warnings } : {}),
        ...describeState(p.state),
      };
    }
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = /authorization|cookie/i.test(k) ? "[redacted]" : v;
  });
  addLog({ at: new Date().toISOString(), method: req.method, headers, query: url.search, body: raw, result });
  console.log("[ui-actions]", req.method, raw || url.search, "=>", JSON.stringify(result).slice(0, 300));

  return json(result);
}

export const POST = handle;
export const GET = handle;
