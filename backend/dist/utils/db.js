"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const env_1 = require("../config/env");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: env_1.env.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false }
});
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
