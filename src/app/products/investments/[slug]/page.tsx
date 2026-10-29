import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { INVESTMENT_PRODUCTS } from "@/lib/products";

export default async function InvestmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = INVESTMENT_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetail product={product} backHref="/products/investments" />;
}
