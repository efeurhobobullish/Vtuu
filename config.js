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

    // Firebase Admin SDK Config
    FIREBASE_ADMIN: {
        type: "service_account",
        project_id: "empirepay-vtu",
        private_key_id: "b4936897a1b0b3bd022b8c230f797754f9c997e6",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCa18ihP+Wl96wf\ni+jTyQ/M5ojhOIqerxW8C/vi67TYsXpwTVrDAjJzVtqiVMAtKnbeD5MRnxMMLKv1\nQ6RH/+6e5IG3Gs2ICYYBNcgbZKaolOkyqbn+o+m3hVXqQaczm4Hyyadjusv+EsT5\nou+F65a0R0QUxGxBB6CgIhWwIEEYI5/QwzNQ/tdlUBm5Y09mgPYeMtedEVXbJ9CW\nBozP7h8pSPvIUn1oNMecFHUOj7WNBtjQkgom03KT5HSceB4RGiF5ktiyjQpbNTSY\nQCD4+bCm8kVgRfaAd/Tb+kstFSHs793oQfMaHU6k2fHrUP92iN+AcC/wjBjxkSeG\nLqSooZ85AgMBAAECggEAAz/3Koc8Syz1FF5r3xIPvlWyVsPIiQcUtjMsMLmQvKGQ\n981v07r2kxwmD5UmyWvkPcnm5M5JaI6Bd27ZgldZS0VxgYXS/YFxqhHWZtjIdK5X\nbKRKTpFjJOJsCLQjDb68Tfu0gy/W+ziqoLCuRUnKCnOadrMesIi38tR0TxOGOjrw\nyziRNCnEAUR1krEeNweKE75THPTvqYMHgWgIdutE+WXjOYOPJjDLBy1FnigiI595\n10NUxBw9YgxQhPc0aYsQvhsgdoNXgFb5azrhBZPexBlGG3PmlcdIciJKncUKl4Uw\nPGV+9u3ai5t+4qBrldG9Oo0Ac66fx+HMnuw726J8OQKBgQDYf6aCOiL74py9fygW\nLzG57B4aefcFGX0A5ZhvydRx+7xRdPfkXM3OyuHrOiZ+oa42/fZ+NsNoMMMiNfYE\ntX3a7g1QJ9/yyRPiNHA4wtY5Ol+sRFXyepVlwUyH12b/gl6YoPQBhY4UYhS3s+ma\ncHLIF97+AGSab7oKIYksh/H7dQKBgQC3GEeyuLDVdKfZ043IT3T/GPlQTQ/2x64o\nekOEa02HdWpN8DH+ncqwPP6mmP5sSU/8Cyd/whdksSsUjvJBa1dcMgZnks72UM8C\n4ZHiW2GoYL86JhRNChjc0oPvD2SNU88y7jSoc47cL/cbfB2/PprIKbXzveOpl2ok\n+4TY1qRQNQKBgFcwKUV+1kHshEUIZYNxpCwE/CabgbCrEB2BWT+D36u7vp5rZb2w\n5i1mpU8PDxumTzvUUSWJNm7KXHt1kctZsAKwJepm9JiZBAnwJlWlmZJYgNkmeBp7\n5ZiiHQkD5XX28dOz1jCasZph2YgVy3kn2gHdIy/Vxq4vWpPj55NoeDpVAoGBAK2E\nkCZbDBMvHAe+iwbD7o/3fgdREQkCEhYAUM5E1tPCPb2hHfA8YCOHmpoOMkgzbl7h\nv0w/h+YAVWCFXCcNcFxKeHFd20/qI1WKqrPHgJSPI4sbHXApWoij5S8A+n1JaPrO\nbw8ZfNFFj7z3ckWVMiDyDqLxWbmWapyj1TGesVflAoGBANAK6iaDAW8I2Z5537p8\nd/msAsyvrjEhUkdN1vyTcmZ7/ivjQKNNwtZ4YaVVxq4kC0PfWO4NEOfSuifSaYTO\nGmNi/XhZkOp9wgCiAXat/OUolTlinNbC4fxsrv+MfBXHDcNf/8iElQDkbzMwDoMt\nOJICx7dxaZxRziYlfUgiJ+RO\n-----END PRIVATE KEY-----\n",
        client_email: "firebase-adminsdk-fbsvc@empirepay-vtu.iam.gserviceaccount.com",
        client_id: "109852513366380465744",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40empirepay-vtu.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
    },

    // Logging & Debugging
    LOG_LEVEL: "info",
    ENABLE_DEBUG: true,
};
