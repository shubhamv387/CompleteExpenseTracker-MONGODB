const DataType = require("sequelize");
const sequelize = require("../utils/database");

const Order = sequelize.define("order", {
  id: {
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  paymentId: DataType.STRING,
  orderId: DataType.STRING,
  status: DataType.STRING,
});

module.exports = Order;
