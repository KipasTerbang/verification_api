const jwt = require("jsonwebtoken");
const { User, Auth } = require("../models");
const ApiError = require("../../utils/apiError");

module.exports = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      return next(new ApiError("You must log in", 401));
    }

    const token = bearerToken.split("Bearer ")[1];

    if (!token) {
      return next(new ApiError("Token is missing or malformed", 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.id) {
      return next(new ApiError("Invalid token payload", 401));
    }

    const user = await User.findByPk(payload.id, {
      include: { model: Auth, as: "auth" },
    });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ApiError("Invalid token", 401));
    }
    next(new ApiError(err.message, 500));
  }
};
