const nodemailer = require("nodemailer");


// Create a single transporter instance with connection pooling to reuse SMTP connections
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  pool: true, // Use pooling!
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  
  if (
    !process.env.EMAIL_USER || 
    process.env.EMAIL_USER.includes("your-sending-gmail") ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS.includes("your-google-app-password")
  ) {
    console.warn("⚠️ [SMTP Warning]: Email credentials are not configured in backend/.env.");
    console.warn("Please generate a Google App Password and update backend/.env to send real emails.");
    return;
  }

  
  const mailOptions = {
    from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${options.email}`);
    return info;
  } catch (error) {
    console.error(`❌ [Email Error] Failed to send email to ${options.email}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
