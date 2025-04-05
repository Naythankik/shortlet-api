const apartmentResource = (review) => {
    return {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        relevant:  review.relevant.yes,
        createdAt: review.createdAt ?? null,
        updatedAt: review.updatedAt ?? null
    }
}

module.exports = (reviews) => {
    return Array.isArray(reviews) && reviews.length > 1
        ? reviews.map(review => apartmentResource(review))
        : reviews.length === 1 ? apartmentResource(reviews[0])
        : apartmentResource(reviews);
};
