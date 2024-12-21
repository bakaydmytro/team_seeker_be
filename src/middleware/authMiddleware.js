const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../../models").User;

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token Received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      req.user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "email", "birthday"],
      });

      if (!req.user) {
        console.log("User not found in DB");
        res.status(404);
        throw new Error("User not found");
      }

      console.log("User Authenticated:", req.user);
      next();
    } catch (error) {
      console.error("Error during token validation:", error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  } else {
    console.log("No token provided");
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});


module.exports = { protect };





