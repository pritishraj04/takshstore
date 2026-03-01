import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    console.log(`There are ${products.length} products in the database.`);
    if (products.length > 0) {
        console.log("Sample product ID:", products[0].id);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
