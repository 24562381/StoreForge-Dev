import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { performance } from 'perf_hooks';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync, execSync } from 'child_process';

export function getBackupsDirectory(): string {
  let dir = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (
      fs.existsSync(path.join(dir, 'scripts', 'db-backup.js')) ||
      fs.existsSync(path.join(dir, 'docker-compose.yml'))
    ) {
      const backupsPath = path.join(dir, 'backups');
      if (!fs.existsSync(backupsPath)) {
        fs.mkdirSync(backupsPath, { recursive: true });
      }
      return backupsPath;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const fallback = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

export interface BackupItem {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  createdAt: string;
  type: 'sql' | 'json';
}

export interface DatabaseStats {
  engine: string;
  status: string;
  databaseName: string;
  totalBackups: number;
  lastBackupTime: string | null;
  latencyMs: number;
  counts: {
    products: number;
    categories: number;
    orders: number;
    users: number;
    reviews: number;
    settings: number;
    translations: number;
  };
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private backupCronInterval?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initAutomatedBackupSchedule();
  }

  onModuleDestroy() {
    if (this.backupCronInterval) {
      clearInterval(this.backupCronInterval);
    }
  }

  /**
   * Initializes internal automated daily database snapshot scheduler (every 24h).
   * Works on any hosting provider without requiring external Linux crontab.
   */
  private initAutomatedBackupSchedule() {
    const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check hourly
    this.backupCronInterval = setInterval(async () => {
      try {
        const stats = await this.getDatabaseStats();
        const lastBackupTime = stats.lastBackupTime ? new Date(stats.lastBackupTime).getTime() : 0;
        const now = Date.now();
        const hoursSinceLast = (now - lastBackupTime) / (1000 * 60 * 60);

        if (hoursSinceLast >= 24) {
          this.logger.log('Executing automated 24-hour database backup cycle...');
          const backup = await this.createBackup('sql');
          this.logger.log(`✔ Automated scheduled backup created: ${backup.fileName} (${backup.fileSizeFormatted})`);
        }
      } catch (err: any) {
        this.logger.warn(`Automated backup schedule error: ${err.message}`);
      }
    }, CHECK_INTERVAL_MS);

    if (this.backupCronInterval.unref) {
      this.backupCronInterval.unref();
    }
  }

  public getBackupsDir(): string {
    return getBackupsDirectory();
  }

  private formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getBackupsList(): Promise<BackupItem[]> {
    const dir = this.getBackupsDir();
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    const backups: BackupItem[] = [];

    for (const file of files) {
      if (!/^db-backup-.*\.(sql|json)$/i.test(file)) continue;

      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) continue;

        backups.push({
          fileName: file,
          fileSizeBytes: stat.size,
          fileSizeFormatted: this.formatBytes(stat.size),
          createdAt: stat.mtime.toISOString(),
          type: file.endsWith('.sql') ? 'sql' : 'json',
        });
      } catch {}
    }

    // Sort descending (newest first)
    return backups.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    const backups = await this.getBackupsList();
    const lastBackupTime = backups.length > 0 ? backups[0].createdAt : null;

    let latencyMs = 0;
    try {
      const startLatency = performance.now();
      await this.prisma.$queryRawUnsafe('SELECT 1');
      const duration = performance.now() - startLatency;
      latencyMs = duration < 10 ? Number(duration.toFixed(1)) : Math.round(duration);
    } catch {
      latencyMs = -1;
    }

    let products = 0;
    let categories = 0;
    let orders = 0;
    let users = 0;
    let reviews = 0;
    let settings = 0;
    let translations = 0;

    try {
      [products, categories, orders, users, reviews, settings, translations] =
        await Promise.all([
          this.prisma.product.count().catch(() => 0),
          this.prisma.category.count().catch(() => 0),
          this.prisma.order.count().catch(() => 0),
          this.prisma.user.count().catch(() => 0),
          this.prisma.review.count().catch(() => 0),
          this.prisma.setting.count().catch(() => 0),
          this.prisma.translation.count().catch(() => 0),
        ]);
    } catch {}

    const rawUrl = process.env.DATABASE_URL || '';
    const maskedUrl = rawUrl.replace(/:[^:@]+@/, ':****@');
    const dbName = rawUrl.split('/').pop()?.split('?')[0] || 'postgres';

    return {
      engine: 'PostgreSQL 18+ (ACID Compliant)',
      status: this.prisma.isDatabaseConnected ? 'connected' : 'disconnected',
      databaseName: `${dbName} (${maskedUrl})`,
      totalBackups: backups.length,
      lastBackupTime,
      latencyMs,
      counts: {
        products,
        categories,
        orders,
        users,
        reviews,
        settings,
        translations,
      },
    };
  }

  private getDatabaseConnectionInfo(): {
    rawUrl: string;
    host: string;
    isLocal: boolean;
  } {
    const rawUrl = process.env.DATABASE_URL || '';
    let host = 'localhost';
    try {
      if (rawUrl.startsWith('postgresql://') || rawUrl.startsWith('postgres://')) {
        const parsed = new URL(rawUrl);
        host = parsed.hostname;
      }
    } catch {
      const match = rawUrl.match(/@([^:/]+)/);
      if (match) host = match[1];
    }
    const isLocal =
      !host ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'postgres-test' ||
      host === '::1';

    return { rawUrl, host, isLocal };
  }

  async createBackup(format: 'sql' | 'json' = 'sql'): Promise<BackupItem> {
    const dir = this.getBackupsDir();
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-');

    if (format === 'sql') {
      const fileName = `db-backup-${timestamp}.sql`;
      const filePath = path.join(dir, fileName);
      const { rawUrl, isLocal } = this.getDatabaseConnectionInfo();

      let dumped = false;

      // 1. Try host pg_dump using DATABASE_URL (works for ANY PostgreSQL hosting: local, Supabase, Neon, AWS RDS, etc.)
      if (rawUrl) {
        try {
          const hasPgDump =
            execSync('command -v pg_dump >/dev/null 2>&1 && echo "yes" || true', {
              encoding: 'utf8',
            }).trim() === 'yes';

          if (hasPgDump) {
            this.logger.log(`Executing host pg_dump using DATABASE_URL...`);
            const hostDump = spawnSync('pg_dump', [rawUrl], {
              maxBuffer: 250 * 1024 * 1024,
            });

            if (hostDump.status === 0 && hostDump.stdout && hostDump.stdout.length > 0) {
              fs.writeFileSync(filePath, hostDump.stdout);
              dumped = true;
            }
          }
        } catch (err: any) {
          this.logger.warn(`Host pg_dump attempt: ${err.message}`);
        }
      }

      // 2. If host pg_dump didn't succeed, check Docker
      if (!dumped) {
        try {
          const isDocker =
            execSync(
              'command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || true',
              { encoding: 'utf8' }
            ).trim() === 'yes';

          if (isDocker) {
            if (isLocal) {
              const isRunning =
                execSync(
                  "docker inspect --format='{{.State.Running}}' postgres-test 2>/dev/null || true",
                  { encoding: 'utf8' }
                ).trim() === 'true';

              if (isRunning) {
                this.logger.log(`Executing Docker pg_dump from local container postgres-test...`);
                const dockerDump = spawnSync(
                  'docker',
                  ['exec', 'postgres-test', 'pg_dump', '-U', 'postgres', '-d', 'postgres'],
                  { maxBuffer: 250 * 1024 * 1024 }
                );

                if (dockerDump.status === 0 && dockerDump.stdout && dockerDump.stdout.length > 0) {
                  fs.writeFileSync(filePath, dockerDump.stdout);
                  dumped = true;
                }
              }
            } else if (rawUrl) {
              this.logger.log(`Executing Docker pg_dump container against remote database host...`);
              const dockerDump = spawnSync(
                'docker',
                ['run', '--rm', 'postgres:18-alpine', 'pg_dump', rawUrl],
                { maxBuffer: 250 * 1024 * 1024 }
              );

              if (dockerDump.status === 0 && dockerDump.stdout && dockerDump.stdout.length > 0) {
                fs.writeFileSync(filePath, dockerDump.stdout);
                dumped = true;
              }
            }
          }
        } catch (err: any) {
          this.logger.warn(`Docker pg_dump attempt: ${err.message}`);
        }
      }

      // 3. Fallback: If SQL dump tools unavailable, generate portable JSON snapshot (Prisma ORM based - 100% database agnostic)
      if (!dumped) {
        this.logger.log(`Native pg_dump not available in environment. Creating portable JSON snapshot...`);
        return this.createJsonSnapshot(timestamp);
      }

      const stat = fs.statSync(filePath);
      return {
        fileName,
        fileSizeBytes: stat.size,
        fileSizeFormatted: this.formatBytes(stat.size),
        createdAt: now.toISOString(),
        type: 'sql',
      };
    } else {
      return this.createJsonSnapshot(timestamp);
    }
  }

  private async createJsonSnapshot(timestamp: string): Promise<BackupItem> {
    const dir = this.getBackupsDir();
    const fileName = `db-backup-${timestamp}.json`;
    const filePath = path.join(dir, fileName);

    const snapshot = {
      createdAt: new Date().toISOString(),
      format: 'storeforge-json-v2',
      tables: {} as Record<string, any[]>,
    };

    const models = [
      'user',
      'category',
      'product',
      'productVariant',
      'order',
      'orderItem',
      'review',
      'promoCode',
      'faq',
      'setting',
      'translation',
    ];

    for (const model of models) {
      if ((this.prisma as any)[model]?.findMany) {
        try {
          snapshot.tables[model] = await (this.prisma as any)[model].findMany();
        } catch (err: any) {
          this.logger.warn(`Could not snapshot model ${model}: ${err.message}`);
          snapshot.tables[model] = [];
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
    const stat = fs.statSync(filePath);

    return {
      fileName,
      fileSizeBytes: stat.size,
      fileSizeFormatted: this.formatBytes(stat.size),
      createdAt: new Date().toISOString(),
      type: 'json',
    };
  }

  public getBackupFilePath(fileName: string): string {
    if (!fileName || !/^db-backup-[a-zA-Z0-9_\-]+\.(sql|json)$/.test(fileName)) {
      throw new BadRequestException(
        'Invalid backup file name pattern. File name must match StoreForge backup naming convention.'
      );
    }

    const dir = this.getBackupsDir();
    const safePath = path.resolve(dir, fileName);

    // Verify path does not escape backups directory (Directory traversal protection)
    if (!safePath.startsWith(dir)) {
      throw new BadRequestException('Access denied: Path traversal detected.');
    }

    if (!fs.existsSync(safePath)) {
      throw new NotFoundException(`Backup file "${fileName}" does not exist.`);
    }

    return safePath;
  }

  async deleteBackup(fileName: string): Promise<{ success: boolean; message: string }> {
    const filePath = this.getBackupFilePath(fileName);
    try {
      fs.unlinkSync(filePath);
      return { success: true, message: `Backup "${fileName}" deleted successfully.` };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to delete backup: ${err.message}`);
    }
  }

  async restoreFromBackup(
    filePath: string,
    options: { takeSafetyBackup?: boolean } = {}
  ): Promise<{
    success: boolean;
    message: string;
    safetyBackupFileName: string | null;
    tablesRestored?: string[];
  }> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Specified backup file could not be found.');
    }

    let safetyBackupFileName: string | null = null;
    if (options.takeSafetyBackup !== false) {
      this.logger.log('Taking automated safety backup prior to database restoration...');
      try {
        const safetyItem = await this.createJsonSnapshot(
          `pre-restore-${Date.now()}`
        );
        safetyBackupFileName = safetyItem.fileName;
        this.logger.log(`✔ Safety backup created: ${safetyBackupFileName}`);
      } catch (backupErr: any) {
        this.logger.warn(`Warning: Could not create pre-restore safety snapshot: ${backupErr.message}`);
      }
    }

    const isSql = filePath.endsWith('.sql');
    const isJson = filePath.endsWith('.json');

    if (!isSql && !isJson) {
      throw new BadRequestException('Unsupported backup format. Only .sql and .json files are supported.');
    }

    if (isSql) {
      // Execute SQL restore safely without shell execution
      let executed = false;
      const fileBuffer = fs.readFileSync(filePath);
      const { rawUrl, isLocal } = this.getDatabaseConnectionInfo();

      // 1. Try host psql first (works for ANY PostgreSQL hosting: local, Supabase, Neon, AWS RDS, etc.)
      if (rawUrl) {
        try {
          const hasPsql =
            execSync('command -v psql >/dev/null 2>&1 && echo "yes" || true', {
              encoding: 'utf8',
            }).trim() === 'yes';

          if (hasPsql) {
            this.logger.log('Restoring database via host psql client (spawnSync)...');
            const hostRestore = spawnSync('psql', [rawUrl], {
              input: fileBuffer,
              maxBuffer: 250 * 1024 * 1024,
            });

            if (hostRestore.status === 0 || (hostRestore.stderr && !hostRestore.status)) {
              executed = true;
            }
          }
        } catch (hostErr: any) {
          this.logger.warn(`Host psql restore attempt failed: ${hostErr.message}`);
        }
      }

      // 2. Try Docker if host psql didn't execute
      if (!executed) {
        try {
          const isDocker =
            execSync(
              'command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || true',
              { encoding: 'utf8' }
            ).trim() === 'yes';

          if (isDocker) {
            if (isLocal) {
              const isRunning =
                execSync(
                  "docker inspect --format='{{.State.Running}}' postgres-test 2>/dev/null || true",
                  { encoding: 'utf8' }
                ).trim() === 'true';

              if (isRunning) {
                this.logger.log('Restoring database via local Docker container postgres-test (spawnSync)...');
                const dockerRestore = spawnSync(
                  'docker',
                  ['exec', '-i', 'postgres-test', 'psql', '-U', 'postgres', '-d', 'postgres'],
                  {
                    input: fileBuffer,
                    maxBuffer: 250 * 1024 * 1024,
                  }
                );

                if (dockerRestore.status === 0 || (dockerRestore.stderr && !dockerRestore.status)) {
                  executed = true;
                }
              }
            } else if (rawUrl) {
              this.logger.log('Restoring remote database via Docker postgres client container...');
              const dockerRestore = spawnSync(
                'docker',
                ['run', '--rm', '-i', 'postgres:18-alpine', 'psql', rawUrl],
                {
                  input: fileBuffer,
                  maxBuffer: 250 * 1024 * 1024,
                }
              );

              if (dockerRestore.status === 0 || (dockerRestore.stderr && !dockerRestore.status)) {
                executed = true;
              }
            }
          }
        } catch (dockerErr: any) {
          this.logger.warn(`Docker SQL restore attempt failed: ${dockerErr.message}`);
        }
      }

      // 3. Fallback: Direct execution via Prisma $executeRawUnsafe if native psql tools are absent
      if (!executed) {
        try {
          this.logger.log('Executing SQL statements via direct Prisma connection...');
          const sqlString = fileBuffer.toString('utf8');
          await this.prisma.$executeRawUnsafe(sqlString);
          executed = true;
        } catch (prismaSqlErr: any) {
          this.logger.warn(`Direct Prisma SQL execution failed: ${prismaSqlErr.message}`);
        }
      }

      if (!executed) {
        throw new InternalServerErrorException(
          'SQL restoration requires PostgreSQL client tools (psql or Docker) or valid SQL script. For hosted databases, portable .json snapshots are universally supported and recommended.'
        );
      }

      return {
        success: true,
        message: 'SQL database backup imported and restored successfully.',
        safetyBackupFileName,
      };
    } else {
      // Execute JSON restore
      const rawContent = fs.readFileSync(filePath, 'utf8');
      let data: any;
      try {
        data = JSON.parse(rawContent);
      } catch {
        throw new BadRequestException('Invalid JSON backup file structure.');
      }

      const tables = data.tables || data;
      if (!tables || typeof tables !== 'object') {
        throw new BadRequestException('Invalid backup structure: No tables found.');
      }

      const restoredTables: string[] = [];

      // Perform relational restore using sequential operations inside Prisma
      try {
        // 1. Settings (Upsert by key)
        if (Array.isArray(tables.setting)) {
          for (const item of tables.setting) {
            if (item.key) {
              await this.prisma.setting.upsert({
                where: { key: item.key },
                update: { value: item.value, description: item.description },
                create: item,
              });
            }
          }
          restoredTables.push('settings');
        }

        // 2. Translations (Upsert by key)
        if (Array.isArray(tables.translation)) {
          for (const item of tables.translation) {
            if (item.key) {
              await this.prisma.translation.upsert({
                where: { key: item.key },
                update: {
                  bn: item.bn,
                  en: item.en,
                  category: item.category,
                  description: item.description,
                },
                create: item,
              });
            }
          }
          restoredTables.push('translations');
        }

        // 3. FAQs (Upsert by id)
        if (Array.isArray(tables.faq)) {
          for (const item of tables.faq) {
            if (item.id) {
              await this.prisma.faq.upsert({
                where: { id: item.id },
                update: item,
                create: item,
              });
            }
          }
          restoredTables.push('faqs');
        }

        // 4. Promo Codes (Upsert by code)
        if (Array.isArray(tables.promoCode)) {
          for (const item of tables.promoCode) {
            if (item.code) {
              await this.prisma.promoCode.upsert({
                where: { code: item.code },
                update: item,
                create: item,
              });
            }
          }
          restoredTables.push('promoCodes');
        }

        // 5. Categories (Upsert by slug)
        if (Array.isArray(tables.category)) {
          for (const item of tables.category) {
            if (item.slug) {
              const { products, ...catData } = item;
              await this.prisma.category.upsert({
                where: { slug: item.slug },
                update: catData,
                create: catData,
              });
            }
          }
          restoredTables.push('categories');
        }

        // 6. Products (Upsert by slug)
        if (Array.isArray(tables.product)) {
          for (const item of tables.product) {
            if (item.slug) {
              const { variants, orderItems, reviews, category, ...prodData } = item;
              await this.prisma.product.upsert({
                where: { slug: item.slug },
                update: prodData,
                create: prodData,
              });
            }
          }
          restoredTables.push('products');
        }

        // 7. Product Variants
        if (Array.isArray(tables.productVariant)) {
          for (const item of tables.productVariant) {
            if (item.id) {
              const { product, orderItems, ...variantData } = item;
              await this.prisma.productVariant.upsert({
                where: { id: item.id },
                update: variantData,
                create: variantData,
              });
            }
          }
          restoredTables.push('productVariants');
        }

        // 8. Reviews
        if (Array.isArray(tables.review)) {
          for (const item of tables.review) {
            if (item.id) {
              const { product, ...reviewData } = item;
              await this.prisma.review.upsert({
                where: { id: item.id },
                update: reviewData,
                create: reviewData,
              });
            }
          }
          restoredTables.push('reviews');
        }

        // 9. Orders & Order Items
        if (Array.isArray(tables.order)) {
          for (const item of tables.order) {
            if (item.orderNumber) {
              const { items, ...orderData } = item;
              await this.prisma.order.upsert({
                where: { orderNumber: item.orderNumber },
                update: orderData,
                create: orderData,
              });
            }
          }
          restoredTables.push('orders');
        }

        if (Array.isArray(tables.orderItem)) {
          for (const item of tables.orderItem) {
            if (item.id) {
              const { order, product, variant, ...itemData } = item;
              await this.prisma.orderItem.upsert({
                where: { id: item.id },
                update: itemData,
                create: itemData,
              });
            }
          }
          restoredTables.push('orderItems');
        }

        // 10. Users: preserve existing passwords and roles if email matches to prevent privilege escalation or lockout
        if (Array.isArray(tables.user)) {
          for (const item of tables.user) {
            if (item.email) {
              const existingUser = await this.prisma.user.findUnique({
                where: { email: item.email },
              });

              if (existingUser) {
                // If user is an active admin, preserve their role and permissions
                if (existingUser.role === 'admin') {
                  await this.prisma.user.update({
                    where: { email: item.email },
                    data: {
                      name: item.name || existingUser.name,
                      phone: item.phone ?? existingUser.phone,
                      photo: item.photo ?? existingUser.photo,
                    },
                  });
                } else {
                  await this.prisma.user.update({
                    where: { email: item.email },
                    data: {
                      name: item.name,
                      phone: item.phone,
                      photo: item.photo,
                      role: item.role === 'admin' ? existingUser.role : item.role,
                      permissions: item.permissions,
                      isActive: item.isActive,
                    },
                  });
                }
              } else {
                // New user from backup: if imported with role 'admin', downgrade to 'moderator' to prevent rogue admin creation
                await this.prisma.user.create({
                  data: {
                    ...item,
                    role: item.role === 'admin' ? 'moderator' : item.role,
                  },
                });
              }
            }
          }
          restoredTables.push('users');
        }

        return {
          success: true,
          message: `JSON database snapshot restored successfully (${restoredTables.length} tables updated).`,
          safetyBackupFileName,
          tablesRestored: restoredTables,
        };
      } catch (restoreErr: any) {
        throw new InternalServerErrorException(
          `Failed restoring JSON snapshot data: ${restoreErr.message}`
        );
      }
    }
  }
}
