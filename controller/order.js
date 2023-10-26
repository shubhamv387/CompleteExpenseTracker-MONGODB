const Razorpay = require('razorpay');
const Order = require('../model/Order');
const mongoose = require('mongoose');

exports.purchasepremium = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: 'INR' }, async (err, order) => {
      if (err) {
        throw new Error(err);
      }
      const newOrder = new Order({
        orderId: order.id,
        status: 'PENDING',
        userId: req.user._id,
      });

      await newOrder.save({ session });

      await session.commitTransaction();
      await session.endSession();
      return res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(error.message.underline.red);
    await session.endSession();
    return res.status(403).json({ success: false, message: error.message });
  }
};

exports.updateTrnasectionStatus = async (req, res, next) => {
  const session = await mongoose.startSession();

  let payment_id = req.body.error
    ? req.body.error.metadata.payment_id
    : req.body.payment_id;

  let order_id = req.body.error
    ? req.body.error.metadata.order_id
    : req.body.order_id;

  try {
    session.startTransaction();
    const order = await Order.findOne({ orderId: order_id });
    order.paymentId = payment_id;

    if (req.body.error) {
      order.status = 'FAILED';
      await order.save({ session });

      await session.commitTransaction();
      return res
        .status(200)
        .json({ success: false, message: 'Transection Failed' });
    }

    order.status = 'SUCCESSFULL';
    req.user.isPremium = true;
    req.user.orders.push(order._id);

    const updatedOrder = order.save({ session });
    const updatedUser = req.user.save({ session });

    await Promise.all([updatedOrder, updatedUser]);

    await session.commitTransaction();
    return res.status(200).json({
      userName: req.user.name,
      success: true,
      message: 'Transection successfull',
    });
  } catch (error) {
    await session.abortTransaction();
    console.log(err.message.underline.red);
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.endSession();
  }
};

exports.getAllOrders = (req, res, next) => {
  res.json({ message: 'getting all orders' });
};
