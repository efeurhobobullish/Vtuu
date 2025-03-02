module.exports = {
    APP_NAME: "EmpirePay",
    PORT: 3000,

    // Admin Panel Credentials
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "supersecretpassword",

    // Paystack Config
    PAYSTACK_SECRET_KEY: "sk_test_1234567890abcdef",
    PAYSTACK_PUBLIC_KEY: "pk_test_1234567890abcdef",
    PAYSTACK_CALLBACK_URL: "https://empirepay.com/paystack/callback",

    // MongoDB Config (Full Connection URL)
    MONGO_URI: "mongodb+srv://empirepayvtu:empirevtu1@empirepayvtu.mygpq.mongodb.net/?retryWrites=true&w=majority&appName=empirepayvtu", // Use full URL instead

    // JWT & Security Config
    JWT_SECRET: "a7cb7034fe3d4d0a93b98e9c78b50b3b30d62f0a1f3bfc875fbf22f5c8fe08db",
    JWT_EXPIRES_IN: "7d",
    SESSION_SECRET: "fbd64b1c50c3f4a432d1b7d1844a3545489f3f68b5a5948979ecdc04b0494317",

    // VTU Service API Keys
    VTU_API_KEY: "your_vtu_api_key",
    VTU_API_URL: "https://vtu-service.com/api",

    // Email Service Config (SMTP)
    EMAIL_HOST: "smtp.gmail.com",
    EMAIL_PORT: 587,
    EMAIL_USER: "empiretechapi@gmail.com",
    EMAIL_PASSWORD: "fxlq bhap skup nssi",

    // Logging & Debugging
    LOG_LEVEL: "info",
    ENABLE_DEBUG: true,
};
