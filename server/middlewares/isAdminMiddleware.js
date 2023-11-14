const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res
      .status(403)
      .send({ success: false, message: "Access denied. Admin only." });
  }
};

module.exports = isAdmin;
