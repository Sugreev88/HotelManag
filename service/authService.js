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
const nodemailer = require("nodemailer");

const addUserToDb = async function ({ name, email, phone, role, password }) {
  let result = new User({ name, email, phone, role, password });
  let user = await result.save();
  return user._id;
};

const getUserFromDb = async function (id) {
  const user = await User.findOne({ _id: id });
  if (!user) throw new AuthError("User not found", 404);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
  };
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

const generateOtpViaMail = async function (email) {
  try {
    const user = await helperService.validUserByEmail(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.updateOne({ email }, { otp }, { upsert: true });
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL, // generated ethereal user
        pass: process.env.GMAIL_PASS,
      },
      debug: true,
    });

    let mailOptions = {
      from: process.env.GMAIL,
      to: `${email}`,
      subject: "User Verification",
      text: `your verification code is ${otp}`,
    };

    return transporter.sendMail(mailOptions, function (error, info) {});
  } catch (error) {
    throw error;
  }
};

const verifyOtpViaMobile = async function (phone1, otp) {
  let user = await helperService.validUserbyPhone(phone1);
  if (!(user.otp == otp)) throw new AuthError("invalid otp", 401);
  return;
};

const verifyOtpViaEmail = async function (email1, otp) {
  let user = await helperService.validUserByEmail(email1);
  if (!(user.otp == otp)) throw new AuthError("invalid otp", 401);
  let updatedOtp = await User.updateOne(
    { email: email1 },
    { $set: { otp: "", isActive: true } }
  );
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
  if (!user)
    throw new AuthError("Access Denied Invalid Token , Please Login", 401);
  let result = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  if (!(result.id == user._id))
    throw new AuthError("Access Denied Invalid Token , Please Login", 401);
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
  generateOtpViaMail,
  verifyOtpViaEmail,
};
