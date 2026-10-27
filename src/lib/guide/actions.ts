/**
 * Turns a loose Bolna tool call into validated screen steps, and describes
 * what the customer will see so the agent can keep talking accurately.
 */
import {
  globalControls,
  normalizePath,
  resolveScreen,
  screenByPath,
  screens,
  type ControlDef,
  type ScreenDef,
} from "./catalog";

export type SnapControl = { id: string; label: string; value: string; text: string };

export type UIState = { path: string; controls: SnapControl[] };

export type Step =
  | { type: "navigate"; href: string; title: string }
  | { type: "set"; id: string; value: string; reveal?: string }
  | { type: "press"; id: string; match?: string; reveal?: string; stepUp?: boolean }
  | { type: "highlight"; id: string };

export type PlanResult =
  | { ok: true; steps: Step[]; state: UIState; warnings: string[]; stepUp: boolean }
  | { ok: false; error: string; hint?: unknown };

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "");
const isBlank = (x?: string | null) => x === undefined || x === null || x.trim() === "";
export const isNone = (x?: string | null) =>
  isBlank(x) || ["none", "null", "undefined", "n/a", "na", "nil", "-"].includes(x!.trim().toLowerCase());

/** The agent must never type or submit a PIN, password, OTP, or id number. */
export function isSecret(raw: string): boolean {
  const n = norm(raw);
  if (!n) return false;
  if (n.includes("mpin") || n.includes("password") || n.includes("aadhaar") || n.includes("aadhar") || n.includes("otp")) return true;
  if (n.includes("stepupconfirm") || n.includes("stepupmpin")) return true;
  if (n === "pin" || n.startsWith("pin") || n.endsWith("pin")) return true;
  return false;
}

const normalizeAction = (a: string) => {
  const x = a.trim().toLowerCase().replace(/[\s\-]+/g, "_");
  const map: Record<string, string> = {
    open: "open",
    show: "open",
    goto: "open",
    go: "open",
    navigate: "open",
    set: "set",
    fill: "set",
    type: "set",
    set_field: "set",
    press: "press",
    click: "press",
    tap: "press",
    highlight: "highlight",
    point: "highlight",
    where: "where",
    read: "where",
    look: "where",
  };
  return map[x];
};

function poolFor(screen: ScreenDef | undefined): ControlDef[] {
  return [...(screen?.controls ?? []), ...globalControls];
}

function matchControls(pool: ControlDef[], raw: string): ControlDef[] {
  const n = norm(raw);
  if (!n) return [];
  const exact = pool.filter((c) => norm(c.id) === n || norm(c.label) === n);
  if (exact.length) return exact;
  if (n.length < 3) return [];
  return pool.filter((c) => {
    const id = norm(c.id);
    const label = norm(c.label);
    return id.includes(n) || label.includes(n) || (id.length >= 4 && n.includes(id)) || (label.length >= 4 && n.includes(label));
  });
}

function choicePressId(control: ControlDef, raw: string): string | null {
  if (control.kind !== "choice" || !control.options?.length) return null;
  const n = norm(raw);
  const opt = control.options.find((o) => norm(o) === n) ?? control.options.find((o) => norm(o).includes(n) || n.includes(norm(o)));
  return opt ? `${control.id}-${opt.toLowerCase()}` : null;
}

function controlList(screen: ScreenDef | undefined): string[] {
  return poolFor(screen).map((c) => {
    const extra = c.options ? ` [${c.options.join(" | ")}]` : "";
    const flag = c.stepUp ? " (needs the customer's MPIN)" : "";
    return `${c.id} — ${c.label}${extra}${flag}`;
  });
}

export function parseAssignments(text: string): { name: string; value: string }[] {
  let parts = text.split(/;|\n/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1 && (parts[0].match(/=/g) ?? []).length > 1) {
    parts = parts[0].split(/,\s*(?=[A-Za-z][\w\- ]*\s*=)/).map((p) => p.trim());
  }
  return parts
    .map((p) => {
      const i = p.search(/[=:]/);
      return i > 0 ? { name: p.slice(0, i).trim(), value: p.slice(i + 1).trim() } : null;
    })
    .filter((x): x is { name: string; value: string } => !!x && !isNone(x.value));
}

function freshPath(start: UIState, screen: ScreenDef): { steps: Step[]; state: UIState } {
  const steps: Step[] = [];
  let state = start;
  if (normalizePath(start.path) !== screen.path) {
    steps.push({ type: "navigate", href: screen.path, title: screen.title });
    state = { path: screen.path, controls: [] };
  }
  return { steps, state };
}

type Built = { ok: true; steps: Step[]; stepUp: boolean } | { ok: false; error: string; hint?: unknown };

function buildControlStep(control: ControlDef, rawValue: string | undefined, as: "set" | "press"): Built {
  if (isSecret(control.id) || isSecret(control.label)) {
    return { ok: false, error: "That field is a PIN, password, or OTP. Ask the customer to type it on the screen. Never ask them to say it aloud." };
  }
  if (control.href) {
    return { ok: true, steps: [{ type: "navigate", href: control.href, title: control.label }], stepUp: false };
  }
  if (control.kind === "choice") {
    if (isNone(rawValue)) return { ok: false, error: `Tell me which ${control.label} to pick.`, hint: control.options };
    const id = choicePressId(control, rawValue!);
    if (!id) return { ok: false, error: `"${rawValue}" is not a ${control.label} option.`, hint: control.options };
    return { ok: true, steps: [{ type: "press", id, reveal: control.reveal, stepUp: control.stepUp }], stepUp: !!control.stepUp };
  }
  if (as === "press" || control.kind === "button") {
    const match = !isNone(rawValue) ? rawValue!.trim() : undefined;
    return {
      ok: true,
      steps: [{ type: "press", id: control.id, match, reveal: control.reveal, stepUp: control.stepUp }],
      stepUp: !!control.stepUp,
    };
  }
  if (isNone(rawValue)) return { ok: false, error: `Give a value for ${control.label}.` };
  return {
    ok: true,
    steps: [{ type: "set", id: control.id, value: rawValue!.trim(), reveal: control.reveal }],
    stepUp: false,
  };
}

function uniqueControl(pool: ControlDef[], raw: string): { control?: ControlDef; error?: string; hint?: unknown } {
  const found = matchControls(pool, raw);
  if (found.length === 1) return { control: found[0] };
  if (found.length > 1) return { error: `"${raw}" matches more than one control.`, hint: found.map((c) => c.id) };
  // A choice option named directly ("NEFT", "success")
  const viaChoice = pool.filter((c) => c.kind === "choice" && choicePressId(c, raw));
  if (viaChoice.length === 1) return { control: viaChoice[0] };
  return {};
}

export function plan(input: { action?: string; target?: string; value?: string }, start: UIState): PlanResult {
  const action = normalizeAction(input.action ?? "");
  if (!action) {
    return { ok: false, error: `Unknown action "${input.action}". Use open, set, press, highlight, or where.` };
  }
  if (isSecret(input.target ?? "") || isSecret(input.value ?? "")) {
    return { ok: false, error: "Refusing to enter a PIN, password, OTP, or id number. Ask the customer to type it on the screen, and never ask them to say it aloud." };
  }

  if (action === "where") {
    return { ok: true, steps: [], state: start, warnings: [], stepUp: false };
  }

  const steps: Step[] = [];
  const warnings: string[] = [];
  let state: UIState = { path: normalizePath(start.path || ""), controls: start.controls ?? [] };
  let stepUp = false;

  const take = (built: Built): string | null => {
    if (!built.ok) return built.error;
    steps.push(...built.steps);
    if (built.stepUp) stepUp = true;
    for (const s of built.steps) {
      if (s.type === "navigate") state = { path: s.href, controls: [] };
    }
    return null;
  };

  if (action === "open") {
    if (isNone(input.target)) return { ok: false, error: "Tell me which screen to open.", hint: screens.map((s) => `${s.id} (${s.title})`) };
    const screen = resolveScreen(input.target!);
    if (!screen) return { ok: false, error: `No screen matches "${input.target}".`, hint: screens.map((s) => `${s.id}: ${s.title}`) };
    const moved = freshPath(state, screen);
    steps.push(...moved.steps);
    state = moved.state;
    if (!isNone(input.value)) {
      const err = applyAssignments(screen, input.value!, take);
      if (err) return { ok: false, error: err, hint: controlList(screen) };
    }
    return { ok: true, steps, state, warnings, stepUp };
  }

  const current = screenByPath(state.path);

  if (action === "highlight") {
    if (isNone(input.target)) return { ok: false, error: "Tell me what to point at." };
    const screenHit = resolveScreen(input.target!);
    if (screenHit && !matchControls(poolFor(current), input.target!).length) {
      const moved = freshPath(state, screenHit);
      steps.push(...moved.steps);
      state = moved.state;
      return { ok: true, steps, state, warnings, stepUp };
    }
    const local = uniqueControl(poolFor(current), input.target!);
    if (local.error) return { ok: false, error: local.error, hint: local.hint };
    let control = local.control;
    if (!control) {
      const owners = screens.filter((s) => matchControls(s.controls, input.target!).length === 1);
      if (owners.length === 1) {
        const moved = freshPath(state, owners[0]);
        steps.push(...moved.steps);
        state = moved.state;
        control = matchControls(owners[0].controls, input.target!)[0];
      }
    }
    if (!control) return { ok: false, error: `Nothing on this screen matches "${input.target}".`, hint: controlList(current) };
    steps.push({ type: "highlight", id: control.id });
    return { ok: true, steps, state, warnings, stepUp };
  }

  // set / press
  if (isNone(input.target)) return { ok: false, error: action === "set" ? "Tell me which field to fill." : "Tell me which button to press.", hint: controlList(current) };

  const directScreen = resolveScreen(input.target!);
  const local = uniqueControl(poolFor(current), input.target!);
  if (local.error) return { ok: false, error: local.error, hint: local.hint };

  let screen = current;
  let control = local.control;
  const choiceNamed = screens.some((s) => s.controls.some((c) => c.kind === "choice" && choicePressId(c, input.target!)));

  if (!control && directScreen && action === "press" && !choiceNamed) {
    const moved = freshPath(state, directScreen);
    steps.push(...moved.steps);
    state = moved.state;
    return { ok: true, steps, state, warnings, stepUp };
  }

  if (!control) {
    const owners = screens
      .map((s) => ({ s, found: matchControls(s.controls, input.target!) }))
      .filter((x) => x.found.length === 1);
    if (owners.length === 1) {
      screen = owners[0].s;
      control = owners[0].found[0];
      const moved = freshPath(state, screen);
      steps.push(...moved.steps);
      state = moved.state;
    } else if (owners.length > 1) {
      return { ok: false, error: `"${input.target}" is on more than one screen. Open the right screen first.`, hint: owners.map((o) => o.s.title) };
    }
  }

  if (!control) {
    // Maybe they named a choice option on another screen ("NEFT")
    const choiceOwners = screens.flatMap((s) => {
      const c = s.controls.find((ctrl) => ctrl.kind === "choice" && choicePressId(ctrl, input.target!));
      return c ? [{ s, c }] : [];
    });
    if (choiceOwners.length === 1) {
      screen = choiceOwners[0].s;
      control = choiceOwners[0].c;
      const moved = freshPath(state, screen);
      steps.push(...moved.steps);
      state = moved.state;
      const err = take(buildControlStep(control, action === "set" ? input.value : input.target, "set"));
      if (err) return { ok: false, error: err, hint: controlList(screen) };
      return { ok: true, steps, state, warnings, stepUp };
    }
    return { ok: false, error: `I can't find "${input.target}" on ${current?.title ?? "this screen"}.`, hint: controlList(current) };
  }

  if (action === "set" && !isNone(input.value) && input.value!.includes("=") && control.kind !== "choice") {
    const err = applyAssignments(screen ?? current!, input.value!, take);
    if (err) return { ok: false, error: err, hint: controlList(screen ?? current) };
  } else {
    const namedOption = control.kind === "choice" && choicePressId(control, input.target!) ? input.target : input.value;
    const err = take(buildControlStep(control, namedOption, action === "press" ? "press" : "set"));
    if (err) return { ok: false, error: err, hint: controlList(screen ?? current) };
  }

  return { ok: true, steps, state, warnings, stepUp };
}

function applyAssignments(screen: ScreenDef, text: string, take: (b: Built) => string | null): string | null {
  const list = parseAssignments(text);
  if (!list.length) return `Could not read any "name=value" pairs from "${text}".`;
  const pool = poolFor(screen);
  for (const { name, value } of list) {
    if (isSecret(name) || isSecret(value)) {
      return "Refusing to enter a PIN, password, OTP, or id number. The customer types those.";
    }
    if (norm(name) === "press") {
      const hit = uniqueControl(pool, value);
      if (hit.error) return hit.error;
      if (!hit.control) return `No button called "${value}" on ${screen.title}.`;
      const raw = hit.control.kind === "choice" && choicePressId(hit.control, value) ? value : undefined;
      const err = take(buildControlStep(hit.control, raw, "press"));
      if (err) return err;
      continue;
    }
    const hit = uniqueControl(pool, name);
    if (hit.error) return hit.error;
    if (!hit.control) return `No field called "${name}" on ${screen.title}.`;
    const err = take(buildControlStep(hit.control, value, "set"));
    if (err) return err;
  }
  return null;
}

export function describeState(state: UIState) {
  const screen = screenByPath(state.path);
  const visible = (state.controls ?? []).slice(0, 24).map((c) => {
    const bits = [c.id];
    if (c.value) bits.push(`value=${c.value}`);
    if (c.text) bits.push(c.text.slice(0, 180));
    return bits.join(" | ");
  });
  return {
    screen: screen ? `${screen.title} (${screen.path})` : state.path || "unknown",
    visible_controls: visible.length ? visible : ["none reported yet — call where in a moment if you need the live list"],
    controls_you_can_use: screen ? controlList(screen) : controlList(undefined),
  };
}
