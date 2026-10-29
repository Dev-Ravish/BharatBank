import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { INSURANCE_PRODUCTS } from "@/lib/products";

export default async function InsuranceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = INSURANCE_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetail product={product} backHref="/products/insurance" />;
}
