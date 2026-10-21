import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { getFrontendUrl, getAdminUrl, getBackendUrl } from './common/utils/urls';

// Central .env loader for standalone backend execution
const rootEnvCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env.local'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env.local'),
  path.resolve(__dirname, '..', '..', '.env'),
];
for (const envPath of rootEnvCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    noSniff: true,
    hidePoweredBy: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Support Chrome Private Network Access (PNA) preflights
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers['access-control-request-private-network']) {
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
  });

  const rawOrigins = [
    getFrontendUrl(),
    getAdminUrl(),
    getBackendUrl(),
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.NEXT_PUBLIC_STORE_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    process.env.STORE_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://localhost:8585',
    'http://127.0.0.1:8585',
  ].filter(Boolean) as string[];

  const allowedOrigins = new Set<string>();
  for (const raw of rawOrigins) {
    const clean = raw.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
    if (!clean) continue;
    allowedOrigins.add(clean);
    if (!/^https?:\/\//i.test(clean)) {
      allowedOrigins.add(`https://${clean}`);
      allowedOrigins.add(`http://${clean}`);
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, Next.js rewrites)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin) ||
        (process.env.NODE_ENV !== 'production' &&
          /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(cleanOrigin)) ||
        allowedOrigins.has(cleanOrigin) ||
        allowedOrigins.has(cleanOrigin.replace(/^https?:\/\//, ''))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Static uploads directory with caching
  app.useStaticAssets(join(process.cwd(), 'public/uploads'), {
    prefix: '/uploads/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days browser cache
    immutable: true,
  });

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Global API Prefix
  app.setGlobalPrefix('api');

  const port = process.env.BACKEND_PORT || process.env.PORT || 8585;
  await app.listen(port, '0.0.0.0');
  console.log(`====================================================`);
  console.log(`[StoreForge] NestJS Backend running at http://localhost:${port}/api`);
  console.log(`====================================================`);
}
bootstrap();
