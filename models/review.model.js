const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define("Review", {
  review_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  timestamps: true,
  tableName: "reviews",
  createdAt: "created_at",
  updatedAt: false,
});

module.exports = Review;