const nodemailer = require('nodemailer')
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
            subject: subject,
            html: message
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

const getMessageTemplate = (header, content, warning, otp = null, token = null, route = null) => {
    const url = `${process.env.HOSTED_URL}/${route}/${token}`;

    return `
            <div style="text-align: center; margin: 0;">
            <h1>${header}</h1>
            ${content}<br>
            <span>${warning}</span><br><br>
            ${
        token ? `
                <div style="margin: 2rem 0">
                <a href="${url}" target="_blank" style="padding: 0.5rem 1rem; border-radius: 5px; background: #4242fa; text-decoration: none; color: #ffffff;">Verify Email</a>
                </div>
                       
                If the button doesn't work, copy and paste this link into your browser: <br />
                <a href="${url}">${url}</a> <br><br><br><br>
                ` : ''
    }
            
            ${otp ? `<p>Your One-Time PIN (OTP) is: <strong>${otp}</strong></p>` : ''}
            
            
            <p style="text-align: center; margin: 0;">This email was sent by 3ird App</p><br>
            <p style="text-align: center; margin: 0;">If you didn't request an email, please ignore this email.</p>
            </div>`
}

module.exports = {
    sendMail,
    getMessageTemplate
};
