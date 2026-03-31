import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[PrismaService] WARNING: DATABASE_URL is not set. DB calls will fail.',
  );
}

// 🔴 THE MAGIC FIX IS RIGHT HERE 🔴
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Tells AWS RDS we are using a secure connection!
});

const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully.');
    } catch (error) {
      this.logger.error(
        'Database connection failed at startup. Will retry on first query.',
        error,
      );
    }
  }
}