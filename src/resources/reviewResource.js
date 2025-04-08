const apartmentResource = (review) => {
    return {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        relevant:  review.relevant?.yes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    }
}

module.exports = (reviews) => {
    if(reviews){
        return reviews.length > 0
            ? reviews.map(review => apartmentResource(review))
            : apartmentResource(reviews);
    }else{
        return reviews;
    }
};
