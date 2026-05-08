const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "HotMeal - Verify your email",
    html: `<h2>Your OTP code is: <strong>${otp}</strong></h2>
           <p>This code expires in 10 minutes.</p>`,
  });
};

module.exports = { sendOTP };