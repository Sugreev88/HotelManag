const HotelError = require("../error/authError");
const hotelService = require("../service/hotelService");
const { errorHandler } = require("../controller/authController");

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
    console.log(location);
    let result = await hotelService.findHotelsbyLocation(location);
    res.status(200).send(result);
  } catch (err) {
    errorHandler(err, next);
  }
};

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
    console.log(hotelId, userId);
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

module.exports = {
  newHotelListing,
  getAllHotels,
  getHotelsByLocation,
  hotelBooking,
  hotelReview,
};
