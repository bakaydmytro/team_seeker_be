const asyncHandler = require("express-async-handler");
const { User, Chat, Message, Member } = require('../../models');
const { Sequelize, Op } = require("sequelize");

const createOrGetChat = asyncHandler(async (req, res) => {
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
      include: [
        {
          model: Member,
          as: 'Members',
          attributes: [],
          where: {
            user_id: { [Op.in]: [senderId, recipientId] }, 
          },
          required: true, 
        },
        {
          model: User,
          through: { attributes: [] }, 
          attributes: ["id", "username", "avatar_url"],
        },
      ],
      where: { isGroup: false },
      group: ['Chat.id'], 
      having: Sequelize.literal(`
        (SELECT COUNT(*) FROM Members WHERE Members.chat_id = Chat.id) = 2 
        AND EXISTS (
          SELECT 1 FROM Members 
          WHERE Members.chat_id = Chat.id AND Members.user_id = ${senderId}
        )
        AND EXISTS (
          SELECT 1 FROM Members 
          WHERE Members.chat_id = Chat.id AND Members.user_id = ${recipientId}
        )
      `),
    });

    if (existingChat) {
      return res.status(200).json(existingChat); 
    }


    const chat = await Chat.create({ isGroup: false });
    await chat.addUsers([senderId, recipientId]); 

    res.status(201).json(chat); 
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

      await Message.update(
        { status: "read" },
        { where: { sender_id: { [Op.ne]: userId }, chat_id: chat_id, status: { [Op.ne]: "read" } } }
      );
      
      res.json({ messages });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Unable to get messages." });
    }
  });

  const getChatUsers = async (req, res) => {
    try {
      const { chat_id } = req.params;
      const user_id = req.user.id;
      
      const chat = await Chat.findByPk(chat_id, {
        include: {
          model: User,
          attributes: ["id", "username", "avatar_url", "status"],
          through: { attributes: [] }, 
        },
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const isMember = await Member.findOne({
        where: { chat_id, user_id },
      });
  
      if (!isMember) {
        return res.status(403).json({ error: "Access denied. You are not a member of this chat." });
      }
  
      res.json(chat.Users); 
    } catch (error) {
      console.error("Error fetching chat users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  const getUserChats = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
  
      const chats = await Chat.findAll({
        include: [
          {
            model: Member,
            where: { user_id: userId },
            attributes: [],
          },
          {
            model: User,
            through: { attributes: [] }, 
            attributes: ["id", "username", "avatar_url"],
            where: {
              id: {
                [Op.ne]: userId, 
              },
            },
          },
        ],
        where: { isGroup: false },
        order: [['updatedAt', 'DESC']], 
      });
  
      return res.status(200).json(chats);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to retrieve chats." });
    }
  });

  module.exports = {
    createOrGetChat,
    getMessages,
    getChatUsers,
    getUserChats
  };

