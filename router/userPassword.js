const express = require('express');
const {
  resetForgotPassword,
  createNewPassword,
  PostCreateNewPassword,
} = require('../controller/userPassword');

const router = express.Router();

router.post('/forgotpassword', resetForgotPassword);

router.get('/resetpassword/:id', createNewPassword);

router.post('/resetpassword/:id', PostCreateNewPassword);

module.exports = router;
