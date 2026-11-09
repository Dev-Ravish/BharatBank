/**
 * Writes BOLNA_UI_TOOL.json — paste it into Bolna → Agent → Tools → Custom function.
 *
 *   npm run tool -- https://your-public-url
 *
 * The token is read from .env.local. The output file contains that secret; it is git-ignored.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")])
);

const token = env.UI_ACTION_TOKEN;
if (!token) throw new Error("UI_ACTION_TOKEN is missing in .env.local");

const base = (process.argv[2] ?? "https://YOUR-PUBLIC-URL").replace(/\/+$/, "");

const tool = {
  name: "ui_action",
  description:
    "Operates the Bharat Bank app on the customer's screen so they can see what you are doing, and sets the face of the Saarthi robot head. " +
    "Use it to open a screen, fill a form, press a button, point at something, read what is on screen, or change only the robot's expression. " +
    "Say one short sentence first, then call this, then describe the result. Never say the gesture name aloud. " +
    "Actions: open (target = screen id such as transfer, upi, bills, fd, loans, home, profile; value = none OR settings like amount=500; beneficiary=Rahul; method=NEFT; press=review-transfer), " +
    "set (target = field id; value = the value), " +
    "press (target = button id; value = none, or a name/amount when several rows match), " +
    "highlight (target = control id; value = none), " +
    "where (target = none; value = none) to read the live screen, " +
    "gesture (target = none; value = none) to change only the robot face. " +
    "gesture is idle, thinking, searching, listening, speaking, working, happy, error, sleeping, or none. " +
    "Pass none to let a screen action choose the face. Use happy when a receipt or success is visible, error when you cannot do the request, thinking while you decide, searching while you look something up, listening while you wait for them. " +
    "ALL FIVE parameters are required. Pass the word none when a parameter does not apply. " +
    "For session ALWAYS pass the session code from your prompt (session_id), exactly, every call. Never say it aloud. " +
    "Never put a PIN, password, OTP, PAN, or Aadhaar in any parameter. Money actions that need an MPIN will say so in the result; the customer types the MPIN.",
  pre_call_message: "One moment, I'll show you on the screen.",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        description: "One of: open, set, press, highlight, where",
      },
      target: {
        type: "string",
        description: "Screen id for open, field id for set, button id for press, control id for highlight. The word none for where.",
      },
      value: {
        type: "string",
        description:
          "For open: none, or name=value pairs separated by semicolons, including press=buttonId. For set: the field value. For press: none, or a row label. Otherwise none.",
      },
      session: {
        type: "string",
        description: "The session code from your prompt (session_id). Copy it exactly every call. Never say it aloud.",
      },
      gesture: {
        type: "string",
        description:
          "How the Saarthi robot should look. One of idle, thinking, searching, listening, speaking, working, happy, error, sleeping, or none. none lets a screen action choose. Never say this word aloud.",
      },
    },
    required: ["action", "target", "value", "session", "gesture"],
  },
  key: "custom_task",
  value: {
    method: "POST",
    url: `${base}/api/ui-actions`,
    api_token: `Bearer ${token}`,
    param: {
      action: "%(action)s",
      target: "%(target)s",
      value: "%(value)s",
      session: "%(session)s",
      gesture: "%(gesture)s",
    },
    headers: {},
  },
};

writeFileSync(join(root, "BOLNA_UI_TOOL.json"), JSON.stringify(tool, null, 2) + "\n", "utf8");
console.log(`Wrote BOLNA_UI_TOOL.json  ->  POST ${tool.value.url}`);
