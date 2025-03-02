module.exports = {
    APP_NAME: "EmpirePay",
    PORT: 3000,

    // Admin Panel Credentials
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "supersecretpassword",

    // Paystack Config
    PAYSTACK_SECRET_KEY: "sk_test_1234567890abcdef", // Use the Paystack Secret Key you sent earlier
    PAYSTACK_PUBLIC_KEY: "pk_test_1234567890abcdef", // Use the Paystack Public Key you sent earlier
    PAYSTACK_CALLBACK_URL: "https://empirepay.com/paystack/callback",

    // MongoDB Config
    DB_HOST: "mongodb://localhost:27017",
    DB_NAME: "empirepay_db",

    // JWT & Security Config
    JWT_SECRET: "a7cb7034fe3d4d0a93b98e9c78b50b3b30d62f0a1f3bfc875fbf22f5c8fe08db", // Randomly generated secret key (Change for production)
    JWT_EXPIRES_IN: "7d",  // Token expiration time (7 days)
    SESSION_SECRET: "fbd64b1c50c3f4a432d1b7d1844a3545489f3f68b5a5948979ecdc04b0494317", // Randomly generated session secret (Change for production)

    // VTU Service API Keys
    VTU_API_KEY: "your_vtu_api_key",
    VTU_API_URL: "https://vtu-service.com/api",

    // Email Service Config (Optional)
    EMAIL_HOST: "smtp.gmail.com",
    EMAIL_PORT: 587,
    EMAIL_USER: "your_email@gmail.com",
    EMAIL_PASSWORD: "your_email_password",

    // Logging & Debugging
    LOG_LEVEL: "info",  // Options: debug, info, warn, error
    ENABLE_DEBUG: true,
};