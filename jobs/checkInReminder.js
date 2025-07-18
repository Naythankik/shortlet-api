const Booking = require("../src/models/bookings");
const Notification = require("../src/models/notification");

const sendCheckInReminderNotifications = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const notifications = [];
    try {
        const bookings = await Booking.find({
            bookingStatus: { $nin: ['checked_in', 'checked_out'] },
            checkInDate: { $gte: today, $lt: tomorrow },
        }).populate('apartment');

        for (const booking of bookings) {
            const alreadySent = await Notification.findOne({
                userId: booking.user,
                type: 'checkin_reminder',
                'metadata.bookingId': booking._id,
            });

            if (!alreadySent) {
                notifications.push({
                    userId: booking.user,
                    message: `You're checking in today at ${booking.apartment.title}. See you soon!`,
                    type: 'checkin_reminder',
                    image: booking.apartment.images?.[0] ?? "https://yourcdn.com/promo-banner.png",
                    metadata: { bookingId: booking._id }
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`[${new Date().toISOString()}] ${notifications.length} check-in reminder(s) sent.`);
        } else {
            console.log(`[${new Date().toISOString()}] No new check-in reminders to send.`);
        }
    } catch (e) {
        console.error("Error sending check-in reminders:", e);
    }
};

module.exports = sendCheckInReminderNotifications
