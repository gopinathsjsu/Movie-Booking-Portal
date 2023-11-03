const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.jwt_secret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).send({ success: false, message: "Invalid token" });
    }

    req.user = user; // Add the user object to the request
    next();
  } catch (error) {
    res.status(401).send({ success: false, message: "Invalid token" });
  }
};
