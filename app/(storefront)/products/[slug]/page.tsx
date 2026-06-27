import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ProductPageClient } from "./product-page-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const productData = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
  });

  if (!productData) {
    return {
      title: "Product Not Found | AIVV",
    };
  }

  const title = `${productData.name} | AIVV OS Store`;
  const plainTextDescription = productData.description
    ? productData.description.replace(/<[^>]*>/g, "").slice(0, 160).trim()
    : `Shop ${productData.name} on the official AIVV OS storefront.`;
  const mainImage = productData.images?.[0] || "/logoaivv.svg";

  return {
    title,
    description: plainTextDescription,
    openGraph: {
      title,
      description: plainTextDescription,
      images: [{ url: mainImage }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainTextDescription,
      images: [mainImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const productData = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      variants: true,
      category: true,
    },
  });

  if (!productData || productData.variants.length === 0) {
    notFound();
  }

  // Construct JSON-LD Structured Data Schema Markup
  const prices = productData.variants.map((v) => parseFloat(v.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "image": productData.images,
    "description": productData.description ? productData.description.replace(/<[^>]*>/g, "").slice(0, 200).trim() : "",
    "category": productData.category?.name || "Premium Catalog",
    "brand": {
      "@type": "Brand",
      "name": "AIVV"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": minPrice.toFixed(2),
      "highPrice": maxPrice.toFixed(2),
      "offerCount": productData.variants.length,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "AIVV"
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* JSON-LD Rich Snippet Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <Container>
          <ProductPageClient productData={productData} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
