const express = require('express');
const { readNotifications, readNotification, markAllAsRead } = require("../src/controllers/UserControllers/notificationController");

const router = express.Router();

router.get('/', readNotifications)
router.patch('/:notificationId/read', readNotification)
router.patch('/read-all', markAllAsRead)

module.exports = router;
