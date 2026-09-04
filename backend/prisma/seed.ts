// prisma/seed.ts
import { prisma } from '../src/utils/db';
import { faker } from '@faker-js/faker';
import { AccountStatus, AccountType, TransactionStatus, TransactionType , staffRole} from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';


async function main() {
  console.log('🌱 Seeding database...');
  //console.log( env.databaseUrl);

  // 1. Seed Main Branch
  const branch = await prisma.branch.upsert({
    where: { branchcode: 'JKB001' },
    update: {},
    create: {
      name: 'Central Headquarters Branch',
      branchcode: 'JKB001',
      address: 'HSR, Sector 1',
      city: 'Bangalore',
      phone: '+91 9876543210',
    },
  });

  // 2. Hash Passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const operatorPassword = await bcrypt.hash('Staff@123', 10);

  // 3. Seed Staff Members
  const admin = await prisma.staff.upsert({
    where: { email: 'admin@jkbank.internal' },
    update: { branchid: branch.id },
    create: {
      branchid: branch.id,
      username: 'superadmin',
      email: 'admin@jkbank.internal',
      passwordHash: adminPassword,
      role: staffRole.ADMIN,
      isActive: true,
    },
  });

  const operator = await prisma.staff.upsert({
    where: { email: 'operator1@jkbank.internal' },
    update: { branchid: branch.id },
    create: {
      branchid: branch.id,
      username: 'operator1',
      email: 'operator1@jkbank.internal',
      passwordHash: operatorPassword,
      role: staffRole.OPERATOR,
      isActive: true,
    },
  });
  console.log('✅ Seed completed successfully:');
  console.log(`   - Branch: ${branch.name} (${branch.branchcode})`);
  console.log(`   - Admin: ${admin.email} (Password: Admin@123)`);
  console.log(`   - Operator: ${operator.email} (Password: Operator@123)`);
}

main()
  