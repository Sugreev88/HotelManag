const HotelError = require("../error/authError");
const hotelService = require("../service/hotelService");
const { errorHandler } = require("../controller/authController");
const authService = require("../service/authService");
const AuthError = require("../error/authError");
const helperService = require("../service/helperService");

const newHotelListing = async function (req, res, next) {
  try {
    const { name, description, location, address, user, totalRooms } = req.body;
    let id = await hotelService.addHoteltoDB({
      name,
      description,
      location,
      address,
      user,
      totalRooms,
    });
    res
      .status(201)
      .send({ message: `succesfully added a new hotel with ${id}` });
  } catch (err) {
    errorHandler(err, next);
  }
};

const getAllHotels = async function (req, res, next) {
  try {
    let result = await hotelService.findAllHotels();
    res.status(200).send(result);
  } catch (err) {
    errorHandler(err, next);
  }
};

const getHotelsByLocation = async function (req, res, next) {
  try {
    let location = req.params.location;
    let result = await hotelService.findHotelsbyLocation(location);
    res.status(200).send(result);
  } catch (err) {
    errorHandler(err, next);
  }
};

function parseDateString(dateString) {
  const parts = dateString.split("-");
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  return `${year}-${month + 1}-${day}`;
}

const hotelBooking = async function (req, res, next) {
  try {
    const {
      hotel,
      user,
      checkInDate,
      checkOutDate,
      numGuests,
      rooms,
      totalPrice,
      paymentStatus,
    } = req.body;
    const checkIn = new Date(parseDateString(checkInDate));
    const checkOut = new Date(parseDateString(checkOutDate));
    if (!(checkIn >= Date.now()))
      throw new HotelError("Please select a valid Date", 400);
    if (checkIn >= checkOut)
      throw new HotelError("Check-in date must be before check-out date", 400);
    let result = await hotelService.addBooking({
      hotel,
      user,
      checkInDate,
      checkOutDate,
      numGuests,
      rooms,
      totalPrice,
      paymentStatus,
    });
    await hotelService.sendMessageViaMail(user, hotel, totalPrice);
    res.status(201).send({ message: `succesfully booked ${result}` });
  } catch (err) {
    errorHandler(err, next);
  }
};

const hotelReview = async function (req, res, next) {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.params.userId;
    const { review, rating } = req.body;
    let result = await hotelService.addReviewtoHotel(
      hotelId,
      userId,
      review,
      rating
    );
    res.status(200).send({ message: "succesfully added a review" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const deactivateHotel = async function (req, res, next) {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.params.userId;
    await hotelService.deactivateHotelToDB(hotelId, userId);
    res.status(200).send({ message: "Hotel succesfully Deactivated" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const updateHotel = async function (req, res, next) {
  try {
    const {
      hotelId,
      userId,
      name,
      description,
      location,
      address,
      totalRooms,
    } = req.body;
    if (!(hotelId && userId))
      throw new AuthError("please Provide Hotelid and userid", 401);
    await hotelService.updateHotelToDB({
      hotelId,
      userId,
      name,
      description,
      location,
      address,
      totalRooms,
    });
    res.status(200).send({ message: "successfully update The Hotel" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const cancelBooking = async function (req, res, next) {
  try {
    const bookingId = req.params.bookingId;
    const { hotelId, userId } = req.body;
    await hotelService.cancelBookingToDb(bookingId, hotelId, userId);
    res.status(200).send({ message: "Booking Succesfully Cancelled" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const getAllBookings = async function (req, res, next) {
  try {
    const userId = req.params.userId;
    console.log(userId);
    let result = await hotelService.getAllBookingsFromDb(userId);
    res.status(200).send(result);
  } catch (err) {
    errorHandler(err, next);
  }
};

module.exports = {
  newHotelListing,
  getAllHotels,
  getHotelsByLocation,
  hotelBooking,
  hotelReview,
  deactivateHotel,
  updateHotel,
  cancelBooking,
  getAllBookings,
};
