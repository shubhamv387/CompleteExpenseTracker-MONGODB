const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();

exports.authUser = async (req, res, next) => {
  // console.log(req.headers.authorization);
  let token = req.headers.authorization;
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findOne({
        where: { id: decoded.userId },
        attributes: [
          "id",
          "name",
          "email",
          "phone",
          "isPremium",
          "allExpenses",
        ],
      });
      // console.log(user);
      if (user) req.user = user;
      else
        return res.status(401).json({
          status: "Failed",
          message: "Not User Found, Please Login again",
        });
      next();
    } else {
      return res
        .status(401)
        .json({ status: "Failed", message: "Not authorized, no token" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ status: "Failed", message: "Not authorized, invalid token" });
  }
};
