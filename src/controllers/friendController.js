const asyncHandler = require("express-async-handler");
const { Friendship, User } = require("../../models");

const sendRequest = asyncHandler(async (req, res) => {

    const { addressee_id } = req.body;
    const requester_id = req.user.id;

    if (requester_id === addressee_id) {
        return res.status(400).json({ message: "You cannot add yourself" });
    }

    try {
        const existingRequest = await Friendship.findOne({ where: { requester_id, addressee_id } });
        if (existingRequest) {
          return res.status(400).json({ message: "Request is already done" });
        }
    
        await Friendship.create({ requester_id, addressee_id, status: 'pending' });
        res.status(201).json({ message: "Request has been sent" });
      } catch (error) {
        res.status(500).json({ message: "Error during request", error });
      }

});

const acceptRequest = asyncHandler(async (req, res) => {

  const { requester_id } = req.body;
  const addressee_id = req.user.id;

  try {
    const friendship = await Friendship.findOne({ where: { requester_id, addressee_id, status: 'pending' } });
    if (!friendship) {
      return res.status(404).json({ message: "Request not found" });
    }

    friendship.status = 'accepted';
    await friendship.save();
    res.json({ message: "Request has been accepted" });
  } catch (error) {
    res.status(500).json({ message: "Error during request", error });
  }

});

const rejectRequest = asyncHandler(async (req, res) => {

  const requester_id = req.query.requester_id;
  const addressee_id = req.user.id;

  try {
    const friendship = await Friendship.findOne({ where: { requester_id, addressee_id, status: 'pending' } });
    if (!friendship) {
      return res.status(404).json({ message: "Request not found" });
    }
    await friendship.destroy();
    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: "Error rejecting friend request", error });
  }
});

module.exports = {
    sendRequest,
    acceptRequest,
    rejectRequest
  };
