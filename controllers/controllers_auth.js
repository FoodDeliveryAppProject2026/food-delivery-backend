const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const createToken = (user) => {
  console.log("JWT_EXPIRES_TIME:", process.env.JWT_EXPIRES_TIME);
  return jwt.sign({ userId: user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
//Sign Up first & last name , email , passward
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    //email and password and first name and last name are required
    if (!email || !password || !first_name || !last_name)
      return res
        .status(400)
        .send("First name , Last name , Email and password are required");

    //email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).send("Invalid email format must be email@domain");

    //password length
    if (password.length < 8)
      return res.status(400).send("Password must be at least 8 characters");

    //password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password))
      return res
        .status(400)
        .send(
          "Password must contain at least one number, small and capital letter , special character",
        );

    //check if user (email) exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).send({ message: err.message });
        if (results.length > 0) {
          return res.status(400).send("Email already exists"); //email already exists
        }

        //hash password
        const hashPassword = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO users (first_name, last_name ,email, password_hash) VALUES (?, ?, ?, ?)",
          [first_name, last_name, email, hashPassword],
          (err, result) => {
            if (err) return res.status(500).send({ message: err.message });
            //jwt token
            const token = createToken(result.insertId);
            res.status(201).json({ message: "Registered successfully", token }); //201 created new user successfully
          },
        );
      },
    );
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
//sign in email & password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    //400 Bad Request missing fields

    //check if user exists & check password correct
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).send({ message: err.message }); //500 Internal Server Error
        if (results.length === 0) {
          return res.status(401).send("Invalid email or password"); //401 Unauthorized email is not found
        }
        //check password validation
        const findUser = results[0];
        const validPassword = await bcrypt.compare(
          password,
          findUser.password_hash,
        );
        if (!validPassword) {
          return res.status(401).send({ message: "Invalid email or password" }); //401 Unauthorized password is not correct
        }
        const token = createToken(findUser.user_id);
        res.status(200).json({ message: "Login successful", token }); //200 OK login
      },
    );
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
