require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};
