const userFactory = require('./src/factory/userFactory');
const chatFactory = require('./src/factory/chatFactory');
const messageFactory = require('./src/factory/messageFactory');
const apartmentFactory = require('./src/factory/apartmentFactory');
const bookingFactory = require('./src/factory/bookingFactory');
const reviewFactory = require('./src/factory/reviewsFactory');
const User = require('./src/models/user');
const Booking = require('./src/models/bookings');
const Apartment = require('./src/models/apartment');
const Review = require('./src/models/review');
const Chat = require('./src/models/chat');
const Message = require('./src/models/message');
require('dotenv').config();

const connection = require("./config/database");
connection();

// Seeder functions
const seederUsers = async () => {
    const users = await userFactory(30);
    try {
        await User.insertMany(users);
        console.log('Users seeded successfully');
    } catch (err) {
        console.error('Error seeding users:', err);
        throw err;
    }
};

const chatSeeder = async () => {
    const chats = await chatFactory(30)
    try{
        await Chat.insertMany(chats)
    }catch (err) {
        console.error('Error seeding users:', err);
        throw err;
    }
}

const messageSeeder = async () => {
    const messages = await messageFactory(1120)

    try{
        for (const message of messages) {
            const chat = await Message.create(message);
            await Chat.findByIdAndUpdate(chat.chat, {
                lastMessage: {
                    text: chat.text,
                    at: chat.createdAt,
                    sender: chat.sender,
                }
            })
        }
    }catch (err) {
        console.error('Error seeding users:', err);
        throw err;
    }
}

const seederBookings = async () => {
    const bookings = await bookingFactory(100);
    try {
        await Booking.insertMany(bookings);
        console.log('Bookings seeded successfully');
    } catch (err) {
        console.error('Error seeding bookings:', err);
        throw err;
    }
};

const seederApartments = async () => {
    const apartments = await apartmentFactory(50);
    try {
        await Apartment.insertMany(apartments);
        console.log('Apartment seeded successfully');
    } catch (err) {
        console.error('Error seeding apartments:', err);
        throw err;
    }
};

const updateApartmentReviewSeeders = async () => {
    try {
        const reviews = await Review.find();

        for (const review of reviews) {
            await Apartment.findOneAndUpdate({ _id: review.apartment}, {
                $addToSet: {
                    reviews: review._id,
                }
            }, { new: true});

        }
    } catch (err) {
        console.error('Error updating users with apartments:', err);
        throw err;
    }
}

const seederReviews = async () => {
    const reviews = await reviewFactory(150);
    try {
        await Review.insertMany(reviews);
        console.log('Review seeded successfully');
    } catch (err) {
        console.error('Error seeding reviews:', err);
        throw err;
    }
};


// Run seeders sequentially
const runSeeders = async () => {
    console.log("Seeder is processing............")
    try {
        // await seederUsers();
        // await seederApartments()
        // await seederBookings()
        // await seederReviews()
        // await updateApartmentReviewSeeders()
        // await chatSeeder()
        // await messageSeeder()
        console.log('All seeders completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

runSeeders();
