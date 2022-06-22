const { Joi } = require("express-validation");
const { commonResponse } = require("../../helper")
const password = Joi.string().min(4).max(16).required();
const email = Joi.string().email().required();

exports.register = (req, res, next) => {

  const schema = Joi.object().keys({
    full_name: Joi.string().required(),
    user_name: Joi.string().required(),
    email,
    password,
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.login = (req, res, next) => {
  const schema = Joi.object().keys({
    user_name: Joi.string().required(),
    password,
    fcm_token: Joi.string().optional().allow(""),
    device_id: Joi.string().optional().allow(""),
    device_type: Joi.string().optional().allow(""),
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.forgotPassword = (req, res, next) => {
  const schema = Joi.object().keys({
    email,
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
    // commonResponse.sendJoiError(res, 'VALIDATION_ERROR', 400, data.error);
  } else {
    next()
  }
};

exports.resetPassword = (req, res, next) => {

  const schema = Joi.object().keys({
    password,
    new_password: Joi.string().required(),
    confirm_password: Joi.string().required(),
    _id: ObjectID.optional().allow(""),
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.resendVerificationLink = (req, res, next) => {

  const schema = Joi.object().keys({
    email,
  })
  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.changePassword = (req, res, next) => {

  const schema = Joi.object({
    old_password: password,
    new_password: password,
    confirm_password: password,
  });
  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.updateStatus = (req, res, next) => {
  const schema = Joi.object({
    otp: Joi.number().required(),
    email: email,
  });
  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.updateProfile = (req, res, next) => {
  const schema = Joi.object().keys({
    email,
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company_name: Joi.string().required(),
    mobile: Joi.string().required(),
    countryCode: Joi.string().optional().allow(""),
  });

  let data = schema.validate(req.body);

  if (data.hasOwnProperty('error')) {
    commonResponse.sendJoiError(res, 'VALIDATION_ERROR', data.error)
  } else {
    next()
  }
};

exports.passwordValidation = password;
exports.emailValidation = email;
