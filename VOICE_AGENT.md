# Bharat voice agent

Bharat is the Bolna voice guide for this app. It uses the same shape as css-quest: the browser starts a call, Bolna calls `/api/ui-actions` when the agent decides to touch the screen, and the page plays those steps with a cursor.

The agent can open every screen, explain products and charges, and fill or press the real controls. It will not type an MPIN, card PIN, password, OTP, PAN, or Aadhaar. When a sheet says “Confirm with MPIN”, the customer types it.

## 1. Env

Copy `bolna.env.sample` to `.env.local`.

- `BOLNA_API_KEY` — same key you already use for css-quest.
- `UI_ACTION_TOKEN` — any long random string. The sample file’s token is fine for local demos; generate a new one if this app is public.
- `BOLNA_AGENT_ID` — a **new** agent. Do not paste the CSS Quest agent id. The prompt and the tool are different, and one agent cannot be both tutors.

Restart `npm run dev` after changing `.env.local`.

## 2. Create the agent in Bolna

1. `npm run knowledge`
2. In the Bolna dashboard, create an agent named **Bharat**.
3. Welcome message: the block under “2. WELCOME MESSAGE” in `BOLNA_AGENT_KNOWLEDGE.txt`.
4. Prompt: everything between `===== PROMPT START =====` and `===== PROMPT END =====`.
5. Pick an LLM that supports function calling.
6. Expose the app on a public HTTPS URL Bolna can reach (css-quest uses a Cloudflare quick tunnel):

```powershell
cd C:\Users\localadmin\Desktop\bolna\BharatBank
npm run dev
cloudflared tunnel --url http://localhost:3000
npm run tool -- https://<the-url-cloudflared-prints>
```

If port 3000 is already taken, start Next on another port and point the tunnel at that port.

7. Bolna → the Bharat agent → Tools → Custom function → paste all of `BOLNA_UI_TOOL.json`.
8. Save the agent. Copy its id into `BOLNA_AGENT_ID` and restart the dev server.

The tunnel hostname changes every time cloudflared restarts. Re-run `npm run tool -- https://…` and paste the JSON again.

`BOLNA_UI_TOOL.json` contains the webhook secret. It is git-ignored. Do not commit it.

## 3. Try it

Open the app, sign in (the login card shows the demo mobile and MPIN — type the MPIN yourself), and tap **Talk to Bharat**. The green dot on the pill means the screen link is connected.

Say: “Show me my balance.” Then: “Transfer five hundred rupees to Rahul by UPI.” Bharat should open Transfer, fill it, and stop at the MPIN sheet unless you clearly asked it to finish. Type the MPIN on the sheet.

`http://localhost:3000/api/ui-debug` (this machine only) shows the last tool calls, with the token redacted.

## 4. What it can drive

Home, payments, UPI, transfer, beneficiaries, bills, fixed and recurring deposits, cards (except the PIN box), loans, the SIP calculator, insurance explanations, service requests, profile, statement download, dark mode, and logout.

Final buttons that move money or freeze a card open the existing MPIN sheet. Bharat is told to leave that sheet to the customer.
