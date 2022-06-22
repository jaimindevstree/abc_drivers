const { Joi } = require("express-validation");
const { commonResponse } = require("../../helper")

exports.hourlyPay = (req, res, next) => {

  const schema = Joi.object().keys({
    date: Joi.date().required(),
    gross_pay: Joi.number().required(),
    hours: Joi.number().optional().allow(''),
    minutes: Joi.number().optional().allow(''),
    mileage: Joi.number().required(),
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};


