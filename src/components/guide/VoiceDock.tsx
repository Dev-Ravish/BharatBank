"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BolnaWebCall as BolnaWebCallType } from "@bolna/web-call";

type CallState = "idle" | "connecting" | "ringing" | "active" | "ended";
type WebCallCtor = typeof BolnaWebCallType;

const ERROR_HELP: Record<string, string> = {
  microphone_denied: "Microphone blocked. Allow mic access in the address bar and try again.",
  at_capacity: "All voice lines are busy right now. Try again in a moment.",
  autoplay_blocked: "The browser blocked audio. Click the button again.",
  connect_failed: "Couldn't connect. Check your internet and try again.",
  call_rejected: "The call was rejected. Check that BOLNA_AGENT_ID is the Bharat Bank agent.",
  mint_failed:
    "Couldn't start the call. Check BOLNA_API_KEY and BOLNA_AGENT_ID in .env.local, or wait if you hit the call limit.",
  already_active: "A call is already running.",
};

type Props = {
  userData: Record<string, string | number>;
  linked: boolean;
  aboveNav: boolean;
  atTop: boolean;
};

export default function VoiceDock({ userData, linked, aboveNav, atTop }: Props) {
  const [state, setState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const callRef = useRef<BolnaWebCallType | null>(null);
  const ctorRef = useRef<WebCallCtor | null>(null);
  const userDataRef = useRef(userData);
  userDataRef.current = userData;

  useEffect(() => {
    import("@bolna/web-call").then((m) => {
      ctorRef.current = m.BolnaWebCall;
    });
    return () => {
      callRef.current?.stop();
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const Ctor = ctorRef.current ?? (await import("@bolna/web-call")).BolnaWebCall;
    const call = new Ctor({ sessionUrl: "/api/bolna-session" });
    callRef.current = call;

    call.on("state-change", (s) => {
      setState(s);
      if (s === "ended" || s === "idle") {
        setLevel(0);
        setMuted(false);
      }
    });
    call.on("volume-level", (v) => setLevel(v));
    call.on("error", (e) => setError(ERROR_HELP[e.code] ?? e.message));

    try {
      await call.start({ userData: userDataRef.current });
    } catch (e) {
      console.warn("[bolna] start failed", e);
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

  const busy = state === "connecting" || state === "ringing";
  const live = state === "active";
  const label = busy ? (state === "ringing" ? "Ringing…" : "Connecting…") : live ? (muted ? "Muted" : "Listening…") : "Talk to Bharat";

  return (
    <div className={`voice-dock${aboveNav ? " above-nav" : ""}${atTop ? " at-top" : ""}`} role="region" aria-label="Voice assistant">
      {error && (
        <div className="voice-error" role="alert">
          {error}
          <button onClick={() => setError(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <div className={`voice-pill${live ? " live" : ""}${busy ? " busy" : ""}`}>
        <span className={`link-dot${linked ? " on" : ""}`} title={linked ? "Screen link connected" : "Screen link connecting"} />
        {live && (
          <button className={`voice-mute${muted ? " on" : ""}`} onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🎙️"}
          </button>
        )}
        <button
          className="voice-main"
          onClick={live || busy ? stop : start}
          aria-label={live || busy ? "End call" : "Talk to Bharat"}
          style={{ ["--level" as string]: level.toFixed(2) }}
        >
          <span className="voice-ring" />
          <span className="voice-icon">{live || busy ? "■" : "▶"}</span>
        </button>
        <span className="voice-label">{label}</span>
      </div>
    </div>
  );
}
