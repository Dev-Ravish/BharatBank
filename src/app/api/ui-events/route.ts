import { connection } from "next/server";
import { allowBrowserRoute, forbidden } from "@/lib/guide/guard";
import { addClient, cleanSid, removeClient, type Client } from "@/lib/guide/hub";

export async function GET(req: Request) {
  await connection();
  if (!allowBrowserRoute(req)) return forbidden();
  const sid = cleanSid(new URL(req.url).searchParams.get("sid"));
  if (sid.length < 6) return new Response("missing sid", { status: 400 });

  const enc = new TextEncoder();
  let client: Client | null = null;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const cleanup = () => {
    if (heartbeat) clearInterval(heartbeat);
    if (client) removeClient(sid, client);
    client = null;
  };

  const stream = new ReadableStream({
    start(controller) {
      client = {
        send: (event, data) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)),
      };
      addClient(sid, client);
      client.send("hello", { sid });
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(enc.encode(": ping\n\n"));
        } catch {
          cleanup();
        }
      }, 15000);
      req.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel: cleanup,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
