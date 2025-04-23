// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  getUserById,
  updateUser,
  steamLogin,
  steamRedirect,
  searchUsers,
  updateAvatar,
  getFriends,
  getRequests,
  getAvailableGames
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const {upload, processAvatar} = require("../middleware/uploadMiddleware");

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided information. All fields are required, and the email must be unique. Supports optional avatar upload.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: email
 *                 description: Valid email address. Must be unique.
 *                 example: johndoe@example.com
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: User's birthdate in YYYY-MM-DD format.
 *                 example: 1990-05-15
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Secure password. Minimum 8 characters.
 *                 example: StrongPass123!
 *               avatar_url:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) Profile avatar image (JPG, PNG).
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
 *                     avatar_url:
 *                       type: string
 *                       example: /uploads/avatar123.jpg
 *       400:
 *         description: Registration failed (missing fields, invalid input, or email already in use).
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
router.post("/signup", upload.single("avatar_url"), processAvatar, registerUser);

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Upload or update user avatar
 *     description: Allows authenticated users to upload or update their profile avatar.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Indicates this endpoint requires Bearer token authorization
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar_url:
 *                 type: string
 *                 format: binary
 *                 description: The avatar image file (JPG, PNG, or GIF).
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avatar uploaded successfully.
 *                 avatar_url:
 *                   type: string
 *                   example: http://localhost:5000/uploads/avatars/1740761727051-888137459.jpg
 *       400:
 *         description: Bad request (e.g., no file uploaded, wrong format).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No file uploaded.
 *       401:
 *         description: Unauthorized (user not authenticated).
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
router.put("/avatar", protect, upload.single("avatar_url"), processAvatar, updateAvatar);


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
 * /api/users/profile/{id}:
 *   get:
 *     summary: Get user profile with game list
 *     tags: [Users]
 *     security:
 *       - bearerAuth:
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 3
 *         required: true
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User profile and games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                 status:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 games:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       appid:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       playtime_forever:
 *                         type: integer
 *                       last_played:
 *                         type: integer
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/profile/:id", protect,  getUserById);

/**
 * @swagger
 * /api/users/steam:
 *   get:
 *     summary: Authenticate with Steam
 *     description: Logs in with Steam. If the user is already authenticated with a token, Steam will be linked to their account.
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           example: Bearer your_token_here
 *         required: false
 *         description: Optional Bearer token for authentication.
 *     responses:
 *       200:
 *         description: Successfully authenticated with Steam.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Steam authentication successful."
 *       401:
 *         description: Unauthorized. Token is invalid.
 *       500:
 *         description: Internal server error.
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
 * /api/users/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
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
router.put("/:id", protect, updateUser);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for users
 *     description: >
 *       Searches for users by username.  
 *       Optionally filters users by Steam game `appid` and includes playtime information for that game.  
 *       Excludes the currently logged-in user from the results.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
 *     parameters:
 *       - name: query
 *         in: query
 *         required: false
 *         description: Search term to find users by username (case-insensitive, starts with).
 *         schema:
 *           type: string
 *           example: john
 *       - name: appid
 *         in: query
 *         required: false
 *         description: Steam App ID of the game to filter users by.
 *         schema:
 *           type: integer
 *           example: 730
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
 *         description: Number of results per page. Defaults to 10, maximum is 100.
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
 *                     appid:
 *                       type: integer
 *                       example: 730
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
 *                       status:
 *                         type: string
 *                         example: online
 *                       avatar_url:
 *                         type: string
 *                         example: https://cdn.cloudflare.steamstatic.com/avatars/user123.jpg
 *                       playtime_forever:
 *                         type: integer
 *                         nullable: true
 *                         description: Total hours played in the filtered game (if appid is provided).
 *                         example: 120
 *                       playtime_2weeks:
 *                         type: integer
 *                         nullable: true
 *                         description: Hours played in the last 2 weeks for the filtered game (if appid is provided).
 *                         example: 5
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

/**
 * @swagger
 * /api/users/friends:
 *   get:
 *     summary: Get list of friends
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of friends per page
 *     responses:
 *       200:
 *         description: Friend list has been successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
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
 *                       avatar_url:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                 total:
 *                   type: integer
 *                   example: 20
 *                   description: Total number of friends
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       401:
 *         description: Unauthorized user
 *       500:
 *         description: Server error
 */
router.get("/friends", protect, getFriends);

/**
 * @swagger
 * /api/users/requests:
 *   get:
 *     summary: Get incoming friend requests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of friend requests per page
 *     responses:
 *       200:
 *         description: List of incoming requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           username:
 *                             type: string
 *                             example: johndoe
 *                           avatar_url:
 *                             type: string
 *                             example: https://example.com/avatar.jpg
 *                 total:
 *                   type: integer
 *                   example: 15
 *                   description: Total number of incoming friend requests
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *       401:
 *         description: Unauthorized user
 *       500:
 *         description: Server error
 */
router.get("/requests", protect, getRequests);

/**
 * @swagger
 * /api/users/games/available:
 *   get:
 *     summary: Get list of available games from steam
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [] 
 *     description: Returning all available games in app
 *     responses:
 *       200:
 *         description: List of available games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   appid:
 *                     type: integer
 *                     example: 730
 *                   name:
 *                     type: string
 *                     example: Counter-Strike Global Offensive
 *       500:
 *         description: Error while getting appid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch game list
 */
router.get("/games/available", protect, getAvailableGames);

module.exports = router;





