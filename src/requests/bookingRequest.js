const Joi = require('joi');

const createRequest = (data) => {
    return Joi.object({
        checkInDate: Joi.date().required(),
        checkOutDate: Joi.date()
            .required()
            .greater(Joi.ref('checkInDate'))
            .messages({
                'date.greater': 'Check-out date must be after check-in date'
            }),
        guests: Joi.number().integer().min(1).required(),
        specialRequests: Joi.string().optional()
    }).validate(data, { abortEarly: false });
};

const updateRequest = (data) => {
    return Joi.object({
        checkInDate: Joi.date().optional(),
        checkOutDate: Joi.date()
            .optional()
            .greater(Joi.ref('checkInDate'))
            .messages({
                'date.greater': 'Check-out date must be after check-in date'
            }),
        guests: Joi.number().integer().min(1).optional(),
        specialRequests: Joi.string().optional()
    }).validate(data, { abortEarly: false });
};

module.exports = {
    createRequest,
    updateRequest,
}
