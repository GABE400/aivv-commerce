import "dotenv/config";
import { db } from "./index";
import { 
  categories, 
  products, 
  productVariants, 
  users 
} from "./schema";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Clear existing data (optional, be careful)
  // await db.delete(productVariants);
  // await db.delete(products);
  // await db.delete(categories);

  // 2. Create Categories
  const [podCategory] = await db.insert(categories).values({
    name: "Print on Demand",
    slug: "print-on-demand",
    description: "Custom designed apparel and accessories.",
  }).returning();

  const [dropshipCategory] = await db.insert(categories).values({
    name: "Tech Gadgets",
    slug: "tech-gadgets",
    description: "High-quality electronics from verified suppliers.",
  }).returning();

  // 3. Create POD Products
  const [hoodie] = await db.insert(products).values({
    name: "Aivv Signature Hoodie",
    slug: "aivv-signature-hoodie",
    description: "Ultra-soft cotton blend hoodie with premium geometric prints. Fulfillable via Printify.",
    type: "pod",
    categoryId: podCategory.id,
    images: ["/products/hoodie.png"],
  }).returning();

  await db.insert(productVariants).values([
    {
      productId: hoodie.id,
      name: "Large / Black",
      sku: "HOODIE-BLK-L",
      price: "45.00",
      supplierVariantId: "12345", // Mock Printify ID
    },
    {
      productId: hoodie.id,
      name: "Medium / Black",
      sku: "HOODIE-BLK-M",
      price: "45.00",
      supplierVariantId: "12346",
    }
  ]);

  // 4. Create Digital Product
  const [presets] = await db.insert(products).values({
    name: "Geometric Art Pack",
    slug: "geometric-art-pack",
    description: "A collection of 50 high-resolution geometric art assets for your store. Digital delivery via ImageKit.",
    type: "digital",
    categoryId: podCategory.id,
    images: ["/products/art-pack.png"],
  }).returning();

  await db.insert(productVariants).values({
    productId: presets.id,
    name: "Digital License",
    sku: "ART-PACK-DIG",
    price: "29.99",
    assetUrl: "/assets/geometric-pack.zip", // Linked to ImageKit path
  });

  // 5. Create Supplier Mock User
  await db.insert(users).values({
    id: "supplier-mock-1",
    name: "Printify Inc.",
    email: "fulfillment@printify.com",
    emailVerified: true,
    role: "supplier",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Seeding complete!");
}

seed().catch((e) => {
  console.error("❌ Seeding failed:");
  console.error(e);
  process.exit(1);
});
