const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
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
    },
    password: {
      type: String,
      required: true,
      min: 6,
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
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    DownloadExpensesList: [childSchema],
  },
  { versionKey: false }
);

// Define a static method
userSchema.methods.findByIdAndUpdateAllExpenses = async function (
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
