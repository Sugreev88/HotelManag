const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      maxlength: 200,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Customer"],
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          const regex = /^\d{10}$/;
          return regex.test(value);
        },
        message: "Phone number must be a 10-digit number.",
      },
    },
    token: {
      type: String,
    },
    otp: {
      type: String,
      index: { expires: 300 },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
