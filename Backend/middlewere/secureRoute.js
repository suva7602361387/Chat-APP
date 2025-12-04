const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.secureRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookie or Authorization header
         console.log("This is token1:",req.cookies.token);

    const token =
      req.cookies?.token || // from cookie
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 3. Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in secureRoute middleware:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
