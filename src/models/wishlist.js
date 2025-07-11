const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apartments: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Apartment'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('wishlist', wishlistSchema);
