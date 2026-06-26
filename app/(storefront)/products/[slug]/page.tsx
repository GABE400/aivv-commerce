import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ProductPageClient } from "./product-page-client";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const productData = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      variants: true,
      category: true,
    },
  });

  if (!productData) {
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
