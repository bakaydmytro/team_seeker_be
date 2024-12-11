//routes/userRoutes
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  searchUsers 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", registerUser); // should be sign up /api/signup
router.post("/login", loginUser); // /api/login
router.get("/me", protect, getLoggedInUser); //api/users/me
router.put("/:id", updateUser);  //api/users/{id}
router.get("/search", protect, searchUsers); //api/users/search?query=

module.exports = router;

