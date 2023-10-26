const jwt = require('jsonwebtoken');
const User = require('../model/User');

exports.authUser = async (req, res, next) => {
  // console.log(req.headers.authorization);
  let token = req.headers.authorization;
  try {
    if (token) {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findOne({ _id: userId }).select('-password');

      if (!user)
        return res.status(401).json({
          status: 'Failed',
          message: 'Not User Found, Please Login again',
        });

      // console.log(user);
      req.user = user;
      next();
    } else {
      return res
        .status(401)
        .json({ status: 'Failed', message: 'Not authorized, no token' });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ status: 'Failed', message: 'Not authorized, invalid token' });
  }
};
