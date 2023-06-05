const { Admin } = require("mongodb");
const Hotel = require("../model/hotel");
const User = require("../model/user");
const Booking = require("../model/booking");
const HotelError = require("../error/hotelError");
const user = require("../model/user");
const nodemailer = require("nodemailer");

const addHoteltoDB = async function ({
  name,
  description,
  location,
  address,
  user,
  totalRooms,
}) {
  const user1 = await User.findOne({ _id: user });
  if (!user1) throw new HotelError("user not found", 404);
  if (user1.role == "Customer") throw new HotelError("Access Denied", 401);
  let result = await new Hotel({
    name,
    description,
    location,
    address,
    user,
    totalRooms,
  });
  await result.save();
  return result._id;
};

const findAllHotels = async function () {
  let result = await Hotel.find();
  if (!result) throw new HotelError("Hotel not found", 404);
  return result;
};

const findHotelsbyLocation = async function (location) {
  let result = await Hotel.find({ location: location });
  if (!result) throw new HotelError("Hotel not found", 404);
  return result;
};

const addBooking = async function ({
  hotel,
  user,
  checkInDate,
  checkOutDate,
  numGuests,
  rooms,
  totalPrice,
  paymentStatus,
}) {
  const validHotel = await Hotel.findOne({ _id: hotel });
  if (!validHotel) throw new HotelError("hotel not found", 404);
  const validUser = await User.findOne({ _id: user });
  if (!validUser) throw new HotelError("user not found", 404);
  let result = await new Booking({
    hotel,
    user,
    checkInDate,
    checkOutDate,
    numGuests,
    rooms,
    totalPrice,
    paymentStatus,
  });
  await result.save();
  return result._id;
};

const sendMessageViaMail = async function (user, hotel, totalPrice) {
  try {
    const user1 = await User.findOne({ _id: user });
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
      to: `${user1.email}`,
      subject: "Hotel Booking",
      text: `your hotel booking have been succesfully processed,and the total amount for your booking is ${totalPrice} Enjoy your trip`,
    };

    return transporter.sendMail(mailOptions, function (error, info) {});
  } catch (error) {
    throw error;
  }
};

const addReviewtoHotel = async function (hotelId, userId, review1, rating1) {
  if (rating1 > 5) throw new HotelError("please select betwwen 1 to 5", 400);
  const hotel = await Booking.findOne({ hotel: hotelId });
  if (!hotel) throw new HotelError("Hotel not found", 404);
  if (!(hotel.user == userId)) throw new HotelError("Access Denied", 401);
  const updatedReview = await Hotel.updateOne(
    { _id: hotelId },
    { review: review1, rating: rating1 }
  );
  console.log(updatedReview);
  return;
};

module.exports = {
  addHoteltoDB,
  findAllHotels,
  findHotelsbyLocation,
  addBooking,
  sendMessageViaMail,
  addReviewtoHotel,
};
