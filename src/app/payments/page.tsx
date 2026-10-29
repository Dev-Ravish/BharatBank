import Link from "next/link";
import AppShell from "@/components/AppShell";

const ITEMS = [
  { href: "/payments/upi", title: "UPI / Scan & Pay", blurb: "Pay a UPI ID, mobile number, or scan a QR code.", icon: "▣", guide: "link-upi" },
  { href: "/payments/transfer", title: "Transfer money", blurb: "NEFT, RTGS, IMPS, or UPI to a bank account.", icon: "↗", guide: "link-transfer" },
  { href: "/payments/beneficiaries", title: "Beneficiaries", blurb: "Manage people you send money to.", icon: "👤", guide: "link-beneficiaries" },
  { href: "/payments/bills", title: "Bill payments & recharge", blurb: "Electricity, mobile, DTH, FASTag, and more.", icon: "⚡", guide: "link-bills" },
];

export default function PaymentsHub() {
  return (
    <AppShell title="Payments">
      <div className="space-y-4 p-4">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-guide={item.guide}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-xl dark:bg-teal-900/30">
              {item.icon}
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
