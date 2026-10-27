/**
 * Who may call which guide route?
 *
 * Local dev: everything except the Bolna webhook is private to this machine,
 * so a public tunnel cannot mint billable calls.
 * PUBLIC_DEPLOY=true: the browser routes accept same-origin requests.
 */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
const LOOPBACK = /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/;

export const isPublicDeploy = () => process.env.PUBLIC_DEPLOY === "true";

export function isLocalRequest(req: Request): boolean {
  const h = req.headers;
  if (!LOCAL_HOST.test((h.get("host") ?? "").trim())) return false;

  const fwdHost = h.get("x-forwarded-host");
  if (fwdHost && !LOCAL_HOST.test(fwdHost.trim())) return false;

  const fwdFor = h.get("x-forwarded-for");
  if (fwdFor && !fwdFor.split(",").every((ip) => LOOPBACK.test(ip.trim()))) return false;

  if (h.has("cf-connecting-ip") || h.has("cf-ray") || h.has("cf-visitor")) return false;
  return true;
}

export function isSameOriginBrowser(req: Request): boolean {
  const h = req.headers;
  const site = h.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

export const allowBrowserRoute = (req: Request) => isLocalRequest(req) || (isPublicDeploy() && isSameOriginBrowser(req));

export const allowDebugRoute = (req: Request) => !isPublicDeploy() && process.env.NODE_ENV !== "production" && isLocalRequest(req);

export const forbidden = () =>
  new Response(JSON.stringify({ error: "forbidden", message: "This endpoint is not available from here." }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });

export const clientIp = (req: Request) =>
  (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
