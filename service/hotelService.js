const { Admin } = require("mongodb");
const Hotel = require("../model/hotel");
const User = require("../model/user");
const Booking = require("../model/booking");
const HotelError = require("../error/hotelError");
const nodemailer = require("nodemailer");
const AuthError = require("../error/authError");

const addHoteltoDB = async function ({
  name,
  description,
  location,
  address,
  totalRooms,
  loggedINUser,
}) {
  const user1 = await User.findOne({ _id: loggedINUser._id });
  // console.log(user1);
  if (!user1) throw new HotelError("user not found", 404);
  if (user1.role == "Customer") throw new HotelError("You are Not Admin", 401);
  let result = await new Hotel({
    name,
    description,
    location,
    address,
    user: user1._id,
    totalRooms,
    availableRooms: totalRooms,
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
  checkInDate,
  checkOutDate,
  numGuests,
  rooms,
  paymentStatus,
  loggedINUser,
}) {
  const validHotel = await Hotel.findOne({ _id: hotel });
  if (!validHotel) throw new HotelError("hotel not found", 404);
  if (!validHotel.isActive) throw new HotelError("Hotel is Deactivated", 400);
  const validUser = await User.findOne({ _id: loggedINUser._id });
  if (!validUser) throw new HotelError("user not found", 404);
  const totalRoomsAvailable = validHotel.availableRooms - rooms;
  if (totalRoomsAvailable < 0)
    throw new HotelError(
      `Can't book ${rooms} rooms we have only ${validHotel.availableRooms} rooms Available`,
      400
    );
  if (validHotel.availableRooms <= 0)
    throw new HotelError(
      `Can't book ${rooms} rooms we have only  ${validHotel.availableRooms} rooms Available`,
      400
    );
  // console.log(validUser);
  let result = await new Booking({
    hotel,
    user: validUser._id,
    checkInDate,
    checkOutDate,
    numGuests,
    rooms,
    totalPrice: numGuests * 1000,
    paymentStatus,
  });
  await result.save();
  let updatedHotelRooms = await Hotel.updateOne(
    { _id: hotel },
    {
      $set: {
        availableRooms: totalRoomsAvailable,
      },
    }
  );
  return result._id;
};

const sendMessageViaMail = async function (result, userid, hotel) {
  const user1 = await User.findOne({ _id: userid });
  const hotelData = await Hotel.findOne({ _id: hotel });
  const bookindData = await Booking.findOne({ _id: result });
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS,
    },
    debug: true,
  });
  let mailOptions = {
    from: process.env.GMAIL,
    to: `${user1.email}`,
    subject: `Hotel Booking id:${bookindData._id}`,
    text: `your hotel booking have been succesfully placed in ${hotelData.name} hotel from ${bookindData.checkInDate} to ${bookindData.checkOutDate} , and the total amount for your booking is ${bookindData.totalPrice} Enjoy your Trip . 🪂🪂🪂🪂`,
  };
  return transporter.sendMail(mailOptions, function (error, info) {});
};

const addReviewtoHotel = async function (hotelId, userId, review1, rating1) {
  if (rating1 > 5) throw new HotelError("please select betwwen 1 to 5", 400);
  const validHotel = await Hotel.findOne({ _id: hotelId, isActive: true });
  if (!validHotel)
    throw new HotelError("Hotel Not Find !! Please check Your HotelId");
  const hotelBooking = await Booking.find({ hotel: hotelId });
  const [hotelBookingnew] = hotelBooking;
  if (!hotelBookingnew)
    throw new HotelError("No Booking found In this hotel", 404);
  const [booking] = hotelBooking;
  if (!hotelBookingnew.user.equals(userId))
    throw new HotelError("No booking Found for the User In This Hotel", 404);
  const updatedReview = await Hotel.updateOne(
    { _id: hotelId },
    { $push: { reviews: { user: userId, review: review1, rating: rating1 } } }
  );
  return;
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
  // if (!(validHotel.user == userId))
  // console.log(validHotel.user, userId);
  if (!validHotel.user.equals(userId))
    throw new HotelError("Access Denied!!Invalid User", 401);
  const previousAvailableRooms = validHotel.availableRooms;
  const updatedAvailableRooms =
    previousAvailableRooms + (totalRooms - validHotel.totalRooms);
  if (updatedAvailableRooms < 0)
    throw new HotelError(
      "You Have an Active Booking Please settle them Before Updating"
    );
  let updateHotel = await Hotel.updateOne(
    { _id: hotelId },
    {
      $set: {
        name: name,
        description: description,
        location: location,
        address: address,
        totalRooms: totalRooms,
        availableRooms: updatedAvailableRooms,
      },
    }
  );
  return;
};

const getAllBookingsFromDb = async function (userId) {
  const [result] = await Booking.find({ user: userId });
  // console.log(result);
  if (!result) throw new HotelError("No Booking found", 404);
  return result;
};

const deactivateHotelToDB = async function (hotelId, userId) {
  let validHotel = await Hotel.findOne({ _id: hotelId });
  if (!validHotel) throw new HotelError("Hotel Not Found", 404);
  let validUser = await User.findOne({ _id: userId });
  if (!validUser) throw new AuthError("User not Found", 404);
  if (validUser.role == "Customer")
    throw new AuthError("Only Admin Can Delete the Hotel", 401);
  let deactivateHotel = await Hotel.updateOne(
    { _id: hotelId },
    { $set: { isActive: false } }
  );
};

const cancelBookingToDb = async function (bookingId, hotelId, userId) {
  const validBooking = await Booking.findOne({ _id: bookingId });
  if (!validBooking) throw new HotelError("Booking not Found", 404);
  // if (!(validBooking.hotel == hotelId))
  if (!validBooking.hotel.equals(hotelId))
    throw new HotelError("Hotel Not Found", 404);
  // if (!(validBooking.user == userId))
  if (!validBooking.user.equals(userId))
    throw new HotelError("No Booking Found of This User", 404);
  const roomsAvaialble = validBooking.rooms;
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
