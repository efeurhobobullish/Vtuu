const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['airtime', 'data', 'bill', 'crypto'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
    provider: { type: String, required: true },
    reference: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
