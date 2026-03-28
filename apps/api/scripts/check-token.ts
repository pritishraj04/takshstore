import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const token = '1ccbdc220a5fc2f093e587b1ef7237ac81649d40ebe080a799eac4332575d278';
  
  const user = await prisma.user.findFirst({
    where: { resetToken: token }
  });
  
  if (user) {
    console.log('User found:', user.email);
    console.log('Expiry:', user.resetTokenExpiry);
    console.log('Now:', new Date());
    console.log('Expired?', user.resetTokenExpiry ? user.resetTokenExpiry < new Date() : 'No expiry set');
  } else {
    const admin = await prisma.adminUser.findFirst({
      where: { resetToken: token }
    });
    if (admin) {
      console.log('Admin found:', admin.email);
      console.log('Expiry:', admin.resetTokenExpiry);
      console.log('Now:', new Date());
      console.log('Expired?', admin.resetTokenExpiry ? admin.resetTokenExpiry < new Date() : 'No expiry set');
    } else {
      console.log('Token not found in DB');
    }
  }
  
  await prisma.$disconnect();
}

main();
