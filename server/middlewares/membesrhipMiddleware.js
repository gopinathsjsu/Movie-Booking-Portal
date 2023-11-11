const User = require("../models/userModel");

const updateMembershipStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.membershipType === "Premium") {
      user.serviceFeeWaiver = true;
    }

    await user.save();
    next();
  } catch (error) {
    res.status(500).send({ message: "Error updating membership status" });
  }
};

const updateRewardPoints = async (userId, points) => {
  try {
    const user = await User.findById(userId);

    if (user.membershipType !== "Guest") {
      user.rewardPoints += points;
      if (user.rewardPoints < 0) {
        user.rewardPoints = 0;
      }
    }
    await user.save();
  } catch (error) {
    console.error("Error updating reward points:", error);
  }
};

module.exports = { updateMembershipStatus, updateRewardPoints };
