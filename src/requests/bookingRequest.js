const Joi = require('joi');

const createRequest = (data) => {
    return Joi.object({
        checkInDate: Joi.date()
            .greater('now')
            .required()
            .messages({
                'date.greater': 'Check-in date must be in the future',
                'date.base': 'Check-in date must be a valid date',
                'any.required': 'Check-in date is required'
            }),
        checkOutDate: Joi.date()
            .greater('now')
            .greater(Joi.ref('checkInDate'))
            .required()
            .messages({
                'date.greater': 'Check-out date must be after check-in date',
                'date.base': 'Check-out date must be a valid date',
                'any.required': 'Check-out date is required'
            }),
        guests: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
                'number.base': 'Guests must be a number',
                'number.min': 'At least one guest is required',
                'any.required': 'Number of guests is required'
            }),

        specialRequests: Joi.string().allow('')
    }).validate(data, { abortEarly: false });
};

const updateRequest = (data) => {
    const schema = Joi.object({
        checkInDate: Joi.date()
            .greater('now')
            .optional()
            .messages({
                'date.greater': 'Check-in date must be in the future',
                'date.base': 'Check-in date must be a valid date'
            }),

        checkOutDate: Joi.date()
            .greater('now')
            .optional()
            .messages({
                'date.greater': 'Check-out date must be in the future',
                'date.base': 'Check-out date must be a valid date'
            }),

        guests: Joi.number()
            .integer()
            .min(1)
            .optional()
            .messages({
                'number.base': 'Guests must be a number',
                'number.min': 'At least one guest is required'
            }),

        specialRequests: Joi.string().allow('')
    }).custom((value, helpers) => {
        const { checkInDate, checkOutDate } = value;

        if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
            return helpers.error('any.invalid', {
                message: 'Check-out date must be after check-in date'
            });
        }

        return value;
    }, 'Cross-field validation');

    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
        result.error.details.forEach(err => {
            if (err.type === 'any.invalid' && err.context?.message) {
                err.message = err.context.message;
            }
        });
    }

    return result;
};

module.exports = {
    createRequest,
    updateRequest
};
