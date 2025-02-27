const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const walletMiddleware = require('./middleware/wallet');

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const vtuRoutes = require('./routes/vtu');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose
    .connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vtu', walletMiddleware, vtuRoutes);

// Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start Server
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
