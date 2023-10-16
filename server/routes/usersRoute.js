const router = require("express").Router();
const User = require("../models/userModel");
const stripe = require("stripe")(process.env.stripe_key);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const { response } = require("express");

// register a new user
router.post("/register", async (req, res) => {
  try {
    // check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        success: false,
        message: "User already exists",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // save the user
    const newUser = new User(req.body);
    await newUser.save();

    res.send({
      success: true,
      message: "Registration Successfull , Please login",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// login a user
router.post("/login", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }

    // check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid password",
      });
    }

    // create and assign a token
    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
      expiresIn: "1h",
    });
    // console.log(token);

    res.send({
      success: true,
      message: "User logged in successfully",
      data: token,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get user details by id
router.get("/get-current-user", authMiddleware, async (req, res) => {
  try {
    res.send({
      success: true,
      message: "User details fetched successfully",
      data: req.user,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});


router.post("/make-payment", authMiddleware, async (req, res) => {
  try {

    const {
      token: token,
      user: user,
    } = req.body;    

    
      // Your payment logic here
      // For example, processing payment and updating user status
        const customer = await stripe.customers.create({
          email: token.email,
          source: token.id,
        });
  
      const charge = await stripe.charges.create({
        amount: 15 * 100, // Convert to cents for Stripe
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: "Ticket Booked for Movie",
      });

      const db_user = await User.findById(req.body.user);      
      db_user.membershipType = "Premium";    
      await db_user.save();
      res.send({
        success: true,
        message: "Payment successful",
        data: req.body.user,
      });

    } catch (error) {
    console.log("Error: ",error.message);
      res.status(500).send({
          success: false,
          message: "Payment processing failed",
          error: error.message
      });

  }
});


router.get("/get-premium", authMiddleware, async (req, res) => {
  try {
    console.log("Loggin User Details: ")
    console.log(user);
    const user = await User.findById(req.body.user._id);
    user.membershipType = "Premium";    
    await user.save();
    res.send({
      success: true,
      message: "Payment successful",
      data: user.id,
    });

  } catch (error) {
    res.status(500).send({ message: "Payment Failed" });
  }
});

module.exports = router;
