const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  allExpenses: {
    type: Number,
    default: 0,
  },
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
});

// Define a static method
userSchema.statics.findByIdAndUpdateAllExpenses = async function (
  lastAmount,
  newAmount,
  id
) {
  const user = await this.findOne({ where: { id } });
  user.allExpenses -= lastAmount;
  user.allExpenses += newAmount;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
