const Joi = require('joi');

const createRequest = (data) => {
    return Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
    }).validate(data, { abortEarly: false });
};

const updateRequest = (data) => {
    return Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
    }).validate(data, { abortEarly: false });
};

module.exports = {
    createRequest,
    updateRequest,
}
