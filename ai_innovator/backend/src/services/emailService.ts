import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendNotificationEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        // If SMTP credentials aren't provided, we'll try to create a test account on the fly for demo purposes
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('--- NO SMTP CREDENTIALS FOUND, USING ETHEREAL TEST ACCOUNT ---');
            const testAccount = await nodemailer.createTestAccount();

            const testTransporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            const info = await testTransporter.sendMail({
                from: '"Medicare AI" <noreply@medicareai.com>',
                to,
                subject,
                text,
                html: html || `<p>${text}</p>`,
            });

            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return info;
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Medicare AI" <noreply@medicareai.com>',
            to,
            subject,
            text,
            html: html || `<p>${text}</p>`,
        });

        console.log('Email sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
