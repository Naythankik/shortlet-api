const { faker } = require('@faker-js/faker')
const Chat = require('../models/chat')

const randomChat = async () => {
    const result = await Chat.aggregate([
        { $sample: { size: 1 } }]);

    return result[0];
};


const message = async () => {
    const { _id: id, participants } = await randomChat();
    const user = faker.helpers.arrayElement(participants)

    return {
        chat: id,
        sender: user,
        readBy: [user],
        text: faker.lorem.paragraph(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
    }
}

module.exports = async (count) => {
    const messages = [];

    for (let i = 0; i < count; i++) {
        messages.push(await message());
    }

    return messages
}
