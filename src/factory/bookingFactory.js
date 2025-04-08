const { faker } = require('@faker-js/faker')
const User = require('../models/user');
const Apartment = require('../models/apartment');


const randomObjectId = async (model) => {
    const result = await model.aggregate([
            { $match: { role: { $ne : 'admin' } } },
            { $sample: { size: 1 } }]);
    return result[0]?._id;
};

const apartment = async () => {
    return {
        user: await randomObjectId(User),
        apartment: await randomObjectId(Apartment),
        totalPrice: faker.finance.amount({min:20, max:5000}),
        checkInDate: faker.date.past(),
        guests: faker.number.int(),
        checkOutDate: faker.date.future(),
        paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'failed']),
        bookingStatus: faker.helpers.arrayElement(['booked', 'cancelled', 'completed']),
        specialRequests: faker.lorem.text(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
    }
}

module.exports = async (count) => {
    const apartments = [];

    for (let i = 0; i < count; i++) {
        apartments.push(await apartment());
    }
    return apartments
}
