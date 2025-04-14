const apartmentResource = require('./apartmentResource')
const userResource = require('./userResource')

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
        apartment: apartmentResource(booking.apartment),
        // user: userResource(booking.user),
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
    }
}

module.exports = (bookings) => {
    if(bookings){
        return bookings.length > 0
            ? bookings.map(booking => bookingResource(booking))
            : bookingResource(bookings);
    }else{
        return bookings;
    }
};
