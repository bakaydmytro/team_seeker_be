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
  searchUsers,
  updateAvatar,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { steamProtect } = require("../middleware/steamAuth");
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





