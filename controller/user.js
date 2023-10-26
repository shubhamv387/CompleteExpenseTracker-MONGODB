const User = require('../model/User');
const bcrypt = require('bcryptjs');
const { uploadeToS3 } = require('../services/S3Services');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Expense = require('../model/Expense');

// @desc    Get All Users
// @route   GET /user/allusers
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

// @desc    Sign Up User
// @route   POST /user/signup
// @access  Public
exports.userSignup = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.json({ message: 'Email already exists!' });

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    await user.save({ session });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '30d',
    });

    // throw new Error("custom error");

    await session.commitTransaction();
    res.status(201).json({
      message: 'User Created Successfully!',
      userDetails: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    await session.abortTransaction();
    console.log(err.message.underline.red);
  } finally {
    await session.endSession();
  }
};

// @desc    Login User
// @route   POST /user/login
// @access  Public
exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) return res.json({ message: 'User does not Exists!' });
    else {
      const user = existingUser;

      const isCorrectPassword = bcrypt.compareSync(password, user.password);

      if (isCorrectPassword) {
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: '30d',
          }
        );
        return res.json({
          message: 'User Logged in Successfully!',
          userDetails: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          token,
        });
      } else return res.json({ message: 'Wrong Credentials!' });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Logout User
// @route   POST /user/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  await res.cookie('jwt', '', {
    expires: new Date(0),
  });

  res.status(200).json({ message: 'User logged out!' });
};

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  const { id, name, email, phone } = req.user;

  res.status(200).json({ id, name, email, phone });
};

// @desc    Update user profile
// @route   PUT /user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const users = await User.findOne({ where: { id: req.user.id } });
    let newUser;
    if (users) {
      newUser = { ...users[0] };

      newUser.name = req.body.name || newUser.name;
      newUser.email = req.body.email || newUser.email;
      newUser.phone = req.body.phone || newUser.phone;
    }
    // if (req.body.password) {
    //   const newHashedPassword = bcrypt.hashSync(req.body.password, 10);
    //   newUser.password = newHashedPassword;
    // }
    await User.update(newUser, { where: { id: req.user.id } });
    const updatedUser = await User.findOne({ where: { id: req.user.id } });
    if (updatedUser)
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    else
      res.json({
        message: 'not found',
      });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Download user total expenses
// @route   GET /user/downloadexpensesreport
// @access  Premium Users Only
exports.downloadExpensesReport = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // const userExpenses = await req.user.populate("expenses");
    const userExpenses = await Expense.find().select('-_id -userId');
    const fileName = `${req.user._id}/Expense${new Date().getTime()}.txt`;

    const data = JSON.stringify(userExpenses);

    const fileUrl = await uploadeToS3(data, fileName);

    req.user.DownloadExpensesList.push({
      fileUrl,
    });

    await req.user.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      fileUrl,
      message: 'Download Successful',
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error.message.underline.red);
    res
      .status(500)
      .json({ success: false, message: 'Download Failed', err: error });
  } finally {
    await session.endSession();
  }
};

// @desc    Previously download expense List
// @route   GET /user/expense-report-downloaded-list
// @access  Premium Users Only
exports.getDownloadedExpenseList = async (req, res, next) => {
  req.user.DownloadExpensesList.sort((a, b) => b.createdAt - a.createdAt);

  res.status(200).json({
    success: true,
    message: 'getting list',
    expenseList: req.user.DownloadExpensesList,
  });
};
