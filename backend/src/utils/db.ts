import {PrismaClient} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: env.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false }
})
const adapter  = new PrismaPg(pool);
export const prisma = new PrismaClient({adapter});
