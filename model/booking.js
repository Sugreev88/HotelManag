const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numGuests: {
      type: Number,
      required: true,
    },
    rooms: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
