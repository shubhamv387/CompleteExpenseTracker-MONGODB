const Brevo = require('sib-api-v3-sdk');
const ForgotPasswordRequest = require('../model/ForgotPasswordRequests');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const mongoose = require('mongoose');
const path = require('path');

// @desc    Sending password reset mail to User
// @route   POST /user/password/forgotpassword
// @access  Public
exports.resetForgotPassword = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res
        .status(400)
        .json({ status: 'Failed', message: 'email does not Exists!' });

    const id = uuidv4();
    const FPR = new ForgotPasswordRequest({
      isActive: true,
      userId: user._id,
      id,
    });

    await FPR.save({ session });

    const defaultClient = await Brevo.ApiClient.instance;

    // Configure API key authorization: api-key
    const apiKey = defaultClient.authentications['api-key'];
    const transEmailApi = new Brevo.TransactionalEmailsApi();

    await Promise.all([apiKey, transEmailApi]);

    apiKey.apiKey = process.env.BREVO_API_KEY;

    const path = `http://localhost:3000/password/resetpassword/${id}`;

    const sender = {
      email: 'shubhamv387@gmail.com',
      name: 'Shubhamv K',
    };
    const receivers = [req.body];

    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'reset password mail',
      textContent: 'Click here to reset your password',
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: 'Success', message: 'email sent successfully!' });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.message.underline.red);
  } finally {
    await session.endSession();
  }
};

// @desc    Reset Forgot Password
// @route   GET /user/password/resetpassword/:id
// @access  Private
exports.createNewPassword = async (req, res, next) => {
  try {
    const FPR = await ForgotPasswordRequest.findOne({ id: req.params.id });
    if (!FPR)
      return res
        .status(400)
        .json({ status: 'failed', message: 'invalid link' });

    return res
      .status(200)
      .sendFile(
        path.join(process.cwd(), 'public/forgotpass/forgotpassword.html')
      );
  } catch (error) {
    console.error(error);
  }
};

// @desc    Reset Forgot Password
// @route   POST /user/password/resetpassword/:id
// @access  Private
exports.PostCreateNewPassword = async (req, res, next) => {
  const { pass, confirmPass } = req.body;
  const session = await mongoose.startSession();

  if (pass !== confirmPass)
    return res
      .status(400)
      .send({ status: 'Failed', message: 'MisMatched Passwords!' });

  try {
    session.startTransaction();

    const FPR = await ForgotPasswordRequest.findOne({ id: req.params.id });

    if (!FPR)
      return res
        .status(400)
        .json({ status: 'failed', message: 'invalid link' });

    if (!FPR.isActive) {
      return res.status(400).send({
        status: 'Failed',
        message: 'Link Expired! Go back and generate a New Link',
      });
    }

    FPR.isActive = false;

    const hashedPassword = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));

    const updatedUser = User.updateOne(
      { _id: FPR.userId },
      { $set: { password: hashedPassword } },
      { session }
    );

    // updating user and FPR parallelly using Promise.all
    await Promise.all([FPR.save({ session }), updatedUser]);

    // throw new Error("custome error");

    await session.commitTransaction();
    res
      .status(200)
      .send({ status: 'Success', message: 'Password Updated Successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.log('line 136', error.message.underline.red);
  } finally {
    await session.endSession();
  }
};
