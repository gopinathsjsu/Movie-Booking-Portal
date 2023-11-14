const router = require("express").Router();
const stripe = require("stripe")(process.env.stripe_key);
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const {
  updateMembershipStatus,
  updateRewardPoints,
} = require("../middlewares/membesrhipMiddleware");

// make payment
router.post("/make-payment", authMiddleware, async (req, res) => {
  try {
    const {
      token: token,
      show: showId,
      seats: seats,
      user: user,
      useRewardpoints: useRewardpoints,
    } = req.body.payload;

    const show = await Show.findById(showId);
    const ticketPrice = show.ticketPrice; // Assuming Show model has a ticketPrice field
    const totalCost = seats.length * ticketPrice;
    let amountToCharge = totalCost;

    if (
      user.membershipType !== "Guest" &&
      user.rewardPoints &&
      useRewardpoints
    ) {
      amountToCharge = Math.max(0, amountToCharge - user.rewardPoints);
    }

    if (amountToCharge > 0) {
      const customer = await stripe.customers.create({
        email: token.email,
        source: token.id,
      });

      const charge = await stripe.charges.create({
        amount: amountToCharge * 100, // Convert to cents for Stripe
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: "Ticket Booked for Movie",
      });

      res.send({
        success: true,
        message: "Payment successful",
        data: charge.id,
      });
    } else {
      // No charge needed
      res.send({
        success: true,
        message: "No payment required",
        data: null,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// book shows
router.post("/book-show", authMiddleware, async (req, res) => {
  try {
    const {
      seats: seats,
      show: showId,
      transactionId: transactionId,
      useRewardpoints: useRewardpoints,
    } = req.body;
    const user = req.user;
    const show = await Show.findById(showId);
    const ticketPrice = show.ticketPrice; // Assuming Show model has a ticketPrice field
    const totalCost = seats.length * ticketPrice;
    let amountToPay = totalCost;
    let usedRewardPoints = 0;

    if (user.membershipType !== "Guest" || useRewardpoints) {
      if (user.rewardPoints >= totalCost) {
        // Deduct reward points if user is Premium and has enough points
        usedRewardPoints = totalCost;
        amountToPay = 0;
        user.rewardPoints -= totalCost;
        await user.save();
      } else {
        // Partially use reward points if not sufficient
        usedRewardPoints = user.rewardPoints;
        amountToPay -= usedRewardPoints;
        user.rewardPoints = amountToPay;
        await user.save();
      }
    }
    // Create the booking
    const newBooking = new Booking({
      show: showId,
      user: req.user._id,
      seats,
      transactionId, // This can be empty if no Stripe payment was needed
    });
    await newBooking.save();

    // update seats
    await Show.findByIdAndUpdate(req.body.show, {
      bookedSeats: [...show.bookedSeats, ...req.body.seats],
    });

    res.send({
      success: true,
      message: "Show booked successfully",
      data: newBooking,
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

// get all bookings by user
router.get("/get-bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user })
      .populate("show")
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "movies",
        },
      })
      .populate("user")
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "theatres",
        },
      });

    res.send({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Delete a booking
router.post("/delete-booking", authMiddleware, async (req, res) => {
  try {
    console.log(req.body.tId);
    await Booking.findByIdAndDelete(req.body.tId);

    res.send({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
