require('dotenv').config();
const cron = require('node-cron');
const connection = require('../config/database')
const Notification = require('../src/models/notification');
const User = require('../src/models/user');

connection()

const sendDailyNotificationsToUsers = async () => {
    try {
        const users = await User.find({role: 'user', isVerified: true});

        const notifications = users.map(user => ({
            userId: user._id,
            message: "Get 20% off on bookings made today!",
            type: 'promotion',
            image: "https://yourcdn.com/promo-banner.png",
            metadata: { promoCode: "DAILY20" }
        }));

        await Notification.insertMany(notifications);
        console.log(`[${new Date().toISOString()}] Promotion notifications sent.`);
    } catch (error) {
        console.error("Error sending daily promotions:", error);
    }
};

// Schedule the job to run every day at 00:00 AM
cron.schedule('*/10 * * * * *', () => {
    console.log("Running scheduled job: sendDailyPromotions");
    sendDailyNotificationsToUsers();
});
