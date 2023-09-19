const mongoose = require("mongoose");

const ForgotPasswordRequestSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model(
  "ForgotPasswordRequest",
  ForgotPasswordRequestSchema
);
