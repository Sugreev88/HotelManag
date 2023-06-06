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

router.route("/addHotel").post(newHotelListing);
router.route("/getAllHotels").get(getAllHotels);
router.route("/getHotelsByLocation/:location").get(getHotelsByLocation);
router.route("/booking").post(hotelBooking);
router.route("/review/:hotelId/:userId").post(hotelReview);
router.route("/update").patch(updateHotel);
router.route("/delete/:hotelId/:userId").delete(deactivateHotel);
router.route("/cancel/booking/:bookingId").post(cancelBooking);
router.route("/getAllBookings/:userId").get(getAllBookings);
module.exports = router;
