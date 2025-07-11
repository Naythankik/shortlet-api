const userFactory = require('./src/factory/userFactory');
const apartmentFactory = require('./src/factory/apartmentFactory');
const bookingFactory = require('./src/factory/bookingFactory');
const reviewFactory = require('./src/factory/reviewsFactory');
const User = require('./src/models/user');
const Booking = require('./src/models/bookings');
const Apartment = require('./src/models/apartment');
const Review = require('./src/models/review');
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
        console.log('All seeders completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeder error:', err);
        process.exit(1);
    }
};

runSeeders();
