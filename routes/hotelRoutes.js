const express = require("express");
const router = express.Router();
const {
  newHotelListing,
  getAllHotels,
  getHotelsByLocation,
  hotelBooking,
  hotelReview,
} = require("../controller/hotelController");

router.route("/addHotel").post(newHotelListing);
router.route("/getAllHotels").get(getAllHotels);
router.route("/getHotelsByLocation/:location").get(getHotelsByLocation);
router.route("/booking").post(hotelBooking);
router.route("/hotelReview/:hotelId/:userId").post(hotelReview);
module.exports = router;
