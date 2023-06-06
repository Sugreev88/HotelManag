const mongoose = require("mongoose");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SSID,
  process.env.TWILIO_AUTH_KEY
);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const helperService = require("../service/helperService");
const AuthError = require("../error/authError");

const addUserToDb = async function ({ name, email, phone, role, password }) {
  let result = new User({ name, email, phone, role, password });
  let user = await result.save();
  return user._id;
};

const getUserFromDb = async function (id) {
  const user = await User.findOne({ _id: id });
  if (!user) throw new AuthError("User not found", 404);
  return user;
};

const generateOtpOnMobile = async function (Phone) {
  await helperService.validUserbyPhone(Phone);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await User.updateOne({ phone: Phone }, { otp }, { upsert: true });
  const message = await client.messages.create({
    body: ` ${otp}`,
    from: process.env.PHONE_NUMBER,
    to: `+91${Phone}`,
  });
  return message;
};

const verifyOtpViaMobile = async function (phone1, otp) {
  let user = await helperService.validUserbyPhone(phone1);
  if (!(user.otp == otp)) throw new AuthError("invalid otp", 401);
  return;
};

const updateOtpToDb = async function (phone1, otp) {
  let updatedOtp = await User.updateOne(
    { phone: phone1 },
    { $set: { otp: "", isActive: true } }
  );
  return;
};

const login = async function (email1, password1) {
  let user = await helperService.validUserByEmail(email1);
  if (!user.isActive) {
    throw new AuthError("please verify your email or phone", 401);
  } else if (!(await bcrypt.compare(password1, user.password))) {
    throw new AuthError("Invalid Password", 401);
  }
  return user;
};

const verifyToken = async function (token) {
  let user = await User.findOne({ token: token });
  if (!user) throw new AuthError("Access Denied", 401);
  let result = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  if (!(result.id == user._id)) throw new AuthError("Access Denied", 404);
  return user;
};

const logoutViaToken = async function (token) {
  let result = await User.updateOne({ token: token }, { $set: { token: " " } });
  return;
};

module.exports = {
  addUserToDb,
  generateOtpOnMobile,
  verifyOtpViaMobile,
  updateOtpToDb,
  login,
  verifyToken,
  logoutViaToken,
  getUserFromDb,
};
