const express = require("express");
const router = express.Router();

const {
  createUser,
  verifyOtp,
  verifyMobile,
  userLogin,
  loginViaToken,
  verifyLogIntoken,
  logout,
  getUserById,
  verifyEmail,
  verifyEmailOtp,
} = require("../controller/authController");

router.route("/signup").post(createUser);
router.route("/verify/mobile").post(verifyMobile);
router.route("/verify/mobile/otp").post(verifyOtp);
router.route("/verify/email").post(verifyEmail);
router.route("/verify/email/otp").post(verifyEmailOtp);
router.route("/login").post(userLogin);
router.route("/login/token").post(loginViaToken);
router.route("/logout").post(verifyLogIntoken, logout);
router.route("/getUser").get(verifyLogIntoken, getUserById);
module.exports = router;
