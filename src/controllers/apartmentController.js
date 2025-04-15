const errorHandler = require('../helper/error-handlers');
const apartmentResource = require('../resources/apartmentResource');
const reviewResource = require('../resources/reviewResource');
const Apartment = require('../models/apartment');
const Review = require('../models/review');
const {createRequest, updateRequest, createReviewRequest, updateReviewRequest} = require("../requests/apartmentRequest");
const {uploadImage} = require("../helper/file");

const createApartment = async function (req, res) {
    const { error, value } = createRequest(req.body);

    if(error) return res.status(400).json({ message: error.details.map(err => err.message) });

    const images = req.files;

    if (!images || images.length < 3) {
        return res.status(422).json({ message: 'Image should be at least 3' });
    }

    try{
        const uploadedImages = await Promise.all(
            images.map(file => uploadImage(file.path, value.name))
        );
        const payload = {
            images: uploadedImages,
            ownerId: req.auth.id,
            ...value,
        }

        const apartment = await Apartment.create(payload);

        return res.status(200).json({
            data: apartmentResource(apartment)
        });
    }catch(err){
        console.error(err)
        return res.status(500).json({message: err.message});
    }
}

const updateApartment = async function (req, res) {
    const { error, value } = updateRequest(req.body);
    const { id: apartmentId } = req.params;

    if(error) return res.status(400).json({ message: error.details.map(err => err.message) });

    try{
        let payload = { ...value };
        if(req.files){
            const uploadedImages = await Promise.all(
                    req.files.map(file => uploadImage(file.path, value.name ?? 'shortlet image'))
                );
            //This appends the elements to the array instead of replacing it
            payload.$push = {
                images: { $each: uploadedImages }
            };
        }

        const apartment = await Apartment.findByIdAndUpdate(apartmentId, payload, { new: true });

        return res.status(200).json({
            message: 'Apartment updated successfully.',
            data: apartmentResource(apartment)
        });
    }catch(err){
        console.error(err)
        return res.status(500).json({message: err.message});
    }
}

const readApartments = async (req, res) => {
    const { page = 1, limit = 15, date, search } = req.query;
    const skip = (page - 1) * limit;
    let query= {};

    if(date){
        query.createdAt = { $gte: date };
    }

    if(search){
        query.name = new RegExp(search, 'i')
    }

    try{
        const apartments = await Apartment.find(query)
            .select('name description price address images')
            .skip(skip)
            .limit(limit);

        const totalPages = await Apartment.countDocuments(query);

        return res.status(200).json({
            apartments : apartmentResource(apartments),
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalPages / limit),
                totalItems: totalPages,
                itemsPerPage: Number(limit)
            }
        });
    }catch(err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const readApartment = async (req, res) => {
    try{
        const { apartmentId } = req.params;
        const apartment = await Apartment.findById(apartmentId)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'firstName lastName -_id profilePicture'
                }
            });

        if(!apartment){
            return res.status(404).json(errorHandler({message:"not found"}))
        }

        return res.status(200).json({
            apartment : apartmentResource(apartment),
        });
    }catch(err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const deleteApartment = async (req, res) => {
    try{
        const { id } = req.auth;
        const apartmentId = req.params.id;
        const apartment = await Apartment.findOneAndDelete({ownerId: id, _id: apartmentId});

        if(!apartment){
            return res.status(404).json(errorHandler({message:"not found"}))
        }

        return res.status(200).json({message: `Apartment ${apartment.name} has been deleted`});
    }catch(err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const popularApartments = async (req, res) => {
    return res.status(200).json({message: 'Coming soon'})
    try{
        const apartments = await Apartment.find()
            .sort({ 'ratings.value': -1 });

        return res.status(200).json({
            apartments : apartmentResource(apartments)
        });
    }catch(err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const addReview = async (req, res) => {
    const { error, value }  = createReviewRequest(req.body)

    if(error) return res.status(400).json(errorHandler({message: error.details[0].message}));

    const { id } = req.auth;
    const { id : apartmentId} = req.params;
    try{
        const apartment = await Apartment.findById(apartmentId);

        if(!apartment){
            return res.status(404).json(errorHandler({message:"not found"}))
        }

        if(apartment.ownerId === id){
            return res.status(405).json(errorHandler({message: 'You can add review to your apartment'}))
        }

        const { rating, comment } = value;

        const review = await Review.create({
            rating, comment,
            user: id,
            apartment: apartmentId
        })

        apartment.reviews.push(review._id)
        await apartment.save();

        return res.status(200).json({
            message: 'Thank you for your review. Visit us again and refer us to a friend and family'
        });

    }catch (err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const updateReview = async (req, res) => {
    const { error, value }  = updateReviewRequest(req.body)

    if(error) return res.status(400).json(errorHandler({message: error.details[0].message}));

    const { id : apartmentId, reviewId } = req.params;

    try{
        const review = await Review.findOne({
            _id: reviewId,
            apartment: apartmentId
        });

        if(!review){
            return res.status(404).json(errorHandler({message:"not found"}))
        }

        await review.updateOne({ ...value, relevant: { yes: 0, no: 0 }});

        return res.status(200).json({
            message: 'Thank you for your review. Visit us again and refer us to a friend and family'
        });

    }catch (err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const deleteReview = async (req, res) => {
    const { id } = req.auth;
    const { id: apartmentId, reviewId} = req.params;
    try{
        const review = await Review.findOne({
            _id: reviewId,
            apartment: apartmentId,
            user: id
        });

        if(!review){
            return res.status(400).json(errorHandler({message:"not found"}))
        }
        await review.deleteOne({});

        return res.status(200).json({
            message: 'Your review has been deleted'
        })
    }catch (err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

const getReviews = async (req, res) => {
    const { id : apartmentId} = req.params;
    try{
        const reviews = await Review.find({apartment: apartmentId})

        return res.status(200).json({reviews: reviewResource(reviews)});
    }catch (err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

module.exports = {
    create: createApartment,
    read: readApartments,
    readAnApartment: readApartment,
    update: updateApartment,
    deleteAnApartment: deleteApartment,
    popularApartments,
    addReview,
    getReviews,
    deleteReview
}
