// prisma/seed.ts
import { prisma } from '../src/utils/db';
import { faker } from '@faker-js/faker';
import { AccountStatus, AccountType, TransactionStatus, TransactionType } from '@prisma/client';
import crypto from 'crypto';

const TOTAL_RECORDS = 100000; // 1 Lakh records
const BATCH_SIZE = 5000;      // Optimal chunk size for PostgreSQL
const STAFF_ID = 'de55f1a7-28eb-4010-a1b9-b696725ac8ac'; // Your specific staff member

async function main() {
  console.log(`🚀 Starting bulk seed for ${TOTAL_RECORDS} records in BankingApp...`);
  console.log(`👨‍💼 Using Staff ID: ${STAFF_ID}`);

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const customersBatch = [];
    const accountsBatch = [];
    const transactionsBatch = [];

    // 1. Generate data for the current batch
    for (let j = 0; j < BATCH_SIZE; j++) {
      const customerId = crypto.randomUUID();
      const accountId = crypto.randomUUID();
      
      // Generate a realistic initial deposit
      const initialDeposit = parseFloat(faker.finance.amount({ min: 1000, max: 50000, dec: 2 }));

      // Build Customer
      customersBatch.push({
        id: customerId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: `${faker.internet.email({ provider: 'jkbank.test' })}-${crypto.randomBytes(4).toString('hex')}`,
        phoneNumber: faker.string.numeric(10),
        address: faker.location.streetAddress(),
      });

      // Build Account
      accountsBatch.push({
        id: accountId,
        customerId: customerId,
        accountNumber: faker.string.numeric(12),
        accountType: AccountType.SAVINGS,
        balance: initialDeposit,
        status: AccountStatus.ACTIVE,
      });

      // Build Initial Transaction (Deposit)
      transactionsBatch.push({
        id: crypto.randomUUID(),
        fromaccountId: null, // Null indicates external cash deposit
        toaccountId: accountId,
        staffId: STAFF_ID,  
        type: TransactionType.DEPOSIT,
        amount: initialDeposit,
        balanceAfter: initialDeposit,
        status: TransactionStatus.COMPLETED,
        referenceNote: 'Initial Opening Deposit',
      });
    }

    // 2. Execute bulk inserts strictly in relational order
    await prisma.customer.createMany({
      data: customersBatch,
      skipDuplicates: true,
    });

    await prisma.account.createMany({
      data: accountsBatch,
      skipDuplicates: true,
    });

    await prisma.transaction.createMany({
      data: transactionsBatch,
      skipDuplicates: true,
    });

    console.log(`✅ Processed: ${i + BATCH_SIZE} / ${TOTAL_RECORDS} records...`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });