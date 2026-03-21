import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const docs = [
    { slug: 'privacy-policy', title: 'Privacy Policy', content: '<p>Our commitment to privacy...</p>' },
    { slug: 'terms-of-service', title: 'Terms of Service', content: '<p>Terms governing use...</p>' },
  ];

  for (const doc of docs) {
    await prisma.cmsDocument.upsert({
      where: { slug: doc.slug },
      update: {},
      create: { slug: doc.slug, title: doc.title, content: doc.content },
    });
  }

  // Seed standard FAQs
  const faqs = [
    { question: 'What is the refund format?', answer: '<p>No refunds natively issued onto digital goods.</p>', displayOrder: 1 },
    { question: 'When does the event horizon lock apply?', answer: '<p>90 days precisely tracking your mapped timeline.</p>', displayOrder: 2 }
  ];

  for (const faq of faqs) {
      await prisma.faq.create({
          data: {
              ...faq
          }
      })
  }

  console.log('CMS Seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
