const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  rejectRequest
} = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/friends/request:
 *   post:
 *     summary: Sending request to other user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressee_id:
 *                 type: integer
 *                 description: User's ID to send friend request
 *                 example: 2
 *     responses:
 *       200:
 *         description: Request has been successfully sent
 *       400:
 *         description: Error during request
 *       401:
 *         description: Unathorized user
 *       500:
 *         description: Server error
 */
router.post("/request", protect, sendRequest);

/**
 * @swagger
 * /api/friends/accept:
 *   post:
 *     summary: Accept friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requester_id:
 *                 type: integer
 *                 description: Users ID who sent request
 *                 example: 2
 *     responses:
 *       200:
 *         description: Request has been accepted
 *       400:
 *         description: Error during request
 *       401:
 *         description: Unathorized user
 *       500:
 *         description: Server error
 */
router.post("/accept", protect, acceptRequest);

/**
 * @swagger
 * /api/friends/reject:
 *   delete:
 *     summary: Reject friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requester_id:
 *                 type: integer
 *                 description: Users ID who sent request
 *                 example: 2
 *     responses:
 *       200:
 *         description: Request has been rejected
 *       400:
 *         description: Error during request
 *       401:
 *         description: Unathorized user
 *       500:
 *         description: Server error
 */
router.delete('/reject', protect, rejectRequest);

module.exports = router;