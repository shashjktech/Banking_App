"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const sendOtpEmail = async (email, otp) => {
    const transport = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: env_1.env.email_user,
            pass: env_1.env.email_pass
        }
    });
    const mailOptions = {
        from: 'jkbank.noreply@gmail.com',
        to: email,
        subject: 'One-Time Verification Code',
        text: `Your verification code is: ${otp}`,
        html: ` <h2>Welcome to JKBank</h2>
                <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
                <p>It will expire in 5 minutes.</p>`,
    };
    await transport.sendMail(mailOptions);
};
exports.sendOtpEmail = sendOtpEmail;
