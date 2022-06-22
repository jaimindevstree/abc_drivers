const { Joi } = require("express-validation");
const { commonResponse } = require("../../helper");

exports.createExpenses = (req, res, next) => {
  const schema = Joi.object().keys({
    date: Joi.date().required(),
    expenses: Joi.array().required()
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty("error")) {
    commonResponse.sendJoiError(res, "VALIDATION_ERROR", data.error);
  } else {
    next();
  }
};
