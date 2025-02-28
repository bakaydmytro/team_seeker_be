const express = require("express");
const router = express.Router();
const {
  createChat
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/chats/create:
 *   post:
 *     summary: Create or retrieve a chat between two users
 *     description: This endpoint checks if a chat already exists between the two users. If not, a new chat is created.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []  # Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *                 description: ID of the recipient user
 *                 example: 2
 *     responses:
 *       200:
 *         description: Chat created or retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 isGroup:
 *                   type: boolean
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-22T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-22T12:00:00Z"
 *       400:
 *         description: Missing senderId or recipientId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sender and recipient IDs are required."
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not authorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unable to create or retrieve conversation."
 */
router.post("/create", protect, createChat);

module.exports = router;