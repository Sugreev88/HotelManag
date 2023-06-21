const HotelError = require("../error/authError");
const hotelService = require("../service/hotelService");
const { errorHandler } = require("../controller/authController");

const newHotelListing = async function (req, res, next) {
  try {
    const loggedINUser = req.loggedInUser;
    // console.log(User);
    const { name, description, location, address, totalRooms } = req.body;
    let id = await hotelService.addHoteltoDB({
      name,
      description,
      location,
      address,
      totalRooms,
      loggedINUser,
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
    const loggedINUser = req.loggedInUser;
    const hotelId = req.params.hotelId;
    const { checkInDate, checkOutDate, numGuests, rooms, paymentStatus } =
      req.body;
    if (rooms <= 0 || !rooms)
      throw new HotelError(
        `please select a valid rooms can't book ${rooms} rooms`,
        400
      );
    const checkIn = new Date(parseDateString(checkInDate));
    const checkOut = new Date(parseDateString(checkOutDate));

    const currentDate = new Date();
    // Assuming the booking date is provided as a string, you can parse it as a Date object
    // const bookingDateStr = "2023-06-09";
    // const bookingDate = new Date(bookingDateStr);

    // Remove the time portion from the current date and booking date for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);

    console.log(currentDate.getTime());

    // if ((checkIn < new Date()))
    //   throw new HotelError("Please select a valid Date", 400);
    // if (checkIn >= checkOut)
    //   throw new HotelError("Check-in date must be before check-out date", 400);
    let result = await hotelService.addBooking({
      hotelId,
      checkInDate,
      checkOutDate,
      numGuests,
      rooms,
      paymentStatus,
      loggedINUser,
    });
    await hotelService.sendMessageViaMail(result, loggedINUser._id, hotel);
    res.status(201).send({ message: `succesfully booked ${result}` });
  } catch (err) {
    errorHandler(err, next);
  }
};

const hotelReview = async function (req, res, next) {
  try {
    const user = req.loggedInUser;
    const hotelId = req.params.hotelId;
    const userId = user._id;
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
    const user = req.loggedInUser;
    const hotelId = req.params.hotelId;
    const userId = user._id;
    await hotelService.deactivateHotelToDB(hotelId, userId);
    res.status(200).send({ message: "Hotel succesfully Deactivated" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const updateHotel = async function (req, res, next) {
  try {
    const user = req.loggedInUser;
    const hotelId = req.params.hotelId;
    const { name, description, location, address, totalRooms } = req.body;
    // if (!(hotelId && userId))
    //   throw new AuthError("please Provide Hotelid and userid", 401);
    await hotelService.updateHotelToDB({
      hotelId,
      userId: user._id,
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
    const user = req.loggedInUser;
    const bookingId = req.params.bookingId;
    const { hotelId } = req.body;
    const userId = user._id;
    await hotelService.cancelBookingToDb(bookingId, hotelId, userId);
    res.status(200).send({ message: "Booking Succesfully Cancelled" });
  } catch (err) {
    errorHandler(err, next);
  }
};

const getAllBookings = async function (req, res, next) {
  try {
    const user = req.loggedInUser;
    const userId = user._id;
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
