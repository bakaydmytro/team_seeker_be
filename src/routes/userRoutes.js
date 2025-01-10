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

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided information. All fields are required, and the email must be unique.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - birthday
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the user.
 *                 example: johndoe123
 *               email:
 *                 type: string
 *                 description: Valid email address for the user. Must be unique.
 *                 example: johndoe@example.com
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: The user's birthdate in YYYY-MM-DD format.
 *                 example: 1990-05-15
 *               password:
 *                 type: string
 *                 description: A secure password. Minimum 8 characters.
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe123
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       example: 1990-05-15
 *       400:
 *         description: An error occurred during registration (e.g., missing fields, invalid input, or email already in use).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email already in use.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.post("/signup", registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with their email and password, returning a token upon successful login.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address associated with the user's account.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's account password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful. Returns the user's information and authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 token:
 *                   type: string
 *                   description: A JWT token for authenticated requests.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       example: 1990-05-15
 *       400:
 *         description: Invalid login data (e.g., missing email or password, invalid format).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email and password are required.
 *       401:
 *         description: Authentication failed (e.g., incorrect password).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password.
 *       404:
 *         description: User not found with the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Retrieve current user information
 *     description: Fetches details of the currently authenticated user using a Bearer token for authorization.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Indicates this endpoint requires Bearer token authorization
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user's unique ID.
 *                   example: 1
 *                 username:
 *                   type: string
 *                   description: The user's username.
 *                   example: johndoe
 *                 email:
 *                   type: string
 *                   description: The user's email address.
 *                   example: johndoe@example.com
 *                 birthday:
 *                   type: string
 *                   format: date
 *                   description: The user's birthdate.
 *                   example: 1990-05-15
 *       401:
 *         description: Unauthorized. Bearer token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not authorized, no token provided.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.get("/me", protect, getLoggedInUser);

/**
 * @swagger
 * /api/users/steam:
 *   get:
 *     summary: Initiate Steam login
 *     description: Redirects the user to the Steam login page for authentication. After successful login, the user will be redirected back to the application with the authentication result.
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects the user to the Steam login page.
 *         headers:
 *           Location:
 *             description: The URL of the Steam login page.
 *             schema:
 *               type: string
 *               example: https://steamcommunity.com/openid/login
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to initiate Steam login.
 */
router.get("/steam", steamLogin);

/**
 * @swagger
 * /api/users/steam/authenticate:
 *   get:
 *     summary: Handle redirect after Steam login
 *     description: Processes the response from Steam after the user logs in. Verifies the user's Steam credentials and redirects them based on the authentication result.
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects the user after successful or failed Steam authentication.
 *         headers:
 *           Location:
 *             description: The URL to which the user is redirected.
 *             schema:
 *               type: string
 *               example: https://yourapp.com/dashboard
 *       401:
 *         description: Unauthorized. Steam authentication failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Steam authentication failed.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process Steam authentication.
 */
router.get('/steam/authenticate', steamRedirect);

/**
 * @swagger
 * /api/users/game-history:
 *   post:
 *     summary: Retrieve and save user's recently played games
 *     description: Fetches the recently played games for a user based on their Steam ID, filters the games based on allowed criteria, and saves them in the database. Requires a valid Steam API key.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - steamid
 *             properties:
 *               steamid:
 *                 type: string
 *                 description: The user's unique Steam ID.
 *                 example: 76561198000030928
 *     responses:
 *       200:
 *         description: Filtered games retrieved and saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Filtered games saved successfully
 *                 games:
 *                   type: array
 *                   description: List of filtered recently played games.
 *                   items:
 *                     type: object
 *                     properties:
 *                       appid:
 *                         type: integer
 *                         description: The game's unique ID on Steam.
 *                         example: 730
 *                       name:
 *                         type: string
 *                         description: The game's name.
 *                         example: "Counter-Strike: Global Offensive"
 *                       playtime_2weeks:
 *                         type: integer
 *                         description: Playtime in the last two weeks (in minutes).
 *                         example: 300
 *                       playtime_forever:
 *                         type: integer
 *                         description: Total playtime for the game (in minutes).
 *                         example: 5000
 *                       img_icon_url:
 *                         type: string
 *                         description: URL of the game's icon.
 *                         example: https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/icon.jpg
 *                       img_logo_url:
 *                         type: string
 *                         description: URL of the game's logo.
 *                         example: https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/logo.jpg
 *       404:
 *         description: No recently played games or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No recently played games found
 *       500:
 *         description: Failed to fetch games due to a server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch games
 *                 error:
 *                   type: string
 *                   example: Internal server error details.
 */
router.post('/game-history', getRecentlyPlayedGames);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username for the user
 *                 example: johndoe123
 *               email:
 *                 type: string
 *                 description: New email for the user
 *                 format: email
 *                 example: johndoe@example.com
 *               birthday:
 *                 type: string
 *                 description: New birthday for the user in YYYY-MM-DD format
 *                 format: date
 *                 example: 2000-01-01
 *               password:
 *                 type: string
 *                 description: New password for the user
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe123
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     birthday:
 *                       type: string
 *                       example: 2000-01-01
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.put("/:id", updateUser);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for users
 *     description: Searches for users by username. Requires authentication via a Bearer token. Excludes the currently logged-in user from the results.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Search term to find users by username (case-insensitive).
 *         schema:
 *           type: string
 *           example: john
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination. Defaults to 1.
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of results per page. Defaults to 10, maximum 100.
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                       example: john
 *                     totalResults:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *       400:
 *         description: Invalid query or pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid query parameter
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: No users found matching the criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No users found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.get("/search", protect, searchUsers); 

module.exports = router;




