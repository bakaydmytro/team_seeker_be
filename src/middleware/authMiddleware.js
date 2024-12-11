//middleware/authMiddleware.js
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

     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }, 
      });

      if (!req.user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});

module.exports = { protect };



