const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define("Customer", {
  customer_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  default_latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  default_longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  default_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  timestamps: false,
  tableName: "customers",
});

module.exports = Customer;