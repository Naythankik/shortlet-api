const {default: mongoose} = require("mongoose");

const Token = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    }
}, { timestamps: true });

module.exports = mongoose.model("Token", Token);
