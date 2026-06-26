import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ProductPageClient } from "./product-page-client";

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
