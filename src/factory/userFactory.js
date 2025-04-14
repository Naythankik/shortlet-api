const { faker } = require('@faker-js/faker')
const bcrypt = require("bcryptjs");

const user = async () => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password', salt);

    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: password,
        telephone: faker.phone.number(),
        dateOfBirth: faker.date.past(),
        isVerified: faker.datatype.boolean(),
        profilePicture: faker.image.avatar(),
        role: faker.helpers.arrayElement(['admin','user']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.past()
    }
}

module.exports = async (count) => {
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push(await user());
    }
    return users
}
