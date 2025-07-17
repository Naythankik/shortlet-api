const Notification = require("../../models/notification");

const readNotifications = async (req, res) => {
    const { id } = req.user;
    try{
        const response = await Notification.find({userId: id});

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications: response
        });
    }catch (e){
        return res.status(500).json({message: e.message});
    }
}

const readNotification = async (req, res) => {
    const { notificationId } = req.params;

    try{
        const response = await Notification.findByIdAndUpdate(notificationId, {
            isRead: true
        }, { new: true });

        if(!response){
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({
            message: "Notification fetched successfully",
            notification: response
        })
    }catch (e){
        return res.status(500).json({message: e.message});
    }
}

const markAllAsRead = async (req, res) => {
    const { id } = req.user;
    try{
        const response = await Notification.updateMany({userId: id}, {
            $set: { readStatus: true }
        });

        return res.status(200).json({
            message: "Notifications marked as read successfully",
            matchedCount: response.matchedCount
        })
    }catch (e){
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    readNotifications,
    readNotification,
    markAllAsRead
};
