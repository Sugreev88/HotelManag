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
} = require("../controller/authController");

router.route("/signup").post(createUser);
router.route("/verify/mobile").post(verifyMobile);
router.route("/verify/mobile/otp").post(verifyOtp);
router.route("/login").post(userLogin);
router.route("/login/token").post(loginViaToken);
router.route("/logout").post(verifyLogIntoken, logout);
router.route("/getUser/:id").get(getUserById);
module.exports = router;
