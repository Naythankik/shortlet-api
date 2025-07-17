const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming you have a User model
        required: true
    },
    message: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    readStatus: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: [ 'booking', 'message', 'review', 'promotion', 'system', 'payment', 'other' ],
        default: 'other'
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, readStatus: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
