const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = {
  // Verify Token
  verifyToken(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Token is not valid" });
    }
  },

  // Check Role
  checkRole(role) {
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    };
  },
};

module.exports = auth;