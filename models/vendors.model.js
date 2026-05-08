const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vendor = sequelize.define("Vendor", {
  vendor_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  store_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
  application_status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
  },
},
{
  timestamps: false,
  tableName: "vendors",
});

module.exports = Vendor;