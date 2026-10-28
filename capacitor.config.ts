import type { CapacitorConfig } from "@capacitor/cli";

// TODO: replace with your real Render URL (Render → your service → the URL at the top of the page).
const REMOTE_URL = "https://bharat-bank.onrender.com";

const config: CapacitorConfig = {
  appId: "com.bharatbank.app",
  appName: "Bharat Bank",
  webDir: "public",
  server: {
    url: REMOTE_URL,
    cleartext: false,
  },
};

export default config;
