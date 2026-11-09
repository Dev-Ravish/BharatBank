"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import GhostCursor from "./GhostCursor";
import VoiceDock from "./VoiceDock";
import { useGuide } from "./useGuide";

const NAV_PREFIXES = ["/dashboard", "/payments", "/products", "/account", "/profile"];

function readControls() {
  return [...document.querySelectorAll<HTMLElement>("[data-guide]")].filter((el) => el.dataset.secret !== "true").map((el) => {
    let value = "";
    if (el instanceof HTMLSelectElement) value = el.selectedOptions[0]?.text ?? el.value;
    else if (el instanceof HTMLInputElement && el.type === "checkbox") value = el.checked ? "on" : "off";
    else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) value = el.value;
    const text = (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: el.dataset.guide || "",
      label: el.getAttribute("data-guide-label") || el.getAttribute("aria-label") || text.slice(0, 60),
      value: value.slice(0, 120),
      text: el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement ? "" : text,
    };
  });
}

export default function GuideRoot() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [sid, setSid] = useState("");
  const [mpinOpen, setMpinOpen] = useState(false);

  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    let id = sessionStorage.getItem("bharatbank-sid");
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 6);
      sessionStorage.setItem("bharatbank-sid", id);
    }
    setSid(id);
  }, []);

  useEffect(() => {
    const look = () => setMpinOpen(!!document.querySelector("[data-guide='step-up-mpin']"));
    look();
    const obs = new MutationObserver(look);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  const guide = useGuide(
    {
      getPath: () => pathRef.current,
      go: (href) => routerRef.current.push(href),
    },
    sid
  );

  useEffect(() => {
    if (!sid || guide.busy) return;
    const send = () => {
      fetch("/api/ui-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, path: pathRef.current, controls: readControls() }),
      }).catch(() => {});
    };
    const t = setTimeout(send, guide.busy ? 700 : 280);
    return () => clearTimeout(t);
  }, [sid, pathname, guide.busy]);

  const aboveNav = !mpinOpen && NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      <GhostCursor cursor={guide.cursor} />
      <VoiceDock
        linked={guide.linked}
        aboveNav={aboveNav}
        atTop={mpinOpen}
        guideLine={guide.line}
        guideFace={guide.face}
        userData={{
          session_id: sid || "none",
          current_screen: pathname,
        }}
      />
    </>
  );
}
