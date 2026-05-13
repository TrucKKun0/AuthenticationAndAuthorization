const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.log("Some variable is missing to send email");
        return;
    }
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.EMAIL_FROM;
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
            user,
            pass,
        },
    });
    await transporter.sendMail({
        from,
        to,
        subject,
        html,
    });
    console.log("Email has been sent to: "+host);
    
}

module.exports = {sendEmail}