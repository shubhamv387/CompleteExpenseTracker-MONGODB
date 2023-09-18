const express = require("express");
const orderController = require("../controller/order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/premiummembership",
  authMiddleware.authUser,
  orderController.purchasepremium
);

router.post(
  "/updatetrnasectionstatus",
  authMiddleware.authUser,
  orderController.updateTrnasectionStatus
);

module.exports = router;
