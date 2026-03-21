import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

  async function seedCoupon() {
  await prisma.coupon.upsert({
    where: { code: 'FOREVER20' },
    update: {},
    create: {
      code: 'FOREVER20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
    },
  });
  console.log('Successfully seeded FOREVER20 coupon.');
}

seedCoupon()
  .catch((e) => {
    console.error('Error seeding coupon:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
