const Booking = require("../src/models/bookings");
const Notification = require("../src/models/notification");

const sendBookingNotificationToUsers = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const threeDaysTime = new Date(tomorrow);
    threeDaysTime.setDate(threeDaysTime.getDate() + 3);

    const notifications = [];

    const bookings = await Booking.find({
        bookingStatus: { $nin: ['checked_in', 'checked_out'] },
        checkInDate: { $gte: tomorrow, $lt: threeDaysTime },
    }).populate('apartment');

    for (const booking of bookings) {
        const alreadySent = await Notification.findOne({
            userId: booking.user,
            type: 'reminder',
            'metadata.bookingId': booking._id,
        });

        if (!alreadySent) {
            notifications.push({
                userId: booking.user,
                message: `Your booking with ${booking.apartment.title} is upcoming!`,
                type: 'reminder',
                image: booking.apartment.images[0] ?? "https://yourcdn.com/promo-banner.png",
                metadata: { bookingId: booking._id }
            });
        }
    }

    if (notifications.length) {
        await Notification.insertMany(notifications);
        console.log(`[${new Date().toISOString()}] ${notifications.length} booking reminder(s) sent.`);
    }
}

module.exports = sendBookingNotificationToUsers
