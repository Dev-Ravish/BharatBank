"use client";

import { useRouter } from "next/navigation";

export default function PageHeader({
  title,
  backHref,
  onBack,
}: {
  title: string;
  backHref?: string;
  onBack?: () => void;
}) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (backHref) {
      router.push(backHref);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <button
        onClick={handleBack}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Back"
      >
        ←
      </button>
      <h1 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h1>
    </header>
  );
}
