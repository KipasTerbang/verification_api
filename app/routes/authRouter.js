const router = require("express").Router();

const Auth = require("../controller/authController");
const validateEmail = require("../middleware/validateEmail");
const authMe = require("../middleware/authMe");

router.post("/register", validateEmail, Auth.register);
router.post("/login", Auth.login);
router.get("/me", authMe, Auth.authenticate);

router.get("/verify-email/:otp", Auth.verifyEmail);
router.post("/send-verification-email", Auth.sendVerificationEmail);

module.exports = router;
