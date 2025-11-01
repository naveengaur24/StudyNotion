const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const main = async () => {
  console.log("Attempting to send a test email...");
  console.log("Using Mail User:", process.env.MAIL_USER);
  console.log("Using Mail Pass:", process.env.MAIL_PASS ? "Password is set" : "Password is NOT set");

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error("Error: MAIL_USER or MAIL_PASS is not defined in your .env file.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `StudyNotion <${process.env.MAIL_USER}>`,
      to: "testreceiver@example.com", // You don't need to own this email
      subject: "Test Email from StudyNotion Setup",
      html: "<b>This is a test email. If you received this, your Nodemailer configuration is correct.</b>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);

  } catch (error) {
    console.error("❌ Failed to send email.");
    console.error("THE REAL ERROR IS:", error);
  }
};

main();