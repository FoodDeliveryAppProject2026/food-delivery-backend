require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const app = express();

// ─── Security Headers ────────────────────────────────
app.use(helmet()); // ✅ adds

// ─── CORS ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true  // ✅ add this if frontend sends cookies
}));

// ─── Rate Limiting ───────────────────────────────────
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10,                   // max 10 requests per window
//   message: { success: false, message: "Too many attempts. Try again later." }
// });
// app.use('/auth', authLimiter); // ✅ protects login/register from brute force

// ─── Body Parsing ────────────────────────────────────
app.use(express.json());

// ─── Logging ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // ✅ logs requests in terminal
}

// ─── Routes ──────────────────────────────────────────
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require("./routes/customer.routes");
const homeRoutes = require('./routes/vendor.routes');
const menuRoutes = require('./routes/menu.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const driverRoutes = require("./routes/driver.routes");

app.use('/auth', authRoutes);
app.use("/customer", customerRoutes);
app.use('/home', homeRoutes);
app.use('/home', menuRoutes);
app.use('/cart', cartRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/driver", driverRoutes);

// ─── 404 Handler ─────────────────────────────────────
app.use((req, res) => {                       // ✅ unknown routes
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {            // ✅ catches all thrown errors
  console.error("🔥", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ─── DB + Server Start ───────────────────────────────
sequelize.sync({ force: false })
  .then(() => console.log('✅ Database synced'))
  .catch((err) => console.error('❌ Database sync failed:', err));

const port = process.env.PORT;  // ✅ fallback port
app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}/`);
});