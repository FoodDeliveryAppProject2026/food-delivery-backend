const { DataTypes } = require("sequelize");

// Put the path of (DatabaseFileName).js
const sequelize = require("../db");
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

    // --- COLUMN 2: First name___Second name ---
    FirstName: {
      type: DataTypes.STRING,     
      allowNull: false,           
    },
    
    LastName: {
      type: DataTypes.STRING,     
      allowNull: false,           
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
  },

  {
    // --- TABLE OPTIONS ---
    timestamps: true,       
    tableName: "users",     

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
  }
);


// -- ComparePassword --
User.prototype.comparePassword = async function (typedPassword) {
  return await bcrypt.compare(typedPassword, this.password);
};

module.exports = User;