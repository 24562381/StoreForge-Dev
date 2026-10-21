import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TranslationsModule } from './modules/translations/translations.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { ModeratorsModule } from './modules/moderators/moderators.module';
import { DatabaseModule } from './modules/database/database.module';
import { CustomizationsModule } from './modules/customizations/customizations.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Locate the single central project root .env files
 */
function getRootEnvFiles(): string[] {
  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (
      fs.existsSync(path.join(current, 'scripts', 'start-server.js')) ||
      (fs.existsSync(path.join(current, 'package.json')) &&
        fs.existsSync(path.join(current, 'backend')) &&
        fs.existsSync(path.join(current, 'frontend')))
    ) {
      return [path.join(current, '.env.local'), path.join(current, '.env')];
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return [path.resolve('.env.local'), path.resolve('.env'), path.resolve('../.env')];
}


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getRootEnvFiles(),
    }),
    PrismaModule,


    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    FaqsModule,
    SettingsModule,
    TranslationsModule,
    AiModule,
    PaymentsModule,
    BarcodeModule,
    UploadsModule,
    PromoCodesModule,
    ModeratorsModule,
    DatabaseModule,
    CustomizationsModule,
    TenantsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}

