import { plan } from "../src/lib/guide/actions";
import type { UIState } from "../src/lib/guide/actions";

const home: UIState = { path: "/dashboard", controls: [] };

function expect(name: string, cond: boolean, extra?: unknown) {
  if (!cond) {
    console.error("FAIL", name, extra);
    process.exitCode = 1;
  } else {
    console.log("ok", name);
  }
}

const open = plan(
  { action: "open", target: "transfer", value: "amount=500; beneficiary=Rahul; method=UPI; press=review-transfer" },
  home
);
expect("open transfer", open.ok === true);
if (open.ok) {
  expect("navigates", open.steps.some((s) => s.type === "navigate" && s.href === "/payments/transfer"));
  expect("sets amount", open.steps.some((s) => s.type === "set" && s.id === "amount" && s.value === "500"));
  expect("picks upi", open.steps.some((s) => s.type === "press" && s.id === "method-upi"));
  expect("reviews", open.steps.some((s) => s.type === "press" && s.id === "review-transfer"));
  expect("review is not step-up", open.stepUp === false);
}

const neft = plan({ action: "press", target: "NEFT", value: "none" }, home);
expect("neft", neft.ok === true && neft.steps.some((s) => s.type === "press" && s.id === "method-neft"));

const pin = plan({ action: "set", target: "login-mpin", value: "123456" }, { path: "/login", controls: [] });
expect("blocks mpin", pin.ok === false);

const confirm = plan({ action: "press", target: "confirm-transfer", value: "none" }, { path: "/payments/transfer", controls: [] });
expect("confirm flags mpin", confirm.ok === true && confirm.stepUp === true);

const where = plan({ action: "where", target: "none", value: "none" }, home);
expect("where", where.ok === true && where.steps.length === 0);

const missing = plan({ action: "open", target: "not-a-screen", value: "none" }, home);
expect("unknown screen", missing.ok === false);

if (process.exitCode) process.exit(process.exitCode);
