const ReviewResource = require('./reviewResource');

const apartmentResource = (apartment) => {
    return {
        id: apartment._id,
        name: apartment.name,
        description: apartment.description,
        address: apartment.address,
        location: apartment.location?.coordinates ? {
            lat: apartment.location.coordinates[0],
            lng: apartment.location.coordinates[1],
        } : undefined,
        discount: apartment.discount,
        images: apartment.images,
        properties: apartment.properties,
        rules: apartment.rules,
        price: apartment.price,
        availability: apartment.availability,
        isAvailable: apartment.isAvailable,
        reviews: ReviewResource(apartment.reviews),
        createdAt: apartment.createdAt,
        updatedAt: apartment.updatedAt
    }
}

module.exports = (apartments) => {
    return apartments.length > 0
        ? apartments.map(apartment => apartmentResource(apartment))
        : apartmentResource(apartments);
};
