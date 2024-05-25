const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth, User } = require("../models");
const { AUTH_EMAIL } = process.env;
const otpGenerator = require("otp-generator");

const apiError = require("../../utils/apiError");
const sendEmail = require("../../utils/sendEmail");

const register = async (req, res, next) => {
  try {
    const { name, email, hobi, password } = req.body;

    const usercek = await Auth.findOne({
      where: {
        email,
      },
    });
    if (usercek) {
      return next(new apiError("User email already taken", 400));
    }

    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const invalidLength = password.length < 8 || symbolRegex.test(password);
    if (invalidLength) {
      return next(
        new apiError(
          "Password must be at least 8 characters and contain no special characters",
          400
        )
      );
    }
    const otps = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = await User.create({
      name,
      hobi,
    });

    await Auth.create({
      email,
      password: hashedPassword,
      id_user: newUser.id,
      otp: otps,
    });

    await sendVerificationEmail(email, otps);

    res.status(200).json({
      status: "Register successful",
      data: {
        email,
        ...newUser,
      },
    });
  } catch (err) {
    next(new apiError(err.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Auth.findOne({
      where: { email },
      include: {
        model: User,
        as: "user",
      },
    });

    if (!user) {
      return next(new apiError("Email not found", 404));
    }
    if (!user.verified) {
      return next(new apiError("User not verified", 401));
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          id: user.id_user,
          username: user.user.name,
          hobi: user.user.hobi,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        status: "Success",
        message: "Login successful",
        data: token,
      });
    } else {
      return next(new apiError("Incorrect password", 401));
    }
  } catch (err) {
    next(new apiError(err.message, 500));
  }
};

const sendVerificationEmail = async (email, otp) => {
  const link = `http://localhost:9000/api/v1/auth/verify-email/${otp}`;
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `
      <p>Hello,</p>
      <p>Verify your email by clicking the link below:</p>
      <p><a href="${link}" style="color:black;font-size:25px;letter-spacing:2px;"><strong>Click this link</strong></a></p>
      <p>It will expire in 5 minutes.</p>
      <p>Best regards,</p>
      <p>Team c8</p>
    `,
  };

  try {
    await sendEmail(mailOptions);
  } catch (err) {
    throw new apiError("Failed to send verification email", 500);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.params;
    const user = await Auth.findOne({ where: { otp } });

    if (!user) {
      return next(new apiError("Invalid OTP", 400));
    }

    if (user.verified) {
      return res.status(200).json({
        status: "Success",
        message: "Email already verified",
      });
    }

    user.otp = 0;
    user.verified = true;
    await user.save();

    res.status(200).json({
      status: "Success",
      message: "Email verified successfully",
    });
  } catch (err) {
    next(new apiError(err.message, 500));
  }
};

const authenticate = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "Success",
      data: {
        id: req.user.id,
        name: req.user.name,
        hobi: req.user.hobi,
      },
    });
  } catch (err) {
    next(new apiError(err.message, 500));
  }
};

module.exports = {
  register,
  login,
  sendVerificationEmail,
  verifyEmail,
  authenticate,
};
