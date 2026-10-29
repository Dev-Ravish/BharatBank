import AppShell from "@/components/AppShell";
import { InfoSection } from "@/components/InfoSection";
import type { ProductDetail as ProductDetailData } from "@/lib/products";

export function ProductDetail({ product, backHref }: { product: ProductDetailData; backHref: string }) {
  return (
    <AppShell title={product.name} backHref={backHref}>
      <div className="space-y-4 p-4">
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Educational demo only — illustrative product information, no real products or purchases.
        </p>

        <p className="text-sm text-slate-700 dark:text-slate-300">{product.overview}</p>

        <InfoSection title="Benefits">
          <ul className="list-disc space-y-1.5 pl-4">
            {product.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </InfoSection>

        <InfoSection title="Key facts">
          <div className="space-y-1.5">
            {product.keyFacts.map((f) => (
              <div key={f.label} className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">{f.label}</span>
                <span className="text-right text-slate-900 dark:text-white">{f.value}</span>
              </div>
            ))}
          </div>
        </InfoSection>

        <InfoSection title="FAQs">
          <div className="space-y-3">
            {product.faqs.map((f) => (
              <div key={f.q}>
                <p className="font-medium text-slate-900 dark:text-white">{f.q}</p>
                <p className="mt-0.5">{f.a}</p>
              </div>
            ))}
          </div>
        </InfoSection>
      </div>
    </AppShell>
  );
}
