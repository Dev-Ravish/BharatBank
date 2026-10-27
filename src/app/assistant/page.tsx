import AppShell from "@/components/AppShell";

export default function AssistantPage() {
  return (
    <AppShell title="AI Assistant">
      <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl dark:bg-teal-900/30">
          ◎
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bharat, your voice guide</h2>
        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
          Tap <span className="font-medium text-slate-700 dark:text-slate-200">Talk to Bharat</span> on any
          screen. Bharat can explain the app and operate it with you — open a page, fill a transfer, pay a
          bill, or walk through a deposit. When an MPIN sheet appears, type the PIN yourself. Bharat will not
          ask you to say it.
        </p>
      </div>
    </AppShell>
  );
}
