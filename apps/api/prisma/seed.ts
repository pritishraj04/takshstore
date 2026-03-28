import {
    PrismaClient,
    AdminStatus,
    PermissionLevel,
    ProductType,
    ProductStatus
} from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // ---------------------------------------------------------
    // 1. Create the Super Admin User
    // ---------------------------------------------------------
    // NOTE: In production, you MUST hash this password using bcrypt!
    // e.g., const hashedPassword = await bcrypt.hash('TakshAdmin2024!', 10);

    const superAdmin = await prisma.adminUser.upsert({
        where: { email: 'admin@taksh.com' },
        update: {},
        create: {
            email: 'admin@takshstore.com',
            name: 'Taksh Super Admin',
            password: process.env.SUPER_ADMIN_INITAL_PASSWORD,
            status: AdminStatus.ACTIVE,
            isSuper: true,
            permissions: {
                create: {
                    orders: PermissionLevel.WRITE,
                    customers: PermissionLevel.WRITE,
                    categories: PermissionLevel.WRITE,
                    products: PermissionLevel.WRITE,
                    subAdmins: PermissionLevel.WRITE,
                    articles: PermissionLevel.WRITE,
                    cms: PermissionLevel.WRITE,
                    coupons: PermissionLevel.WRITE,
                    reviews: PermissionLevel.WRITE,
                    media: PermissionLevel.WRITE,
                    settings: PermissionLevel.WRITE,
                }
            }
        },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // ---------------------------------------------------------
    // 2. Base CMS Documents
    // ---------------------------------------------------------
    const cmsDocs = [
        { slug: 'about', title: 'About Us', content: 'Welcome to Taksh...' },
        { slug: 'terms', title: 'Terms & Conditions', content: 'These are the terms and conditions...' },
        { slug: 'privacy', title: 'Privacy Policy', content: 'We respect your privacy...' },
    ];

    for (const doc of cmsDocs) {
        await prisma.cmsDocument.upsert({
            where: { slug: doc.slug },
            update: {},
            create: doc,
        });
    }
    console.log(`✅ CMS Documents created.`);

    // ---------------------------------------------------------
    // 3. Store Settings
    // ---------------------------------------------------------
    const defaultSettings = [
        { key: 'STORE_NAME', value: 'Taksh' },
        { key: 'CONTACT_EMAIL', value: 'support@taksh.com' },
        { key: 'CURRENCY', value: 'INR' },
    ];

    for (const setting of defaultSettings) {
        await prisma.storeSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log(`✅ Store Settings initialized.`);

    // ---------------------------------------------------------
    // 4. Base Products (Digital & Physical)
    // ---------------------------------------------------------
    await prisma.product.upsert({
        where: { id: 'default-digital-invite' },
        update: {},
        create: {
            id: 'default-digital-invite',
            title: 'Bespoke Digital Invitation',
            type: ProductType.DIGITAL,
            price: 2000,
            description: 'A beautifully crafted digital experience for your guests.',
            status: ProductStatus.ACTIVE,
            isDigital: true,
            isCustomizable: true,
            eternityAddonPrice: 500,
        },
    });

    await prisma.product.upsert({
        where: { id: 'default-canvas-print' },
        update: {},
        create: {
            id: 'default-canvas-print',
            title: 'Premium Museum Canvas',
            type: ProductType.PHYSICAL,
            price: 5000,
            description: 'Your favorite memory, printed on premium gallery-wrapped canvas.',
            status: ProductStatus.ACTIVE,
            isDigital: false,
            isCustomizable: false,
        },
    });
    console.log(`✅ Default Products created.`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });