const { faker } = require('@faker-js/faker')
const User = require('../models/user');
const Apartment = require('../models/apartment');


const randomObjectId = async (model) => {
    const result = await model.aggregate([
            { $match: { role: { $ne : 'admin' } } },
            { $sample: { size: 1 } }]);
    return result[0]?._id;
};

const review = async () => {
    return {
        user: await randomObjectId(User),
        apartment: await randomObjectId(Apartment),
        comment: faker.lorem.paragraph(),
        rating: faker.number.int({min: 1, max: 5}),
        relevant: {
            yes: faker.number.int({min: 1, max: 100}),
            no: faker.number.int({min: 1, max: 100})
        },
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
    }
}

module.exports = async (count) => {
    const reviews = [];

    for (let i = 0; i < count; i++) {
        reviews.push(await review());
    }
    return reviews
}
