const express = require('express');
const {
  purchasePremium,
  updateTransactionStatus,
} = require('../controller/order');
const { authUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/premiummembership', authUser, purchasePremium);

router.post('/updatetrnasectionstatus', authUser, updateTransactionStatus);

module.exports = router;
