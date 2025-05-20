const {default: mongoose} = require("mongoose");

const Token = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['refresh', 'verification', 'password-reset'],
        required: true
    },
    otp: {
        type: Number,
        required: false,
    },
    token: {
        type: String,
        required: true,
    },
    expiresIn: {
        type: Date,
        required: true,
    },
    userAgent: {
        type: String,
        required: false
    },
    ip: {
        type: String,
        required: false
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for faster queries
Token.index({ user: 1, type: 1 });
Token.index({ token: 1 }, { unique: true });

// Add a method to check if a token has expired
Token.methods.isExpired = function() {
    return Date.now() >= this.expiresIn;
};

module.exports = mongoose.model("Token", Token);
