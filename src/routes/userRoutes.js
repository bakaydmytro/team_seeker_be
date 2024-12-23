// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  steamLogin,
  steamRedirect,
  getRecentlyPlayedGames,
  searchUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { steamProtect } = require("../middleware/steamAuth");

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 description: User email
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: User's birthday
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: An error occurred during registration
 */
router.post("/signup", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid login data
 *       404:
 *         description: User not found
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
 *     responses:
 *       200:
 *         description: Information about the current user
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getLoggedInUser);

/**
 * @swagger
 * /api/users/steam:
 *   get:
 *     summary: Initiate Steam login
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirect to Steam login page
 */
router.get("/steam", steamLogin);

/**
 * @swagger
 * /api/users/steam/authenticate:
 *   get:
 *     summary: Handle redirect after Steam login
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirect to the main page
 */
router.get('/steam/authenticate', steamRedirect);

/**
 * @swagger
 * /api/users/game-history:
 *   get:
 *     summary: Retrieve user's game history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game history retrieved successfully
 *       404:
 *         description: No game history found
 *       401:
 *         description: Unauthorized
 */
router.get('/game-history', steamProtect, getRecentlyPlayedGames);

router.put("/:id", updateUser);  
router.get("/search", protect, searchUsers); 

module.exports = router;





