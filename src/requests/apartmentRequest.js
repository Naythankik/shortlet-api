const Joi = require('joi');

const createRequest = (data) => {
    return Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            postcode: Joi.string().required()
        }).required(),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2).required()
        }).required(),
        discount: Joi.object({
            percentage: Joi.number().optional(),
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional()
        }).optional(),
        properties: Joi.array().items(Joi.string()).required(),
        rules: Joi.array().items(Joi.string()).required(),
        price: Joi.number().required(),
    }).validate(data, { abortEarly: false})
}

const updateRequest = (data) => {
    return Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            postcode: Joi.string().required()
        }).optional(),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2).optional()
        }).optional(),
        discount: Joi.object({
            percentage: Joi.number().optional(),
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional()
        }).optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
        properties: Joi.array().items(Joi.string()).optional(),
        rules: Joi.array().items(Joi.string()).optional(),
        availability: Joi.object({
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional()
        }).optional(),
        price: Joi.number().optional(),
    }).validate(data, { abortEarly: false})
}

const createReviewRequest = (data) => {
    return Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required()
    }).validate(data)
}

const updateReviewRequest = (data) => {
    return Joi.object({
        comment: Joi.string().optional(),
        rating: Joi.number().min(1).max(5).optional()
    }).validate(data)
}

module.exports = {
    createRequest,
    updateRequest,
    createReviewRequest,
    updateReviewRequest
}
