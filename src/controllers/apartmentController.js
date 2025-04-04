const errorHandler = require('../helper/error-handlers');
const apartmentResource = require('../resources/apartmentResource');
const Apartment = require('../models/apartment');
const {createRequest} = require("../requests/apartmentRequest");
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
        return res.status(200).json(apartment);
    }catch(err){
        console.error(err)
        return res.status(500).json({message: err.message});
    }
}

const readApartments = async (req, res) => {
    const { id } = req.auth;
    const { page = 1, limit = 15, date, search } = req.query;
    const skip = (page - 1) * limit;
    let query = {ownerId: id};

    if(date){
        query.createdAt = { $gte: date };
    }

    if(search){
        query.name = new RegExp(search, 'i')
    }

    try{
        const apartments = await Apartment.find(query)
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
        const { id } = req.auth;
        const apartmentId = req.params.id;
        const apartment = await Apartment.findOne({ownerId: id, _id: apartmentId});

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
    const { id } = req.auth;
    try{
        const apartments = await Apartment.find({ownerId: id})
            .sort({ 'ratings.value': -1 });

        return res.status(200).json({
            apartments : apartmentResource(apartments)
        });
    }catch(err){
        console.error(err)
        return res.status(500).json(errorHandler({message: err.message}))
    }
}

module.exports = {
    create: createApartment,
    read: readApartments,
    readAnApartment: readApartment,
    deleteAnApartment: deleteApartment,
    popularApartments,
}
