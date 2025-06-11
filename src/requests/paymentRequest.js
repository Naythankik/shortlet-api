const Joi = require("joi");

const createPayment = (data) => {
    return Joi.object({
        amount: Joi.number().integer().required(),
        description: Joi.string().required(),
        currency: Joi.string().required(),
        method: Joi.string().valid('card', 'alipay', 'klarna', 'afterpay_clearpay', 'us_bank_account', 'sepa_debit').required()
    }).validate(data, { abortEarly: false });
};

module.exports = {
    createPayment,
};
