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

router.route("/addHotel").post(verifyLogIntoken, newHotelListing);
router.route("/getAllHotels").get(getAllHotels);
router.route("/getHotelsByLocation/:location").get(getHotelsByLocation);
router.route("/booking").post(verifyLogIntoken, hotelBooking);
router.route("/review/:hotelId").post(verifyLogIntoken, hotelReview);
router.route("/update").patch(verifyLogIntoken, updateHotel);
router.route("/delete/:hotelId").delete(verifyLogIntoken, deactivateHotel);
router
  .route("/cancel/booking/:bookingId")
  .post(verifyLogIntoken, cancelBooking);
router.route("/getAllBookings").get(verifyLogIntoken, getAllBookings);
module.exports = router;
