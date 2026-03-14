const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },

    role: {
      type: DataTypes.ENUM("Customer", "Vendor", "Admin"),
      allowNull: false,
      defaultValue: "Customer",
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // --- order_delivery_id ---
    order_delivery_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Users",
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      },

      beforeUpdate: async (user) => {
        if (user.changed("password_hash")) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (typedPassword) {
  return await bcrypt.compare(typedPassword, this.password_hash);
};

module.exports = User;