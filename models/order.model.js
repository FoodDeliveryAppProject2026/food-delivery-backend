const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define("Order", {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"),
    defaultValue: "Pending",
  },
  total_amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM("COD", "Online"),
    defaultValue: "COD",
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  delivery_lat: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  delivery_long: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  placed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  timestamps: false,
  tableName: "orders",
});

module.exports = Order;