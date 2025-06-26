const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMail = async (receiver, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `3ird App <${process.env.MAIL_USERNAME}>`,
            to: receiver,
            subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const getMessageTemplate = (header, content, warning, otp = null, token = null, route = null) => {
    const url = `${process.env.HOSTED_URL}/${route || ''}/${token || ''}`;

    return `
        <div style="max-width: 600px; margin: auto; padding: 2rem; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; color: #333;">
            <!-- Header -->
            <h2 style="color: #4242fa;">${header}</h2>

            <!-- Body Content -->
            <p style="font-size: 1rem; line-height: 1.6;">${content}</p>
            <p style="color: #d9534f;">${warning}</p>

            <!-- Verification Button -->
            ${token ? `
                <div style="margin: 2rem 0;">
                    <a href="${url}" target="_blank" 
                        style="padding: 0.75rem 1.5rem; background-color: #4242fa; color: #fff; text-decoration: none; border-radius: 5px;">
                        Verify Email
                    </a>
                </div>
                <p>If the button doesn't work, click this link:</p>
                <p><a href="${url}" target="_blank" style="text-wrap: wrap">Verification Link</a></p>
            ` : ''}

            <!-- OTP -->
            ${otp ? `
                <p style="font-size: 1.1rem;">Your One-Time PIN (OTP) is: 
                    <strong style="font-size: 1.25rem;">${otp}</strong>
                </p>
            ` : ''}

            <!-- Footer -->
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 0.9rem;">This email was sent by <strong>3ird App</strong>.</p>
            <p style="font-size: 0.9rem;">If you didn't request this, please ignore the email.</p>
        </div>
    `;
};

module.exports = {
    sendMail,
    getMessageTemplate,
};
