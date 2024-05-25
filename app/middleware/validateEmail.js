const ApiError = require("../../utils/apiError");

const validateEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    return next(new ApiError("Invalid email address.", 400));
  }

  next();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = validateEmail;
