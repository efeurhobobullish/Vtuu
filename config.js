module.exports = {
    APP_NAME: "EmpirePay",
    PORT: 3000,

    // Admin Panel Credentials
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "superpassword",

    // Paystack Config
    PAYSTACK_SECRET_KEY: "sk_test_1234567890abcdef",
    PAYSTACK_PUBLIC_KEY: "pk_test_1234567890abcdef",
    PAYSTACK_CALLBACK_URL: "https://empirepay.com/paystack/callback",

    // MongoDB Config
    DB_HOST: "mongodb+srv://empirepayvtu:empirevtu1@empirepayvtu.mygpq.mongodb.net/?retryWrites=true&w=majority&appName=empirepayvtu",
    DB_NAME: "empirepay_db",

    // JWT & Security Config
    JWT_SECRET: "a7cb7034fe3d4d0a93b98e9c78b50b3b30d62f0a1f3bfc875fbf22f5c8fe08db",
    JWT_EXPIRES_IN: "7d",
    SESSION_SECRET: "fbd64b1c50c3f4a432d1b7d1844a3545489f3f68b5a5948979ecdc04b0494317",

    // VTU Service API Keys
    VTU_API_KEY: "your_vtu_api_key",
    VTU_API_URL: "https://vtu-service.com/api",

    // Email Service Config (Optional)
    EMAIL_HOST: "smtp.gmail.com",
    EMAIL_PORT: 587,
    EMAIL_USER: "your_email@gmail.com",
    EMAIL_PASSWORD: "your_email_password",

    // Firebase Config ✅ Now Stored in `config.js`
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyA7PgOugBpc4qi_qUiVjfI8KuClk2vBHzo",
        authDomain: "empirepay-vtu.firebaseapp.com",
        projectId: "empirepay-vtu",
        storageBucket: "empirepay-vtu.firebasestorage.app",
        messagingSenderId: "151995966724",
        appId: "1:151995966724:web:42342317c4bd3bcf719c51",
        measurementId: "G-XFYKL2RY5C"
    },

    // Logging & Debugging
    LOG_LEVEL: "info",
    ENABLE_DEBUG: true,
};
