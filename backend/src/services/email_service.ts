import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { from } from 'node:stream/iter';
import { isMapIterator } from 'node:util/types';

export const sendOtpEmail = async(email:string, otp: string) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: env.email_user,
            pass: env.email_pass
        }
    })
    const mailOptions = {
        from: 'jkbank.noreply@gmail.com',
        to: email,
        subject:'One-Time Verification Code',
        text: `Your verification code is: ${otp}`,
        html: ` <h2>Welcome to JKBank</h2>
                <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
                <p>It will expire in 5 minutes.</p>`,
    };

    await transport.sendMail(mailOptions);
}