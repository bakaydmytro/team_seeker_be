const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../../models");

const steamProtect = asyncHandler(async (req, res, next) => {
  let token;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
     
      token = req.headers.authorization.split(" ")[1];

     
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

     
      const user = await User.findOne({
        where: { id: decoded.id },
        attributes: ["id", "username", "steamid", "avatar_url", "profile_url"], 
      });

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      
      req.user = user;

      next(); 
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401);
      throw new Error("Not Authorized");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});

module.exports = { steamProtect };
