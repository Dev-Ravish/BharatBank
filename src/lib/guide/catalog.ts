/**
 * Map of Bharat Bank screens and the controls the voice agent may touch.
 * `scripts/generate-knowledge.ts` turns this into the Bolna prompt, so keep `about`
 * accurate to the real pages.
 */

export type ControlKind = "text" | "number" | "select" | "choice" | "check" | "button" | "date";

export type ControlDef = {
  id: string;
  label: string;
  kind: ControlKind;
  options?: string[];
  /** Press this first if the control is not on screen yet (it lives behind a toggle). */
  reveal?: string;
  /** Pressing this opens the MPIN sheet. The agent must not type the MPIN. */
  stepUp?: boolean;
  /** If set, pressing the control navigates instead of clicking. */
  href?: string;
  hint?: string;
};

export type ScreenDef = {
  id: string;
  path: string;
  title: string;
  aliases: string[];
  about: string;
  controls: ControlDef[];
};

export const globalControls: ControlDef[] = [
  { id: "tab-home", label: "Home tab", kind: "button", href: "/dashboard" },
  { id: "tab-payments", label: "Payments tab", kind: "button", href: "/payments" },
  { id: "tab-products", label: "Products tab", kind: "button", href: "/products" },
  { id: "tab-profile", label: "Profile tab", kind: "button", href: "/profile" },
];

export const screens: ScreenDef[] = [
  {
    id: "welcome",
    path: "/",
    title: "Welcome",
    aliases: ["landing", "welcome", "start", "marketing"],
    about:
      "Public marketing page for Bharat Bank, a fictional demo bank (not a real bank). It introduces UPI, deposits, cards, and loans. Create account goes to registration. Login goes to sign-in. The demo sign-in details are printed on the login page; never read a PIN aloud.",
    controls: [
      { id: "go-register", label: "Create account", kind: "button", href: "/register" },
      { id: "go-login", label: "Login", kind: "button", href: "/login" },
    ],
  },
  {
    id: "login",
    path: "/login",
    title: "Sign in",
    aliases: ["login", "sign in", "signin", "log in"],
    about:
      "Sign in with the mobile number and a 6-digit MPIN. The page itself prints the demo mobile number and the demo MPIN. Point at that card and let the customer type the MPIN. There is also a legacy username/password sign-in. You must never type or speak an MPIN or password. After sign-in the app opens Home.",
    controls: [
      { id: "login-mobile", label: "Mobile number", kind: "text" },
      { id: "login-submit", label: "Sign in", kind: "button" },
      { id: "login-legacy", label: "Legacy sign-in", kind: "button", hint: "Switches to username and password. Still do not type the password." },
      { id: "go-register", label: "Create an account", kind: "button", href: "/register" },
    ],
  },
  {
    id: "register",
    path: "/register",
    title: "Create account",
    aliases: ["register", "signup", "sign up", "create account", "open account"],
    about:
      "Registration walks through mobile number, an OTP, then name, email, PAN and Aadhaar, then an MPIN. You may explain the steps and open this page. Do not type the OTP, PAN, Aadhaar, or MPIN. Tell the customer to enter those on the screen.",
    controls: [],
  },
  {
    id: "home",
    path: "/dashboard",
    title: "Home",
    aliases: ["home", "dashboard", "accounts"],
    about:
      "Home shows a greeting, the savings account (number, IFSC, branch, balance), quick actions, recent transactions, and notifications. Savings interest in this demo is 3.00% a year up to one lakh rupees and 3.50% above that, paid quarterly, scheme SA-REG-01. The balance on this card is the source of truth — never invent a figure. The bell opens notifications. The eye hides or shows the balance.",
    controls: [
      { id: "notifications", label: "Notifications", kind: "button" },
      { id: "balance-toggle", label: "Show or hide balance", kind: "button" },
      { id: "balance", label: "Balance card", kind: "button", hint: "Highlight only. Read the balance from this card's text." },
      { id: "transactions", label: "Recent transactions", kind: "button", hint: "Highlight only." },
      { id: "qa-transfer", label: "Transfer", kind: "button", href: "/payments/transfer" },
      { id: "qa-upi", label: "Scan and Pay", kind: "button", href: "/payments/upi" },
      { id: "qa-bills", label: "Bill Pay", kind: "button", href: "/payments/bills" },
      { id: "qa-cards", label: "Cards", kind: "button", href: "/products/cards" },
      { id: "qa-deposits", label: "Deposits", kind: "button", href: "/products/fd" },
      { id: "qa-loans", label: "Loans", kind: "button", href: "/products/loans" },
      { id: "qa-investments", label: "Investments", kind: "button", href: "/products/investments" },
      { id: "qa-offers", label: "Offers & Rewards", kind: "button", href: "/offers" },
    ],
  },
  {
    id: "payments",
    path: "/payments",
    title: "Payments",
    aliases: ["payments", "pay"],
    about: "Hub for UPI, bank transfer (NEFT, RTGS, IMPS, UPI), beneficiaries, and bill payments.",
    controls: [
      { id: "link-upi", label: "UPI", kind: "button", href: "/payments/upi" },
      { id: "link-transfer", label: "Transfer money", kind: "button", href: "/payments/transfer" },
      { id: "link-beneficiaries", label: "Beneficiaries", kind: "button", href: "/payments/beneficiaries" },
      { id: "link-bills", label: "Bill payments", kind: "button", href: "/payments/bills" },
    ],
  },
  {
    id: "transfer",
    path: "/payments/transfer",
    title: "Transfer money",
    aliases: ["transfer", "send money", "neft", "rtgs", "imps", "bank transfer"],
    about:
      "Send money to a saved beneficiary. Methods: UPI is free and instant, any time. IMPS is instant any time: two rupees fifty up to one thousand, five rupees up to one lakh, fifteen rupees up to five lakh. NEFT settles in batches within about two hours: two rupees fifty up to ten thousand, five rupees up to one lakh, fifteen rupees above that. RTGS is only for two lakh rupees and above, twenty-five rupees, settles within thirty minutes. A new beneficiary has a short cooling period (about thirty seconds in this demo) before the first transfer. Review the details, then Confirm opens the MPIN sheet. You never enter the MPIN. The demo book starts with Rahul at HDFC and Priya at ICICI; trust the names actually listed on screen.",
    controls: [
      { id: "method", label: "Transfer method", kind: "choice", options: ["UPI", "IMPS", "NEFT", "RTGS"] },
      { id: "beneficiary", label: "Beneficiary", kind: "select", hint: "Match the nickname or bank shown in the dropdown, such as Rahul." },
      { id: "amount", label: "Amount", kind: "number" },
      { id: "remarks", label: "Remarks", kind: "text" },
      { id: "review-transfer", label: "Review transfer", kind: "button" },
      { id: "confirm-transfer", label: "Confirm and authorize", kind: "button", stepUp: true, hint: "Only exists on the review step. Press review-transfer first." },
      { id: "edit-transfer", label: "Edit details", kind: "button" },
      { id: "new-transfer", label: "New transfer", kind: "button", hint: "Shown on the success receipt." },
      { id: "transfer-charges", label: "Charges table", kind: "button" },
      { id: "receipt", label: "Transfer receipt", kind: "button" },
    ],
  },
  {
    id: "upi",
    path: "/payments/upi",
    title: "UPI",
    aliases: ["upi", "scan", "scan and pay", "vpa", "qr"],
    about:
      "Pay a UPI ID or a mobile number. The customer's own UPI ID is shown at the top (demo form is the mobile number at bharatbank). Simulate QR scan fills the demo merchant VPA merchant.demo@bharatbank. Saved payees appear as chips. The demo outcome control can force success, pending, or failed. Pay opens the MPIN sheet. You never enter the MPIN.",
    controls: [
      { id: "scan-qr", label: "Simulate QR scan", kind: "button" },
      { id: "upi-id", label: "UPI ID or mobile", kind: "text" },
      { id: "amount", label: "Amount", kind: "number" },
      { id: "note", label: "Note", kind: "text" },
      { id: "outcome", label: "Demo outcome", kind: "choice", options: ["success", "pending", "failed"] },
      { id: "pay-upi", label: "Pay", kind: "button", stepUp: true },
    ],
  },
  {
    id: "bills",
    path: "/payments/bills",
    title: "Bill payments",
    aliases: ["bills", "recharge", "bill pay", "electricity", "fastag", "dth"],
    about:
      "Pay or schedule a bill. Billers: State Electricity Board, Municipal Water Supply, City Piped Gas, Home Broadband, Mobile Prepaid Recharge, Mobile Postpaid, DTH Recharge, FASTag Recharge, Credit Card Bill, Life Insurance Premium, School or Education Fees, Municipal Property Tax. Fetch bill fills a demo amount. Schedule for later uses a date. Autopay can be ticked. This demo pays without an extra MPIN.",
    controls: [
      { id: "biller-search", label: "Search billers", kind: "text" },
      { id: "biller", label: "Biller", kind: "select" },
      { id: "consumer", label: "Consumer or mobile number", kind: "text" },
      { id: "amount", label: "Amount", kind: "number" },
      { id: "fetch-bill", label: "Fetch bill", kind: "button" },
      { id: "schedule", label: "Schedule date", kind: "date" },
      { id: "autopay", label: "Autopay", kind: "check" },
      { id: "pay-bill", label: "Pay bill", kind: "button" },
    ],
  },
  {
    id: "beneficiaries",
    path: "/payments/beneficiaries",
    title: "Beneficiaries",
    aliases: ["beneficiaries", "payees", "add beneficiary"],
    about:
      "People the customer can transfer to. Add needs full name, optional nickname, account number, IFSC, and bank name. A new payee stays pending for about thirty seconds in this demo, and transfers to a pending payee are blocked. Remove deletes one. To remove a specific person, press beneficiary-remove with value set to their nickname.",
    controls: [
      { id: "add-beneficiary", label: "Add beneficiary", kind: "button" },
      { id: "name", label: "Full name", kind: "text", reveal: "add-beneficiary" },
      { id: "nickname", label: "Nickname", kind: "text", reveal: "add-beneficiary" },
      { id: "account-number", label: "Account number", kind: "text", reveal: "add-beneficiary" },
      { id: "ifsc", label: "IFSC code", kind: "text", reveal: "add-beneficiary" },
      { id: "bank-name", label: "Bank name", kind: "text", reveal: "add-beneficiary" },
      { id: "save-beneficiary", label: "Save beneficiary", kind: "button", reveal: "add-beneficiary" },
      { id: "beneficiary-remove", label: "Remove beneficiary", kind: "button", hint: "Pass the nickname in value when more than one is listed." },
    ],
  },
  {
    id: "products",
    path: "/products",
    title: "Products",
    aliases: ["products", "offers"],
    about: "Hub for fixed deposits, recurring deposits, cards, loans, investments, insurance, and service requests.",
    controls: [
      { id: "link-fd", label: "Fixed Deposits", kind: "button", href: "/products/fd" },
      { id: "link-rd", label: "Recurring Deposits", kind: "button", href: "/products/rd" },
      { id: "link-cards", label: "Cards", kind: "button", href: "/products/cards" },
      { id: "link-loans", label: "Loans", kind: "button", href: "/products/loans" },
      { id: "link-investments", label: "Investments", kind: "button", href: "/products/investments" },
      { id: "link-insurance", label: "Insurance", kind: "button", href: "/products/insurance" },
      { id: "link-service", label: "Service requests", kind: "button", href: "/products/service-requests" },
    ],
  },
  {
    id: "fd",
    path: "/products/fd",
    title: "Fixed Deposits",
    aliases: ["fd", "fixed deposit", "fixed deposits", "deposits"],
    about:
      "Book a lump-sum deposit. Interest is compounded quarterly and the rate is fixed on the booking date. Minimum one thousand rupees. Payout can be at maturity, monthly, or quarterly. Rate card (general / senior citizen, from 1 Oct 2026): 7–45 days 3.00 / 3.50; 46–179 days 4.50 / 5.00; 180–269 days 5.75 / 6.25; 270 days to under 1 year 6.00 / 6.50; 1 year to under 2 years 7.10 / 7.60; 2 to under 3 years 7.00 / 7.50; 3 to 5 years 6.75 / 7.25; above 5 years to 10 years 6.50 / 7.00. Senior rates apply to residents 60 and above, up to three crore. Premature closure costs 1% on the rate for the period run, and nothing is paid if closed within 7 days. TDS applies above the usual thresholds. A loan against FD is available under Loans. Closing an FD needs MPIN and credits the payout to the savings account. The demo often starts with one active deposit — read the card on screen for the real principal and maturity.",
    controls: [
      { id: "open-fd-form", label: "Open new FD", kind: "button" },
      { id: "amount", label: "FD amount", kind: "number", reveal: "open-fd-form" },
      { id: "tenure", label: "Tenure in months", kind: "number", reveal: "open-fd-form" },
      { id: "payout", label: "Interest payout", kind: "select", options: ["At maturity", "Monthly", "Quarterly"], reveal: "open-fd-form" },
      { id: "nominee", label: "Nominee name", kind: "text", reveal: "open-fd-form" },
      { id: "submit-fd", label: "Open FD", kind: "button", reveal: "open-fd-form" },
      { id: "fd-close", label: "Close fixed deposit", kind: "button", stepUp: true, hint: "Pass the principal amount in value if several deposits are listed." },
      { id: "fd-rates", label: "FD rate chart", kind: "button" },
    ],
  },
  {
    id: "rd",
    path: "/products/rd",
    title: "Recurring Deposits",
    aliases: ["rd", "recurring deposit", "recurring deposits"],
    about:
      "Save a fixed amount every month. Minimum five hundred rupees a month. Interest compounds quarterly. The page shows the current rate. Closing needs MPIN. Simulate missed installment marks a skipped month. Read the cards on screen for what is actually open.",
    controls: [
      { id: "open-rd-form", label: "Open new RD", kind: "button" },
      { id: "amount", label: "Monthly installment", kind: "number", reveal: "open-rd-form" },
      { id: "tenure", label: "Tenure in months", kind: "number", reveal: "open-rd-form" },
      { id: "submit-rd", label: "Open RD", kind: "button", reveal: "open-rd-form" },
      { id: "rd-miss", label: "Simulate missed installment", kind: "button" },
      { id: "rd-close", label: "Close recurring deposit", kind: "button", stepUp: true },
    ],
  },
  {
    id: "cards",
    path: "/products/cards",
    title: "Cards",
    aliases: ["cards", "debit card", "credit card", "freeze card"],
    about:
      "The demo customer has a RuPay debit card ending 4821 and a Visa credit card ending 7734. Freeze or unfreeze needs MPIN. Manage controls opens domestic, international, and online toggles plus a spending-limit slider (five thousand to three lakh, steps of five thousand). Replacement is tracked under service requests. Changing the PIN is something only the customer may type — never set a PIN and never ask them to say it aloud. Read outstanding and limits from the card on screen.",
    controls: [
      { id: "card-debit-freeze", label: "Freeze debit card", kind: "button", stepUp: true },
      { id: "card-credit-freeze", label: "Freeze credit card", kind: "button", stepUp: true },
      { id: "card-debit-manage", label: "Manage debit card", kind: "button" },
      { id: "card-credit-manage", label: "Manage credit card", kind: "button" },
      { id: "card-debit-domestic", label: "Debit domestic usage", kind: "check", reveal: "card-debit-manage" },
      { id: "card-debit-international", label: "Debit international usage", kind: "check", reveal: "card-debit-manage" },
      { id: "card-debit-online", label: "Debit online usage", kind: "check", reveal: "card-debit-manage" },
      { id: "card-debit-limit", label: "Debit spending limit", kind: "number", reveal: "card-debit-manage" },
      { id: "card-debit-replace", label: "Replace debit card", kind: "button", reveal: "card-debit-manage" },
      { id: "card-credit-domestic", label: "Credit domestic usage", kind: "check", reveal: "card-credit-manage" },
      { id: "card-credit-international", label: "Credit international usage", kind: "check", reveal: "card-credit-manage" },
      { id: "card-credit-online", label: "Credit online usage", kind: "check", reveal: "card-credit-manage" },
      { id: "card-credit-limit", label: "Credit spending limit", kind: "number", reveal: "card-credit-manage" },
      { id: "card-credit-replace", label: "Replace credit card", kind: "button", reveal: "card-credit-manage" },
    ],
  },
  {
    id: "loans",
    path: "/products/loans",
    title: "Loans",
    aliases: ["loans", "loan", "emi", "personal loan", "home loan"],
    about:
      "Two tabs: My loans, and Apply. Products: Personal 11.5% up to 60 months and 15 lakh; Home 8.4% up to 240 months and 1 crore; Car 9.2% up to 84 months and 20 lakh; Education 9.8% up to 120 months and 25 lakh; Gold 10.5% up to 36 months and 10 lakh; Loan against FD 8.9% up to 60 months and 5 lakh. The apply form shows a live EMI estimate. Processing fee is 1.5% plus GST, minimum 999 and maximum 15,000, plus 500 documentation. Floating-rate prepayment from own funds is nil; fixed-rate prepayment is 2% of outstanding. Late fee is 2% a month on the overdue EMI. Pay EMI and prepay both need MPIN. The demo often starts with one personal loan — read outstanding, EMI, and next due date from the card.",
    controls: [
      { id: "loans-tab", label: "My loans", kind: "button" },
      { id: "apply-tab", label: "Apply for a loan", kind: "button" },
      { id: "loan-product", label: "Loan product", kind: "select", reveal: "apply-tab" },
      { id: "loan-amount", label: "Loan amount", kind: "number", reveal: "apply-tab" },
      { id: "loan-tenure", label: "Loan tenure in months", kind: "number", reveal: "apply-tab" },
      { id: "loan-apply", label: "Check eligibility and apply", kind: "button", reveal: "apply-tab" },
      { id: "loan-pay-emi", label: "Pay EMI", kind: "button", stepUp: true, reveal: "loans-tab", hint: "Pass the product name in value if several loans are listed." },
      { id: "loan-schedule", label: "Repayment schedule", kind: "button", reveal: "loans-tab" },
      { id: "loan-prepay-amount", label: "Prepay amount", kind: "number", reveal: "loans-tab" },
      { id: "loan-prepay", label: "Prepay or foreclose", kind: "button", stepUp: true, reveal: "loans-tab" },
    ],
  },
  {
    id: "investments",
    path: "/products/investments",
    title: "Investments",
    aliases: ["investments", "sip", "mutual fund", "ppf", "nps"],
    about:
      "Educational only — nothing here buys a real investment. Categories: mutual funds, SIP, fixed income, PPF, NPS, and gold. The SIP calculator takes a monthly amount, years, and an assumed return percent, and shows an estimated future value. Say clearly that the figure is illustrative.",
    controls: [
      { id: "sip-monthly", label: "SIP monthly amount", kind: "number" },
      { id: "sip-years", label: "SIP years", kind: "number" },
      { id: "sip-return", label: "SIP return percent", kind: "number" },
    ],
  },
  {
    id: "insurance",
    path: "/products/insurance",
    title: "Insurance",
    aliases: ["insurance", "health insurance", "term insurance"],
    about:
      "Educational only — no real policy is sold. Products described on the page: health, life, term, motor, and travel. Explain them in plain language and do not quote a premium, because the page does not sell one.",
    controls: [],
  },
  {
    id: "service",
    path: "/products/service-requests",
    title: "Service requests",
    aliases: ["service", "service request", "cheque book", "dispute", "fraud"],
    about:
      "Raise a request: cheque book, stop cheque, address update, nominee update, transaction dispute, or fraud report. Details are optional. The list below shows status: submitted, in progress, or resolved. Card replacement requests also land here.",
    controls: [
      { id: "request-type", label: "Request type", kind: "select", options: ["Cheque book request", "Stop cheque payment", "Address update", "Nominee update", "Transaction dispute", "Fraud report"] },
      { id: "request-details", label: "Request details", kind: "text" },
      { id: "submit-request", label: "Submit request", kind: "button" },
    ],
  },
  {
    id: "profile",
    path: "/profile",
    title: "Profile",
    aliases: ["profile", "my profile", "settings"],
    about:
      "Shows the customer's name, mobile, email, masked PAN, masked Aadhaar, KYC status, and UPI ID. Links to account details and service requests. Dark mode toggle. Logout ends the session. Read the values from the profile card; do not recite masked IDs digit by digit unless asked.",
    controls: [
      { id: "profile-card", label: "Profile card", kind: "button" },
      { id: "theme-toggle", label: "Dark mode", kind: "button" },
      { id: "logout", label: "Logout", kind: "button" },
      { id: "go-account", label: "Account details", kind: "button", href: "/account" },
      { id: "go-service", label: "Service requests", kind: "button", href: "/products/service-requests" },
    ],
  },
  {
    id: "account",
    path: "/account",
    title: "Account details",
    aliases: ["account", "account details"],
    about:
      "Account holder, account number, type (the demo is a savings account), IFSC BHRT0001234, branch, nominee, declared monthly income, and available balance. View statement opens the filterable statement. Read figures from the summary on screen.",
    controls: [
      { id: "account-summary", label: "Account summary", kind: "button" },
      { id: "go-statement", label: "View statement", kind: "button", href: "/account/statement" },
    ],
  },
  {
    id: "statement",
    path: "/account/statement",
    title: "Statement",
    aliases: ["statement", "transactions", "passbook", "history"],
    about:
      "Full transaction list. Filter with from and to dates (YYYY-MM-DD) and All, Credit, or Debit. Download writes a CSV of the filtered rows. Credits are positive and show in green; debits are negative.",
    controls: [
      { id: "from", label: "From date", kind: "date" },
      { id: "to", label: "To date", kind: "date" },
      { id: "statement-all", label: "All transactions", kind: "button" },
      { id: "statement-credit", label: "Credits only", kind: "button" },
      { id: "statement-debit", label: "Debits only", kind: "button" },
      { id: "download-statement", label: "Download statement", kind: "button" },
    ],
  },
];

export function screenByPath(path: string): ScreenDef | undefined {
  const p = normalizePath(path);
  return screens.find((s) => s.path === p);
}

export function normalizePath(path: string): string {
  const bare = path.split("?")[0].split("#")[0];
  if (bare.length > 1 && bare.endsWith("/")) return bare.slice(0, -1);
  return bare || "/";
}

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "");

export function resolveScreen(ref: string): ScreenDef | null {
  const raw = ref.trim().toLowerCase();
  const n = norm(raw);
  if (!n) return null;
  const exact = screens.find(
    (s) =>
      norm(s.id) === n ||
      norm(s.title) === n ||
      normalizePath(raw) === s.path ||
      s.aliases.some((a) => norm(a) === n)
  );
  if (exact) return exact;
  if (n.length < 4) return null;
  const partial = screens.filter(
    (s) => norm(s.title).includes(n) || norm(s.id).includes(n) || s.aliases.some((a) => norm(a).includes(n) || n.includes(norm(a)))
  );
  return partial.length === 1 ? partial[0] : null;
}
