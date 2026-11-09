"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const TABS = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/payments", label: "Payments", icon: "arrowUpRight" },
  { href: "/products", label: "Products", icon: "grid" },
  { href: "/profile", label: "Profile", icon: "user" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      data-testid="bottom-nav"
    >
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
            <Link
            key={tab.href}
            href={tab.href}
            data-guide={`tab-${tab.label.toLowerCase()}`}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
              active ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon name={tab.icon} className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
