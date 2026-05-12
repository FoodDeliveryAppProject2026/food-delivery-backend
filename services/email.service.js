const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"HotMeal" <${process.env.EMAIL_USER}>`, // ✅ shows a name instead of raw email
      to: email,
      subject: "HotMeal - Verify your email",
      html: `<h2>Your OTP code is: <strong>${otp}</strong></h2>
             <p>This code expires in 10 minutes.</p>`,
    });
    console.log(`✅ OTP sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send OTP:", err.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};
module.exports = { sendOTP };
