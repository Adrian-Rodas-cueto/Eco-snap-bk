const Joi = require("joi");

// Define the validation schema
const userValidationSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name should have a minimum length of 2",
    "string.max": "First name should have a maximum length of 30"
  }),
  lastName: Joi.string().min(2).max(30).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name should have a minimum length of 2",
    "string.max": "Last name should have a maximum length of 30"
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email"
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password should have a minimum length of 6"
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    "string.empty": "Confirm password is required",
    "any.only": "Password and confirmPassword do not match"
  }),
});

// Validate user data
const validateUser = (userData) => {
  return userValidationSchema.validate(userData, { abortEarly: false });
};

module.exports = { validateUser };
