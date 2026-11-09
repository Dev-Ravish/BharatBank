"use client";

import { useEffect, useRef, useState } from "react";
import type { CursorState } from "./GhostCursor";
import type { Step } from "@/lib/guide/actions";
import { gestureForStep, type RobotGesture } from "@/lib/guide/gesture";

export type GuideApi = {
  getPath: () => string;
  go: (href: string) => void;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "");
const normPath = (path: string) => {
  const bare = path.split("?")[0].split("#")[0];
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare || "/";
};

function flash(el: Element | null | undefined) {
  if (!el) return;
  el.classList.add("ui-glow");
  setTimeout(() => el.classList.remove("ui-glow"), 1600);
}

function findAll(id: string): HTMLElement[] {
  const want = norm(id);
  return [...document.querySelectorAll<HTMLElement>("[data-guide]")].filter((el) => norm(el.dataset.guide || "") === want);
}

function findOne(id: string, match?: string): HTMLElement | null {
  const all = findAll(id);
  if (match) {
    const n = norm(match);
    const hit = all.find((el) => {
      const label = norm(el.getAttribute("data-guide-label") || "");
      const text = norm((el.innerText || "").slice(0, 80));
      return (label && (label.includes(n) || n.includes(label))) || (text && n.length >= 3 && text.includes(n));
    });
    if (hit) return hit;
  }
  if (all[0]) return all[0];
  const want = norm(id);
  const loose = [...document.querySelectorAll<HTMLElement>("[data-guide]")].filter((el) => {
    const label = norm(el.getAttribute("data-guide-label") || "");
    const text = norm((el.innerText || "").slice(0, 40));
    return (label && (want.includes(label) || label.includes(want))) || (text.length >= 4 && want.includes(text));
  });
  return loose[0] ?? null;
}

async function waitFor(lookup: () => HTMLElement | null, ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const el = lookup();
    if (el) return el;
    await sleep(80);
  }
  return null;
}

function setReactValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
  if (descriptor?.set) descriptor.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function truthy(value: string) {
  return /^(1|true|yes|on|check|checked)$/i.test(value.trim());
}

function faceLine(gesture: RobotGesture): string | null {
  switch (gesture) {
    case "error":
      return "That didn't work. I'll try another way.";
    case "happy":
      return "That's done.";
    case "thinking":
      return "One moment.";
    case "searching":
      return "Looking that up.";
    case "working":
      return "Doing that now.";
    case "listening":
      return "I'm listening.";
    case "speaking":
      return "Here it is.";
    case "sleeping":
      return "I'll wait quietly.";
    default:
      return null;
  }
}

function caption(step: Step): string {
  switch (step.type) {
    case "navigate":
      return `Opening ${step.title}.`;
    case "highlight":
      return "Right over here.";
    case "set":
      return "Filling that in for you.";
    case "press":
      return step.stepUp ? "Your turn for the mPIN. I won't type it." : "Tapping that for you.";
  }
}

function applyValue(el: HTMLElement, value: string) {
  if (el.dataset.secret === "true") return false;
  if (el instanceof HTMLSelectElement) {
    const n = norm(value);
    const opt =
      [...el.options].find((o) => norm(o.value) === n || norm(o.text) === n) ??
      [...el.options].find((o) => norm(o.text).includes(n) || (n.length >= 3 && n.includes(norm(o.text))));
    if (!opt) return false;
    setReactValue(el, opt.value);
    return true;
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    const want = truthy(value);
    if (el.checked !== want) el.click();
    return true;
  }
  if (el instanceof HTMLInputElement && el.type === "range") {
    const num = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (!num) return false;
    setReactValue(el, num[0]);
    return true;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    let next = value;
    if (el instanceof HTMLInputElement && (el.type === "number" || el.inputMode === "numeric")) {
      const num = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
      if (num) next = num[0];
    }
    setReactValue(el, next);
    return true;
  }
  el.click();
  return true;
}

/**
 * Plays Bolna tool calls on the real Bharat Bank screens: a cursor moves,
 * then the page navigates, fields fill, and buttons press.
 */
export function useGuide(api: GuideApi, sid: string) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const [cursor, setCursor] = useState<CursorState>({ x: 40, y: 40, visible: false, click: 0 });
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const [face, setFace] = useState<RobotGesture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const queue: Step[] = [];
    let running = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let lineTimer: ReturnType<typeof setTimeout> | undefined;
    let faceTimer: ReturnType<typeof setTimeout> | undefined;
    let explicit: RobotGesture | null = null;

    const showFace = (gesture: RobotGesture | null, holdMs?: number) => {
      setFace(gesture);
      clearTimeout(faceTimer);
      if (gesture && holdMs) {
        faceTimer = setTimeout(() => {
          if (!cancelled) setFace(null);
        }, holdMs);
      }
    };

    const moveTo = async (x: number, y: number, ms = 550) => {
      setCursor((c) => ({ ...c, x, y, visible: true }));
      await sleep(ms);
    };

    const pointAt = async (el: HTMLElement | null) => {
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "auto" });
      await sleep(180);
      const r = el.getBoundingClientRect();
      await moveTo(r.left + r.width * 0.5, r.top + r.height * 0.5);
    };

    const clickAt = async (el: HTMLElement) => {
      await pointAt(el);
      setCursor((c) => ({ ...c, click: c.click + 1 }));
      flash(el);
      await sleep(180);
      if (el.dataset.secret === "true") return;
      el.click();
      await sleep(280);
    };

    const go = async (href: string) => {
      if (normPath(apiRef.current.getPath()) === normPath(href)) return;
      apiRef.current.go(href);
      const start = Date.now();
      while (Date.now() - start < 5000 && !cancelled) {
        if (normPath(apiRef.current.getPath()) === normPath(href)) {
          await sleep(500);
          return;
        }
        await sleep(50);
      }
    };

    const ensure = async (id: string, match?: string, reveal?: string) => {
      let el = findOne(id, match);
      if (!el && reveal) {
        const btn = findOne(reveal);
        if (btn && btn.dataset.secret !== "true") await clickAt(btn);
        el = await waitFor(() => findOne(id, match), 1800);
      }
      if (!el) el = await waitFor(() => findOne(id, match), 1600);
      return el;
    };

    const run = async (step: Step) => {
      switch (step.type) {
        case "navigate":
          await go(step.href);
          break;
        case "highlight": {
          const el = await ensure(step.id);
          flash(el);
          await pointAt(el);
          await sleep(900);
          break;
        }
        case "set": {
          const el = await ensure(step.id, undefined, step.reveal);
          if (!el) break;
          await pointAt(el);
          flash(el);
          applyValue(el, step.value);
          await sleep(400);
          break;
        }
        case "press": {
          const el = await ensure(step.id, step.match, step.reveal);
          if (!el || el.dataset.secret === "true") break;
          await clickAt(el);
          await sleep(350);
          break;
        }
      }
    };

    const drain = async () => {
      if (running) return;
      running = true;
      setBusy(true);
      clearTimeout(hideTimer);
      clearTimeout(lineTimer);
      clearTimeout(faceTimer);
      let acted = false;
      let waitedForPin = false;
      while (queue.length && !cancelled) {
        const step = queue.shift()!;
        if (step.type === "press" && step.stepUp) waitedForPin = true;
        else if (step.type === "set" || step.type === "press") acted = true;
        if (!cancelled) {
          setLine(caption(step));
          setFace(explicit ?? gestureForStep(step));
        }
        try {
          await run(step);
        } catch (e) {
          console.warn("[guide] step failed", step, e);
        }
      }
      running = false;
      setBusy(false);
      if (queue.length && !cancelled) {
        void drain();
        return;
      }
      const named = explicit;
      explicit = null;
      hideTimer = setTimeout(() => setCursor((c) => ({ ...c, visible: false })), 2500);
      lineTimer = setTimeout(() => {
        if (!cancelled) setLine(null);
      }, 1900);
      if (cancelled) return;
      if (named) showFace(named, 1800);
      else if (waitedForPin) showFace("thinking", 4000);
      else if (acted) showFace("happy", 1500);
      else showFace(null);
    };

    if (!sid) return;
    const es = new EventSource(`/api/ui-events?sid=${encodeURIComponent(sid)}`);
    es.addEventListener("hello", () => setLinked(true));
    es.addEventListener("action", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { steps?: Step[]; gesture?: RobotGesture | null };
        const steps = data.steps ?? [];
        const gesture = data.gesture ?? null;
        if (steps.length) {
          explicit = gesture;
          queue.push(...steps);
          void drain();
          return;
        }
        if (!gesture) return;
        explicit = null;
        setFace(gesture);
        setLine(faceLine(gesture));
        clearTimeout(lineTimer);
        clearTimeout(faceTimer);
        const hold = gesture === "error" ? 3400 : gesture === "idle" ? 900 : 4800;
        faceTimer = setTimeout(() => {
          if (!cancelled) setFace(null);
        }, hold);
        lineTimer = setTimeout(() => {
          if (!cancelled) setLine(null);
        }, hold);
      } catch (e) {
        console.warn("[guide] bad event", e);
      }
    });
    es.onerror = () => setLinked(false);

    return () => {
      cancelled = true;
      clearTimeout(hideTimer);
      clearTimeout(lineTimer);
      clearTimeout(faceTimer);
      es.close();
    };
  }, [sid]);

  return { cursor, busy, linked, line, face };
}
