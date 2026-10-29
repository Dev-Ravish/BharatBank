import Link from "next/link";
import AppShell from "@/components/AppShell";
import { INSURANCE_PRODUCTS } from "@/lib/products";

export default function InsurancePage() {
  return (
    <AppShell title="Insurance" backHref="/products">
      <div className="space-y-4 p-4">
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Educational demo only — illustrative product information, no real policies or purchases.
        </p>
        {INSURANCE_PRODUCTS.map((p) => (
          <Link
            key={p.slug}
            href={`/products/insurance/${p.slug}`}
            className="block rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.blurb}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
