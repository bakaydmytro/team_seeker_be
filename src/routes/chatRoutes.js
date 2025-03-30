const express = require("express");
const router = express.Router();
const {
  createOrGetChat,
  getMessages,
  getChatUsers,
  getUserChats
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
router.post("/create", protect, createOrGetChat);


/**
 * @swagger
 * /api/chats/{chat_id}/messages:
 *   get:
 *     summary: Get chat message history
 *     description: Retrieve the list of messages from a specific chat with pagination support.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []  # Requires authentication token
 *     parameters:
 *       - in: path
 *         name: chat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chat to retrieve messages from.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The number of messages to retrieve per request.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The starting point for retrieving messages (for offset-based pagination).
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: The ID of the last loaded message (for cursor-based pagination).
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 456
 *                       chat_id:
 *                         type: integer
 *                         example: 123
 *                       content:
 *                         type: string
 *                         example: "Hello!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-21T12:34:56.789Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Ivan"
 *       400:
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid chat ID or parameters."
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not authorized."
 *       404:
 *         description: Chat not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found or access denied."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error. Please try again later."
 */
router.get("/:chat_id/messages", protect, getMessages);

/**
 * @swagger
 * /api/chats/{chat_id}/users:
 *   get:
 *     summary: Get users in a chat
 *     description: Retrieves a list of users who are members of a specified chat.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []  # Requires authentication
 *     parameters:
 *       - in: path
 *         name: chat_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the chat
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users in the chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   username:
 *                     type: string
 *                     example: "Alice"
 *                   avatar_url:
 *                     type: string
 *                     example: "/uploads/avatar1.jpg"
 *                   status:
 *                     type: string
 *                     example: "online"
 *       404:
 *         description: Chat not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat not found"
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
 *                   example: "Internal server error"
 */
router.get("/:chat_id/users", protect, getChatUsers);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get user's chat list
 *     description: Retrieve all chats where the authenticated user is a member.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []  # JWT Token
 *     responses:
 *       200:
 *         description: List of user chats
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
 *                   isGroup:
 *                     type: boolean
 *                     example: false
 *                   name:
 *                     type: string
 *                     example: "Chat with John"
 *                   avatar_url:
 *                     type: string
 *                     nullable: true
 *                     example: "https://example.com/chat-avatar.jpg"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-22T12:00:00Z"
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
 *                   example: "Unable to retrieve chats."
 */
router.get("/", protect, getUserChats);

module.exports = router;