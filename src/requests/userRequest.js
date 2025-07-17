const Joi = require('joi');

const updateRequest = (data) => {
    return Joi.object({
        'firstName': Joi.string(),
        'lastName': Joi.string(),
        'email': Joi.string().email(),
        'telephone': Joi.string(),
    }).validate(data, { abortEarly: false})
}


module.exports = {
    updateRequest
}
