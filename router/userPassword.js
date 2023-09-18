const express = require("express");
const passwordController = require("../controller/userPassword");

const router = express.Router();

router.post("/forgotpassword", passwordController.resetForgotPassword);

router.get("/resetpassword/:id", passwordController.createNewPassword);

router.post("/resetpassword/:id", passwordController.PostCreateNewPassword);

module.exports = router;
