const asyncHandler = require("express-async-handler");
const { User, Chat } = require('../../models');
const { Op } = require("sequelize");

const createChat  = asyncHandler(async (req, res) => {
    try {
  
      const { recipientId } = req.body;
      const senderId = req.user.id;
  
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required." });
      }

      if (parseInt(recipientId) === senderId) {
        return res.status(400).json({ error: "You cannot make chat with yourself." });
    }

    const existingChat = await Chat.findOne({
      include: {
        model: User,
        where: { id: senderId },
        through: { attributes: [] },
      },
      where: {
        '$id$': { [Op.in]: [senderId, recipientId] },
      },
    });

    if (existingChat) {
      return res.status(400).json({ error: "Chat with this recipient already exists." });
    }

  
      const chat = await Chat.create({ isGroup: false });
      await chat.addUsers([senderId, recipientId]);
  
      res.status(200).json(chat);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Unable to create or retrieve chat." });
    }
  });
 
  module.exports = {
    createChat,
  };