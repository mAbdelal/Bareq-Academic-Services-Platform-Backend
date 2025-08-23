

const nodemailer = require('nodemailer');
const {EMAIL_PASSWORD,EMAIL_USER}=require("../config/env")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASSWORD, 
    },
});

async function sendEmail({ to, subject, html }) {
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };