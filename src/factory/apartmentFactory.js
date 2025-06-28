const { faker } = require('@faker-js/faker');
const User = require('../models/user');

const allTags = [
    "wifi", "air-conditioning", "swimming-pool", "generator", "security",
    "kitchen", "washing-machine", "smart-tv", "balcony", "gym",
    "lekki", "victoria-island", "ikeja", "abuja", "lagos-island", "port-harcourt",
    "luxury", "budget", "family-friendly", "studio-apartment", "2-bedroom",
    "duplex", "penthouse", "bachelor-pad",
    "sea-view", "city-view", "quiet-neighborhood", "party-friendly",
    "long-stay", "short-stay", "remote-work-ready", "romantic"
];
const allFeatures = [
    "air conditioning",
    "wifi",
    "parking space",
    "king-sized bed",
    "private bathroom",
    "fully equipped kitchen",
    "smart TV",
    "Netflix",
    "CCTV",
    "power backup",
    "workstation",
    "refrigerator",
    "microwave",
    "washing machine",
    "wardrobe"
];
const bedroomItems = ["bed", "wardrobe", "mirror", "bedside lamp", "rug"];
const livingRoomItems = ["sofa", "smart-tv", "coffee table", "bookshelf", "curtains"];
const kitchenItems = ["fridge", "microwave", "gas cooker", "dishwasher", "kitchen-cabinet"];
const bathroomItems = ["toilet", "bathroom", "water heater", "bathtub"];
const others = ["AC", "fan", "workstation", "balcony-chair", "washing machine"];

const availableProperties = [
    ...bedroomItems,
    ...livingRoomItems,
    ...kitchenItems,
    ...bathroomItems,
    ...others
];

const staticImages = [
    "https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/26556328/pexels-photo-26556328.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/12289395/pexels-photo-12289395.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/9494898/pexels-photo-9494898.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/14614669/pexels-photo-14614669.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/30380629/pexels-photo-30380629.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/16103928/pexels-photo-16103928.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6538943/pexels-photo-6538943.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/4800183/pexels-photo-4800183.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/30018004/pexels-photo-30018004.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7587828/pexels-photo-7587828.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6927199/pexels-photo-6927199.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6580381/pexels-photo-6580381.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/12931939/pexels-photo-12931939.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/19899072/pexels-photo-19899072.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/30759435/pexels-photo-30759435.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/9937728/pexels-photo-9937728.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/10827358/pexels-photo-10827358.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/14495883/pexels-photo-14495883.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const randomObjectId = async (model) => {
    const result = await model.aggregate([
        { $match: { role: 'host' } },
        { $sample: { size: 1 } }]);
    return result[0]?._id;
};

const apartment = async () => {
    return {
        name: faker.company.name(),
        description: faker.lorem.paragraphs(5),
        address: {
            street: faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            postcode: faker.location.zipCode()
        },
        host: await randomObjectId(User),
        location: {
            type: "Point",
            coordinates: [
                parseFloat(faker.location.longitude()),
                parseFloat(faker.location.latitude()),
            ]
        },
        features: faker.helpers.arrayElements(allFeatures, { min: 3, max: 8 }),
        price: parseFloat(faker.finance.amount({ min: 70000, max: 200000 })),
        tags: faker.helpers.arrayElements(allTags, { min: 4, max: 8 }),
        cautionFee: faker.finance.amount({ min: 1000, max: 5000 }),
        maxGuests: faker.number.int({ min: 2, max: 10 }),
        discount: {
            percentage: faker.number.float({ min: 3, max: 35, fractionDigits: 2 }),
            startDate: faker.date.recent(),
            endDate: faker.date.soon({ days: 10 }),
        },
        images: faker.helpers.arrayElements(staticImages, { min: 6, max: 12 }),
        properties: faker.helpers.arrayElements(availableProperties, { min: 3, max: 6 }).map(name => ({
            name,
            quantity: faker.number.int({ min: 1, max: 3 })
        })),
        rules: faker.helpers.arrayElements(
            Array.from({ length: 10 }, () => faker.lorem.sentence()),
            { min: 2, max: 4 }
        ),
        availability: {
            startDate: faker.date.recent(),
            endDate: faker.date.soon({ days: 30 }),
        },
        isAvailable: faker.datatype.boolean(),
        ratings: {
            value: faker.number.int({ min: 2, max: 5 }),
            numberOfRaters: faker.number.int({ min: 1, max: 100 }),
        },
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent(),
    };
};

module.exports = async (count) => {
    const apartments = [];
    for (let i = 0; i < count; i++) {
        apartments.push(await apartment());
    }
    return apartments;
};
