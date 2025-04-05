const apartmentResource = (apartment) => {
    return {
        id: apartment._id,
        name: apartment.name,
        description: apartment.description,
        address: apartment.address,
        location: apartment.location ? {
            lat: apartment.location.coordinates[0],
            lng: apartment.location.coordinates[1]
        } : { lat: 0, lng: 0 },
        discount: apartment.discount,
        images: apartment.images,
        properties: apartment.properties,
        rules: apartment.rules,
        price: apartment.price,
        availability: apartment.availability,
        isAvailable: apartment.isAvailable,
        ratings: apartment.ratings && apartment.ratings.numberOfRaters > 0
            ? ((apartment.ratings.value / apartment.ratings.numberOfRaters) * 5).toFixed(1)
            : null,
        createdAt: apartment.createdAt ?? null,
        updatedAt: apartment.updatedAt ?? null
    }
}

module.exports = (apartments) => {
    return Array.isArray(apartments) && apartments.length > 1
        ? apartments.map(apartment => apartmentResource(apartment))
        : apartments.length === 1 ? apartmentResource(apartments[0])
        : apartmentResource(apartments);
};
