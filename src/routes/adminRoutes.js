const express = require("express");
const router = express.Router();
const {
  getUsersJSON,
  getUsers,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

/**
 * @swagger
 * /api/admins/users/download:
 *   get:
 *     summary: Get a JSON file of all users
 *     description: Retrieves all users from the database and downloads them as a JSON file. Accessible only to admins.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
 *     responses:
 *       200:
 *         description: JSON file with all users successfully generated and ready for download
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: users.json
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied. Admins only.
 *       500:
 *         description: Error occurred while fetching users or generating the file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unable to download file
 */
router.get('/users/download', protect, isAdmin, getUsersJSON);

/**
 * @swagger
 * /api/admins/users:
 *   get:
 *     summary: Get all users as JSON
 *     description: Retrieves all users from the database and returns them as a JSON response. Accessible only to admins.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []  # Bearer token for authorization
 *     responses:
 *       200:
 *         description: List of all users in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: johndoe
 *                   email:
 *                     type: string
 *                     example: johndoe@example.com
 *                   status:
 *                     type: string
 *                     example: active
 *       403:
 *         description: Access denied. Admins only.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied. Admins only.
 *       500:
 *         description: Error occurred while fetching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unable to get users
 */
router.get('/users', protect, isAdmin, getUsers);

module.exports = router;