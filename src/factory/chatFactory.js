const { faker } = require('@faker-js/faker')
const User = require('../models/user')

const randomUserId = async () => {
    const result = await User.aggregate([
        { $match: { role : 'user' } },
        { $sample: { size: 1 } }]);
    return result[0]?._id;
};

const randomHostId = async () => {
    const result = await User.aggregate([
        { $match: { role: { $ne : 'user' } } },
        { $sample: { size: 1 } }]);
    return result[0]?._id;
};


const chat = async () => {
    return {
        participants: [
            await randomUserId(),
            await randomHostId()
        ],
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
    }
}

module.exports = async (count) => {
    const chats = [];

    for (let i = 0; i < count; i++) {
        chats.push(await chat());
    }
    return chats
}
