import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let dbUrl = process.env.DATABASE_URL;
    // OPTIMIZATION: Bound database connection pool size to 10 connections.
    // Prevents unbounded socket allocation, lowering RAM usage on both PostgreSQL and Node.js.
    if (dbUrl && !dbUrl.includes('connection_limit')) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${separator}connection_limit=10&pool_timeout=15`;
    }
    super(
      dbUrl
        ? {
            datasources: {
              db: {
                url: dbUrl,
              },
            },
          }
        : undefined,
    );
  }

  private reconnectInterval: NodeJS.Timeout | null = null;
  public isDatabaseConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isDatabaseConnected = true;
      await this.ensureDatabaseReady();
      await this.autoSeedDefaults();
    } catch (err: any) {
      this.isDatabaseConnected = false;
      this.logger.error(`❌ Could not connect to PostgreSQL on startup: ${err?.message || err}`);
      this.logger.warn(`⚠️ The backend HTTP server is running on port ${process.env.BACKEND_PORT || 8585}. Retrying database connection every 5s...`);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectInterval) return;
    this.reconnectInterval = setInterval(async () => {
      try {
        await this.$connect();
        this.isDatabaseConnected = true;
        this.logger.log(`✔ PostgreSQL database connection established successfully.`);
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        await this.ensureDatabaseReady();
        await this.autoSeedDefaults();
      } catch {
        // Silently retry in background
      }
    }, 5000);
  }

  async onModuleDestroy() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    await this.$disconnect();
  }

  private async ensureDatabaseReady() {
    let tablesMissing = false;
    try {
      const res: any = await this.$queryRawUnsafe(
        `SELECT to_regclass('public.settings')::text as settings_tbl, to_regclass('public.translations')::text as trans_tbl;`
      );
      if (!res || !res[0] || !res[0].settings_tbl || !res[0].trans_tbl) {
        tablesMissing = true;
      }
    } catch {
      tablesMissing = true;
    }

    if (!tablesMissing) {
      return;
    }

    this.logger.log('⚙️ Database tables not detected. Executing database setup & schema sync (scripts/db-sync.js)...');
    try {
      const syncScriptPath = [
        path.join(process.cwd(), 'scripts', 'db-sync.js'),
        path.resolve(__dirname, '..', '..', '..', 'scripts', 'db-sync.js'),
      ].find((p) => fs.existsSync(p));

      if (syncScriptPath) {
        execSync(`node "${syncScriptPath}"`, {
          stdio: 'inherit',
          env: { ...process.env },
        });
        this.logger.log('✔ Database tables created and synchronized successfully.');
      } else {
        const candidateSchemas = [
          path.join(process.cwd(), 'backend', 'prisma', 'schema.prisma'),
          path.join(process.cwd(), 'prisma', 'schema.prisma'),
          path.resolve(__dirname, '..', '..', '..', 'prisma', 'schema.prisma'),
        ];
        const schemaPath = candidateSchemas.find((p: string) => fs.existsSync(p));
        if (schemaPath) {
          execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, {
            stdio: 'inherit',
            env: { ...process.env },
          });
          this.logger.log('✔ Database tables created and synchronized successfully.');
        }
      }
    } catch (pushErr: any) {
      this.logger.warn(`Automatic database push notice: ${pushErr.message}`);
    }
  }


  private async autoSeedDefaults() {
    try {
      // 1. Ensure essential default store settings exist
      const defaultSettings = [
        { key: 'site_title', value: 'StoreForge E-Commerce', description: 'Website Title' },
        { key: 'store_name', value: 'StoreForge', description: 'Store Brand Name' },
        { key: 'store_name_en', value: 'StoreForge', description: 'Store Brand Name (EN)' },
        { key: 'store_name_bn', value: 'স্টোরফোর্জ', description: 'Store Brand Name (BN)' },
        { key: 'delivery_charge_dhaka', value: '60', description: 'Delivery Inside Dhaka (BDT)' },
        { key: 'delivery_charge_outside', value: '120', description: 'Delivery Charge Outside Dhaka (BDT)' },
        { key: 'contact_phone', value: '+880 1700-000000', description: 'Support Phone' },
        { key: 'contact_email', value: 'support@storeforge.io', description: 'Support Email' },
        { key: 'first_run_completed', value: 'false', description: 'First-run setup completed flag' },
      ];

      for (const s of defaultSettings) {
        await this.setting.upsert({
          where: { key: s.key },
          update: {},
          create: s,
        });
      }

      // 3. Ensure a starter category and sample product exist if empty
      const catCount = await this.category.count();
      if (catCount === 0) {
        const category = await this.category.create({
          data: {
            name: 'Featured Collection',
            slug: 'featured-collection',
            description: 'Handcrafted luxury decor and items',
            status: 'active',
            sortOrder: 1,
          },
        });

        const prodCount = await this.product.count();
        if (prodCount === 0) {
          await this.product.create({
            data: {
              categoryId: category.id,
              name: '3D Wooden World Map',
              slug: '3d-wooden-world-map',
              tagline: 'Transform Your Wall Into a Piece of Art',
              shortDescription: 'Handcrafted luxury 3D multi-layered birch wood map with detailed engravings.',
              fullDescription: '<p>Experience craftsmanship with laser-cut precision natural birch wood. Edit or customize anytime from your Admin Panel.</p>',
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
            },
          });
        }
      }

      // 4. Ensure starter FAQs exist if empty
      const faqCount = await this.faq.count();
      if (faqCount === 0) {
        const defaultFaqs = [
          {
            question: 'What material is the product made of?',
            questionBn: 'পণ্যটি কোন উপাদান দিয়ে তৈরি?',
            answer:
              'The map is crafted from 100% premium, eco-friendly certified birch plywood. Each continent and island is precision laser-cut and stained with rich, non-toxic wood tones that highlight natural wood grains.',
            answerBn:
              'ম্যাপটি শতভাগ প্রিমিয়াম ও পরিবেশবান্ধব সার্টিফাইড বার্চ প্লাইউড দিয়ে তৈরি। নিখুঁত লেজার কাটিং এবং দীর্ঘস্থায়ী প্রাকৃতিক রঙের ফিনিশিং কাঠের প্রাকৃতিক সৌন্দর্যকে ফুটিয়ে তোলে।',
            sortOrder: 1,
            isPublished: true,
          },
          {
            question: 'What is the difference between 4 Feet and 6 Feet sizes?',
            questionBn: '৪ ফুট এবং ৬ ফুট সাইজের মধ্যে পার্থক্য কী?',
            answer:
              'The 4 Feet version measures 4 x 2.5 ft (120 x 75 cm) and is ideal for standard bedrooms, apartments, and study rooms. The 6 Feet version measures 6 x 3.8 ft (180 x 115 cm) and is best suited for large living room focal walls or corporate conference rooms.',
            answerBn:
              '৪ ফুট ভার্সনটি (১২০ x ৭৫ সেমি) সাধারণ বেডরুম ও অ্যাপার্টমেন্টের জন্য মানানসই। ৬ ফুট ভার্সনটি (১৮০ x ১১৫ সেমি) লিভিং রুম বা অফিসের প্রধান ওয়ালের জন্য অত্যন্ত দৃষ্টিনন্দন।',
            sortOrder: 2,
            isPublished: true,
          },
          {
            question: 'How long does delivery take?',
            questionBn: 'ডেলিভারি পেতে কত দিন সময় লাগে?',
            answer:
              'Inside Dhaka: 24 to 48 hours. Outside Dhaka: 2 to 4 business days via trusted door-to-door courier service.',
            answerBn:
              'ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সারাদেশে ২ থেকে ৪ কার্যদিবসের মধ্যে হোম ডেলিভারি সম্পন্ন হয়।',
            sortOrder: 3,
            isPublished: true,
          },
        ];

        for (const item of defaultFaqs) {
          const created = await this.faq.create({
            data: {
              question: item.question,
              answer: item.answer,
              sortOrder: item.sortOrder,
              isPublished: item.isPublished,
            },
          });

          // Seed translation keys
          await this.translation.upsert({
            where: { key: `faq.${created.id}.question` },
            update: {},
            create: {
              key: `faq.${created.id}.question`,
              bn: item.questionBn,
              en: item.question,
              category: 'faqs',
              description: `FAQ #${created.id} Question`,
            },
          });

          await this.translation.upsert({
            where: { key: `faq.${created.id}.answer` },
            update: {},
            create: {
              key: `faq.${created.id}.answer`,
              bn: item.answerBn,
              en: item.answer,
              category: 'faqs',
              description: `FAQ #${created.id} Answer`,
            },
          });
        }
      }

      // 5. Ensure starter customer reviews exist if empty
      const revCount = await this.review.count();
      if (revCount === 0) {
        const firstProd = await this.product.findFirst({ select: { id: true } });
        const defaultReviews = [
          {
            customerName: 'Rafiqul Islam',
            location: 'Gulshan, Dhaka',
            rating: 5,
            reviewText:
              'Outstanding craftsmanship! The 6-feet map completely transformed our living room wall. Everyone who visits asks where we got it from. Delivery was swift within 24 hours in Dhaka.',
            isPublished: true,
            isFeatured: true,
            sortOrder: 1,
          },
          {
            customerName: 'Tanvir Ahmed',
            location: 'Uttara, Dhaka',
            rating: 5,
            reviewText:
              'Top quality wood and the 3D layers give it so much depth under warm spotlighting. Installation with the provided stencil was very easy and satisfying.',
            isPublished: true,
            isFeatured: true,
            sortOrder: 2,
          },
          {
            customerName: 'Nusrat Jahan',
            location: 'Chittagong',
            rating: 5,
            reviewText:
              'Ordered the 4-foot version for my husbands home office. Packaging was very secure and arrived in Chittagong in 3 days. Beautiful finish and great customer care!',
            isPublished: true,
            isFeatured: true,
            sortOrder: 3,
          },
        ];

        for (const rev of defaultReviews) {
          await this.review.create({
            data: {
              productId: firstProd?.id || null,
              customerName: rev.customerName,
              location: rev.location,
              rating: rev.rating,
              reviewText: rev.reviewText,
              isPublished: rev.isPublished,
              isFeatured: rev.isFeatured,
              sortOrder: rev.sortOrder,
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.debug(`Database auto-seed notice: ${err.message}`);
    }
  }
}
