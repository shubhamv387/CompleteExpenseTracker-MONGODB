const express = require("express");
const userController = require("../controller/user");
const authMiddleware = require("../middleware/authMiddleware");
const isAdminMiddleware = require("../middleware/isAdmin");
const isPremiumUser = require("../middleware/isPremium");

const router = express.Router();

router.get(
  "/allusers",
  authMiddleware.authUser,
  isAdminMiddleware.isAdmin,
  userController.getAllUsers
);

router.post("/signup", userController.userSignup);

router.post("/login", userController.userLogin);

router.post("/logout", userController.logoutUser);

router
  .route("/profile")
  .get(authMiddleware.authUser, userController.getUserProfile)
  .put(authMiddleware.authUser, userController.updateUserProfile);

router.get(
  "/downloadexpensesreport",
  authMiddleware.authUser,
  isPremiumUser.isPremiumUser,
  userController.downloadExpensesReport
);

router.get(
  "/expense-report-downloaded-list",
  authMiddleware.authUser,
  isPremiumUser.isPremiumUser,
  userController.getDownloadedExpenseList
);

module.exports = router;
