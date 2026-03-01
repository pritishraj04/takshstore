import { PrismaClient, ProductType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting seed...');

    // Clear existing products to prevent duplicates (cascade deletes order items based on Prisma relation rules if applicable, but usually orderItems restrict product deletion. Here we assume a fresh DB or deleting products is safe).
    // Actually, to avoid foreign key errors during delete, let's just create new items without deleting old ones if possible, or try deleting.
    // If order items exist referencing the products, deleteMany might fail. Let's wrap it in a try-catch just in case.
    try {
        await prisma.product.deleteMany({});
        console.log('Cleared existing products.');
    } catch (e) {
        console.log('Could not clear existing products (likely due to existing orders), continuing to insert new ones.');
    }

    const product1 = await prisma.product.create({
        data: {
            title: 'Abstract Gold Canvas',
            price: 15000,
            type: 'PHYSICAL',
        },
    });

    const product2 = await prisma.product.create({
        data: {
            title: 'Bespoke Digital Wedding Invite',
            price: 5000,
            type: 'DIGITAL',
        },
    });

    console.log('Successfully created seed products:');
    console.log(`Product 1 (Physical) ID: ${product1.id}`);
    console.log(`Product 2 (Digital) ID: ${product2.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
