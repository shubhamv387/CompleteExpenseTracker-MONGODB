const express = require('express');
const {
  getAllUsers,
  userSignup,
  userLogin,
  downloadExpensesReport,
  getDownloadedExpenseList,
} = require('../controller/user');
const { authUser } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/isAdmin');
const { isPremiumUser } = require('../middleware/isPremium');

const router = express.Router();

router.get('/allusers', authUser, isAdmin, getAllUsers);

router.post('/signup', userSignup);

router.post('/login', userLogin);

// router
//   .route("/profile")
//   .get(authUser, getUserProfile)
//   .put(authUser, updateUserProfile);

router.get(
  '/downloadexpensesreport',
  authUser,
  isPremiumUser,
  downloadExpensesReport
);

router.get(
  '/expense-report-downloaded-list',
  authUser,
  isPremiumUser,
  getDownloadedExpenseList
);

module.exports = router;
