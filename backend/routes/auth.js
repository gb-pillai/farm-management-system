const express = require("express");
const router = express.Router();
const User = require("../models/User");

/*
  Phase-2 Authentication
  ----------------------
  - Signup (register farmer)
  - Login using MongoDB
  - No tokens (simple phase)
*/

/* -------------------- SIGNUP -------------------- */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Create new user
    const newUser = new User({
      username,
      password
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

/* -------------------- LOGIN -------------------- */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Find user in database
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;
