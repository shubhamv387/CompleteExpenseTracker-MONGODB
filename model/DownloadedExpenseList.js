const DataType = require("sequelize");
const sequelize = require("../utils/database");

const DownloadExpensesList = sequelize.define("downloadexpenseslist", {
  id: {
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  fileUrl: {
    type: DataType.STRING,
    allowNull: false,
  },
});

module.exports = DownloadExpensesList;
