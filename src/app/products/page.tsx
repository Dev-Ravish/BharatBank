import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Icon } from "@/components/icons";

const ITEMS = [
  { href: "/products/fd", title: "Fixed Deposits", blurb: "Grow a lump sum with quarterly compounding.", icon: "rupee", guide: "link-fd" },
  { href: "/products/rd", title: "Recurring Deposits", blurb: "Save a fixed amount every month.", icon: "refresh", guide: "link-rd" },
  { href: "/products/cards", title: "Cards", blurb: "Manage your debit and credit cards.", icon: "card", guide: "link-cards" },
  { href: "/products/loans", title: "Loans", blurb: "Personal, home, car, education, gold.", icon: "bank", guide: "link-loans" },
  { href: "/products/investments", title: "Investments", blurb: "Mutual funds, SIPs, bonds, PPF, NPS.", icon: "chart", guide: "link-investments" },
  { href: "/products/insurance", title: "Insurance", blurb: "Health, life, term, motor, travel.", icon: "shield", guide: "link-insurance" },
  { href: "/products/service-requests", title: "Service requests", blurb: "Cheque book, address update, and more.", icon: "clipboard", guide: "link-service" },
] as const;

export default function ProductsHub() {
  return (
    <AppShell title="Products">
      <div className="space-y-4 p-4">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-guide={item.guide}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Icon name={item.icon} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
