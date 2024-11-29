//routes/userRoutes
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  steamLogin,
  steamRedirect,
} = require("../controllers/userController");
const { protect, } = require("../middleware/authMiddleware");


router.post("/signup", registerUser); 
router.post("/login", loginUser); 
router.get("/me", protect, getLoggedInUser); 
router.get("/steam", steamLogin);
router.get('/steam/authenticate', steamRedirect);


module.exports = router;
