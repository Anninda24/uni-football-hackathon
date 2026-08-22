import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting database tables...');

  // Delete all existing data in reverse order of foreign key dependencies
  await prisma.playerStats.deleteMany();
  await prisma.match.deleteMany();
  await prisma.auctionLedger.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.categoryTier.deleteMany();
  await prisma.biddingRule.deleteMany();
  await prisma.systemState.deleteMany();

  console.log('🔑 Hashing default password (123456)...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  console.log('👤 Creating default demo accounts...');

  // 1. Super Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  // 2. Sub Admin
  const subAdminUser = await prisma.user.create({
    data: {
      name: 'Sub Admin',
      email: 'subadmin@gmail.com',
      password: hashedPassword,
      role: 'SUB_ADMIN'
    }
  });

  // 3. Podium Admin
  const podiumUser = await prisma.user.create({
    data: {
      name: 'Podium Auctioneer',
      email: 'podium@gmail.com',
      password: hashedPassword,
      role: 'PODIUM_ADMIN'
    }
  });

  // 3. Team Manager
  const managerUser = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'manager@gmail.com',
      password: hashedPassword,
      role: 'TEAM_MANAGER'
    }
  });

  // 4. Player Account + Profile
  const playerUser = await prisma.user.create({
    data: {
      name: 'Julian Sterling',
      email: 'player@gmail.com',
      password: hashedPassword,
      role: 'PLAYER',
      playerProfile: {
        create: {
          studentId: 'ST-2026-001',
          academicSession: '2025/2026',
          jerseyName: 'STERLING',
          primaryPosition: 'ST',
          secondaryPositions: 'RW,CAM',
          basePrice: 15000,
          status: 'REGISTERED'
        }
      }
    }
  });

  // 5. Spectator
  const spectatorUser = await prisma.user.create({
    data: {
      name: 'Guest Spectator',
      email: 'spectator@gmail.com',
      password: hashedPassword,
      role: 'SPECTATOR'
    }
  });

  console.log('🏆 Creating initial Franchise Team...');
  await prisma.team.create({
    data: {
      name: 'Thunderbolts FC',
      budget: 100000,
      remainingBudget: 100000,
      managerId: managerUser.id
    }
  });

  console.log('⚙️ Initializing SystemState (TOURNAMENT Phase)...');
  await prisma.systemState.create({
    data: {
      currentPhase: 'TOURNAMENT'
    }
  });

  console.log('📊 Seeding initial CategoryTiers & BiddingRules...');
  await prisma.categoryTier.createMany({
    data: [
      { name: 'Icon', basePrice: 0 },
      { name: 'Platinum', basePrice: 15000 },
      { name: 'Gold', basePrice: 10000 },
      { name: 'Silver', basePrice: 6000 },
      { name: 'Bronze', basePrice: 3000 }
    ]
  });

  await prisma.biddingRule.createMany({
    data: [
      { minBudgetPercent: 0, maxBudgetPercent: 3, raiseStep: 150 },
      { minBudgetPercent: 3, maxBudgetPercent: 10, raiseStep: 500 },
      { minBudgetPercent: 10, maxBudgetPercent: 100, raiseStep: 1000 }
    ]
  });

  console.log('✅ Database Seeding Complete!');
  console.log('----------------------------------------------------');
  console.log('Created Demo Accounts (Password: 123456):');
  console.log(`- Super Admin : ${adminUser.email} (SUPER_ADMIN)`);
  console.log(`- Podium Admin: ${podiumUser.email} (PODIUM_ADMIN)`);
  console.log(`- Team Manager: ${managerUser.email} (TEAM_MANAGER)`);
  console.log(`- Player Account: ${playerUser.email} (PLAYER)`);
  console.log(`- Spectator   : ${spectatorUser.email} (SPECTATOR)`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
