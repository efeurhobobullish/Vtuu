module.exports = {
    APP_NAME: "EmpirePay",
    PORT: 3000,

    // Admin Panel Credentials
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "your_secure_password",

    // Paystack Config
    PAYSTACK_SECRET_KEY: "your_paystack_secret_key",
    PAYSTACK_PUBLIC_KEY: "your_paystack_public_key",
    PAYSTACK_CALLBACK_URL: "https://yourdomain.com/paystack/callback",

    // Database Config
    DB_HOST: "localhost",
    DB_USER: "your_db_user",
    DB_PASSWORD: "your_db_password",
    DB_NAME: "empirepay_db",
    DB_DIALECT: "mysql", // Change to "postgres" or another dialect if needed

    // JWT & Security Config
    JWT_SECRET: "your_jwt_secret",
    JWT_EXPIRES_IN: "7d",
    SESSION_SECRET: "your_session_secret",

    // VTU Service API Keys
    VTU_API_KEY: "your_vtu_api_key",
    VTU_API_URL: "https://vtu-service.com/api",

    // Email Service Config (Optional)
    EMAIL_HOST: "smtp.your-email-provider.com",
    EMAIL_PORT: 587,
    EMAIL_USER: "your_email@example.com",
    EMAIL_PASSWORD: "your_email_password",

    // Logging & Debugging
    LOG_LEVEL: "info", // Options: debug, info, warn, error
    ENABLE_DEBUG: true,
};
