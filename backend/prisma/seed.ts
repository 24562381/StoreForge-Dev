/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma Database Seed...');

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@woodenmap.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const rawPassword =
      process.env.ADMIN_SEED_PASSWORD ||
      (process.env.NODE_ENV === 'production'
        ? require('crypto').randomBytes(8).toString('hex')
        : 'admin123');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    if (process.env.NODE_ENV === 'production') {
      console.log(`👤 Admin user seeded: ${adminEmail} / [PASSWORD_PROTECTED]`);
    } else {
      console.log(`👤 Admin user seeded: ${adminEmail} / ${rawPassword}`);
    }
  }

  // 2. Seed Default Category
  const category = await prisma.category.upsert({
    where: { slug: 'world-maps' },
    update: {},
    create: {
      name: 'World Maps',
      slug: 'world-maps',
      description: 'Handcrafted 3D multi-layered wooden world maps',
      status: 'active',
      sortOrder: 1,
    },
  });

  // 3. Seed Main 3D Wooden World Map Product
  const existingProduct = await prisma.product.findUnique({ where: { slug: '3d-wooden-world-map' } });
  if (!existingProduct) {
    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: '3D Wooden World Map',
        slug: '3d-wooden-world-map',
        tagline: 'Transform Your Wall Into a Piece of Art',
        shortDescription:
          'Premium handcrafted 3D wooden world map made with multi-layered natural birch plywood to give your wall a sophisticated and luxurious interior accent.',
        fullDescription:
          '<p>Experience the world right from your living room or office wall. Our 3D Wooden World Map is laser-cut with pinpoint precision from certified natural birch wood. Features layered relief topography, engraved country names, capitals, borders, and major islands.</p>',
        hasSizeVariants: true,
        status: 'active',
        variants: {
          create: [
            {
              sizeName: '4 Feet',
              dimensions: '4 x 2.5 ft (120 x 75 cm)',
              colour: 'Natural Oak & Walnut',
              price: 4500,
              originalPrice: 5500,
              stockStatus: 'in_stock',
              isDefault: true,
              sortOrder: 1,
            },
            {
              sizeName: '6 Feet',
              dimensions: '6 x 3.8 ft (180 x 115 cm)',
              colour: 'Natural Oak & Walnut',
              price: 7500,
              originalPrice: 9200,
              stockStatus: 'in_stock',
              isDefault: false,
              sortOrder: 2,
            },
          ],
        },
        images: {
          create: [
            {
              imageUrl: '/images/product-main.jpg',
              altText: '3D Wooden World Map wall mounted living room',
              title: 'Living Room Display',
              isPrimary: true,
              sortOrder: 1,
            },
            {
              imageUrl: '/images/product-front.jpg',
              altText: '3D Wooden World Map front view full perspective',
              title: 'Front Architectural View',
              isPrimary: false,
              sortOrder: 2,
            },
            {
              imageUrl: '/images/product-closeup.jpg',
              altText: '3D Wooden World Map close-up wood grain and country details',
              title: 'Craftsmanship Close-up',
              isPrimary: false,
              sortOrder: 3,
            },
          ],
        },
        features: {
          create: [
            {
              title: 'Premium Natural Birch Wood',
              description: 'Handcrafted from 100% natural, eco-friendly certified birch plywood with protective rich stain.',
              icon: 'feather',
              sortOrder: 1,
            },
            {
              title: '3D Multi-Layer Relief',
              description: 'Layered thickness ranging from 3mm to 12mm creating remarkable tactile shadow depth.',
              icon: 'layers',
              sortOrder: 2,
            },
            {
              title: 'Laser Precision Engravings',
              description: 'Crisp, detailed engraving of country names, national borders, capitals, and islands.',
              icon: 'compass',
              sortOrder: 3,
            },
          ],
        },
      },
    });
    console.log(`📦 Seeded product: ${product.name}`);
  }

  // 4. Seed Reviews
  const revCount = await prisma.review.count();
  if (revCount === 0) {
    await prisma.review.createMany({
      data: [
        {
          customerName: 'Rafiqul Islam',
          rating: 5,
          reviewText:
            'Outstanding craftsmanship! The 6-feet map completely transformed our living room wall. Everyone who visits asks where we got it from. Delivery was swift within 24 hours in Dhaka.',
          location: 'Gulshan, Dhaka',
          isPublished: true,
          isFeatured: true,
          sortOrder: 1,
        },
        {
          customerName: 'Tanvir Ahmed',
          rating: 5,
          reviewText:
            'Top quality wood and the 3D layers give it so much depth under warm spotlighting. Installation with the provided stencil was very easy and satisfying.',
          location: 'Uttara, Dhaka',
          isPublished: true,
          isFeatured: true,
          sortOrder: 2,
        },
        {
          customerName: 'Nusrat Jahan',
          rating: 5,
          reviewText:
            'Ordered the 4-foot version for my husbands home office. Packaging was very secure and arrived in Chittagong in 3 days. Beautiful finish and great customer care!',
          location: 'Chittagong',
          isPublished: true,
          isFeatured: true,
          sortOrder: 3,
        },
      ],
    });
    console.log('⭐ Seeded reviews');
  }

  // 5. Seed FAQs
  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: 'What material is the product made of?',
          answer:
            'The map is crafted from 100% premium, eco-friendly certified birch plywood. Each continent and island is precision laser-cut and stained with rich, non-toxic wood tones that highlight natural wood grains.',
          isPublished: true,
          sortOrder: 1,
        },
        {
          question: 'What is the difference between 4 Feet and 6 Feet sizes?',
          answer:
            'The 4 Feet version measures 4 x 2.5 ft (120 x 75 cm) and is ideal for standard bedrooms, apartments, and study rooms. The 6 Feet version measures 6 x 3.8 ft (180 x 115 cm) and is best suited for large living room focal walls or corporate conference rooms.',
          isPublished: true,
          sortOrder: 2,
        },
        {
          question: 'How long does delivery take?',
          answer:
            'Inside Dhaka: 24 to 48 hours. Outside Dhaka: 2 to 4 business days via trusted door-to-door courier service.',
          isPublished: true,
          sortOrder: 3,
        },
      ],
    });
    console.log('❓ Seeded FAQs');
  }

  // 6. Seed Site Settings
  const settingsData = [
    { key: 'site_title', value: '3D Wooden World Map | Luxury Wall Decor', description: 'Website Title' },
    { key: 'delivery_charge_dhaka', value: '80', description: 'Delivery Charge Inside Dhaka (BDT)' },
    { key: 'delivery_charge_outside', value: '150', description: 'Delivery Charge Outside Dhaka (BDT)' },
    { key: 'contact_phone', value: '+880 1700-000000', description: 'Customer Support Phone' },
    { key: 'contact_whatsapp', value: '8801700000000', description: 'Customer WhatsApp Number' },
    { key: 'contact_email', value: 'support@woodenmap.com', description: 'Customer Support Email' },
    { key: 'contact_address', value: 'House 12, Road 5, Dhanmondi, Dhaka, Bangladesh', description: 'Office Address' },
    { key: 'first_run_completed', value: 'true', description: 'First-run setup completed flag' },
  ];

  await Promise.all(
    settingsData.map((s) =>
      prisma.setting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      })
    )
  );

  console.log('🎉 Prisma database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
