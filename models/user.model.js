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
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password_hash: {
      type: DataTypes.STRING(255),
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
      allowNull: true, // matches DEFAULT NULL in your SQL
      defaultValue: null, // no default in SQL
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // maps to tinyint DEFAULT '0'
    },

    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },

    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "users", // your SQL table is lowercase "users"
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
  },
);

User.prototype.comparePassword = async function (typedPassword) {
  return await bcrypt.compare(typedPassword, this.password_hash);
};

module.exports = User;
