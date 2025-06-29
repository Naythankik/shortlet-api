const { faker } = require('@faker-js/faker')
const User = require('../models/user');
const Apartment = require('../models/apartment');

async function randomId(model, match = {}) {
    const result = await model.aggregate([
        { $match: match},
        { $sample: { size: 1 } },
        { $project: { _id: 1 } }
    ]);
    return result[0]?._id;
}



const review = async () => {
    return {
        user:  await randomId(User, { role: 'user' }),
        apartment: await randomId(Apartment),
        comment: faker.lorem.paragraph(),
        rating: faker.number.int({ min: 1, max: 5 }),
        relevant: {
            yes: faker.number.int({ min: 1, max: 100 }),
            no:  faker.number.int({ min: 1, max: 100 }),
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
