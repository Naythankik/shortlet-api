const bookingService = require("../services/BookingService");

module.exports = {
    create: bookingService.createBooking.bind(bookingService),
    update: bookingService.updateBooking.bind(bookingService),
    read: bookingService.readABooking.bind(bookingService),
    cancel: bookingService.cancelABooking.bind(bookingService),
    readAll: bookingService.readAllBooking.bind(bookingService),
}
