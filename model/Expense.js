const DataType = require("sequelize");
const sequelize = require("../utils/database");

const Expense = sequelize.define("expense", {
  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: {
    type: DataType.DOUBLE,
    allowNull: false,
  },
  description: {
    type: DataType.TEXT,
    allowNull: false,
  },
  category: {
    type: DataType.ENUM,
    values: ["Fuel", "Food", "Electricity", "Movie"],
    allowNull: false,
  },
});

module.exports = Expense;
