const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Driver = sequelize.define("Driver", {
  order_delivery_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Available", "Busy", "Offline"),
    defaultValue: "Available",
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  timestamps: false,
  tableName: "order_delivery",
});

module.exports = Driver;