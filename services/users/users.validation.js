const { Joi } = require("express-validation");
const constants = require("../../helper/resources/messages.json");

const password = Joi.string().min(4).max(16).required();
const email = Joi.string().email().required();

const REGEX = {
  MONGO_OBJECT_ID: /^[a-f\d]{24}$/i,
};

const ObjectID = Joi.string()
  .pattern(REGEX.MONGO_OBJECT_ID)
  .trim()
  .strict(true)
  .required()
  .messages({
    "string.pattern.base": constants.PROVIDE_OBJECT_ID,
  });

const paramsValidation = Joi.object({
  id: ObjectID,
});

const tokenValidation = Joi.object({
  token: Joi.string().length(64).message(constants.EXPIRED_TOKEN_ERROR),
});

exports.register = {
  body: Joi.object({
    full_name: Joi.string().required(),
    user_name: Joi.string().required(),
    email,
    password
  }),
};

exports.login = {
  body: Joi.object({
    user_name: Joi.any().required(),
    password,
  }),
};

exports.forgotPassword = {
  body: Joi.object({
    email,
  }),
};

exports.resetPassword = {
  body: Joi.object({
    password,
    new_password: Joi.string().required(),
    confirm_password: Joi.string().required(),
    _id: ObjectID.optional().allow(""),
  }),
};

exports.resendVerificationLink = {
  body: Joi.object({
    email,
  }),
};

exports.changePassword = {
  body: Joi.object({
    password,
    newPassword: password,
  }),
};

exports.updateStatus = {
  body: Joi.object({
    otp: Joi.number().required(),
    email: email,
  }),
};

exports.getUserById = {
  params: paramsValidation,
};

exports.ObjectID = ObjectID;
exports.paramsValidation = paramsValidation;
exports.tokenValidation = tokenValidation;
exports.passwordValidation = password;
exports.emailValidation = email;
