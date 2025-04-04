const Joi = require('joi');

const updateRequest = (data) => {
    return Joi.object({
        'firstName': Joi.string(),
        'lastName': Joi.string(),
        'email': Joi.string().email(),
        'telephone': Joi.string(),
        'dateOfBirth': Joi.date().less('now'),
    }).validate(data, { abortEarly: false})
}


module.exports = {
    updateRequest
}
