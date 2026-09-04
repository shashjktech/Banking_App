"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    databaseUrl: process.env.DATABASE_URL,
    port: Number(process.env.PORT),
    jwtsecret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    client_url: process.env.CLIENT_URL,
};
