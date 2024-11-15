//routes/userRoutes
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", registerUser); // should be sign up /api/signup
router.post("/login", loginUser); // /api/login
router.get("/me", protect, getLoggedInUser); //api/user/{id}

module.exports = router;
