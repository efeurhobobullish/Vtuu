const config = require("../config");
const twilio = require("twilio")(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
const nodemailer = require("nodemailer");

// Generate 4-digit OTP
exports.generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Send OTP via SMS
exports.sendOTPviaSMS = async (phone, otp) => {
    await twilio.messages.create({
        body: `Your verification code is: ${otp}`,
        from: config.TWILIO_PHONE_NUMBER,
        to: phone
    });
};

// Send OTP via Email
exports.sendOTPviaEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS }
    });

    await transporter.sendMail({
        from: `"EmpirePay" <${config.SMTP_USER}>`,
        to: email,
        subject: "OTP Verification",
        text: `Your verification code is: ${otp}`
    });
};
