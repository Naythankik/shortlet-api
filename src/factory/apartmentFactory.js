const { faker } = require('@faker-js/faker')

const apartment = async () => {
    return {
        name: faker.company.name(),
        description: faker.lorem.sentences(50),
        address: {
            street: faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            postcode: faker.location.zipCode()
        },
        location: {
            coordinates: [
                faker.location.longitude(),
                faker.location.latitude(),
            ]
        },
        price: faker.finance.amount({min:20, max:5000}),
        discount: {
            percentage: faker.number.float({min:3, max:35, fractionDigits: 2}),
            startDate: Date.now(),
            endDate: faker.date.soon()
        },
        images: faker.helpers.multiple(() => {
            return faker.image.urlLoremFlickr()
        }),
        properties: faker.helpers.multiple(() => {
            return faker.commerce.productMaterial()
        }),
        rules: faker.helpers.multiple(() => {
           return faker.lorem.text()
        }),
        availability: {
            startDate: Date.now(),
            endDate: faker.date.soon()
        },
        isAvailable: faker.helpers.arrayElement([true, false]),
        ratings: {
            value: faker.helpers.rangeToNumber({min: 20, max: 90}),
            numberOfRaters: faker.helpers.rangeToNumber({min: 1, max: 100}),
        },
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
