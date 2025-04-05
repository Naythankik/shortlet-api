const {default: mongoose} = require("mongoose");

const Review = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
    comment: {
        type: String,
        required: true,
    },
    rating: {
        type: String,
        required: true,
        min: 1,
        max: 5
    },
    relevant: {
        yes: {
            type: Number,
            default: 0
        },
        no: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Review", Review);
