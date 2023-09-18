const DataType = require("sequelize");
const sequelize = require("../utils/database");

const User = sequelize.define("user", {
  id: {
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataType.STRING,
    allowNull: false,
  },
  email: {
    type: DataType.STRING,
    allowNull: false,
  },
  password: {
    type: DataType.STRING,
    allowNull: false,
  },
  phone: {
    type: DataType.STRING,
    allowNull: false,
  },
  isPremium: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
  allExpenses: {
    type: DataType.DOUBLE,
    defaultValue: 0,
  },
});

// Define a static method
User.findByIdAndUpdateAllExpenses = async function (lastAmount, newAmount, id) {
  const user = await this.findOne({ where: { id } });
  user.allExpenses -= lastAmount;
  user.allExpenses += newAmount;
};

module.exports = User;
