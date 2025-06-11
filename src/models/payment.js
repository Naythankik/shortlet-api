const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, unique: true },
        amountTotal: { type: Number, required: true },
        currency: { type: String, required: true },
        paymentStatus: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        paymentMethod: {
            type: String,
            enum: [
                'card', 'alipay', 'wechat_pay', 'bank_transfer', 'klarna', 'fpx',
                'grabpay', 'promptpay', 'sepa_debit', 'us_bank_account'
            ],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
