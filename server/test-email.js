const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
    console.log("--- Email Configuration Test ---");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Missing");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Missing");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("ERROR: Missing email credentials in .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log("Verifying transporter connection...");
        await transporter.verify();
        console.log("✅ Transporter connection successful!");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from Research Portal",
            text: "This is a test email to verify the system works.",
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Email Test Failed:", error.message);
        if (error.code === 'EAUTH') {
            console.error("Suggestion: Check your email and password. For Gmail, use an 'App Password', not your login password.");
        }
    }
}

testEmail();
