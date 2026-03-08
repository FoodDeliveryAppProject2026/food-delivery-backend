// FILE: routes/auth.js
const express = require("express");
const router = express.Router();
//the path of the controller
const { register, login } = require("./auth.controller");

// POST /api/auth/register → calls register()
router.post("/register", register);

// POST /api/auth/login → calls login()
router.post("/login", login);

module.exports = router;