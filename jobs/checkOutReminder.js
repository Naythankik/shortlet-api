const Booking = require("../src/models/bookings");
const Notification = require("../src/models/notification");

const sendCheckOutReminderNotifications = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const notifications = [];
    try {
        const bookings = await Booking.find({
            bookingStatus: { $nin: ['checked_out'] },
            checkOutDate: { $gte: today, $lt: tomorrow },
        }).populate('apartment');

        for (const booking of bookings) {
            const alreadySent = await Notification.findOne({
                userId: booking.user,
                type: 'checkout_reminder',
                'metadata.bookingId': booking._id,
            });

            if (!alreadySent) {
                notifications.push({
                    userId: booking.user,
                    message: `Don't forget to check out of ${booking.apartment.title} today. We hope you enjoyed your stay!`,
                    type: 'checkout_reminder',
                    image: booking.apartment.images?.[0] ?? "https://yourcdn.com/checkout-banner.png",
                    metadata: { bookingId: booking._id }
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`[${new Date().toISOString()}] ${notifications.length} check-out reminder(s) sent.`);
        } else {
            console.log(`[${new Date().toISOString()}] No new check-out reminders to send.`);
        }
    } catch (e) {
        console.error("Error sending check-out reminders:", e);
    }
};

module.exports = sendCheckOutReminderNotifications
