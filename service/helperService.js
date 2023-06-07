const jwt = require("jsonwebtoken");
const AuthError = require("../error/authError");
const User = require("../model/user");

const validUserByEmail = async function (email) {
  let result = await User.findOne({ email: email });
  if (!result) throw new AuthError("invalid email", 401);
  return result;
};

const validUserbyPhone = async function (phone) {
  let result = await User.findOne({ phone: phone });
  if (!result) throw new AuthError("invalid phone", 401);
  return result;
};

const generateToken = async function (id) {
  try {
    const secretkety = process.env.TOKEN_SECRET_KEY;
    const token = await jwt.sign({ id }, secretkety);
    let updatedOtp = await User.updateOne(
      { _id: id },
      { $set: { token: token } }
    );
    return token;
  } catch (err) {
    throw new AuthError(err.message, 401);
  }
};

const parseDateString = async function (dateString) {
  const parts = dateString.split("-");
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  return `${year}-${month + 1}-${day}`;
};

module.exports = {
  generateToken,
  validUserByEmail,
  validUserbyPhone,
  parseDateString,
};
