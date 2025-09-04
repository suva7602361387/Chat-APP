
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.secureRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token; // ✅ Use the correct cookie name
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Make sure JWT_SECRET is used consistently
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password"); // ✅ Match your token payload structure
    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }

    req.user = user;
    next(); // move to next middleware/controller
  } catch (error) {
    console.error("Error in secureRoute middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
