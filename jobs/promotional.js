const Notification = require("../src/models/notification");
const User = require("../src/models/user");

const sendPromotionalNotifications = async () => {
    const users = await User.find();

    const notifications = users.map(user => ({
        userId: user._id,
        message: `🎉 Enjoy up to 25% off selected apartments this weekend!`,
        type: 'promotion',
        image: "https://yourcdn.com/promo-banner.png",
        metadata: {}
    }));

    await Notification.insertMany(notifications);
    console.log(`[${new Date().toISOString()}] ${notifications.length} promotional notification(s) sent.`);
};

module.exports = sendPromotionalNotifications
