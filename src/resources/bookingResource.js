const Apartment = require('./apartmentResource')

const bookingResource = (booking) => {
    return {
        id: booking._id,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice,
        guests: booking.guests,
        paymentStatus: booking.paymentStatus,
        specialRequests: booking.specialRequests,
        bookingStatus: booking.bookingStatus,
        apartment: Apartment(booking.apartment),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    }
}

module.exports = (bookings) => {
    return bookings.length > 0 ? bookings.map(booking => bookingResource(booking)) : bookingResource(bookings)
};
