const asyncHandler = require("express-async-handler");
const { User, Chat, Message } = require('../../models');
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

  const getMessages = asyncHandler(async (req, res) => {
    try {

      const { chat_id } = req.params;
      const userId = req.user.id;
      let { limit = 20, offset = 0 } = req.query;
      limit = parseInt(limit);
      offset = parseInt(offset);

       const chat = await Chat.findByPk(chat_id, {
      include: {
        model: User,
        where: { id: userId },
        through: { attributes: [] },
      },
    });
  
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found or access denied.' });
      }

      const messages = await Message.findAll({
        where: { chat_id },
        include: [{ model: User, attributes: ['id', 'username'] }],
        order: [['createdAt', 'ASC']], 
        limit,
        offset,
      });
      
      res.json({ messages });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Unable to get messages." });
    }
  });
 
  module.exports = {
    createChat,
    getMessages
  };

