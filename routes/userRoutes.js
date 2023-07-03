const express = require("express");
const router = express.Router();
// const axios = require("axios");

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

router.route("").post(createUser);
router.route("/verify/mobile").post(verifyMobile);
router.route("/verify/mobile/otp").post(verifyOtp);
router.route("/verify/email").post(verifyEmail);
router.route("/verify/email/otp").post(verifyEmailOtp);
router.route("/login").post(userLogin);
router.route("/login/token").post(loginViaToken);
router.route("/logout").post(verifyLogIntoken, logout);
router.route("/").get(verifyLogIntoken, getUserById);
module.exports = router;
