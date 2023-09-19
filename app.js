const express = require("express");

const mongoose = require("mongoose");

const path = require("path");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT || 3000;

//Routers
const userRouter = require("./router/user");
// const userPasswordRouter = require("./router/userPassword");
const expenseRouter = require("./router/expense");
// const orderRouter = require("./router/order");

// Models
const User = require("./model/User");
// const Expenses = require("./model/Expense");
// const Order = require("./model/Order");
// const ForgotPasswordRequest = require("./model/ForgotPasswordRequests");
// const DownloadExpensesList = require("./model/DownloadedExpenseList");

const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRouter);
// app.use("/password", userPasswordRouter);
app.use("/expenses", expenseRouter);
// app.use("/orders", orderRouter);

app.use((req, res, next) => {
  res.status(400).json({ message: "page not found" });
});

/* User.hasMany(Expenses);
Expenses.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});

User.hasMany(DownloadExpensesList);
DownloadExpensesList.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
}); */

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`server is running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
