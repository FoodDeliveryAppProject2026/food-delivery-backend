const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to MySQL via Sequelize"))
  .catch((err) => console.error("❌ Connection failed:", err));

module.exports = sequelize;