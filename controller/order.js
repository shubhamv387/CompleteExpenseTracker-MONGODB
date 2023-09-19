const Razorpay = require("razorpay");
const Order = require("../model/Order");

exports.purchasepremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      await Order.create({
        orderId: order.id,
        status: "PENDING",
        userId: req.user._id,
      });
      return res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTrnasectionStatus = async (req, res, next) => {
  let payment_id = req.body.error
    ? req.body.error.metadata.payment_id
    : req.body.payment_id;

  let order_id = req.body.error
    ? req.body.error.metadata.order_id
    : req.body.order_id;

  try {
    const order = await Order.findOne({ orderId: order_id });
    order.paymentId = payment_id;

    if (req.body.error) {
      order.status = "FAILED";
      await order.save();

      return res
        .status(200)
        .json({ success: false, message: "Transection Failed" });
    }

    order.status = "SUCCESSFULL";
    req.user.isPremium = true;
    req.user.orders.push(order._id);

    const updatedOrder = order.save();
    const updatedUser = req.user.save();

    await Promise.all([updatedOrder, updatedUser]);

    return res.status(200).json({
      userName: req.user.name,
      success: true,
      message: "Transection successfull",
    });
  } catch (error) {
    console.log(err);
  }
};

exports.getAllOrders = (req, res, next) => {
  res.json({ message: "getting all orders" });
};
