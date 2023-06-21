const express = require("express");
const router = express.Router();
const {
  newHotelListing,
  getAllHotels,
  getHotelsByLocation,
  hotelBooking,
  hotelReview,
  deactivateHotel,
  updateHotel,
  cancelBooking,
  getAllBookings,
} = require("../controller/hotelController");
const { verifyLogIntoken } = require("../controller/authController");

router.route("/hotel").post(verifyLogIntoken, newHotelListing);
router.route("/hotels").get(getAllHotels);
router.route("/hotels/:location").get(getHotelsByLocation);
router.route("/hotel/booking/:hotelId").post(verifyLogIntoken, hotelBooking);
router.route("/hotel/review/:hotelId").post(verifyLogIntoken, hotelReview);
router.route("/hotel/:hotelId").patch(verifyLogIntoken, updateHotel);
router.route("/hotel/:hotelId").delete(verifyLogIntoken, deactivateHotel);
router.route("/hotel/cancel/:bookingId").post(verifyLogIntoken, cancelBooking);
router.route("/hotel/bookings").get(verifyLogIntoken, getAllBookings);
module.exports = router;
