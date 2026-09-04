
import dotenv from 'dotenv';
import { prisma } from '../utils/db';


dotenv.config();

export const env={
    databaseUrl: process.env.DATABASE_URL,
    port: Number(process.env.PORT),
    jwtsecret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    client_url: process.env.CLIENT_URL,
}as const;


