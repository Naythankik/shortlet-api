const Joi = require('joi');

const loginRequest = (data) => {
    return Joi.object({
        'email': Joi.string().email().required(),
        'password': Joi.string().required(),
    }).validate(data, { abortEarly: false})
}

const registerRequest = (data) => {
    return Joi.object({
        'firstName': Joi.string().required(),
        'lastName': Joi.string().required(),
        'email': Joi.string().email().required(),
        'telephone': Joi.string().required(),
        'password': Joi.string().min(8).required(),
        'dateOfBirth': Joi.date().less('now').required(),
        'role': Joi.string().valid('user', 'rider').required()
    }).validate(data, { abortEarly: false})
}

module.exports = {
    loginRequest,
    registerRequest,
}
