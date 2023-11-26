const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
  // User Registration
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      // Validation (simplified for brevity)
      if (!email || !password || !username) {
        return res.status(400).json({ message: "Please enter all fields" });
      }
      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
      // Create and save the user
      const user = new User({ username, email, password });
      await user.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // User Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Create JWT token
      const token = jwt.sign(
        { id: user._id, membership: user.membership, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
