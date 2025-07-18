require('dotenv').config();
const cron = require('node-cron');
const sendBookingNotificationToUsers = require('../jobs/bookingReminder');
const sendCheckInReminderNotifications = require('../jobs/checkInReminder');
const sendCheckOutReminderNotifications = require('../jobs/checkOutReminder');
const sendReviewPromptNotifications = require('../jobs/reviewPrompt');
const sendPromotionalNotifications = require('../jobs/promotional');
const connection = require('../config/database');
const {disconnect} = require("mongoose");
connection()

console.log(`[${new Date().toISOString()}] Scheduler started...`);

cron.schedule('0 * * * *', async () => {
    try {
        await sendBookingNotificationToUsers();
        await sendCheckInReminderNotifications();
        await sendCheckOutReminderNotifications();
        await sendReviewPromptNotifications();
        console.log(`[${new Date().toISOString()}] Ran reminder jobs.`);
    } catch (err) {
        console.error("Reminder jobs error:", err);
    }
});

cron.schedule('0 0 7 * *', async () => {
    try {
        await sendPromotionalNotifications();
        console.log(`[${new Date().toISOString()}] Ran promotional job.`);
    } catch (err) {
        console.error("Promotional job error:", err);
    }
});

process.on('SIGINT', async () => {
    console.log("Shutting down gracefully...");
    try {
        await disconnect();
        console.log("MongoDB disconnected.");
    } catch (err) {
        console.error("Error disconnecting MongoDB:", err);
    }
    process.exit(0);
});

