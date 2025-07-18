const Booking = require("../src/models/bookings");
const Notification = require("../src/models/notification");

const sendReviewPromptNotifications = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    const notifications = [];
    try {
        const bookings = await Booking.find({
            bookingStatus: 'checked_out',
            checkOutDate: { $gte: yesterday, $lt: today }
        }).populate('apartment');

        for (const booking of bookings) {
            const alreadySent = await Notification.findOne({
                userId: booking.user,
                type: 'review_prompt',
                'metadata.bookingId': booking._id,
            });

            if (!alreadySent) {
                notifications.push({
                    userId: booking.user,
                    message: `How was your stay at ${booking.apartment.title}? Leave a review to help others!`,
                    type: 'review_prompt',
                    image: booking.apartment.images?.[0] ?? "https://yourcdn.com/review-prompt.png",
                    metadata: { bookingId: booking._id }
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`[${new Date().toISOString()}] ${notifications.length} review prompt(s) sent.`);
        } else {
            console.log(`[${new Date().toISOString()}] No review prompts to send.`);
        }
    } catch (err) {
        console.error("Error sending review prompt notifications:", err);
    }
};

module.exports = sendReviewPromptNotifications
