const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count().catch((e) => {
    console.error('user.count failed:', e.message);
    return null;
  });

  const profileCount = await prisma.musicianProfile.count().catch((e) => {
    console.error('musicianProfile.count failed:', e.message);
    return null;
  });

  const gigCount = await prisma.gig.count().catch((e) => {
    console.error('gig.count failed:', e.message);
    return null;
  });

  console.log('Counts:', {
    userCount,
    profileCount,
    gigCount,
  });

  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  }).catch((e) => {
    console.error('user.findMany failed:', e.message);
    return [];
  });

  console.log('Sample users:', users);
}

main()
  .catch((e) => {
    console.error('DB check failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });