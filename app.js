const express = require("express");
const { connectdb } = require("./utils/database");

const path = require("path");
const cors = require("cors");
require("colors");

require("dotenv").config();
const PORT = process.env.PORT || 3000;

//Routers
const userRouter = require("./router/user");
const userPasswordRouter = require("./router/userPassword");
const expenseRouter = require("./router/expense");
const orderRouter = require("./router/order");

const app = express();
app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRouter);
app.use("/password", userPasswordRouter);
app.use("/expenses", expenseRouter);
app.use("/orders", orderRouter);

app.use((req, res, next) => {
  res.status(400).json({ message: "page not found" });
});

connectdb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `server is running on http://localhost:${PORT}`.underline.cyan
      );
    });
  })
  .catch((err) => console.log(err));
