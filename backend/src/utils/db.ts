import {PrismaClient} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: env.databaseUrl,
    // max: 10,
    // idleTimeoutMillis: 30000,
    //ssl: { rejectUnauthorized: false }
    user: 'postgres',
    password: 'admin123', 
    database: 'internal_banking_app',
    host: '/cloudsql/project-242bd360-d8b9-4aad-9e6:asia-south1:internal-banking-app',
    max: 10,
    idleTimeoutMillis: 30000,
})
pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

const adapter  = new PrismaPg(pool);
export const prisma = new PrismaClient({adapter});
