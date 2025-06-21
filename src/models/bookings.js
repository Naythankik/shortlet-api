const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    apartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    checkInDate: {
        type: Date,
        required: true,
    },
    checkOutDate: {
        type: Date,
        required: true,
    },
    guests: {
        type: Number,
        default: 1,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'expired'],
        default: 'pending',
    },
    specialRequests: {
        type: String,
    },
    bookingStatus: {
        type: String,
        enum: [
            'booked',       // Booking has been created but not yet confirmed
            'confirmed',    // Booking has been reviewed and accepted by host/admin
            'cancelled',    // Booking was canceled by guest or host
            'checked_in',   // Guest has arrived and checked into the apartment
            'checked_out',  // Guest has checked out of the apartment
            'no_show',      // Guest did not show up for the booking
            'completed'     // Booking has been successfully completed (stay ended)
        ],
        default: 'booked',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
