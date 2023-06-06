const { Admin } = require("mongodb");
const Hotel = require("../model/hotel");
const User = require("../model/user");
const Booking = require("../model/booking");
const HotelError = require("../error/hotelError");
const user = require("../model/user");
const nodemailer = require("nodemailer");
const AuthError = require("../error/authError");

const addHoteltoDB = async function ({
  name,
  description,
  location,
  address,
  user,
  totalRooms,
}) {
  const user1 = await User.findOne({ _id: user });
  console.log(user1);
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
  let result = await Hotel.find({ isActive: true });
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
  if (!validHotel.isActive) throw new HotelError("Hotel NOt Found", 404);
  const validUser = await User.findOne({ _id: user });
  if (!validUser) throw new HotelError("user not found", 404);
  // console.log(validHotel.totalRooms);
  if (!(validHotel.totalRooms >= rooms))
    throw new HotelError("Rooms are already fulled", 400);
  const totalRoomsAvailable = validHotel.totalRooms - rooms;
  let updatedHotelRooms = await Hotel.updateOne(
    { _id: hotel },
    {
      $set: {
        availableRooms: totalRoomsAvailable,
      },
    }
  );
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
    console.log(user1.email);
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
  try {
    if (rating1 > 5) throw new HotelError("please select betwwen 1 to 5", 400);
    const hotel = await Booking.find({ hotel: hotelId });
    // console.log(hotel);
    const [validHotel] = hotel;
    if (!validHotel) throw new HotelError("Hotel not found", 404);
    const [booking] = hotel;
    if (!(booking.user == userId)) throw new HotelError("Access Denied", 401);
    const updatedReview = await Hotel.updateOne(
      { _id: hotelId },
      { $push: { reviews: { user: userId, review: review1, rating: rating1 } } }
    );
    return;
  } catch (err) {
    throw new HotelError(err.message, 400);
  }
};

const updateHotelToDB = async function ({
  hotelId,
  userId,
  name,
  description,
  location,
  address,
  totalRooms,
}) {
  const validHotel = await Hotel.findOne({ _id: hotelId });
  if (!validHotel) throw new HotelError("Hotel Not Found", 404);
  if (!(validHotel.user == userId))
    throw new HotelError("Access Denied!!Invalid User", 401);
  let updateHotel = await Hotel.updateOne(
    { _id: hotelId },
    {
      $set: {
        name: name,
        description: description,
        location: location,
        address: address,
        totalRooms: totalRooms,
      },
    }
  );
  return;
};

const getAllBookingsFromDb = async function (userId) {
  const [result] = await Booking.find({ user: userId });
  console.log(result);
  if (!result) throw new HotelError("No Booking found", 400);
  return result;
};

const deactivateHotelToDB = async function (hotelId, userId) {
  let validHotel = await Hotel.findOne({ _id: hotelId });
  if (!validHotel) throw new HotelError("Hotel Not Found", 404);
  let validUser = await User.findOne({ _id: userId });
  if (!validUser) throw new AuthError("User not Found", 404);
  if (validUser.role == "Customer") throw new AuthError("invalid User", 401);
  let deactivateHotel = await Hotel.updateOne(
    { _id: hotelId },
    { $set: { isActive: false } }
  );
  return;
};

const cancelBookingToDb = async function (bookingId, hotelId, userId) {
  const validBooking = await Booking.findOne({ _id: bookingId });
  if (!validBooking) throw new HotelError("Booking not Found", 404);
  // if (!validBooking.isActive)
  //   throw new HotelError("booking already cancelled", 400);
  if (!(validBooking.hotel == hotelId))
    throw new HotelError("Hotel Not Found", 404);
  if (!(validBooking.user == userId))
    throw new HotelError("No Booking Found of This User", 404);
  const roomsAvaialble = validBooking.rooms;
  // console.log(validBooking.rooms);
  let deactivateHotelBooking = await Booking.updateOne(
    { _id: bookingId },
    { $set: { isActive: false } }
  );
  let updateHotelRooms = await Hotel.updateOne(
    { _id: hotelId },
    { $set: { availableRooms: roomsAvaialble } }
  );
  return;
};

module.exports = {
  addHoteltoDB,
  findAllHotels,
  findHotelsbyLocation,
  addBooking,
  sendMessageViaMail,
  addReviewtoHotel,
  deactivateHotelToDB,
  updateHotelToDB,
  cancelBookingToDb,
  getAllBookingsFromDb,
};
