const User = require("../model/User");
const DownloadExpensesList = require("../model/DownloadedExpenseList");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { uploadeToS3 } = require("../services/S3Services");
require("dotenv").config();

// @desc    Get All Users
// @route   GET /user/allusers
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
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
  try {
    const existingUser = await User.findAll({ where: { email: email } });
    if (existingUser.length)
      return res.json({ message: "Email already exists!" });
    else {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
      });

      const token = generateToken.generateToken(res, user.id);
      res.status(201).json({
        message: "User Created Successfully!",
        userDetails: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token: token,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Login User
// @route   POST /user/login
// @access  Public
exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findAll({ where: { email: email } });

    if (!existingUser.length)
      return res.json({ message: "User does not Exists!" });
    else {
      const user = existingUser[0];
      const token = generateToken.generateToken(res, user.id);
      const isCorrectPassword = bcrypt.compareSync(password, user.password);
      if (isCorrectPassword)
        return res.json({
          message: "User Logged in Successfully!",
          userDetails: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          token: token,
        });
      else return res.json({ message: "Wrong Credentials!" });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Logout User
// @route   POST /user/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  await res.cookie("jwt", "", {
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out!" });
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
        message: "not found",
      });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Download user total expenses
// @route   GET /user/downloadexpensesreport
// @access  Premium Users Only
exports.downloadExpensesReport = async (req, res, next) => {
  try {
    const userExpenses = await req.user.getExpenses();
    const fileName = `${req.user.id}/Expense${new Date().getTime()}.txt`;

    const data = JSON.stringify(userExpenses);

    const fileUrl = await uploadeToS3(data, fileName);

    await DownloadExpensesList.create({
      fileUrl: fileUrl,
      userId: req.user.id,
    });

    // await req.user.createDownloadExpensesList({ fileUrl: fileUrl });

    res.status(200).json({
      success: true,
      fileUrl,
      message: "Download Successful",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Download Failed", err: error });
  }
};

// @desc    Previously download expense List
// @route   GET /user/expense-report-downloaded-list
// @access  Premium Users Only
exports.getDownloadedExpenseList = async (req, res, next) => {
  const DownloadedExpList = await DownloadExpensesList.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  // console.log(DownloadedExpList);
  res.status(200).json({
    success: true,
    message: "getting list",
    expenseList: DownloadedExpList,
  });
};
