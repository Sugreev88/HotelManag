const { default: mongoose } = require("mongoose");
const authService = require("../service/authService");
const ValidationError = require("../error/validationError");
const AuthError = require("../error/authError");
const helperService = require("../service/helperService");

const errorHandler = async function (error, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    next(new ValidationError(error.message));
  } else if (error.code == 11000) {
    next(new ValidationError(error.message));
  } else if (error instanceof mongoose.Error.CastError) {
    next(new ValidationError(error.message));
  }
  next(error);
};

const createUser = async function (req, res, next) {
  try {
    // const ne = req.body;
    // console.log(ne);
    const { name, email, phone, role, password } = req.body;
    let id = await authService.addUserToDb({
      name,
      email,
      phone,
      role,
      password,
    });
    res.status(201).send({
      message: `id:${id}  please verify your mobile or email`,
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

const verifyMobile = async function (req, res, next) {
  try {
    const { phone } = req.body;
    if (!phone) throw new AuthError("Phone number is required");
    await authService.generateOtpOnMobile(phone);
    res.status(200).send({ message: "succesfully send otp on mobile" });
  } catch (error) {
    errorHandler(error, next);
  }
};

const verifyOtp = async function (req, res, next) {
  try {
    const { phone, otp } = req.body;
    await authService.verifyOtpViaMobile(phone, otp);
    await authService.updateOtpToDb(phone, otp);
    res.status(200).send({
      message: "succesfully verified Please Login Via Email and Password",
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

const userLogin = async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const token = await helperService.generateToken(user.id, user.email);
    res.status(200).send({ message: `succesfully logged in , ${token}` });
  } catch (error) {
    errorHandler(error, next);
  }
};

const loginViaToken = async function (req, res, next) {
  try {
    const token =
      req.headers.authorization.split(" ")[1] ||
      req.headers.authorization.split(" ")[0];
    if (!token) throw new AuthError("Please send token", 401);
    await authService.verifyToken(token);
    res.status(200).send({ message: "Successfully Logged In" });
  } catch (error) {
    errorHandler(error, next);
  }
};
const verifyLogIntoken = async function (req, res, next) {
  try {
    const token =
      req.headers.authorization.split(" ")[1] ||
      req.headers.authorization.split(" ")[0];
    if (!token) throw new AuthError("please send token", 401);
    let user = await authService.verifyToken(token);
    req.loggedInUser = user;
    next();
  } catch (error) {
    errorHandler(error, next);
  }
};

const logout = async function (req, res, next) {
  try {
    const user = req.loggedInUser;
    const Token = user.token;
    await authService.logoutViaToken(Token);
    res.status(200).send({ message: "Successfully logged Out" });
  } catch (error) {
    errorHandler(error, next);
  }
};

const getUserById = async function (req, res, next) {
  try {
    const id = req.params.id;
    if (!id) throw new AuthError("please provide user id", 401);
    let user = await authService.getUserFromDb(id);
    res.status(200).send(user);
  } catch (err) {
    errorHandler(err, next);
  }
};

module.exports = {
  createUser,
  verifyOtp,
  verifyMobile,
  userLogin,
  loginViaToken,
  verifyLogIntoken,
  logout,
  errorHandler,
  getUserById,
};
