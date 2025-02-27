const fs = require('fs');
const nodemailer = require('nodemailer');
const winston = require('winston');

// Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
    ]
});

// Function to log messages
const log = (level, message) => {
    logger.log({ level, message });
};

// Function to send an email notification (e.g., for transactions or alerts)
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this based on your email provider
            auth: {
                user: process.env.EMAIL_USER, // Replace with your email
                pass: process.env.EMAIL_PASS  // Replace with your email password or app password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        log('info', `Email sent to ${to}`);
    } catch (error) {
        log('error', `Email send failed: ${error.message}`);
    }
};

// Function to validate phone numbers
const isValidPhoneNumber = (phone) => {
    const regex = /^[0-9]{10,15}$/; // Adjust for country-specific formats if needed
    return regex.test(phone);
};

// Function to format currency
const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency
    }).format(amount);
};

// Function to handle errors gracefully
const handleError = (res, errorMessage, statusCode = 400) => {
    log('error', errorMessage);
    return res.status(statusCode).json({ success: false, message: errorMessage });
};

// Function to read and parse JSON files (e.g., transaction records)
const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        log('error', `Error reading JSON file: ${error.message}`);
        return null;
    }
};

// Function to write JSON data to a file (e.g., store transactions)
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log('info', `Data written to ${filePath}`);
    } catch (error) {
        log('error', `Error writing JSON file: ${error.message}`);
    }
};

module.exports = {
    log,
    sendEmail,
    isValidPhoneNumber,
    formatCurrency,
    handleError,
    readJSON,
    writeJSON
};
