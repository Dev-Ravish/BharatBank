"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BolnaWebCall as BolnaWebCallType } from "@bolna/web-call";
import { RobotHead, type RobotHeadState } from "robot-heads";
import type { RobotGesture } from "@/lib/guide/gesture";

type CallState = "idle" | "connecting" | "ringing" | "active" | "ended";
type WebCallCtor = typeof BolnaWebCallType;

const ERROR_HELP: Record<string, string> = {
  microphone_denied: "Microphone blocked. Allow mic access in the address bar and try again.",
  at_capacity: "All voice lines are busy right now. Try again in a moment.",
  autoplay_blocked: "The browser blocked audio. Tap Saarthi again.",
  connect_failed: "Couldn't connect. Check your internet and try again.",
  call_rejected: "The call was rejected. Check that BOLNA_AGENT_ID is the Bharat Bank agent.",
  mint_failed:
    "Couldn't start the call. Check BOLNA_API_KEY and BOLNA_AGENT_ID in .env.local, or wait if you hit the call limit.",
  already_active: "A call is already running.",
};

const IDLE_LINES = [
  "Tap me, then tell me where you want to go.",
  "I can open payments, cards, deposits, or loans.",
  "Ask for your balance and I'll take you there.",
  "I'll point at the screen so you don't get lost.",
];

type Props = {
  userData: Record<string, string | number>;
  linked: boolean;
  aboveNav: boolean;
  atTop: boolean;
  guideLine: string | null;
  guideFace: RobotGesture | null;
};

export default function VoiceDock({ userData, linked, aboveNav, atTop, guideLine, guideFace }: Props) {
  const [state, setState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [idleIndex, setIdleIndex] = useState(0);
  const [showTalk, setShowTalk] = useState(true);

  const callRef = useRef<BolnaWebCallType | null>(null);
  const ctorRef = useRef<WebCallCtor | null>(null);
  const userDataRef = useRef(userData);
  userDataRef.current = userData;

  useEffect(() => {
    import("@bolna/web-call").then((mod) => {
      ctorRef.current = mod.BolnaWebCall;
    });
    return () => {
      callRef.current?.stop();
    };
  }, []);

  const dialing = state === "connecting" || state === "ringing";
  const live = state === "active";

  useEffect(() => {
    if (dialing || live || guideLine || error) return;
    const id = window.setInterval(() => {
      setIdleIndex((index) => (index + 1) % IDLE_LINES.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, [dialing, live, guideLine, error]);

  useEffect(() => {
    if (error) return;
    setShowTalk(true);
    if (dialing || live || guideLine || hover) return;
    const id = window.setTimeout(() => setShowTalk(false), 4200);
    return () => window.clearTimeout(id);
  }, [dialing, live, guideLine, error, hover]);

  const start = useCallback(async () => {
    setError(null);
    const Ctor = ctorRef.current ?? (await import("@bolna/web-call")).BolnaWebCall;
    const call = new Ctor({ sessionUrl: "/api/bolna-session" });
    callRef.current = call;

    call.on("state-change", (next) => {
      setState(next);
      if (next === "ended" || next === "idle") {
        setLevel(0);
        setMuted(false);
      }
    });
    call.on("volume-level", (value) => setLevel(value));
    call.on("error", (event) => setError(ERROR_HELP[event.code] ?? event.message));

    try {
      await call.start({ userData: userDataRef.current });
    } catch (startError) {
      console.warn("[bolna] start failed", startError);
      setState("idle");
    }
  }, []);

  const stop = useCallback(async () => {
    await callRef.current?.stop();
    setState("idle");
  }, []);

  const toggleMute = () => {
    const next = !muted;
    callRef.current?.setMuted(next);
    setMuted(next);
  };

  const talking = live && !muted && level > 0.08;
  const face: RobotHeadState = error
    ? "error"
    : guideFace
      ? guideFace
      : live && muted
        ? "sleeping"
        : state === "connecting"
          ? "thinking"
          : state === "ringing"
            ? "searching"
            : talking
              ? "speaking"
              : live
                ? "listening"
                : hover
                  ? "happy"
                  : "idle";
  const speed = talking ? 0.85 + Math.min(level, 1) * 1.5 : face === "working" || face === "searching" ? 1.15 : 1;
  const speech = guideLine
    ? guideLine
    : dialing
      ? state === "ringing"
        ? "Ringing now. I'll be right with you."
        : "Connecting. One moment."
      : live
        ? muted
          ? "Mic is off. Tap the mic when you want to talk."
          : "I'm listening. Tell me where to go."
        : IDLE_LINES[idleIndex];
  const actionLabel = dialing ? "Cancel the call" : live ? "Hang up" : "Talk to Saarthi";
  const hint = dialing ? "Cancel" : live ? "Hang up" : "Tap to talk";

  return (
    <div
      className={`mascot-dock${aboveNav ? " above-nav" : ""}${atTop ? " at-top" : ""}`}
      role="region"
      aria-label="Saarthi, voice guide"
      data-testid="saarthi"
    >
      <div className="mascot-anchor">
        {error ? (
          <div className="mascot-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ) : showTalk ? (
          <p className="mascot-bubble" role={guideLine || live || dialing ? "status" : undefined} key={speech}>
            <span className="mascot-name" aria-hidden="true">
              Saarthi
            </span>
            {speech}
          </p>
        ) : null}

        {live && (
          <button
            type="button"
            className="mascot-mute"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          >
            <MicIcon off={muted} />
          </button>
        )}

        <button
          type="button"
          className="mascot-hit"
          onClick={live || dialing ? stop : start}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          aria-pressed={live}
          aria-label={actionLabel}
        >
          <RobotHead
            className="mascot-robot"
            shape="rectangle"
            state={face}
            size={112}
            speed={speed}
            interactive
            aria-hidden
            style={{ pointerEvents: "none" }}
          />
          <span className="mascot-hint">
            <span
              className={`link-dot${linked ? " on" : ""}`}
              title={linked ? "Connected to this screen" : "Connecting to this screen"}
            />
            {hint}
          </span>
        </button>
      </div>
    </div>
  );
}

function MicIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" fill="currentColor" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 20h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {off && <path d="M5 5l14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}
