const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  review: {
    type: String,
  },
  rating: {
    type: Number,
  },
  amenities: {
    type: [String],
    required: true,
  },
  totalRooms: {
    type: Number,
    required: true,
  },
  // rooms: [
  //   {
  //     name: {
  //       type: String,
  //       required: true,
  //     },
  //     description: {
  //       type: String,
  //       required: true,
  //     },
  //     price: {
  //       type: Number,
  //       required: true,
  //     },
  //     capacity: {
  //       type: Number,
  //       required: true,
  //     },
  //     amenities: {
  //       type: [String],
  //       required: true,
  //     },
  //   },
  // ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
