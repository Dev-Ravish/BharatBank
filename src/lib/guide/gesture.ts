import type { Step } from "./actions";

/** Faces from robot-heads. Kept here so the server never imports the canvas library. */
export const ROBOT_GESTURES = [
  "idle",
  "thinking",
  "searching",
  "listening",
  "speaking",
  "working",
  "happy",
  "error",
  "sleeping",
] as const;

export type RobotGesture = (typeof ROBOT_GESTURES)[number];

const NONE = new Set(["", "none", "null", "undefined", "n/a", "na", "nil", "-", "auto"]);

export function parseGesture(raw?: string | null): RobotGesture | null {
  const x = (raw ?? "").trim().toLowerCase();
  if (NONE.has(x)) return null;
  return (ROBOT_GESTURES as readonly string[]).includes(x) ? (x as RobotGesture) : null;
}

export function isGestureAction(action?: string | null): boolean {
  const x = (action ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return x === "gesture" || x === "express" || x === "face" || x === "mood";
}

/** What the head should do while a screen step is playing, when the agent did not name a face. */
export function gestureForStep(step: Step): RobotGesture {
  if (step.type === "navigate" || step.type === "highlight") return "searching";
  if (step.type === "press" && step.stepUp) return "thinking";
  return "working";
}
