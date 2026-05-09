require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

// allows to show data in json
app.use(express.json());

// allows back-end to communicate with front-end
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

// import db connection
const sequelize = require("./config/db");

// import routes
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const customerRoutes = require("./routes/customer.routes");
app.use("/customer", customerRoutes);

const homeRoutes = require("./routes/vendor.routes");
app.use("/home", homeRoutes);

// sync database
sequelize
  .sync({ force: false })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Database sync failed:", err));

// listen on port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
