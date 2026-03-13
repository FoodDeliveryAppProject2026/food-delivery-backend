const { DataTypes } = require("sequelize");

// Put the path of (DatabaseFileName).js
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

//Define the Model
const User = sequelize.define(
  "User", // the model name —> Sequelize will create a table called "users" (lowercase + plural)
  {
    // --- COLUMN 1: id ---
    // This is the PRIMARY KEY
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // --- COLUMN 2: First name___Last name ---
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
      //this set is to avoid additional unnecessary spaces "   John   " -> "John"
      set(value) {
        const trimmed = value.trim();
        this.setDataValue(
          "FirstName",
          trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
        );
      }
    },

    LastName: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const trimmed = value.trim();
        this.setDataValue(
          "LastName",
          trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
        );
      }
    },

    // --- COLUMN 3: email ---
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    // --- COLUMN 4: password ---
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // --- COLUMN 5: phone number ---
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },
      // --- NEW: role ---
    role: {
      type: DataTypes.ENUM("Customer", "Vendor", "Admin"),
      allowNull: false,
      defaultValue: "Customer",
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },

  {
    // --- TABLE OPTIONS ---
    timestamps: true,
    tableName: "Users",

    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },

      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// -- ComparePassword --
User.prototype.comparePassword = async function (typedPassword) {
  return await bcrypt.compare(typedPassword, this.password);
};

module.exports = User;
