import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import PageHeader from "./PageHeader";

export default function AppShell({
  children,
  title,
  backHref,
  onBack,
}: {
  children: ReactNode;
  title?: string;
  backHref?: string;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 pb-24 dark:bg-slate-950">
      {title && <PageHeader title={title} backHref={backHref} onBack={onBack} />}
      {children}
      <BottomNav />
    </div>
  );
}
