const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema({
  paymentId: {
    type: String,
  },
  orderId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
